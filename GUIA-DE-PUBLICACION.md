# Cómo publicar tu Cotizador (sin programar nada)

Vas a necesitar dos cuentas gratuitas: **Supabase** (guarda los datos) y **Vercel**
(publica la página web). Todo se hace con clics, copiar y pegar texto.
Calculá unos 20 minutos.

## 1. Crear la base de datos en Supabase

1. Entrá a **supabase.com** → **Start your project** → creá tu cuenta.
2. **New Project** → ponele un nombre (ej. "cotizador") y una contraseña
   para la base de datos (guardala en un lugar seguro). Esperá 1-2 minutos
   mientras se crea.
3. En el menú de la izquierda, andá a **SQL Editor** → **New query**.
4. Abrí el archivo `schema.sql` que está en esta misma carpeta, copiá
   **todo** el contenido, pegalo ahí, y tocá **Run**. Esto crea todas las
   tablas y los permisos automáticamente.

## 2. Copiar tus claves

1. Andá a **Project Settings** (ícono de tuerca) → **API**.
2. Vas a ver tres datos. Copialos, los vas a necesitar en el paso 4:
   - **Project URL**
   - **anon public** key
   - **service_role** key (marcada como secreta — no la compartas con nadie)

## 3. Crear tu usuario (vos, como Administrador)

1. Andá a **Authentication** → **Users** → **Add user** → **Create new user**.
2. Cargá tu email y una contraseña. Creá el usuario.
3. Andá a **Table Editor** → tabla **profiles** → vas a ver una fila con tu
   usuario (se creó sola). Editá esa fila: poné tu nombre en `full_name` y
   cambiá `role` de "vendedor" a **"admin"**. Guardá.

   Para cada vendedor de tu equipo, repetís solo el paso 1 y 2 de esta
   sección (no hace falta tocar `role`, ya queda como "vendedor").

## 4. Publicar la página web en Vercel

1. Entrá a **vercel.com** → creá tu cuenta (podés usar la opción
   "Continue with GitHub", te va a pedir crear una cuenta de GitHub si no
   tenés — también gratis).
2. Subí esta carpeta del proyecto a un repositorio de GitHub: en
   **github.com** → **New repository** → nombre libre → **Create repository**
   → **uploading an existing file** → arrastrá todos los archivos de esta
   carpeta (menos la carpeta `node_modules`, no hace falta) → **Commit changes**.
3. Volvé a Vercel → **Add New** → **Project** → elegí el repositorio que
   acabás de crear.
4. Antes de tocar "Deploy", abrí **Environment Variables** y cargá los tres
   valores del paso 2, con estos nombres exactos:
   - `NEXT_PUBLIC_SUPABASE_URL` → el Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → la anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` → la service_role key
5. Tocá **Deploy**. Esperá 1-2 minutos.

Cuando termine, Vercel te va a dar una dirección propia (algo como
`tu-cotizador.vercel.app`). Esa es tu web, ya en vivo.

## 5. Probarlo

1. Abrí esa dirección → te va a pedir iniciar sesión → entrá con el usuario
   admin que creaste.
2. Como admin: cargá tus productos y medios de pago en **Catálogo**.
3. Pedile a un vendedor (o probá vos mismo con el segundo usuario) que
   entre, cree una cotización con un WhatsApp real, y la mande.
4. Abrí el link que genera — esa es la pantalla que va a ver tu cliente,
   con el botón para aprobar el presupuesto.

## ¿Y si en el medio algo no coincide?

Es normal que en un ida y vuelta como este se cuele algún detalle (un
nombre de campo, un permiso). Si un paso no te da lo esperado, contame
exactamente en qué pantalla estás y qué mensaje ves, y lo resolvemos.
