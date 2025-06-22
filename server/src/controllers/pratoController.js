// src/controllers/prato.controller.js

module.exports = (pratoService) => ({
  async getHomepageData(req, res) {
    try {
      const data = await pratoService.getDishesForHomepage();
      res.status(200).json(data);
    } catch (error) {
      console.error('Erro no controller ao buscar dados para homepage:', error);
      res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }
});