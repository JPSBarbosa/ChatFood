// src/components/Cart/Cart.jsx (CÓDIGO REAL)
import React from 'react';
import './Cart.css';

function Cart({ items }) {
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.preco), 0);

  return (
    <div className="cart-container">
      <h2>🛒 Meu Carrinho</h2>
      
      {items.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="cart-items-list">
            {items.map((item, index) => (
              <li key={index} className="cart-item">
                <div className="item-info">
                  <span className="item-name">{item.nome}</span>
                  <span className="item-price">
                    R$ {parseFloat(item.preco).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <strong>Total: R$ {totalPrice.toFixed(2)}</strong>
          </div>

        </>
      )}
    </div>
  );
}

export default Cart;