// src/repositories/userRepository.js

module.exports = (db) => ({
  findById: async (id) => {

    // Usamos 'idusuarios' nos filtros e selecionamos como 'id' para o resto da aplicação
    const result = await db.query(
      "SELECT idusuarios AS id, email, nome, tipo, url_foto_perfil FROM usuarios WHERE idusuarios = $1", 
      [id]
    );
    return result.rows[0];
  },
  
  updateProfileData: async (id, nome) => {
    const result = await db.query(
      "UPDATE usuarios SET nome = $2 WHERE idusuarios = $1 RETURNING idusuarios AS id, email, nome, tipo, url_foto_perfil", 
      [id, nome]
    );
    return result.rows[0];
  },
  
  // Função para atualizar o nome E a foto
  updateProfileWithPicture: async (id, nome, urlFotoPerfil) => {
    const result = await db.query(
      "UPDATE usuarios SET nome = $2, url_foto_perfil = $3 WHERE idusuarios = $1 RETURNING idusuarios AS id, email, nome, tipo, url_foto_perfil", 
      [id, nome, urlFotoPerfil]
    );
    return result.rows[0];
}

});