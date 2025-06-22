module.exports = (db) => ({
  async findAllDishesWithRestaurants() {
    const query = `
      SELECT
        p.id,
        p.nome AS prato_nome,
        p.descricao,
        p.preco,
        p.url_imagem,
        r.id AS restaurante_id,
        r.nome AS restaurante_nome
      FROM pratos p
      JOIN restaurantes r ON p.restaurante_id = r.id
      ORDER BY r.nome;
    `;
    const { rows } = await db.query(query);
    return rows;
  }
});