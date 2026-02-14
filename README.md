# Proyecto Académico -- Arquitectura Distribuida con Contenedores Docker

## 1. Descripción General

Este proyecto implementa una arquitectura distribuida basada en
contenedores Docker, diseñada bajo criterios de:

-   Separación de responsabilidades
-   Alta disponibilidad
-   Balanceo de carga multinivel
-   Escalabilidad horizontal
-   Red interna aislada

La solución está compuesta por:

-   1 Base de datos PostgreSQL
-   3 microservicios Node.js (Profesores, Alumnos, Prácticas)
-   2 réplicas por microservicio
-   1 Nginx por cada réplica (mapeo 1:1)
-   1 balanceador principal Nginx
-   1 red interna común

------------------------------------------------------------------------

# 2. Arquitectura General

## 2.1 Esquema de Comunicaciones

    Cliente → Balancer (Nginx:80)
            → Cluster Servicio
                → Nginx interno
                    → Node.js:3001
                        → PostgreSQL

------------------------------------------------------------------------

# 3. Red Docker

Todos los contenedores pertenecen a la red:

    academico-net

Características:

-   Tipo: bridge
-   Comunicación interna por nombre de servicio
-   Ningún contenedor Node expone puertos al host
-   Solo el balanceador principal publica el puerto 80

------------------------------------------------------------------------

# 4. Base de Datos

Servicio: academico-db\
Imagen: postgres:15

Características:

-   Inicialización automática mediante init_db.sql
-   Esquema: academico
-   Usuario aplicación: backend
-   Permisos completos sobre tablas y secuencias

Variables de conexión:

DB_HOST=academico-db\
DB_USER=backend\
DB_PASSWORD=\*\*\*\*\*\*\*\*\
DB_NAME=academico\
PORT=3001

------------------------------------------------------------------------

# 5. Microservicios

Cada dominio funcional dispone de su propio servicio:

  Servicio     Archivo         Función
  ------------ --------------- ------------------------
  Profesores   profesores.js   Gestión de asignaturas
  Alumnos      alumnos.js      Gestión de alumnos
  Prácticas    practicas.js    Gestión de prácticas

Características:

-   Node.js 22
-   Puerto interno 3001
-   Stateless
-   CRUD completo

------------------------------------------------------------------------

# 6. Arquitectura de Balanceo

## Nivel 1 -- Balanceador Principal

Servicio: balancer

Define 3 upstream:

-   profesores_cluster
-   alumnos_cluster
-   practicas_cluster

------------------------------------------------------------------------

## Nivel 2 -- Balanceo Interno 1:1

profesores-nginx-1 → profesores-node-1:3001\
profesores-nginx-2 → profesores-node-2:3001

alumnos-nginx-1 → alumnos-node-1:3001\
alumnos-nginx-2 → alumnos-node-2:3001

practicas-nginx-1 → practicas-node-1:3001\
practicas-nginx-2 → practicas-node-2:3001

------------------------------------------------------------------------

# 7. Flujo de una Petición

1.  Cliente accede a http://localhost\
2.  Petición llega al balancer\
3.  Se redirige al cluster correspondiente\
4.  Nginx interno reenvía a Node\
5.  Node consulta PostgreSQL\
6.  Respuesta vuelve al cliente

------------------------------------------------------------------------

# 8. Alta Disponibilidad

-   Caída de un Node → otro responde\
-   Caída de un Nginx interno → balancer redirige\
-   Escalabilidad horizontal posible

Arquitectura: L7 → L7 → Aplicación

------------------------------------------------------------------------

# 9. Funcionalidades

-   CRUD completo
-   Relaciones N:M
-   Integridad referencial
-   Portal central index.html

------------------------------------------------------------------------

# 10. Despliegue

## Construcción y arranque

docker-compose up --build -d

## Acceso

http://localhost

------------------------------------------------------------------------

# 11. Conclusión

Arquitectura basada en microservicios con:

-   Contenedorización completa
-   Balanceo jerárquico
-   Alta disponibilidad
-   Infraestructura reproducible
