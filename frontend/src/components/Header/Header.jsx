// src/components/Header/Header.jsx (Versão Final e Robusta)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Header.css';

const BACKEND_URL = 'http://localhost:3001';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        // O console.log abaixo nos ajuda a depurar o conteúdo do token
        console.log("Token decodificado no Header:", decodedToken);
        setUser(decodedToken);
      }
    } catch (error) {
      console.error("Token inválido ou expirado no Header:", error);
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // <<< LÓGICA MELHORADA AQUI >>>
  // Criamos uma variável para a URL da imagem com uma verificação mais segura
  let profileImageUrl = `https://ui-avatars.com/api/?name=${user?.nome || user?.email || 'User'}&background=random`;

  if (user && user.url_foto_perfil && user.url_foto_perfil.startsWith('/uploads')) {
    // Só usamos a URL do perfil se ela existir E começar com '/uploads/'
    profileImageUrl = `${BACKEND_URL}${user.url_foto_perfil}`;
  }

  const getHomeLink = () => {
    if (!user) return '/homepage';
    return user.tipo === 'restaurante' ? '/restaurante/home' : '/homepage';
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to={getHomeLink()} className="logo">
          CHATFOOD
        </Link>
        <nav className="main-nav">
          {user && (
            <>
              <span className="welcome-message">
                Olá, {user.nome || 'Usuário'} 
                <span className="user-type">({user.tipo === 'restaurante' ? 'Restaurante' : 'Cliente'})</span>
              </span>

              <div className="profile-menu">
                <img
                  // Usamos a nossa variável segura
                  src={profileImageUrl}
                  alt="Foto do perfil"
                  className="profile-pic"
                />
                <div className="dropdown-content">
                  <Link to="/perfil">Perfil</Link>
                  {user.tipo === 'restaurante' && (
                    <Link to="/restaurante/home">Painel do Restaurante</Link>
                  )}
                  {user.tipo === 'cliente' && (
                    <Link to="/homepage">Home</Link>
                  )}
                  <button onClick={handleLogout}>Sair</button>
                </div>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;