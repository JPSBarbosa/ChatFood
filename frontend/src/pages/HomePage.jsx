import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DishCard from '../components/DishCard/DishCard';
import Cart from '../components/Cart/Cart';
import './HomePage.css';

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddToCart = (dish) => {
    setCartItems([...cartItems, dish]);
  };

  const handleRemoveFromCart = (itemIndexToRemove) => {
    setCartItems(cartItems.filter((_, index) => index !== itemIndexToRemove));
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
            <div className="dishes-list">
              {restaurant.pratos.map(dish => (
                <DishCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </section>
        ))}
      </div>
      
      <div className="cart-section">
        <Cart items={cartItems} onRemoveItem={handleRemoveFromCart} />
      </div>
    </div>
  );
}

export default HomePage;