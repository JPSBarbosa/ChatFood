console.log('>>> Arquivo de Rota de PRATO foi carregado pelo Node.js');
const { Router } = require('express');

module.exports = (pratoController) => {
  const router = Router();
  router.get('/homepage-pratos', pratoController.getHomepageData);
  return router;
};