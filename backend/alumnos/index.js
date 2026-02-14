const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    host: process.env.DB_HOST || "mi-rds.xxxxxx.us-east-1.rds.amazonaws.com",
    user: "backend",
    password: "ContraseñaSegura123",
    database: "academico",
    port: 5432
});

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
        <div class="footer">Sistema Académico Distribuido - Portal de Alumnos</div>
    </div>
</body>
</html>
`;

app.get('/alumnos/registro', (req, res) => {
    const form = `
        <form action="/alumnos/registro" method="POST">
            <input type="text" name="nombre" placeholder="Tu Nombre Completo" required>
            <input type="email" name="email" placeholder="Tu Email" required>
            <button type="submit">Registrarse</button>
        </form>
    `;
    res.send(getBaseHTML("Registro de Alumno", form));
});

app.post('/alumnos/registro', async (req, res) => {
    const { nombre, email } = req.body;
    try {
        await pool.query(
            `INSERT INTO academico.alumnos(nombre, email) VALUES ($1, $2)`,
            [nombre, email]
        );
        res.send(getBaseHTML("Bienvenido", "<p>Registro completado con éxito.</p><a href='/alumnos/asignaturas'>Ver Asignaturas</a>"));
    } catch (err) {
        res.status(500).send(getBaseHTML("Error", `<p>${err.message}</p>`));
    }
});

app.get('/alumnos/asignaturas', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM academico.asignaturas ORDER BY id`);
        let list = "<ul>";
        result.rows.forEach(row => {
            list += `<li>${row.nombre} - <a href='#'>Inscribirse</a></li>`;
        });
        list += "</ul>";
        res.send(getBaseHTML("Asignaturas Disponibles", list));
    } catch (err) {
        res.status(500).send(getBaseHTML("Error", `<p>${err.message}</p>`));
    }
});

app.listen(3000, () => {
    console.log("Servidor alumnos ejecutándose en puerto 3000");
});
