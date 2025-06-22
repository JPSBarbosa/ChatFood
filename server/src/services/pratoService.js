// src/services/prato.service.js

module.exports = (pratoRepository) => ({
  async getDishesForHomepage() {
    const dishes = await pratoRepository.findAllDishesWithRestaurants();

    const groupedByRestaurant = dishes.reduce((acc, prato) => {
      let restaurante = acc.find(r => r.id === prato.restaurante_id);

      if (!restaurante) {
        restaurante = {
          id: prato.restaurante_id,
          nome: prato.restaurante_nome,
          pratos: [],
        };
        acc.push(restaurante);
      }

      restaurante.pratos.push({
        id: prato.id,
        nome: prato.prato_nome,
        descricao: prato.descricao,
        preco: prato.preco,
        url_imagem: prato.url_imagem,
      });

      return acc;
    }, []);

    return groupedByRestaurant;
  }
});