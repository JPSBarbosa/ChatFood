const natural = require('natural');
const stringSimilarity = require('string-similarity');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatbotService {
  constructor(db) {
    this.db = db;
    this.tokenizer = new natural.WordTokenizer();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key-here');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.tempCart = new Map();
  }

  // Processa a mensagem do usuário e retorna uma resposta 
  async processMessage(userMessage, userId = null) {
    const message = userMessage.toLowerCase();
    
    // Análise de intenção usando palavras-chave
    const intent = this.analyzeIntent(message);
    
    switch (intent.type) {
      case 'greeting':
        return this.generateGreetingResponse();
      
      case 'menu_request':
        return await this.getMenuInformation();
      
      case 'restaurant_info':
        return await this.getRestaurantInformation();
      
      case 'price_inquiry':
        return await this.getPriceInformation();
      
      case 'order_help':
        return this.getOrderHelp();
      
      case 'add_to_cart':
        return await this.addToCart(message, userId);
      
      case 'view_cart':
        return await this.viewCart(userId);
      
      case 'clear_cart':
        return await this.clearCart(userId);
      
      case 'recommendations':
        return await this.getRecommendations(message, userId);
      
      case 'unknown':
      default:
        const result = await this.db.query(`
          SELECT p.id, p.nome, p.descricao, p.preco, p.url_imagem, r.nome as restaurante
          FROM pratos p
          JOIN restaurantes r ON p.restaurante_id = r.id
        `);
        const dishes = result.rows;
        const mentionedDish = dishes.find(dish => message.includes(dish.nome.toLowerCase()));
        if (mentionedDish) {
          return await this.addToCart(message, userId);
        }
        // Se não mencionar prato, cai no IA
        return await this.generateAIResponse(message);
    }
  }

  // Analisa a intenção da mensagem 
  analyzeIntent(message) {
    const words = this.tokenizer.tokenize(message);
    
    // Palavras-chave para diferentes intenções
    const intents = {
      greeting: ['olá', 'oi', 'hello', 'bom dia', 'boa tarde', 'boa noite', 'hey'],
      menu_request: ['cardápio', 'menu', 'pratos', 'comida', 'refeição', 'almoço', 'jantar', 'lanche'],
      restaurant_info: ['restaurante', 'restaurantes', 'local', 'endereço', 'onde'],
      price_inquiry: ['preço', 'valor', 'custo', 'quanto custa', 'quanto é'],
      order_help: ['pedido', 'comprar', 'carrinho', 'como fazer', 'ajuda'],
      add_to_cart: [
        'adicionar', 'quero', 'gostaria', 'pedir', 'comprar', 'adiciona',
        'me vê', 'me envie', 'traga', 'coloca', 'manda', 'envia', 'serve',
        'gostaria de', 'me dá', 'me traz', 'coloque', 'adiciona', 'inclua',
        'pode trazer', 'pode colocar', 'pode adicionar', 'me arruma', 'me manda',
        'me serve', 'me entrega', 'me coloca', 'me adiciona', 'me inclui', 'me envia'
      ],
      view_cart: ['carrinho', 'pedido', 'ver carrinho', 'meu pedido'],
      clear_cart: [
        'limpar', 'remover', 'cancelar', 'esvaziar', 'limpa', 'remove',
        'cancela', 'esvazia', 'limpar carrinho', 'remover tudo', 'cancelar pedido',
        'esvaziar carrinho', 'limpa tudo', 'remove tudo', 'cancela pedido',
        'me limpa', 'me remove', 'me cancela', 'me esvazia', 'limpar tudo',
        'remover carrinho', 'cancelar tudo', 'esvaziar tudo', 'zerar carrinho',
        'zerar pedido', 'resetar carrinho', 'resetar pedido'
      ],
      recommendations: [
        'recomenda', 'sugestão', 'indicar', 'melhor', 'popular',
        'italiano', 'japonês', 'brasileiro', 'chinês', 'mexicano', 'árabe',
        'massa', 'carne', 'frango', 'peixe', 'vegetariano', 'vegano',
        'pizza', 'hambúrguer', 'sushi', 'lasanha', 'espaguete',
        'o que tem de bom', 'o que é bom', 'o que recomenda',
        'me sugere', 'me indica', 'me recomenda', 'me mostra'
      ]
    };

    let bestIntent = 'unknown';
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(intents)) {
      const score = stringSimilarity.findBestMatch(message, keywords).bestMatch.rating;
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    return { type: bestIntent, confidence: bestScore };
  }

  // resposta de saudação
  generateGreetingResponse() {
    const greetings = [
      "Olá! Sou o assistente inteligente do ChatFood. Como posso ajudá-lo hoje?",
      "Oi! Estou aqui para ajudá-lo a encontrar os melhores pratos e fazer seus pedidos!",
      "Olá! Que tal explorarmos os deliciosos pratos dos nossos restaurantes parceiros?"
    ];
    return {
      message: greetings[Math.floor(Math.random() * greetings.length)],
      type: 'greeting'
    };
  }

  // informações do cardápio
  async getMenuInformation() {
    try {
      const result = await this.db.query(`
        SELECT r.nome as restaurante, p.nome as prato, p.descricao, p.preco, p.id, p.url_imagem
        FROM pratos p
        JOIN restaurantes r ON p.restaurante_id = r.id
        ORDER BY r.nome, p.nome
      `);

      const menu = result.rows;
      const restaurants = {};
      
      menu.forEach(item => {
        if (!restaurants[item.restaurante]) {
          restaurants[item.restaurante] = [];
        }
        restaurants[item.restaurante].push(item);
      });

      let response = "🍽️ <strong>Cardápio Completo:</strong>\n\n";
      
      for (const [restaurant, dishes] of Object.entries(restaurants)) {
        response += `<strong>${restaurant}:</strong>\n`;
        dishes.forEach(dish => {
          const preco = parseFloat(dish.preco) || 0;
          response += `• ${dish.prato} - R$ ${preco.toFixed(2)}\n`;
        });
        response += "\n";
      }

      return {
        message: response,
        type: 'menu_info',
        data: { menu, restaurants }
      };
    } catch (error) {
      console.error('Erro ao buscar cardápio:', error);
      return {
        message: "Desculpe, não consegui carregar o cardápio no momento. Tente novamente em alguns instantes.",
        type: 'error'
      };
    }
  }

  // informações dos restaurantes
  async getRestaurantInformation() {
    try {
      const result = await this.db.query(`
        SELECT id, nome, url_logo
        FROM restaurantes
        ORDER BY nome
      `);

      const restaurants = result.rows;
      let response = "🏪 <strong>Nossos Restaurantes Parceiros:</strong>\n\n";
      
      restaurants.forEach(restaurant => {
        response += `<strong>${restaurant.nome}</strong>\n`;
        if (restaurant.url_logo) {
          response += `🖼️ Logo disponível\n`;
        }
        response += "\n";
      });

      return {
        message: response,
        type: 'restaurant_info',
        data: { restaurants }
      };
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error);
      return {
        message: "Desculpe, não consegui carregar as informações dos restaurantes.",
        type: 'error'
      };
    }
  }

  // informações de preços
  async getPriceInformation() {
    try {
      const result = await this.db.query(`
        SELECT p.nome as prato, p.preco, r.nome as restaurante
        FROM pratos p
        JOIN restaurantes r ON p.restaurante_id = r.id
        ORDER BY p.preco
      `);

      const dishes = result.rows;
      let response = "💰 <strong>Faixa de Preços:</strong>\n\n";
      
      if (dishes.length > 0) {
        const precos = dishes.map(d => parseFloat(d.preco) || 0);
        const minPrice = Math.min(...precos);
        const maxPrice = Math.max(...precos);
        
        response += `<strong>Preços variam de R$ ${minPrice.toFixed(2)} a R$ ${maxPrice.toFixed(2)}</strong>\n\n`;
        response += "<strong>Alguns pratos populares:</strong>\n";
        
        // alguns pratos de exemplo
        dishes.slice(0, 5).forEach(dish => {
          const preco = parseFloat(dish.preco) || 0;
          response += `• ${dish.prato} (${dish.restaurante}) - R$ ${preco.toFixed(2)}\n`;
        });
      }

      return {
        message: response,
        type: 'price_info',
        data: { dishes }
      };
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
      return {
        message: "Desculpe, não consegui carregar as informações de preços.",
        type: 'error'
      };
    }
  }

  // Ajuda com pedidos
  getOrderHelp() {
    return {
      message: "🛒 <strong>Como Fazer um Pedido:</strong>\n\n" +
               "1. <strong>Navegue pelos pratos</strong> na página principal\n" +
               "2. <strong>Clique em 'Adicionar ao Carrinho'</strong> nos pratos desejados\n" +
               "3. <strong>Revise seu carrinho</strong> no painel lateral\n" +
               "4. <strong>Finalize o pedido</strong> e aguarde a confirmação\n\n" +
               "Posso ajudá-lo a encontrar pratos específicos ou fazer recomendações!",
      type: 'order_help'
    };
  }

  // Adiciona item ao carrinho usando IA
  async addToCart(message, userId) {
    try {
      // Busca todos os pratos disponíveis
      const result = await this.db.query(`
        SELECT p.id, p.nome, p.descricao, p.preco, p.url_imagem, r.nome as restaurante
        FROM pratos p
        JOIN restaurantes r ON p.restaurante_id = r.id
      `);

      const dishes = result.rows;
      
      // Usa IA para encontrar o prato mais relevante
      const selectedDish = await this.findBestDishMatch(message, dishes);
      
      if (!selectedDish) {
        return {
          message: "Desculpe, não consegui identificar qual prato você gostaria. Pode ser mais específico?",
          type: 'error'
        };
      }

      // Converte o preço para número
      const preco = parseFloat(selectedDish.preco) || 0;

      // Cria o item para o carrinho
      const newItem = {
        id: selectedDish.id,
        nome: selectedDish.nome,
        preco: preco,
        restaurante: selectedDish.restaurante,
        url_imagem: selectedDish.url_imagem,
        quantidade: 1
      };

      // Adiciona ao carrinho em memória
      const cartKey = `${userId || 'default'}`;
      const currentCart = this.tempCart.get(cartKey) || [];
      
      // Verifica se o item já existe no carrinho
      const existingItemIndex = currentCart.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        // Se já existe, aumenta a quantidade
        currentCart[existingItemIndex].quantidade += 1;
      } else {
        // Se não existe, adiciona novo item
        currentCart.push(newItem);
      }
      
      // Atualiza o carrinho
      this.tempCart.set(cartKey, currentCart);

      return {
        message: `✅ <strong>Adicionado ao carrinho:</strong>\n\n` +
                 `🍽️ <strong>${selectedDish.nome}</strong>\n` +
                 `🏪 ${selectedDish.restaurante}\n` +
                 `💰 R$ ${preco.toFixed(2)}\n\n` +
                 `Deseja adicionar mais algum prato ou ver seu carrinho?`,
        type: 'cart_added',
        data: { 
          newItem: newItem,
          cartItems: currentCart
        }
      };
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      return {
        message: "Desculpe, ocorreu um erro ao adicionar o item ao carrinho.",
        type: 'error'
      };
    }
  }

  // Encontra o melhor prato usando IA
  async findBestDishMatch(message, dishes) {
    try {
      // Usa Gemini para análise semântica
      const prompt = `Você é um assistente especializado em encontrar pratos de comida. 
      Analise a mensagem do usuário e retorne apenas o nome do prato mais adequado 
      da lista fornecida. Se não encontrar correspondência, retorne "NENHUM".

      Mensagem do usuário: "${message}"
      
      Pratos disponíveis:
      ${dishes.map(d => `- ${d.nome} (${d.restaurante})`).join('\n')}
      
      Retorne apenas o nome do prato mais adequado ou "NENHUM".`;

      const result = await this.model.generateContent(prompt);
      const aiResponse = result.response.text().trim();
      
      if (aiResponse === "NENHUM") {
        // Fallback para busca por similaridade
        return this.findDishBySimilarity(message, dishes);
      }

      // Encontra o prato pelo nome retornado pela IA
      const selectedDish = dishes.find(dish => 
        dish.nome.toLowerCase().includes(aiResponse.toLowerCase()) ||
        aiResponse.toLowerCase().includes(dish.nome.toLowerCase())
      );

      return selectedDish || this.findDishBySimilarity(message, dishes);
    } catch (error) {
      console.error('Erro na IA:', error);
      // Fallback para busca por similaridade
      return this.findDishBySimilarity(message, dishes);
    }
  }

  // Busca por similaridade de texto (fallback)
  findDishBySimilarity(message, dishes) {
    const dishNames = dishes.map(d => d.nome);
    const bestMatch = stringSimilarity.findBestMatch(message, dishNames);
    
    if (bestMatch.bestMatch.rating > 0.3) {
      return dishes.find(d => d.nome === bestMatch.bestMatch.target);
    }
    
    return null;
  }

  // Visualiza carrinho
  async viewCart(userId) {
    const cartKey = `${userId || 'default'}`;
    const cartItems = this.tempCart.get(cartKey) || [];

    if (cartItems.length === 0) {
      return {
        message: "🛒 Seu carrinho está vazio. Que tal adicionar alguns pratos deliciosos?",
        type: 'empty_cart'
      };
    }

    const total = cartItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    
    let response = "🛒 <strong>Seu Carrinho:</strong>\n\n";
    cartItems.forEach(item => {
      response += `• ${item.nome} (${item.restaurante})\n`;
      response += `  R$ ${item.preco.toFixed(2)} x ${item.quantidade}\n\n`;
    });
    response += `<strong>Total: R$ ${total.toFixed(2)}</strong>\n\n`;
    response += "Deseja finalizar o pedido ou adicionar mais itens?";

    return {
      message: response,
      type: 'cart_view',
      data: { cartItems, total }
    };
  }

  // Limpa carrinho
  async clearCart(userId) {
    const cartKey = `${userId || 'default'}`;
    const cartItems = this.tempCart.get(cartKey) || [];
    this.tempCart.delete(cartKey);
    
    if (cartItems.length === 0) {
      return {
        message: "🛒 Seu carrinho já estava vazio! Que tal adicionar alguns pratos deliciosos?",
        type: 'cart_cleared'
      };
    }
    
    return {
      message: `🗑️ <strong>Carrinho limpo com sucesso!</strong>\n\n` +
               `Removidos ${cartItems.length} item(s) do seu carrinho.\n\n` +
               `Que tal começar um novo pedido?`,
      type: 'cart_cleared',
      data: { clearedItems: cartItems }
    };
  }

  // Gera recomendações personalizadas usando IA
  async getRecommendations(message, userId) {
    try {
      // Busca todos os pratos disponíveis
      const result = await this.db.query(`
        SELECT p.nome, p.descricao, p.preco, p.url_imagem, r.nome as restaurante
        FROM pratos p
        JOIN restaurantes r ON p.restaurante_id = r.id
        ORDER BY p.nome
      `);

      const allDishes = result.rows;
      
      // Usa IA para encontrar pratos relacionados
      const prompt = `Você é um especialista em culinária e recomendações de comida.
      Analise a mensagem do usuário e encontre pratos relacionados da lista fornecida.
      
      Mensagem do usuário: "${message}"
      
      Pratos disponíveis:
      ${allDishes.map(d => `- ${d.nome} (${d.restaurante}) - ${d.descricao}`).join('\n')}
      
      Retorne apenas os nomes dos pratos mais relacionados (máximo 5), separados por vírgula.
      Se não encontrar pratos relacionados, retorne "NENHUM".
      Exemplo de resposta: "Pizza Margherita, Lasanha, Espaguete"`;

      const aiResult = await this.model.generateContent(prompt);
      const aiResponse = aiResult.response.text().trim();
      
      let recommendations = [];
      
      if (aiResponse !== "NENHUM") {
        // Processa a resposta da IA
        const recommendedNames = aiResponse.split(',').map(name => name.trim());
        
        // Encontra os pratos recomendados
        recommendations = allDishes.filter(dish => 
          recommendedNames.some(name => 
            dish.nome.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(dish.nome.toLowerCase())
          )
        );
      }
      
      // Se a IA não encontrou nada ou encontrou poucos, adiciona alguns aleatórios
      if (recommendations.length < 3) {
        const randomDishes = allDishes
          .filter(dish => !recommendations.find(r => r.id === dish.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 5 - recommendations.length);
        
        recommendations = [...recommendations, ...randomDishes];
      }
      
      // Limita a 5 recomendações
      recommendations = recommendations.slice(0, 5);
      
      let response = "🌟 <strong>Recomendações Especiais:</strong>\n\n";
      
      recommendations.forEach((dish, index) => {
        const preco = parseFloat(dish.preco) || 0;
        response += `${index + 1}. <strong>${dish.nome}</strong>\n`;
        response += `   🏪 ${dish.restaurante}\n`;
        response += `   💰 R$ ${preco.toFixed(2)}\n`;
        response += `   📝 ${dish.descricao}\n\n`;
      });

      response += "Gostaria de adicionar algum desses pratos ao seu carrinho?";

      return {
        message: response,
        type: 'recommendations',
        data: { recommendations }
      };
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      return {
        message: "Desculpe, não consegui gerar recomendações no momento.",
        type: 'error'
      };
    }
  }

  // Gera resposta usando IA quando não entende a pergunta
  async generateAIResponse(message) {
    try {
      const prompt = `Você é um assistente amigável do ChatFood, um app de comida.\n\
      Responda de forma natural e útil, sempre em português.\n\
      Seja breve e direto ao ponto.\n\
      Nunca pergunte sobre tamanho do prato, endereço de entrega ou opções adicionais.\n\
      Se o usuário pedir para finalizar o pedido, apenas responda que o pedido foi registrado e que ele será processado, sem pedir mais informações.\n\
      Pergunta do usuário: ${message}`;

      const result = await this.model.generateContent(prompt);
      
      return {
        message: result.response.text(),
        type: 'ai_response'
      };
    } catch (error) {
      console.error('Erro na IA:', error);
      return {
        message: "Desculpe, não entendi sua pergunta. Posso ajudá-lo com informações sobre restaurantes, pratos, pedidos, preços ou entrega. O que você gostaria de saber?",
        type: 'fallback'
      };
    }
  }
}

module.exports = ChatbotService; 