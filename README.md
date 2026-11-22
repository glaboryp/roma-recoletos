# ¡Rumbo a Roma!

Tienda de fajines y calcetines para el viaje de Semana Santa 2027 del centro universitario Recoletos.

- `/` tienda: se eligen colores y estampados (los packs se calculan solos), datos, de parte de quién vienes, y al enviar se enseña el Bizum.
- `/panel` cada vendedora ve sus pedidos, lo vendido, el material y lo que le queda para el viaje, y su enlace para WhatsApp (`/?de=<id>` deja elegida a la vendedora).
- `/admin` gestión: totales por vendedora, marcar Bizum recibido, borrar pedidos, número de Bizum. `/admin/productos` y `/admin/personas` para editar productos y dar de alta Gmails.

Astro (SSR en Vercel) + Neon Postgres + Better Auth (Google) + Vercel Blob para las fotos subidas.

## Desarrollo

```sh
docker run -d --name roma-pg -e POSTGRES_PASSWORD=roma -e POSTGRES_DB=roma -p 54330:5432 postgres:17
cp .env.example .env   # DATABASE_URL=postgres://postgres:roma@localhost:54330/roma, BETTER_AUTH_URL=http://localhost:4321
pnpm install
pnpm db:setup          # tablas + productos (+ vendedoras y pedidos del formulario, ver abajo)
pnpm dev
pnpm test              # cálculo de precios por packs
```

`pnpm db:setup` se puede repetir: crea lo que falte, solo carga datos si no hay productos y deja `ADMIN_EMAIL` como admin.

Las vendedoras y los pedidos del formulario de Google se cargan desde `scripts/pedidos-formulario.json`, que no está en el repo porque tiene datos personales de los compradores. Si no existe, se cargan solo los productos.

## Puesta en marcha

1. **Vercel**: importa el repo. En *Storage* añade **Neon** (crea `DATABASE_URL`) y **Blob** (crea `BLOB_READ_WRITE_TOKEN`).
2. **Google**: en Google Cloud Console → *APIs y servicios* → *Credenciales*, crea un *ID de cliente OAuth* de tipo aplicación web con la URI de redirección
   `https://TU-DOMINIO/api/auth/callback/google` (y `http://localhost:4321/api/auth/callback/google` para local). En la pantalla de consentimiento, publica la app: mientras esté en *Testing* solo pueden entrar los usuarios de prueba que añadas allí.
3. **Variables en Vercel**: `BETTER_AUTH_URL` (la URL pública), `BETTER_AUTH_SECRET` (`openssl rand -hex 32`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
4. **Base de datos**: `vercel env pull .env`, añade `ADMIN_EMAIL=tu@gmail.com` y `ADMIN_NAME=...`, y ejecuta `pnpm db:setup` una vez.
5. Entra en `/entrar` con tu Gmail, pon el número de Bizum en *Pedidos* y añade los Gmails de cada una en *Personas*.

## Cómo funciona

- Solo pueden entrar los correos dados de alta en *Personas*; con rol *Gestión* ven todo, con *Vendedora* solo lo suyo.
- Precios por cantidad en formato `1x9, 2x16`: el total coge la combinación más barata sumando todas las variantes del mismo producto.
- Cada pedido guarda su total y su coste al hacerse; cambiar precios o costes solo afecta a pedidos nuevos.
- Las variantes con foto de detalle están en `src/assets/muestras/<variante>.webp`; las nuevas usan la primera foto del producto.
