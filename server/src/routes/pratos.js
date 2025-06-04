const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const db = new Pool();

router.post("/", async (req, res) => {
  const { nome, descricao, preco, id_restaurante } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO pratos (nome, descricao, preco, id_restaurante) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, descricao, preco, id_restaurante]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar prato:", err);
    res.status(500).json({ error: "Erro ao criar prato" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM pratos");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar pratos:", err);
    res.status(500).json({ error: "Erro ao buscar pratos" });
  }
});

router.get("/restaurante/:id_restaurante", async (req, res) => {
  const { id_restaurante } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM pratos WHERE id_restaurante = $1",
      [id_restaurante]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar pratos por restaurante:", err);
    res.status(500).json({ error: "Erro ao buscar pratos" });
  }
});

router.put("/:id", async (req, res) => {
  const { nome, descricao, preco } = req.body;
  const { id } = req.params;
  try {
    const result = await db.query(
      "UPDATE pratos SET nome = $1, descricao = $2, preco = $3 WHERE id = $4 RETURNING *",
      [nome, descricao, preco, id]
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
    await db.query("DELETE FROM pratos WHERE id = $1", [id]);
    res.status(200).json({ message: "Prato deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar prato:", err);
    res.status(500).json({ error: "Erro ao deletar prato" });
  }
});

module.exports = router;