const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || "mi-rds.xxxxxx.us-east-1.rds.amazonaws.com",
    user: "backend",
    password: "ContraseñaSegura123",
    database: "academico",
    port: 5432
});

// Función para generar el HTML base con CSS e Imagen
const getBaseHTML = (title, content) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <div class="container">
        <img src="/static/img/logo.png" alt="Logo Académico" class="logo">
        <h1>${title}</h1>
        ${content}
        <div class="footer">Sistema Académico Distribuido - Panel de Profesores</div>
    </div>
</body>
</html>
`;

// ======================================
// GESTIÓN DE ASIGNATURAS (HTML)
// ======================================

app.get('/profesores/asignaturas/nueva', (req, res) => {
    const form = `
        <form action="/profesores/asignaturas" method="POST">
            <input type="text" name="nombre" placeholder="Nombre de la Asignatura" required>
            <textarea name="descripcion" placeholder="Descripción"></textarea>
            <input type="number" name="creditos" placeholder="Créditos" required>
            <button type="submit">Crear Asignatura</button>
        </form>
        <br>
        <a href="/profesores/asignaturas">Ver Listado</a>
    `;
    res.send(getBaseHTML("Nueva Asignatura", form));
});

app.post('/profesores/asignaturas', async (req, res) => {
    const { nombre, descripcion, creditos } = req.body;
    try {
        await pool.query(
            `INSERT INTO academico.asignaturas(nombre, descripcion, creditos) VALUES ($1, $2, $3)`,
            [nombre, descripcion, creditos]
        );
        res.send(getBaseHTML("Éxito", "<p>Asignatura creada correctamente.</p><a href='/profesores/asignaturas/nueva'>Volver</a>"));
    } catch (err) {
        res.status(500).send(getBaseHTML("Error", `<p>${err.message}</p>`));
    }
});

app.get('/profesores/asignaturas', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM academico.asignaturas ORDER BY id`);
        let list = "<ul>";
        result.rows.forEach(row => {
            list += `<li><strong>${row.nombre}</strong> (${row.creditos} créditos)</li>`;
        });
        list += "</ul><br><a href='/profesores/asignaturas/nueva'>Añadir Nueva</a>";
        res.send(getBaseHTML("Listado de Asignaturas", list));
    } catch (err) {
        res.status(500).send(getBaseHTML("Error", `<p>${err.message}</p>`));
    }
});

app.listen(3000, () => {
    console.log("Servidor profesores ejecutándose en puerto 3000");
});
