import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = ({ onCartUpdate, currentCartItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! Sou o assistente inteligente do ChatFood. Como posso ajudá-lo hoje?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const messagesEndRef = useRef(null);

  // Adiciona animação visual quando o carrinho é atualizado
  const [isCartUpdated, setIsCartUpdated] = useState(false);
  const prevCartLength = useRef(cartItems.length);

  // Inicializa o carrinho local do Chatbot apenas uma vez com o carrinho da HomePage
  useEffect(() => {
    setCartItems(currentCartItems || []);
    // eslint-disable-next-line
  }, []);

  // Não existe mais useEffect para sincronizar cartItems com currentCartItems!

  useEffect(() => {
    if (cartItems.length > prevCartLength.current) {
      setIsCartUpdated(true);
      const timer = setTimeout(() => setIsCartUpdated(false), 600);
      return () => clearTimeout(timer);
    }
    prevCartLength.current = cartItems.length;
  }, [cartItems]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verifica se o backend está conectado
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Notifica a HomePage quando o carrinho muda
  useEffect(() => {
    if (onCartUpdate) {
      console.log('Chatbot: Notificando HomePage sobre mudança no carrinho:', cartItems);
      onCartUpdate(cartItems);
    }
  }, [cartItems, onCartUpdate]);

  const checkBackendConnection = async () => {
    try {
      await axios.get('http://localhost:3001/api/chatbot/health');
      setIsConnected(true);
    } catch (error) {
      console.warn('Backend do chatbot não está disponível, usando modo offline');
      setIsConnected(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      if (isConnected) {
        // Usa o backend de IA
        const response = await axios.post('http://localhost:3001/api/chatbot/message', {
          message: inputMessage,
          userId: null // Em produção, seria o ID do usuário logado
        });

        const botResponse = response.data.data;
        
        const botMessage = {
          id: messages.length + 2,
          text: botResponse.message,
          sender: 'bot',
          timestamp: new Date(),
          type: botResponse.type,
          data: botResponse.data
        };

        setMessages(prev => [...prev, botMessage]);

        // Atualiza o carrinho local se foi adicionado um item
        if (botResponse.type === 'cart_added' && botResponse.data?.newItem) {
          // Atualiza o carrinho local com todos os itens
          if (botResponse.data.cartItems) {
            setCartItems(botResponse.data.cartItems);
          }
          // Notifica HomePage para sincronizar o carrinho
          if (onCartUpdate) {
            onCartUpdate(botResponse.data.cartItems || [botResponse.data.newItem]);
          }
        }

        // Atualiza o carrinho se foi visualizado
        if (botResponse.type === 'cart_view' && botResponse.data?.cartItems) {
          setCartItems(botResponse.data.cartItems);
        }

        // Limpa o carrinho se foi limpo
        if (botResponse.type === 'cart_cleared') {
          setCartItems([]);
          // Notifica HomePage para limpar o carrinho
          if (onCartUpdate) {
            onCartUpdate([]);
          }
        }

      } else {
        // Modo offline com respostas básicas
        const botResponse = generateOfflineResponse(inputMessage);
        const botMessage = {
          id: messages.length + 2,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      // Fallback para modo offline
      const botResponse = generateOfflineResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Respostas offline quando o backend não está disponível
  const generateOfflineResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('restaurante') || input.includes('restaurantes')) {
      return "Temos vários restaurantes parceiros! Você pode ver todos os pratos disponíveis na página principal. Posso ajudá-lo a encontrar algo específico?";
    }
    
    if (input.includes('cardápio') || input.includes('menu') || input.includes('pratos')) {
      return "Nossos restaurantes oferecem uma grande variedade de pratos! Você pode navegar pelos cards na página principal para ver todas as opções disponíveis.";
    }
    
    if (input.includes('pedido') || input.includes('comprar') || input.includes('carrinho')) {
      return "Para fazer um pedido, basta clicar no botão 'Adicionar ao Carrinho' nos pratos que desejar. Depois você pode finalizar sua compra no carrinho!";
    }
    
    if (input.includes('preço') || input.includes('valor') || input.includes('custo')) {
      return "Os preços variam de acordo com cada prato e restaurante. Você pode ver o preço de cada item diretamente nos cards dos pratos.";
    }
    
    if (input.includes('ajuda') || input.includes('suporte')) {
      return "Estou aqui para ajudar! Posso responder perguntas sobre restaurantes, pratos, pedidos e preços. O que você gostaria de saber?";
    }
    
    if (input.includes('olá') || input.includes('oi') || input.includes('hello')) {
      return "Olá! Como posso ajudá-lo hoje? Posso responder perguntas sobre nossos restaurantes, pratos e como fazer pedidos!";
    }
    
    return "Desculpe, não entendi sua pergunta. Posso ajudá-lo com informações sobre restaurantes, pratos, pedidos ou preços. O que você gostaria de saber?";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Renderiza mensagem com formatação especial
  const renderMessage = (message) => {
    if (message.type === 'menu_info' && message.data) {
      return (
        <div className="message-content">
          <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }} />
          <div className="menu-preview">
            <small>📋 Cardápio carregado com {Object.keys(message.data.restaurants).length} restaurantes</small>
          </div>
        </div>
      );
    }
    
    if (message.type === 'cart_added' && message.data) {
      return (
        <div className="message-content">
          <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }} />
          <div className="cart-item-added">
            <small>✅ Item adicionado com sucesso!</small>
          </div>
        </div>
      );
    }
    
    if (message.type === 'recommendations' && message.data) {
      return (
        <div className="message-content">
          <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }} />
          <div className="recommendations-preview">
            <small>🌟 {message.data.recommendations.length} recomendações geradas</small>
          </div>
        </div>
      );
    }
    
    if (message.type === 'cart_cleared') {
      return (
        <div className="message-content">
          <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }} />
          <div className="cart-cleared">
            <small>🗑️ Carrinho limpo com sucesso!</small>
          </div>
        </div>
      );
    }
    
    // Para todas as outras mensagens, usar formatação HTML
    return (
      <div className="message-content">
        <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br/>') }} />
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      {/* Botão flutuante */}
      <button 
        className={`chatbot-toggle ${isCartUpdated ? 'cart-updated' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chat"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {cartItems.length > 0 && (
          <span className="cart-badge">{cartItems.length}</span>
        )}
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="chatbot-info">
              <h3>ChatFood Assistant</h3>
              <span className="status">
                {isConnected ? 'Online' : 'Modo Offline'}
              </span>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {renderMessage(message)}
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Digite sua mensagem..." : "Modo offline - respostas básicas"}
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 