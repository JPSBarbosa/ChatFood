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
        console.log("Token decodificado no Header:", decodedToken);
        setUser(decodedToken);
      }
    } catch (error) {
      console.error("Token inválido ou expirado no Header:", error);
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogout = () => {
    console.log("Logout iniciado");
    localStorage.removeItem('token');
    setUser(null);
    navigate('/', { replace: true });
  };

  const handleProfileClick = () => {
    console.log("Navegando para perfil");
    navigate('/perfil');
  };

  const handleHomeClick = () => {
    console.log("Navegando para home");
    if (user?.tipo === 'restaurante') {
      navigate('/restaurante/home');
    } else {
      navigate('/homepage');
    }
  };

  let profileImageUrl = `https://ui-avatars.com/api/?name=${user?.nome || user?.email || 'User'}&background=random`;

  if (user && user.url_foto_perfil && user.url_foto_perfil.startsWith('/uploads')) {
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
                  src={profileImageUrl}
                  alt="Foto do perfil"
                  className="profile-pic"
                />
                <div className="dropdown-content">
                  <button onClick={handleProfileClick}>Perfil</button>
                  {user.tipo === 'restaurante' && (
                    <button onClick={handleHomeClick}>Painel do Restaurante</button>
                  )}
                  {user.tipo === 'cliente' && (
                    <button onClick={handleHomeClick}>Home</button>
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