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
            <a href="/practicas/listado">📝 Prácticas</a> | 
            <a href="/practicas/nueva">➕ Nueva</a>
        </div>
        <hr>
        ${content}
        <div class="footer">Gestión de Prácticas - Nodo: ${process.env.HOSTNAME || 'Desconocido'}</div>
    </div>
</body>
</html>
`;

app.get('/practicas/listado', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, a.nombre as asignatura_nombre 
            FROM academico.practicas p 
            JOIN academico.asignaturas a ON p.asignatura_id = a.id 
            ORDER BY p.id`);
        let html = '<table><tr><th>ID</th><th>Título</th><th>Asignatura</th><th>Acciones</th></tr>';
        result.rows.forEach(r => {
            html += `<tr>
                <td>${r.id}</td>
                <td>${r.titulo}</td>
                <td>${r.asignatura_nombre}</td>
                <td>
                    <a href="/practicas/editar/${r.id}">✏️</a> | 
                    <a href="/practicas/borrar/${r.id}" onclick="return confirm('¿Seguro?')">🗑️</a>
                </td>
            </tr>`;
        });
        html += '</table>';
        res.send(getBaseHTML("Listado de Prácticas", html));
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/practicas/nueva', async (req, res) => {
    try {
        const asigs = await pool.query('SELECT id, nombre FROM academico.asignaturas');
        let options = asigs.rows.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
        const form = `
            <form action="/practicas/nueva" method="POST">
                <select name="asignatura_id">${options}</select>
                <input type="text" name="titulo" placeholder="Título" required>
                <textarea name="descripcion" placeholder="Descripción"></textarea>
                <input type="date" name="fecha_limite" required>
                <button type="submit">Guardar</button>
            </form>`;
        res.send(getBaseHTML("Nueva Práctica", form));
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/practicas/nueva', async (req, res) => {
    const { asignatura_id, titulo, descripcion, fecha_limite } = req.body;
    try {
        await pool.query('INSERT INTO academico.practicas(asignatura_id, titulo, descripcion, fecha_limite) VALUES($1, $2, $3, $4)', 
        [asignatura_id, titulo, descripcion, fecha_limite]);
        res.redirect('/practicas/listado');
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/practicas/editar/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM academico.practicas WHERE id = $1', [req.params.id]);
        const r = result.rows[0];
        const asigs = await pool.query('SELECT id, nombre FROM academico.asignaturas');
        let options = asigs.rows.map(a => `<option value="${a.id}" ${a.id === r.asignatura_id ? 'selected' : ''}>${a.nombre}</option>`).join('');
        const form = `
            <form action="/practicas/update" method="POST">
                <input type="hidden" name="id" value="${r.id}">
                <select name="asignatura_id">${options}</select>
                <input type="text" name="titulo" value="${r.titulo}" required>
                <textarea name="descripcion">${r.descripcion}</textarea>
                <input type="date" name="fecha_limite" value="${r.fecha_limite ? r.fecha_limite.toISOString().split('T')[0] : ''}" required>
                <button type="submit">Actualizar</button>
            </form>`;
        res.send(getBaseHTML("Editar Práctica", form));
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/practicas/update', async (req, res) => {
    const { id, asignatura_id, titulo, descripcion, fecha_limite } = req.body;
    try {
        await pool.query('UPDATE academico.practicas SET asignatura_id=$1, titulo=$2, descripcion=$3, fecha_limite=$4 WHERE id=$5', 
        [asignatura_id, titulo, descripcion, fecha_limite, id]);
        res.redirect('/practicas/listado');
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/practicas/borrar/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM academico.practicas WHERE id = $1', [req.params.id]);
        res.redirect('/practicas/listado');
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(3001, '0.0.0.0', () => console.log("Servidor prácticas en puerto 3001"));
