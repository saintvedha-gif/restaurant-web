# Mucha Mazorca — sitio web

Frontend del sitio público y panel de administración. Está separado del repositorio hermano `mucha-mazorca-api`, que sirve datos y conecta con MySQL/MariaDB.

## Mapa rápido para trabajar

| Si necesitas cambiar... | Empieza aquí |
|---|---|
| Rutas del sitio y carga diferida de páginas | `src/App.tsx` |
| Arranque, carga inicial desde API y tema | `src/main.tsx` |
| Página de inicio, menú, contacto, galería o pedidos | `src/pages/` |
| Vista/selección de un producto y sus adicionales | `src/pages/ProductDetailPage.tsx` |
| Carrito, formulario y tarjetas | `src/context/CartContext.tsx`, `src/components/` |
| Datos de respaldo, categorías, adicionales e imágenes | `src/data/menuData.ts`, `src/data/` |
| Contrato de productos/adicionales | `src/types/menu.ts` |
| URL base, cookies, CSRF y errores de API | `src/lib/api.ts` |
| Carga de datos públicos de la API y respaldo local | `src/lib/load*.ts`, `src/lib/gallery.ts` |
| Pestañas del administrador | `src/pages/AdminPage.tsx` |
| Productos, categorías y adicionales | `src/components/admin/AdminProducts.tsx`, `AdminCategories.tsx`, `AdminAddons.tsx`, `ProductEditor.tsx` |
| Promociones, pedidos, clientes, galería y ajustes | componentes correspondientes en `src/components/admin/` |
| Estilos globales y tokens visuales | `src/index.css`, `tailwind.config.js` |
| Publicación automática a Hostinger | `.github/workflows/deploy.yml` |

## Páginas y panel

`src/App.tsx` define las rutas:

| Ruta | Pantalla |
|---|---|
| `/` | Inicio (`HomePage.tsx`) |
| `/menu` | Menú y detalle de producto (`MenuPage.tsx`, `ProductDetailPage.tsx`) |
| `/contacto` | Contacto |
| `/galeria` | Galería |
| `/mis-pedidos` | Consulta de pedidos |
| `/admin` | Panel privado (`AdminPage.tsx`) |

En el panel, `AdminPage.tsx` coordina las pestañas **Resumen**, **Pedidos**, **Productos**, **Promociones**, **Clientes**, **Galería**, **Personalizar sitio**, **Notificaciones** y **Cuenta**. Productos abre a su vez la administración de categorías y grupos/adicionales.

## Flujo de datos

1. `src/main.tsx` carga menú, categorías, adicionales, promociones, ajustes y galería antes de mostrar la aplicación.
2. `src/lib/loadMenu.ts`, `loadCategories.ts`, `loadAddonGroups.ts`, `loadPromos.ts`, `loadSettings.ts` y `gallery.ts` consultan la API.
3. Si la API no responde a tiempo, la aplicación conserva los datos de respaldo del frontend en `src/data/`. El menú/las categorías/adicionales/promociones iniciales se definen en esos módulos; si se cambian a mano, mantén sincronizadas las referencias de productos, categorías y grupos.
4. Las funciones de red pasan por `src/lib/api.ts`; allí se establece `VITE_API_URL`, `credentials: include`, el encabezado CSRF para escrituras y el timeout.
5. El panel escribe en la API. Si cambias un campo persistente, actualiza también la API y crea una migración cuando corresponda; modificar solo el formulario no garantiza que el backend/base lo acepte o guarde.
6. El cálculo final de pedidos y precios ocurre de forma confiable en la API, no en el frontend.

Para saber qué se necesita al cambiar la base, lee `mucha-mazorca-api/README.md`, sección “Base de datos: instalación y migraciones”.

## Tecnologías

- React 18, TypeScript, Vite 6, React Router 7, Tailwind CSS 3.
- `@twemoji/api` para renderizado de emojis.
- Cloudinary para imágenes remotas; imágenes locales de respaldo en `public/images/`.
- API Node.js + Express + MySQL/MariaDB en el otro repositorio.

## Desarrollo y comprobaciones

Requisitos: Node.js 22 recomendado y npm.

```bash
npm install
npm run dev
```

Vite muestra la URL local, normalmente `http://localhost:5173`. Configura `.env.local` con `VITE_API_URL=http://localhost:3000` para API local. Si se modifica un archivo de entorno, reinicia Vite.

```bash
npm run build       # TypeScript y compilación de producción
npm run preview     # Sirve localmente la compilación
```

En PowerShell, si la política de ejecución bloquea `npm.ps1`, usa `npm.cmd` (por ejemplo, `npm.cmd run build`).

Variables frontend:

- `VITE_API_URL`: origen de la API.
- `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`: carga de imágenes desde el panel.
- `VITE_VAPID_PUBLIC_KEY`: clave pública para suscripciones push.

Todo valor `VITE_*` queda incluido en el JavaScript público del navegador. Nunca pongas claves privadas, contraseñas de base de datos ni secretos de Cloudinary aquí. Usa `.env.example` como plantilla y conserva los archivos `.env*` locales fuera de Git.

## Publicación del frontend en Hostinger

El workflow `.github/workflows/deploy.yml` se ejecuta al hacer `push` a `main` o manualmente con `workflow_dispatch`. Construye `dist/` con Node 22 y sincroniza su contenido con Hostinger por FTP. Esto publica **solo el frontend**; no despliega la API, no modifica MySQL y no ejecuta migraciones.

En GitHub → **Settings → Secrets and variables → Actions**, configura los secretos que consume el workflow:

- `HOSTINGER_FTP_SERVER`
- `HOSTINGER_FTP_USERNAME`
- `HOSTINGER_FTP_PASSWORD`
- `VITE_API_URL` (URL productiva HTTPS de la API)
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_VAPID_PUBLIC_KEY`

El workflow usa `server-dir: ./`; confirma que el usuario FTP esté limitado a la carpeta web correcta (normalmente `public_html`) antes de publicar. El secreto `HOSTINGER_SERVER_DIR` que aparezca en guías antiguas no se usa por el workflow actual.

Pasos de publicación:

1. Trabaja en una rama y prueba localmente.
2. Ejecuta `npm run build`; corrige errores antes de fusionar.
3. Revisa los secretos de GitHub y que `VITE_API_URL` apunte a producción.
4. Fusiona/publica en `main`.
5. Revisa **Actions** en GitHub: tanto build como FTP deben finalizar correctamente.
6. Abre el sitio, fuerza recarga del navegador y prueba menú, imágenes, pedidos y acceso al panel.
7. Si la API rechaza peticiones por CORS, configura el origen exacto del sitio en `ALLOWED_ORIGINS` de la API; no intentes arreglarlo agregando un proxy inseguro.

Si el cambio incluye código de API, sigue también su proceso de publicación y prueba. Si incluye base de datos, respalda y aplica primero la migración aprobada según el README de la API; el workflow del frontend nunca migra la base.

## Imágenes y PWA

- Imágenes locales: `public/images/`; fuentes originales: `assets-source/images/`.
- Mapeo Cloudinary: `src/data/cloudinaryImages.ts`; funciones y fallback local: `src/data/menuData.ts`.
- El script `npm run images:cloudinary:upload` sincroniza imágenes desde `assets-source/images/`; revisa el script y la configuración antes de usarlo.
- PWA, instalación y notificaciones se implementan en `src/lib/pwa.ts`, `src/components/InstallButton.tsx` y `src/components/PushButton.tsx`.
- Rutas fallback y archivos públicos como `public/.htaccess`, `404.html`, manifest, robots y sitemap deben conservarse al publicar.

## Reglas al hacer cambios

1. Busca el componente y la ruta de API que ya implementan una función antes de crear lógica duplicada.
2. Si cambia el contrato de un dato, actualiza tipos, UI, llamada API, validación/servidor y pruebas relacionadas.
3. Prueba build del frontend y pruebas de la API cuando cambie el backend; no consideres una captura visual como validación de persistencia.
4. No subas `.env`, credenciales, respaldos SQL ni datos de clientes.
