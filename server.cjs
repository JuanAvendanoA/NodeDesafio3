import express from "express";
import cors from "cors";
import { Pool } from "pg";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  user: "johnny",
  host: "localhost",
  database: "like_me",
  password: "postgres",
  port: 5432,
  allowExitOnIdle: true, // Permite que el proceso de Node.js termine incluso si hay conexiones inactivas
});

app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener posts:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/posts", async (req, res) => {
  const { title, image, description } = req.body;
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

app.put("/posts/:id/like", async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *",
      [postId],
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Post no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar likes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await pool.query("DELETE FROM posts WHERE id = $1", [
      postId,
    ]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Post no encontrado" });
    res.json({ message: "Post eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar post:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
