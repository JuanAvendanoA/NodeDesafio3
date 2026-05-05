const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Configuración de la conexión a la base de datos
const pool = new Pool({
  host: "localhost",
  user: "johnny", // acceso con usuario de PostgreSQL
  password: "postgres", // acceso con usuario de PostgreSQL
  database: "likeme", // nombre de la base de datos
  allowExitOnIdle: true, // Permite que el proceso de Node.js termine incluso si hay conexiones inactivas
});

// Habilita CORS para el frontend (Permite que el frontend pueda hacer solicitudes al servidor)
app.use(cors());
app.use(express.json()); // Para recibir datos JSON en el cuerpo de las solicitudes

// Ruta GET para obtener todos los posts
app.get("/posts", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM posts");
    res.json(rows); // Devuelve los posts en formato JSON
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    res.status(500).send("Error al obtener los posts");
  }
});

// Ruta POST para agregar un nuevo post
app.post("/posts", async (req, res) => {
  const { titulo, img, descripcion } = req.body;
  const likes = 0; // Valor por defecto para los likes

  try {
    const result = await pool.query(
      "INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING *",
      [titulo, img, descripcion, likes],
    );
    res.json(result.rows[0]); // Devuelve el post recién agregado
  } catch (error) {
    console.error("Error al agregar el post:", error);
    res.status(500).send("Error al agregar el post");
  }
});

// Iniciar el servidor en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
