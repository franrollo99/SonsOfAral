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

Los originales de `frontend/public/images` se conservan. Para regenerar los
respaldos tras cambiarlos manualmente:

```powershell
cd backend
php artisan images:optimize-static
```

El comando genera los archivos en `frontend/public/images/optimized` y los
manifiestos de dimensiones en `frontend/src/assets/site-images.json` y
`backend/resources/site-images.json`. Estos archivos deben incluirse en el despliegue.
Las subidas del panel usan el disco público de Laravel y requieren `php artisan storage:link`.

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
