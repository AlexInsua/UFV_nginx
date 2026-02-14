CREATE SCHEMA IF NOT EXISTS academico;

-- ASIGNATURAS
CREATE TABLE academico.asignaturas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creditos INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ALUMNOS
CREATE TABLE academico.alumnos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSCRIPCIONES (relación N:M)
CREATE TABLE academico.inscripciones (
    id SERIAL PRIMARY KEY,
    alumno_id INT NOT NULL REFERENCES academico.alumnos(id) ON DELETE CASCADE,
    asignatura_id INT NOT NULL REFERENCES academico.asignaturas(id) ON DELETE CASCADE,
    nota NUMERIC(4,2),
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alumno_id, asignatura_id)
);

-- PRACTICAS (relacionadas con asignaturas)
CREATE TABLE academico.practicas (
    id SERIAL PRIMARY KEY,
    asignatura_id INT NOT NULL 
        REFERENCES academico.asignaturas(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite DATE
);

-- ENTREGAS (relacionadas con prácticas y alumnos)
CREATE TABLE academico.entregas (
    id SERIAL PRIMARY KEY,
    practica_id INT NOT NULL 
        REFERENCES academico.practicas(id) ON DELETE CASCADE,
    alumno_id INT NOT NULL 
        REFERENCES academico.alumnos(id) ON DELETE CASCADE,
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calificacion NUMERIC(4,2),
    comentario TEXT,
    UNIQUE(practica_id, alumno_id)
);

-- Permisos backend
CREATE ROLE backend LOGIN PASSWORD 'ContraseñaSegura123';

GRANT USAGE ON SCHEMA academico TO backend;
GRANT SELECT, INSERT, UPDATE, DELETE 
ON ALL TABLES IN SCHEMA academico 
TO backend;
