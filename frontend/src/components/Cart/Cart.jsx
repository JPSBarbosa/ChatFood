// src/components/Cart/Cart.jsx (CÓDIGO REAL)
import React from 'react';
import './Cart.css';

function Cart({ items, onRemoveItem }) {
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.preco), 0);

  return (
    <div className="cart-container">
      <h2>Meu Carrinho</h2>
      {items.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="cart-items-list">
            {items.map((item, index) => (
              <li key={`${item.id}-${index}`} className="cart-item">
                <div className="item-info">
                  <span className="item-name">{item.nome}</span>
                  <span className="item-price">
                    {parseFloat(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <button onClick={() => onRemoveItem(index)} className="remove-button">
                  Desfazer
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <strong>Total: </strong>
            <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;