# Cotizador — Sistema de cotizaciones B2B/B2C

Next.js 16 + Supabase. Tres módulos:

- **Admin** (`/admin`): KPIs, catálogo de productos y medios de pago, actividad del equipo.
- **Vendedor** (`/seller`): pipeline Kanban y cotizador con envío por WhatsApp.
- **Cliente** (`/quote/[token]`): página pública, sin login, para aprobar el presupuesto.

## Para publicarlo sin programar

Seguí **`GUIA-DE-PUBLICACION.md`**, paso a paso.

## Para desarrolladores

```bash
npm install
cp .env.local.example .env.local   # completar con tus credenciales de Supabase
npm run dev
```

El esquema de base de datos está en `schema.sql` (Postgres/Supabase, con
Row Level Security ya configurado para separar Admin de Vendedor).
