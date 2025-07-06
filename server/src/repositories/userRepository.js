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
  },

  // Deletar restaurante por ID do usuário
  deleteRestaurantByUserId: async (userId) => {
    // Primeiro, buscar o ID do restaurante
    const restauranteResult = await db.query(
      "SELECT id FROM restaurantes WHERE id_usuario = $1",
      [userId]
    );
    
    if (restauranteResult.rows.length > 0) {
      const restauranteId = restauranteResult.rows[0].id;
      
      // Deletar todos os pratos do restaurante primeiro
      await db.query(
        "DELETE FROM pratos WHERE restaurante_id = $1",
        [restauranteId]
      );
      
      // Agora deletar o restaurante
      const result = await db.query(
        "DELETE FROM restaurantes WHERE id = $1 RETURNING id",
        [restauranteId]
      );
      return result.rows[0];
    }
    
    return null;
  },

  // Deletar usuário
  deleteUser: async (id) => {
    const result = await db.query(
      "DELETE FROM usuarios WHERE idusuarios = $1 RETURNING idusuarios AS id",
      [id]
    );
    return result.rows[0];
  }
});