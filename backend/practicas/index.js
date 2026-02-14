const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Conexión a PostgreSQL (RDS en AWS)
const pool = new Pool({
    host: process.env.DB_HOST || "mi-rds.xxxxxx.us-east-1.rds.amazonaws.com",
    user: "backend",
    password: "ContraseñaSegura123",
    database: "academico",
    port: 5432
});


// ======================================
// 1️⃣ CREAR PRÁCTICA (Profesor)
// ======================================

app.post('/practicas/crear', async (req, res) => {
    const { asignatura_id, titulo, descripcion, fecha_limite } = req.body;

    try {
        await pool.query(
            `INSERT INTO academico.practicas(asignatura_id, titulo, descripcion, fecha_limite)
             VALUES ($1, $2, $3, $4)`,
            [asignatura_id, titulo, descripcion, fecha_limite]
        );

        res.send("Práctica creada correctamente");
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// ======================================
// 2️⃣ LISTAR PRÁCTICAS POR ASIGNATURA
// ======================================

app.get('/practicas/asignatura/:id', async (req, res) => {
    const asignaturaId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT id, titulo, descripcion, fecha_limite
             FROM academico.practicas
             WHERE asignatura_id = $1
             ORDER BY fecha_creacion DESC`,
            [asignaturaId]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// ======================================
// 3️⃣ VER ENTREGAS DE UNA PRÁCTICA
// ======================================

app.get('/practicas/:id/entregas', async (req, res) => {
    const practicaId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT a.id AS alumno_id,
                    a.nombre,
                    e.fecha_entrega,
                    e.calificacion,
                    e.comentario
             FROM academico.entregas e
             JOIN academico.alumnos a 
                ON e.alumno_id = a.id
             WHERE e.practica_id = $1`,
            [practicaId]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// ======================================
// 4️⃣ SEGUIMIENTO DE ENTREGAS (quién ha entregado y quién no)
// ======================================

app.get('/practicas/:id/seguimiento', async (req, res) => {
    const practicaId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT a.id AS alumno_id,
                    a.nombre,
                    CASE 
                        WHEN e.id IS NOT NULL THEN 'Entregada'
                        ELSE 'Pendiente'
                    END AS estado,
                    e.calificacion
             FROM academico.practicas p
             JOIN academico.inscripciones i 
                ON p.asignatura_id = i.asignatura_id
             JOIN academico.alumnos a 
                ON i.alumno_id = a.id
             LEFT JOIN academico.entregas e 
                ON e.id IS NOT NULL AND e.practica_id = p.id 
                AND e.alumno_id = a.id
             WHERE p.id = $1`,
            [practicaId]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// ======================================
// 5️⃣ CALIFICAR ENTREGA
// ======================================

app.put('/practicas/calificar', async (req, res) => {
    const { practica_id, alumno_id, calificacion, comentario } = req.body;

    try {
        await pool.query(
            `UPDATE academico.entregas
             SET calificacion = $1,
                 comentario = $2
             WHERE practica_id = $3 
             AND alumno_id = $4`,
            [calificacion, comentario, practica_id, alumno_id]
        );

        res.send("Entrega calificada correctamente");
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// ======================================
// INICIO SERVIDOR
// ======================================

app.listen(3000, () => {
    console.log("Servidor prácticas ejecutándose en puerto 3000");
});
