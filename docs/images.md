# Imágenes de la web

En `/gestion/contenido` se pueden cambiar la foto principal de Inicio y el logo,
editar sus descripciones y restaurar los respaldos originales optimizados.
Solo los administradores pueden guardar cambios. Las carpetas no son editables.

## Procesamiento

- Fotos: WebP, calidad 80, anchuras máximas de 480, 960 y 1920 píxeles.
- Logo: PNG sin pérdida, transparencia conservada, anchuras de 96, 192 y 384.
- No se amplían imágenes pequeñas. La API publica las dimensiones reales para
  que `srcSet` no describa incorrectamente los archivos.
- Antes de subir, el frontend intenta reducir fotos a 4 MB y 2400 píxeles de lado
  máximo. El logo no se recomprime en el navegador.
- Laravel acepta imágenes PNG/JPG/WebP de hasta 5 MB. SVG no se acepta en subidas.
- Las imágenes antiguas siguen funcionando; solo las nuevas tienen tres versiones.
- Al reemplazar, se guarda la imagen nueva antes de retirar la anterior. Los
  archivos antiguos se eliminan después de confirmar la transacción.

## Requisito de PHP

Debe estar habilitado GD (o Imagick para las subidas). En XAMPP, activa
`extension=gd` en el `php.ini` que utiliza el servidor y reinicia Apache o
`php artisan serve`. Comprueba también los límites `upload_max_filesize` y
`post_max_size`: el segundo afecta a toda la petición, no a cada foto individual.
Para lotes de galería, divide la subida si el conjunto supera el límite del servidor.

## Respaldos estáticos

El logo original actual es `frontend/assets/originals/logo-band.png`, copiado de
`LOGOS/LOGO_SOA_FORGOTTEN_TIMES/LOGOV2_WHITE.png`. Conserva su transparencia
y proporción horizontal. La cabecera muestra solo el logo, sin otro nombre
ni numeración en los enlaces.

Los originales del logo y de la foto de inicio se conservan en
`frontend/assets/originals`, fuera de `public`. No se incluyen en el build ni
se sirven al visitante. Solo se publican sus variantes optimizadas.
Para regenerar los respaldos tras cambiar esos originales manualmente:

```powershell
cd backend
php artisan images:optimize-static
```

El comando genera los archivos en `frontend/public/images/optimized` y los
manifiestos de dimensiones en `frontend/src/assets/site-images.json` y
`backend/resources/site-images.json`. Estos archivos deben incluirse en el despliegue.
Las subidas del panel usan el disco público de Laravel y requieren `php artisan storage:link`.

No borres `assets/originals`: permite volver a generar las variantes sin perder
calidad. Las versiones optimizadas y los dos manifiestos se mantienen en Git.

## Comprobación visual

Con Vite en marcha y Chrome instalado, ejecuta `npm run test:a11y` para comprobar
menú móvil, formularios, foco, cierre de modales y navegación de la galería.
`PUBLIC_DESIGN_CHECK=1` añade capturas y verificaciones en ocho anchos de pantalla,
incluidos títulos, filtros, fotos verticales/horizontales y gestos táctiles.
Las capturas se guardan en una carpeta temporal cuya ruta muestra la prueba.

## Pruebas

```powershell
cd backend
php artisan test
cd ../frontend
npm test
npm run build
```

Con Vite en marcha y Chrome instalado, `npm run test:a11y` comprueba el gestor con
una API simulada, sin modificar la BDD. Usa `A11Y_BASE_URL` si Vite no está en el puerto 5173.
