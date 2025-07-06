const express = require('express');
const router = express.Router();

module.exports = (chatbotService) => {
  // Endpoint de saúde do chatbot
  router.get('/health', (req, res) => {
    res.json({ status: 'Chatbot service is running' });
  });

  // Endpoint de teste para verificar pratos disponíveis
  router.get('/test-dishes', async (req, res) => {
    try {
      const result = await chatbotService.db.query(`
        SELECT p.id, p.nome, p.descricao, p.preco, p.url_imagem, r.nome as restaurante
        FROM pratos p
        JOIN restaurantes r ON p.restaurante_id = r.id
        LIMIT 5
      `);
      res.json({ dishes: result.rows });
    } catch (error) {
      console.error('Erro ao buscar pratos de teste:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  });

  // Endpoint principal do chatbot
  router.post('/message', async (req, res) => {
    try {
      const { message, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Mensagem é obrigatória' 
        });
      }

      console.log('Chatbot recebeu mensagem:', message);
      
      const response = await chatbotService.processMessage(message, userId);
      
      console.log('Chatbot retornou resposta:', response);
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro no chatbot:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  });



  return router;
}; 