const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { nome, url_logo, id_usuario } = req.body;
  try {
    const result = await req.app.locals.db.query(
      "INSERT INTO restaurantes (nome, url_logo, id_usuario) VALUES ($1, $2, $3) RETURNING *",
      [nome, url_logo || null, id_usuario]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar restaurante:", err);
    res.status(500).json({ error: "Erro ao criar restaurante" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await req.app.locals.db.query("SELECT * FROM restaurantes");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar restaurantes:", err);
    res.status(500).json({ error: "Erro ao buscar restaurantes" });
  }
});

router.get("/usuario/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const result = await req.app.locals.db.query(
      "SELECT * FROM restaurantes WHERE id_usuario = $1",
      [id_usuario]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar restaurante do usuário:", err);
    res.status(500).json({ error: "Erro ao buscar restaurante" });
  }
});

router.put("/:id", async (req, res) => {
  const { nome, url_logo } = req.body;
  const { id } = req.params;
  try {
    const result = await req.app.locals.db.query(
      "UPDATE restaurantes SET nome = $1, url_logo = $2 WHERE id = $3 RETURNING *",
      [nome, url_logo || null, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar restaurante:", err);
    res.status(500).json({ error: "Erro ao atualizar restaurante" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await req.app.locals.db.query("DELETE FROM restaurantes WHERE id = $1", [id]);
    res.status(200).json({ message: "Restaurante deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar restaurante:", err);
    res.status(500).json({ error: "Erro ao deletar restaurante" });
  }
});

module.exports = router;