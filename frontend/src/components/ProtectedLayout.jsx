import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header/Header';

function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedLayout - URL atual:", location.pathname);
    const token = localStorage.getItem('token');
    console.log("ProtectedLayout - Token encontrado:", !!token);
    
    if (!token) {
      console.log("ProtectedLayout - Redirecionando para login");
      navigate('/');
    }
  }, [navigate, location]);

  console.log("ProtectedLayout - Renderizando com Outlet");

  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;