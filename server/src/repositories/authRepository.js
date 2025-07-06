module.exports = (db) => ({
  findByEmail: async (email) => {
  const result = await db.query(
    "SELECT idusuarios AS id, email, password, tipo, nome, url_foto_perfil FROM usuarios WHERE email = $1", 
    [email]
  );
  return result.rows[0];
},
  create: async (email, passwordHash, tipo, nome) => {
    await db.query(
      "INSERT INTO usuarios (email, password, tipo, nome) VALUES ($1, $2, $3, $4)",
      [email, passwordHash, tipo, nome]
    );
  }
});