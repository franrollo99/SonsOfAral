# Preparación para publicar (sin desplegar todavía)

Los cambios no modifican los `.env` de desarrollo. No se ha publicado la web,
creado un dominio ni ejecutado copias o restauraciones de la base de datos.

## Dependencias

Se han actualizado los paquetes dentro de los rangos existentes, sin saltos de
versión mayor. Conserva los dos archivos de bloqueo en Git. En un servidor usa
`npm ci` y `composer install --no-dev --optimize-autoloader`, no `update`.

Repite `npm audit` y `composer audit` antes de publicar. Swagger todavía depende
indirectamente de `doctrine/annotations`, abandonado: no equivale a una
vulnerabilidad detectada, pero conviene revisar su sustitución cuando la cadena
de Swagger permita hacerlo sin romper la documentación.

## Configuración del backend

Configura secretos en el servidor, nunca en Git ni en variables `VITE_*`:

- `APP_ENV=production`, `APP_DEBUG=false` y `APP_URL` con la URL HTTPS de la API.
- `FRONTEND_URL` con el origen HTTPS del frontend, sin una ruta adicional.
- `CORS_ALLOWED_ORIGINS` con los orígenes permitidos separados por comas;
  sin comodines, barras finales ni rutas. CORS no sustituye la autorización.
- Base de datos con usuario propio y permisos mínimos, no `root`.
- `APP_KEY` única y guardada de forma segura. No regenerarla en cada despliegue.
- `SESSION_SECURE_COOKIE=true`; revisa dominio y cookies según el hosting.
- Correo SMTP real y una prueba de recuperación de contraseña. `MAIL_MAILER=log`
  no envía correos. Los logs pueden contener enlaces de recuperación: protégelos.
- Decide caché y colas según la infraestructura. No activar un driver de base
  de datos o Redis sin sus tablas/servicio. Actualmente la notificación de
  recuperación no implementa `ShouldQueue`.

Sirve exclusivamente `backend/public`, nunca la raíz del repositorio. Usa
PHP mantenido y compatible con `composer.json`, con GD/WebP y las extensiones
exigidas por `composer check-platform-reqs`. `php artisan serve` es para desarrollo.
Configura permisos de escritura en `storage` y `bootstrap/cache`, enlace
`php artisan storage:link`, HTTPS, tamaño máximo de subida coherente entre
servidor/PHP y API, y límites de peticiones.

Después de instalar y configurar, en el servidor de destino:

```text
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

No ejecutes estos pasos contra una base de datos importante sin copia previa.
Las URLs de recuperación y verificación ahora se leen mediante `config()`, por
lo que siguen disponibles con la configuración cacheada.

Antes de publicar:

- Cambiar la contraseña de prueba del administrador. No ejecutar `db:seed` ni
  `migrate --seed`: `UserSeeder` conserva una credencial de desarrollo.
- Restringir Swagger y su JSON en el servidor o con middleware; actualmente su
  configuración no exige autenticación. No basta con ocultar el enlace.
- Revisar acceso administrativo, recuperación, permisos y cargas de imágenes.
- Revisar que los textos legales reflejen el uso y los servicios reales de la web.
- Monitorizar errores y espacio en disco. `/up` comprueba el arranque de Laravel,
  no demuestra que la base de datos ni el correo funcionen.

## Frontend, buscadores y enlaces compartidos

Configura estas variables **antes del build** en el entorno de destino:

```dotenv
VITE_API_URL=https://api.example.com/api
VITE_SITE_URL=https://example.com
VITE_ALLOW_INDEXING=true
```

`example.com` es un ejemplo, no el dominio de la banda. Mientras no se publique,
deja `VITE_ALLOW_INDEXING=false` y el dominio vacío. El build de prueba genera
`noindex`, robots bloqueado y sitemap vacío. No uses ese build para publicar.

El build genera HTML inicial para las páginas públicas y rutas conocidas del
administrador: títulos, descripciones, canonical y Open Graph/Twitter. React
también actualiza los metadatos al navegar. Conserva el favicon existente y usa
la foto estática optimizada de inicio como imagen para compartir.

El hosting debe servir primero los archivos reales de `dist`, incluidos los
`index.html` de cada ruta, y después aplicar el fallback de la SPA. Una regla que
reescriba todas las rutas al HTML de inicio pierde los metadatos por ruta.
Comprueba los enlaces directos, barras finales y rutas inexistentes; estas
últimas deberían devolver HTTP 404 con una página apropiada al configurar el hosting.

El administrador lleva `noindex`; no se incluye en el sitemap. En producción
robots permite rastrearlo para que el buscador pueda leer esa instrucción.
Ni robots ni `noindex` protegen datos: la protección sigue siendo la autorización
del backend. El robots del backend bloquea el rastreo de toda la API.

Esto genera metadatos estáticos, no renderizado completo de React. El sitemap
contiene las seis páginas públicas fijas. Las galerías individuales aún no
generan HTML ni metadatos de cada álbum para bots sin JavaScript. La imagen de
compartir es estática: cambiar la foto desde el gestor no la actualiza en estos
metadatos. Si lo necesitamos, añadiremos generación desde la API o SSR, no
consultas a la base de datos durante este build de desarrollo.

Comprueba el HTML servido y la vista previa real de un enlace cuando haya dominio
público; algunas plataformas cachean las tarjetas. No es posible verificar esas
tarjetas privadas desde localhost.

Referencias: [despliegue de Laravel](https://laravel.com/docs/12.x/deployment),
[SEO de JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
y [Open Graph](https://ogp.me/).

## Copias de seguridad y restauración

Una copia completa incluye base de datos, `backend/storage/app/public`
(fotos y variantes), configuración secreta y `APP_KEY`, y versión exacta del
código/lockfiles. Git no guarda las fotos subidas ni los secretos.

Guarda las copias **fuera del repositorio y de las carpetas públicas**. Usa
cifrado, acceso restringido y otra ubicación independiente del servidor.
Programa copias diarias y antes de migraciones; define retención y comprueba
periódicamente una restauración. No se ha instalado un servicio de backup.

Ejemplo de exportación MySQL en Windows, a adaptar al MySQL instalado:

```powershell
mysql_config_editor set --login-path=soa-backup --host=127.0.0.1 --port=3307 --user=usuario_backup --password
mysqldump --login-path=soa-backup --single-transaction --routines --triggers --events --result-file="D:\CopiasSonsOfAral\bdd.sql" nombre_bdd
Compress-Archive -LiteralPath "C:\ruta\backend\storage\app\public" -DestinationPath "D:\CopiasSonsOfAral\imagenes.zip"
```

Crea previamente la carpeta de copias y usa nombres con fecha para no sobrescribir
la última copia válida. No pongas contraseñas en comandos. `--result-file` evita
problemas de codificación de la redirección en Windows PowerShell.
`--single-transaction` requiere tablas transaccionales; para sincronizar fotos
y registros suspende temporalmente escrituras/cargas o utiliza snapshots
coordinados. El archivo de credenciales de MySQL requiere también protección.

Ensaya la recuperación en una **base nueva de prueba**, nunca encima de la actual:
importa el SQL con el cliente MySQL (`SOURCE` con la ruta del fichero), recupera
las fotos y configura esa base y la clave original en un entorno aislado.
Comprueba administrador, conciertos, lanzamientos, galerías y fotos. Una copia
no se considera fiable solo porque el archivo existe; confirma que puede restaurarse.
