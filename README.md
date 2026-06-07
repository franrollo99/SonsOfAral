# Sons Of Aral

Aplicación web desarrollada por Francisco Rodríguez Llorente como Proyecto Fin de Grado Superior DAW para la banda Sons Of Aral.

## Requisitos

* PHP 8.2 o superior
* Composer
* Node.js
* MySQL

## Usuarios de prueba

### Administrador

* Email: [admin@sonsaral.com](mailto:admin@sonsaral.com)
* Contraseña: admin123

### Cliente

* Email: [cliente@sonsaral.com](mailto:cliente@sonsaral.com)
* Contraseña: cliente123

## Documentación API

La documentación de la API está disponible mediante Swagger una vez iniciado el backend:

http://localhost:8000/api/documentation

## Instalación del Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

## Instalación del Frontend

```bash
cd frontend
npm install
npm run dev
```
