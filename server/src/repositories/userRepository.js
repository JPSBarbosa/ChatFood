// src/repositories/userRepository.js

module.exports = (db) => ({
  async findById(userId) {
    const query = `
      SELECT idusuarios as id, email, nome, tipo, url_foto_perfil 
      FROM usuarios 
      WHERE idusuarios = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  },

  async updateProfile(userId, updateData) {
    const { nome, url_foto_perfil } = updateData;
    const query = `
      UPDATE usuarios 
      SET nome = $1, url_foto_perfil = $2 
      WHERE idusuarios = $3 
      RETURNING idusuarios as id, email, nome, tipo, url_foto_perfil
    `;
    const result = await db.query(query, [nome, url_foto_perfil, userId]);
    return result.rows[0];
  },

  async updateProfileData(userId, nome) {
    const query = `
      UPDATE usuarios 
      SET nome = $1 
      WHERE idusuarios = $2 
      RETURNING idusuarios as id, email, nome, tipo, url_foto_perfil
    `;
    const result = await db.query(query, [nome, userId]);
    return result.rows[0];
  },

  async updateProfileWithPicture(userId, nome, urlFotoPerfil) {
    const query = `
      UPDATE usuarios 
      SET nome = $1, url_foto_perfil = $2 
      WHERE idusuarios = $3 
      RETURNING idusuarios as id, email, nome, tipo, url_foto_perfil
    `;
    const result = await db.query(query, [nome, urlFotoPerfil, userId]);
    return result.rows[0];
  },

  async deleteRestaurantByUserId(userId) {
    const findRestaurantQuery = 'SELECT id FROM restaurantes WHERE id_usuario = $1';
    const restaurantResult = await db.query(findRestaurantQuery, [userId]);
    
    if (restaurantResult.rows.length > 0) {
      const restaurantId = restaurantResult.rows[0].id;
      
      const deletePratosQuery = 'DELETE FROM pratos WHERE restaurante_id = $1';
      await db.query(deletePratosQuery, [restaurantId]);
      
      const deleteRestaurantQuery = 'DELETE FROM restaurantes WHERE id = $1';
      await db.query(deleteRestaurantQuery, [restaurantId]);
    }
  },

  async deleteUser(userId) {
    const query = 'DELETE FROM usuarios WHERE idusuarios = $1';
    const result = await db.query(query, [userId]);
    return result.rowCount > 0;
  }
});