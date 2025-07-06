const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { nome, descricao, preco, restaurante_id } = req.body;
  try {
    const result = await req.app.locals.db.query(
      "INSERT INTO pratos (nome, descricao, preco, restaurante_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, descricao, preco, restaurante_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar prato:", err);
    res.status(500).json({ error: "Erro ao criar prato" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await req.app.locals.db.query("SELECT * FROM pratos");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar pratos:", err);
    res.status(500).json({ error: "Erro ao buscar pratos" });
  }
});

router.get("/restaurante/:restaurante_id", async (req, res) => {
  const { restaurante_id } = req.params;
  try {
    const result = await req.app.locals.db.query(
      "SELECT * FROM pratos WHERE restaurante_id = $1",
      [restaurante_id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar pratos por restaurante:", err);
    res.status(500).json({ error: "Erro ao buscar pratos" });
  }
});

router.put("/:id", async (req, res) => {
  const { nome, descricao, preco, url_imagem } = req.body;
  const { id } = req.params;
  try {
    const result = await req.app.locals.db.query(
      "UPDATE pratos SET nome = $1, descricao = $2, preco = $3, url_imagem = $4 WHERE id = $5 RETURNING *",
      [nome, descricao, preco, url_imagem || null, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar prato:", err);
    res.status(500).json({ error: "Erro ao atualizar prato" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await req.app.locals.db.query("DELETE FROM pratos WHERE id = $1", [id]);
    res.status(200).json({ message: "Prato deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar prato:", err);
    res.status(500).json({ error: "Erro ao deletar prato" });
  }
});

module.exports = router;