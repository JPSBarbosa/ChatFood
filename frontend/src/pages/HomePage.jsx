import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DishCard from '../components/DishCard/DishCard';
import Cart from '../components/Cart/Cart';
import Chatbot from '../components/Chatbot/Chatbot';
import './HomePage.css';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollStates, setScrollStates] = useState({});
  const scrollRefs = useRef({});

  useEffect(() => {
    axios.get('http://localhost:3001/api/homepage-pratos')
      .then(response => {
        setRestaurants(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Houve um erro ao buscar os pratos!", error);
        setLoading(false);
      });
  }, []);

  // Inicializar estados de scroll quando restaurantes são carregados
  useEffect(() => {
    if (restaurants.length > 0) {
      // Aguardar um pouco para o DOM ser renderizado
      setTimeout(() => {
        restaurants.forEach(restaurant => {
          if (restaurant.pratos.length > 4) {
            checkScrollPosition(restaurant.id);
          }
        });
      }, 100);
    }
  }, [restaurants]);

  // Gerenciar event listeners de scroll
  useEffect(() => {
    const listeners = {};

    restaurants.forEach(restaurant => {
      const container = scrollRefs.current[restaurant.id];
      if (container) {
        const handleScroll = () => checkScrollPosition(restaurant.id);
        container.addEventListener('scroll', handleScroll);
        listeners[restaurant.id] = { container, handleScroll };
        
        // Verificar posição inicial
        checkScrollPosition(restaurant.id);
      }
    });

    // Cleanup function para remover event listeners
    return () => {
      Object.values(listeners).forEach(({ container, handleScroll }) => {
        if (container) {
          container.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, [restaurants]);

  // Função para verificar se precisa mostrar botões de rolagem
  const shouldShowScrollButtons = (restaurantId) => {
    const container = scrollRefs.current[restaurantId];
    if (!container) return false;
    
    // Verificar se há overflow horizontal
    const hasOverflow = container.scrollWidth > container.clientWidth;
    return hasOverflow;
  };

  // Função para verificar posição da rolagem
  const checkScrollPosition = (restaurantId) => {
    const container = scrollRefs.current[restaurantId];
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtStart = scrollLeft <= 0;
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1; // -1 para tolerância

    setScrollStates(prev => ({
      ...prev,
      [restaurantId]: { isAtStart, isAtEnd }
    }));
  };

  // Função para verificar se deve mostrar setinha esquerda
  const shouldShowLeftButton = (restaurantId) => {
    const scrollState = scrollStates[restaurantId];
    return scrollState && !scrollState.isAtStart;
  };

  // Função para verificar se deve mostrar setinha direita
  const shouldShowRightButton = (restaurantId) => {
    const scrollState = scrollStates[restaurantId];
    return scrollState && !scrollState.isAtEnd;
  }; 

  // Adiciona prato ao carrinho (pelo card)
  const handleAddToCart = (dish) => {
    setCartItems(prevItems => [...prevItems, dish]);
  };

  // Remove item do carrinho
  const handleRemoveFromCart = (index) => {
    setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  // Limpa todo o carrinho
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Atualiza carrinho quando chatbot adiciona ou limpa
  const handleChatbotCartUpdate = (newItems) => {
    if (newItems && newItems.length === 0) {
      // Limpa o carrinho se receber array vazio
      setCartItems([]);
    } else if (newItems && newItems.length > 0) {
      // Sincroniza completamente o carrinho com os itens do chatbot
      setCartItems(newItems);
    }
  };

  // Funções para rolagem suave
  const scrollLeft = (restaurantId) => {
    const scrollContainer = scrollRefs.current[restaurantId];
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (restaurantId) => {
    const scrollContainer = scrollRefs.current[restaurantId];
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="homepage-container">
      <div className="dishes-section">
        <h1>Bem-vindo ao Chatfood!</h1>
        
        {restaurants.map(restaurant => (
          <section key={restaurant.id} className="restaurant-section">
            <h2>{restaurant.nome}</h2>
            <div className="dishes-container">
              {restaurant.pratos.length > 4 && shouldShowLeftButton(restaurant.id) && (
                <button 
                  className="scroll-indicator left"
                  onClick={() => scrollLeft(restaurant.id)}
                  aria-label="Rolar para esquerda"
                >
                  ‹
                </button>
              )}
              <div 
                className="dishes-list"
                ref={(el) => {
                  scrollRefs.current[restaurant.id] = el;
                }}
              >
                {restaurant.pratos.map(dish => (
                  <DishCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />
                ))}
              </div>
              {restaurant.pratos.length > 4 && shouldShowRightButton(restaurant.id) && (
                <button 
                  className="scroll-indicator right"
                  onClick={() => scrollRight(restaurant.id)}
                  aria-label="Rolar para direita"
                >
                  ›
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
      
      <div className="cart-section">
        <Cart 
          items={cartItems} 
        />
      </div>
      
      <Chatbot 
        onCartUpdate={handleChatbotCartUpdate}
        currentCartItems={cartItems}
      />
    </div>
  );
}

export default HomePage;