require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: Number(process.env.DB_PORT)
});

const SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {
    const { email, password, tipo } = req.body;

    try {
        const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            const hash = await bcrypt.hash(password, saltRounds);
            const tipoUsuario = tipo || 'cliente';

            await db.query(
                "INSERT INTO usuarios (email, password, tipo) VALUES ($1, $2, $3)",
                [email, hash, tipoUsuario]
            );

            return res.status(201).json({ message: "Cadastrado com sucesso!" });
        } else {
            return res.status(400).json({ message: "Email já cadastrado!" });
        }
    } catch (err) {
        console.error("Erro no registro:", err);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                const token = jwt.sign(
                    { id: user.id, email: user.email, tipo: user.tipo },
                    SECRET,
                    { expiresIn: '1h' }
                );
                return res.status(200).json({ message: "Login realizado com sucesso!", token });
            } else {
                return res.status(401).json({ message: "Email ou senha incorretos!" });
            }
        } else {
            return res.status(401).json({ message: "Email ou senha incorretos!" });
        }
    } catch (err) {
        console.error("Erro no login:", err);
        return res.status(500).json({ error: "Erro interno no servidor." });
    }
});

app.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});