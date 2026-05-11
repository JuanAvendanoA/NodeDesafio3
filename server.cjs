const express = require("express"); //importacion de dependencias framework
const cors = require("cors");  // importacion de dependencias cors
const { Pool } = require("pg"); //importacion de dependencias, conexion a postgresql

const app = express(); 
app.use(cors()); //permite peticiones de otros dominios
app.use(express.json()); //Permite leer JSON en req.body (POST, PUT)
app.use(express.static("public")); //sirve estaticos (HTML, SCC, JS) desde la carpeta public 

//conexion a la base datos creando un pool de conexiones a POSTGRESQL, para consultas SQL a la base con estos datos de Login
const pool = new Pool({
  user: "johnny",
  host: "localhost",
  database: "likeme",
  password: "postgres",
  port: 5432,
});

//consulta todos los posts, los ordena por ID descendente y devuelbe un JSON
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener posts:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// lee del body par aindetar en base de datos
app.post("/posts", async (req, res) => {
  const { title, image, description } = req.body;
  // los likes parten en 0 y returning devuelve el Post recien creado
  try {
    const result = await pool.query(
      "INSERT INTO posts (title, image, description, likes) VALUES ($1, $2, $3, 0) RETURNING *",
      [title, image, description],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar post:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//dar like a un post
app.put("/posts/:id/like", async (req, res) => {
  const postId = req.params.id; //toma el id desde la URL
  try {
    const result = await pool.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *", //aumenta los like en 1:
      [postId],
    );

    //En caso que no exista el post
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Post no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar likes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Eliminar un post
app.delete("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await pool.query("DELETE FROM posts WHERE id = $1", [
      postId,
    ]); //Elimina el post por ID
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Post no encontrado" }); //error al eliminar el post si no existe
    res.json({ message: "Post eliminado correctamente" }); //si existe logra eliminarlo
  } catch (error) {
    console.error("Error al eliminar post:", error);
    res.status(500).json({ error: "Error interno del servidor" }); //en caso que no pueda eliminar por error 500, error interno del servidor
  }
});

//esto es para levantar el servidor en el puerto 5000, y queda en estado LISTENING
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
