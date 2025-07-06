const ChatbotService = require('../services/chatbotService');

class ChatbotController {
  constructor(chatbotService) {
    this.chatbotService = chatbotService;
  }

  // Processa mensagem do usuário
  async processMessage(req, res) {
    try {
      const { message, userId, cartItems } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Mensagem é obrigatória e deve ser uma string'
        });
      }

      const response = await this.chatbotService.processMessage(message, userId, cartItems);

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro no controller do chatbot:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Busca informações do cardápio
  async getMenu(req, res) {
    try {
      const response = await this.chatbotService.getMenuInformation();
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar cardápio'
      });
    }
  }

  // Busca informações dos restaurantes
  async getRestaurants(req, res) {
    try {
      const response = await this.chatbotService.getRestaurantInformation();
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar restaurantes'
      });
    }
  }

  // Busca informações de preços
  async getPrices(req, res) {
    try {
      const response = await this.chatbotService.getPriceInformation();
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar preços'
      });
    }
  }

  // Adiciona item ao carrinho
  async addToCart(req, res) {
    try {
      const { message, userId } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Mensagem é obrigatória'
        });
      }

      const response = await this.chatbotService.addToCart(message, userId);
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao adicionar ao carrinho'
      });
    }
  }

  // Visualiza carrinho
  async viewCart(req, res) {
    try {
      const { userId } = req.params;
      const { cartItems } = req.body;
      const response = await this.chatbotService.viewCart(userId, cartItems);
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro ao visualizar carrinho:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao visualizar carrinho'
      });
    }
  }

  // Limpa carrinho
  async clearCart(req, res) {
    try {
      const { userId } = req.params;
      const response = await this.chatbotService.clearCart(userId);
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao limpar carrinho'
      });
    }
  }



  // Gera recomendações
  async getRecommendations(req, res) {
    try {
      const { message, userId } = req.body;
      const response = await this.chatbotService.getRecommendations(message, userId);
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar recomendações'
      });
    }
  }

  // Teste de conectividade
  async healthCheck(req, res) {
    res.json({
      success: true,
      message: 'Chatbot está funcionando!',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ChatbotController; 