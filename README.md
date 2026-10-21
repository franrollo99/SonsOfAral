# Sons of Aral

Web de la banda con conciertos, música y galerías de fotos. Incluye un panel
privado para administrar contenido, imágenes de inicio, logo y contraseña.
Backend Laravel y frontend React con Vite. No incluye tienda, carrito, pedidos,
registro público ni área de clientes.

## Requisitos

- PHP 8.2 o superior, Composer y GD con soporte WebP.
- Node.js compatible con Vite 7 (20.19+ o 22.12+).
- MySQL para el desarrollo habitual.
- Chrome para las pruebas de navegador y SQLite de PHP para las pruebas del backend.

## Backend: instalación local

Desde la raíz del proyecto, en PowerShell:

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Estos pasos de configuración son para una instalación nueva: si ya tienes
`.env` y `APP_KEY`, consérvalos. Configura en `.env` tu conexión de base de datos
y las URLs del frontend y backend. Después:

```powershell
php artisan migrate
php artisan storage:link
php artisan serve
```

No es necesario ejecutar `migrate:fresh` para instalar o actualizar: ese comando
borra las tablas y sus datos.

## Frontend: instalación local

En otra terminal, desde la raíz:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Conserva también el `.env` del frontend si ya está configurado. Revisa
`VITE_API_URL` y abre la dirección que muestre Vite.

## Administración y datos de desarrollo

El acceso está en `/gestion/acceso`; el panel, en `/gestion`. La autorización
se comprueba en el servidor, no depende de que el enlace esté oculto.

En una base de datos local nueva puedes crear el administrador con:

```powershell
cd backend
php artisan db:seed --class=UserSeeder
```

El seeder crea solo `admin@sonsofaral.com` con rol administrador y una contraseña
de desarrollo definida en `UserSeeder.php`. No crea clientes. Cambia esa
contraseña antes de publicar y no ejecutes seeders de prueba en producción.

Para importar los archivos de la banda durante el desarrollo, consulta
[Archivos de prueba](docs/test-media.md). Esa importación usa los servicios de
imágenes y conserva los originales. Las fechas y algunos textos son ficticios.

## Imágenes

Los originales estáticos están en `frontend/assets/originals`, fuera del directorio
público. El logo y la foto de inicio generan variantes en
`frontend/public/images/optimized`; el navegador elige el tamaño adecuado.
La foto histórica `assets/originals/archive/bandaSOA.png` se conserva como archivo
y no participa en la generación ni se publica.

```powershell
cd backend
php artisan images:optimize-static
```

El panel permite sustituir el logo y la imagen de inicio sin cambiar archivos
manualmente. Consulta [Imágenes de la web](docs/images.md).

## Comprobaciones

```powershell
cd backend
php artisan test
cd ../frontend
npm run lint
npm test
npm run build
```

Con Vite en marcha y Chrome instalado:

```powershell
cd frontend
$env:A11Y_BASE_URL = 'http://localhost:5173'
$env:PUBLIC_DESIGN_CHECK = '1'
npm run test:a11y
```

Las pruebas de navegador usan una API simulada, no modifican la base de datos
local y comprueban teclado, modales, controles, diseño adaptable y gestos táctiles.
Los tests no se incluyen en el frontend compilado. Las antiguas maquetas de
`/disenos` ya no forman parte de la aplicación.

## Documentación API y publicación

Con el backend local iniciado, Swagger está en
`http://localhost:8000/api/documentation`.

Antes de desplegar, sigue [Preparación para publicar](docs/publicacion.md):
configuración de producción, credenciales, correo, copias de seguridad,
restricción de Swagger y metadatos. Un build local correcto no sustituye esas
comprobaciones. No se ha desplegado la web.
