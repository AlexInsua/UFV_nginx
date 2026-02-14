-- Crear esquema
CREATE SCHEMA IF NOT EXISTS academico;

-- ======================================
-- TABLAS
-- ======================================

-- ASIGNATURAS
CREATE TABLE IF NOT EXISTS academico.asignaturas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creditos INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ALUMNOS
CREATE TABLE IF NOT EXISTS academico.alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSCRIPCIONES (relación N:M)
CREATE TABLE IF NOT EXISTS academico.inscripciones (
    id SERIAL PRIMARY KEY,
    alumno_id INT NOT NULL REFERENCES academico.alumnos(id) ON DELETE CASCADE,
    asignatura_id INT NOT NULL REFERENCES academico.asignaturas(id) ON DELETE CASCADE,
    nota NUMERIC(4,2),
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alumno_id, asignatura_id)
);

-- PRACTICAS (relacionadas con asignaturas)
CREATE TABLE IF NOT EXISTS academico.practicas (
    id SERIAL PRIMARY KEY,
    asignatura_id INT NOT NULL REFERENCES academico.asignaturas(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite DATE
);

-- ENTREGAS (relacionadas con prácticas y alumnos)
CREATE TABLE IF NOT EXISTS academico.entregas (
    id SERIAL PRIMARY KEY,
    practica_id INT NOT NULL REFERENCES academico.practicas(id) ON DELETE CASCADE,
    alumno_id INT NOT NULL REFERENCES academico.alumnos(id) ON DELETE CASCADE,
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion NUMERIC(4,2),
    comentario TEXT,
    UNIQUE(practica_id, alumno_id)
);

-- ======================================
-- CREAR ROL
-- ======================================

DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'backend') THEN
      CREATE ROLE backend LOGIN PASSWORD 'ContraseñaSegura123';
   END IF;
END
$do$;

-- ======================================
-- PERMISOS
-- ======================================

-- Permisos sobre el esquema
GRANT USAGE ON SCHEMA academico TO backend;

-- Permisos sobre tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA academico TO backend;

-- Permisos sobre secuencias (para que pueda usar SERIAL / nextval)
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA academico TO backend;

-- Asegurar que futuras tablas y secuencias también otorguen permisos automáticamente
ALTER DEFAULT PRIVILEGES IN SCHEMA academico
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO backend;

ALTER DEFAULT PRIVILEGES IN SCHEMA academico
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO backend;
