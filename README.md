# Proyecto Académico - Arquitectura en AWS

Este proyecto contiene la estructura y el código para un sistema académico distribuido, diseñado para ser desplegado en AWS con una arquitectura de alta disponibilidad.

## Estructura del Proyecto

- `database/`: Contiene el script SQL (`schema.sql`) para inicializar la base de datos PostgreSQL.
- `public/`: Archivos estáticos (CSS, Imágenes) que Nginx sirve directamente.
- `nginx/`:
  - `load_balancer/`: Configuración para el servidor Nginx que actúa como balanceador de carga.
  - `web_server/`: Configuración para los servidores Nginx que actúan como proxies inversos y sirven los archivos estáticos.
- `backend/`:
  - `profesores/`: Lógica del backend para la gestión de profesores (genera HTML dinámico).
  - `alumnos/`: Lógica del backend para la gestión de alumnos (genera HTML dinámico).
  - `practicas/`: Lógica del backend para la gestión de prácticas.

## Requisitos

- Node.js y npm instalados.
- Base de datos PostgreSQL (RDS recomendado).
- Servidores Nginx para el balanceo de carga y proxy inverso.

## Instalación del Backend

En cada carpeta de backend (`profesores`, `alumnos`, `practicas`), puedes instalar las dependencias necesarias:

```bash
npm install
```

## Configuración

Asegúrate de configurar la variable de entorno `DB_HOST` con la dirección de tu base de datos RDS, o edita directamente los archivos `index.js` con las credenciales correctas.

## Arquitectura y Archivos Estáticos

El sistema utiliza un balanceador de carga que distribuye el tráfico a diferentes clústeres de servidores según la ruta.

### Servidor Web (Nginx) como Servidor de Estáticos
En esta versión, Nginx en los Web Servers está configurado para:
1.  **Servir archivos estáticos**: Las peticiones a `/static/` son gestionadas directamente por Nginx desde la carpeta `/var/www/public/`, lo que mejora el rendimiento al no sobrecargar a Node.js con archivos pesados como imágenes o CSS.
2.  **Proxy Inverso**: Las peticiones dinámicas se pasan al servidor Node.js en el puerto 3000.

### Rutas del Load Balancer
- `/profesores/` -> Clúster de Profesores
- `/alumnos/` -> Clúster de Alumnos
- `/practicas/` -> Clúster de Prácticas
