const { Pool } = require('pg');

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: Number(process.env.DB_PORT)
});

exports.findByEmail = async (email) => {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    return result.rows[0];
};

exports.create = async (email, passwordHash, tipo) => {
    await db.query(
        "INSERT INTO usuarios (email, password, tipo) VALUES ($1, $2, $3)",
        [email, passwordHash, tipo]
    );
};
