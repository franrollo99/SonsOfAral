# Archivos locales de prueba

El acceso directo del escritorio apunta a:
`C:/Users/Fran/Desktop/Otros/DAW/TFG/WEB_ SONS OF ARAL _ Fran`.
El seeder necesita esa carpeta original, no el archivo `.lnk`.

Configura en `backend/.env`:

```dotenv
DEMO_MEDIA_PATH="C:/Users/Fran/Desktop/Otros/DAW/TFG/WEB_ SONS OF ARAL _ Fran"
```

Desde `backend`, ejecuta:

```powershell
php artisan config:clear
php artisan db:seed --class=DemoMediaSeeder
php artisan storage:link
```

No hace falta `migrate:fresh`: no borra tablas, usuarios ni contenido existente.
Tampoco cambia la contraseña del administrador. Con la ruta configurada,
`DatabaseSeeder` usa estos archivos en vez de los antiguos ejemplos ficticios
(ese seeder general sí ejecuta también `UserSeeder`).

## Qué importa

- `DISCOS/EP`: portada y cinco pistas WAV.
- `DISCOS/FORGOTTEN TIMES/MP3`: portada y catorce pistas MP3.
- `BOLOS`: un concierto ficticio por cartel, con fechas futuras al crearlos.
- Los recintos de prueba usan nombres como El Purgatorio, Sala Rock o La Fábrica.
- `FOTOS`: una galería de banda, reutilizando su primera imagen como portada.

Las imágenes pasan por `MultimediaService` e `ImageService`: se generan
las mismas variantes WebP de 480, 960 y 1920 px, sin ampliar imágenes pequeñas.
Los audios se copian al almacenamiento público, sin recodificarlos.
Las duraciones proceden de los metadatos de los archivos originales
y están recogidas en `database/seeders/fixtures/media.php`.

Se marcan los registros como «prueba». Las fechas de lanzamientos y conciertos
son ficticias; no se intenta deducir fechas oficiales de nombres de archivos.
El vídeo, las contraportadas y los logos no se importan: no son canciones,
carteles ni fotos de la galería, y no se sustituye el logo o la portada de inicio.

## Repetir la importación

Repetir el comando reutiliza los registros de prueba con los mismos nombres,
pistas y archivos ya asociados, sin duplicarlos ni sobrescribir ediciones.
Si cambias el título identificador de un registro de prueba, el seeder
puede crear otro con su nombre original.
Una ejecución interrumpida se puede repetir para completar lo que falte.
Los archivos originales nunca se mueven, modifican ni eliminan.
Los nombres antiguos «Concierto de prueba · archivo · identificador» se
sustituyen por los nuevos recintos al repetir el seeder, conservando fechas,
carteles y los mismos registros.

Solo funciona con `APP_ENV=local` o `testing`.
Si la carpeta no existe o no contiene los tres directorios esperados,
se detiene antes de importar. Los archivos ausentes de una pista se avisan y omiten.
La carpeta externa y los audios copiados no deben incluirse en Git.
