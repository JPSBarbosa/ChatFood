module.exports = (db) => ({
  findByEmail: async (email) => {
  const result = await db.query(
    "SELECT idusuarios AS id, email, password, tipo, nome, url_foto_perfil FROM usuarios WHERE email = $1", 
    [email]
  );
  return result.rows[0];
},
  create: async (email, passwordHash, tipo) => {
    await db.query(
      "INSERT INTO usuarios (email, password, tipo) VALUES ($1, $2, $3)",
      [email, passwordHash, tipo]
    );
  }
});