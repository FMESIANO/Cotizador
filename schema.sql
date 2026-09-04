-- ============================================================================
-- QUOTE SYSTEM — ESQUEMA DE BASE DE DATOS (PostgreSQL / Supabase)
-- ============================================================================
-- Diseñado para Supabase porque resuelve gratis: Auth, RLS (permisos por fila,
-- ideal para el RBAC Admin/Vendedor) y Storage. Funciona igual en un Postgres
-- plano con un backend Node/Express si se prefiere manejar la auth a mano.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1. USUARIOS (referencia a auth.users de Supabase Auth)
-- ----------------------------------------------------------------------------
create type user_role as enum ('admin', 'vendedor');

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  phone         text,                       -- WhatsApp del vendedor (para el botón "Consultar por WhatsApp")
  role          user_role not null default 'vendedor',
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. CLIENTES (cartera de cada vendedor)
-- ----------------------------------------------------------------------------
create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  whatsapp      text not null,              -- formato E.164, ej: 5491122334455
  email         text,
  created_at    timestamptz not null default now()
);
create index on public.clients (seller_id);

-- ----------------------------------------------------------------------------
-- 3. CATÁLOGO — Productos, impuestos y medios de pago (globales, gestión Admin)
-- ----------------------------------------------------------------------------
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  base_price    numeric(12,2) not null check (base_price >= 0),
  tax_rate_pct  numeric(5,2) not null default 21.00,   -- IVA u otro impuesto
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.payment_methods (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                        -- "Efectivo", "Transferencia", "Tarjeta x3"
  adjustment_pct  numeric(5,2) not null default 0,       -- positivo = recargo, negativo = descuento
  active          boolean not null default true
);

-- ----------------------------------------------------------------------------
-- 4. COTIZACIONES
-- ----------------------------------------------------------------------------
create type quote_status as enum ('borrador', 'enviada', 'aprobada', 'rechazada');

create table public.quotes (
  id                uuid primary key default gen_random_uuid(),
  token             text not null unique,                 -- id público, corto, no secuencial (nanoid)
  seller_id         uuid not null references public.profiles(id),
  client_id         uuid not null references public.clients(id),
  payment_method_id uuid not null references public.payment_methods(id),
  status            quote_status not null default 'borrador',
  subtotal          numeric(12,2) not null default 0,
  tax_amount        numeric(12,2) not null default 0,
  adjustment_amount numeric(12,2) not null default 0,
  total             numeric(12,2) not null default 0,
  notes             text,
  expires_at        timestamptz not null default (now() + interval '7 days'),
  sent_at           timestamptz,
  responded_at      timestamptz,
  created_at        timestamptz not null default now()
);
create index on public.quotes (seller_id);
create index on public.quotes (token);
create index on public.quotes (status);

create table public.quote_items (
  id            uuid primary key default gen_random_uuid(),
  quote_id      uuid not null references public.quotes(id) on delete cascade,
  product_id    uuid not null references public.products(id),
  quantity      integer not null check (quantity > 0),
  unit_price    numeric(12,2) not null,     -- snapshot del precio al momento de cotizar
  tax_rate_pct  numeric(5,2) not null       -- snapshot del impuesto al momento de cotizar
);
create index on public.quote_items (quote_id);

-- Log simple de auditoría para "Gestión de Equipo" (actividad del vendedor)
create table public.quote_events (
  id          bigint generated always as identity primary key,
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  actor       text not null,               -- 'seller:<id>' | 'client' | 'admin:<id>'
  event       text not null,               -- 'created' | 'sent' | 'viewed' | 'approved' | 'rejected'
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Alta automática de perfil: cuando creás un usuario nuevo desde
-- Authentication -> Users en el panel de Supabase, esta función le crea
-- automáticamente su fila en `profiles` (rol "vendedor" por defecto). Para
-- convertir a alguien en admin, después solo hay que editar esa fila desde
-- Table Editor y cambiar la columna `role` a "admin" — sin escribir código.
-- ----------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'vendedor'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY — el corazón del RBAC
-- ============================================================================
alter table public.clients enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.products enable row level security;
alter table public.payment_methods enable row level security;

-- Admin: acceso total (se identifica por su fila en profiles.role)
create policy "admin_full_access_quotes" on public.quotes
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Vendedor: solo sus propias cotizaciones
create policy "seller_own_quotes" on public.quotes
  for all using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

-- Mismo patrón para clients
create policy "admin_full_access_clients" on public.clients
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "seller_own_clients" on public.clients
  for all using (seller_id = auth.uid()) with check (seller_id = auth.uid());

-- Catálogo: todos los autenticados pueden leer, solo admin escribe
create policy "read_products" on public.products for select using (auth.role() = 'authenticated');
create policy "admin_write_products" on public.products for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "read_payment_methods" on public.payment_methods for select using (auth.role() = 'authenticated');
create policy "admin_write_payment_methods" on public.payment_methods for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ----------------------------------------------------------------------------
-- Nota sobre la vista pública /quote/[token]:
-- El cliente NO se autentica, así que esa ruta NO debe pegarle a la tabla con
-- RLS de usuario. Se resuelve con una vista SQL + una Edge Function (o API
-- route en Next.js) que usa la service_role key en el servidor, valida
-- `token` y `expires_at > now()`, y devuelve solo los campos necesarios
-- (nunca datos de otros clientes ni de otros vendedores).
-- ----------------------------------------------------------------------------
create view public.public_quote_view as
  select q.token, q.status, q.subtotal, q.tax_amount, q.adjustment_amount, q.total,
         q.expires_at, c.name as client_name, pm.name as payment_method_name,
         pr.full_name as seller_name, pr.phone as seller_whatsapp
  from public.quotes q
  join public.clients c on c.id = q.client_id
  join public.payment_methods pm on pm.id = q.payment_method_id
  join public.profiles pr on pr.id = q.seller_id;
