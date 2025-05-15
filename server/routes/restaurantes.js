const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const db = new Pool();

router.post("/", async (req, res) => {
  const { nome, cnpj, endereco, telefone, id_usuario } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO restaurantes (nome, cnpj, endereco, telefone, id_usuario) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, cnpj, endereco, telefone, id_usuario]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar restaurante:", err);
    res.status(500).json({ error: "Erro ao criar restaurante" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM restaurantes");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar restaurantes:", err);
    res.status(500).json({ error: "Erro ao buscar restaurantes" });
  }
});

router.put("/:id", async (req, res) => {
  const { nome, cnpj, endereco, telefone } = req.body;
  const { id } = req.params;
  try {
    const result = await db.query(
      "UPDATE restaurantes SET nome = $1, cnpj = $2, endereco = $3, telefone = $4 WHERE id = $5 RETURNING *",
      [nome, cnpj, endereco, telefone, id]
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
    await db.query("DELETE FROM restaurantes WHERE id = $1", [id]);
    res.status(200).json({ message: "Restaurante deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar restaurante:", err);
    res.status(500).json({ error: "Erro ao deletar restaurante" });
  }
});

module.exports = router;