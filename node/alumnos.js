const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: 'backend',
    password: 'ContraseñaSegura123',
    database: 'academico',
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
        <img src="/static/img/logo.png" alt="Logo" class="logo">
        <h1>${title}</h1>
        <div class="nav">
            <a href="/">🏠 Inicio</a> | 
            <a href="/alumnos/registro">👥 Alumnos</a> | 
            <a href="/alumnos/registro/nuevo">➕ Nuevo</a>
        </div>
        <hr>
        ${content}
        <div class="footer">Portal de Alumnos - Nodo: ${process.env.HOSTNAME || 'Desconocido'}</div>
    </div>
</body>
</html>
`;

app.get('/alumnos/registro', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM academico.alumnos ORDER BY id');
        let html = '<table><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Acciones</th></tr>';
        result.rows.forEach(r => {
            html += `<tr>
                <td>${r.id}</td>
                <td>${r.nombre}</td>
                <td>${r.email}</td>
                <td>
                    <a href="/alumnos/registro/editar/${r.id}">✏️</a> | 
                    <a href="/alumnos/registro/borrar/${r.id}" onclick="return confirm('¿Seguro?')">🗑️</a>
                </td>
            </tr>`;
        });
        html += '</table>';
        res.send(getBaseHTML("Gestión de Alumnos", html));
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/alumnos/registro/nuevo', (req, res) => {
    const form = `
        <form action="/alumnos/registro" method="POST">
            <input type="text" name="nombre" placeholder="Nombre Completo" required>
            <input type="email" name="email" placeholder="Email" required>
            <button type="submit">Registrar</button>
        </form>`;
    res.send(getBaseHTML("Nuevo Alumno", form));
});

app.post('/alumnos/registro', async (req, res) => {
    const { nombre, email } = req.body;
    try {
        await pool.query('INSERT INTO academico.alumnos(nombre, email) VALUES($1, $2)', [nombre, email]);
        res.redirect('/alumnos/registro');
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/alumnos/registro/editar/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM academico.alumnos WHERE id = $1', [req.params.id]);
        const r = result.rows[0];
        const form = `
            <form action="/alumnos/registro/update" method="POST">
                <input type="hidden" name="id" value="${r.id}">
                <input type="text" name="nombre" value="${r.nombre}" required>
                <input type="email" name="email" value="${r.email}" required>
                <button type="submit">Actualizar</button>
            </form>`;
        res.send(getBaseHTML("Editar Alumno", form));
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/alumnos/registro/update', async (req, res) => {
    const { id, nombre, email } = req.body;
    try {
        await pool.query('UPDATE academico.alumnos SET nombre=$1, email=$2 WHERE id=$3', [nombre, email, id]);
        res.redirect('/alumnos/registro');
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/alumnos/registro/borrar/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM academico.alumnos WHERE id = $1', [req.params.id]);
        res.redirect('/alumnos/registro');
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(3001, '0.0.0.0', () => console.log("Servidor alumnos en puerto 3001"));
