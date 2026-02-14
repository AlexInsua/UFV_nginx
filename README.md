# Proyecto Académico - Arquitectura de Red Única (V4)

Esta versión cumple estrictamente con los requisitos de arquitectura solicitados.

## Especificaciones Técnicas

1.  **Red Única**: Todos los contenedores están en la red `academico-net`.
2.  **Puerto 3001**: Todos los servicios de Node.js escuchan en el puerto 3001.
3.  **Mapeo 1:1 Nginx-Node**:
    - `profesores-nginx-1` -> `profesores-node-1:3001`
    - `profesores-nginx-2` -> `profesores-node-2:3001`
    - `alumnos-nginx-1` -> `alumnos-node-1:3001`
    - `alumnos-nginx-2` -> `alumnos-node-2:3001`
    - `practicas-nginx-1` -> `practicas-node-1:3001`
    - `practicas-nginx-2` -> `practicas-node-2:3001`
4.  **Balanceador Principal**:
    - `upstream profesores_cluster`: Balancea entre `profesores-nginx-1` y `profesores-nginx-2`.
    - `upstream alumnos_cluster`: Balancea entre `alumnos-nginx-1` y `alumnos-nginx-2`.
    - `upstream practicas_cluster`: Balancea entre `practicas-nginx-1` y `practicas-nginx-2`.

## Funcionalidades

- **CRUD Completo**: Gestión total de Asignaturas, Alumnos y Prácticas.
- **Portal Central**: `index.html` con acceso a todos los servicios.
- **Navegación**: Enlaces de retorno al inicio en todas las páginas.
- **Alta Disponibilidad**: Balanceo de carga en dos niveles (L7 -> L7 -> App).

## Despliegue

```bash
docker-compose up --build -d
```
Acceso en `http://localhost`.
