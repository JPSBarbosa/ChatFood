// src/components/DishCard/DishCard.jsx (CÓDIGO REAL)
import React from 'react';
import './DishCard.css';

function DishCard({ dish, onAddToCart }) {
  return (
    <div className="dish-card" onClick={() => onAddToCart(dish)}>
      <img src={dish.url_imagem} alt={dish.nome} className="dish-image" />
      <div className="dish-info">
        <h4 className="dish-name">{dish.nome}</h4>
        <p className="dish-description">{dish.descricao}</p>
        <p className="dish-price">
          {parseFloat(dish.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    </div>
  );
}

export default DishCard;