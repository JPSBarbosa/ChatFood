import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header/Header';

function ProtectedLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div>
      <Header />
      <main>
        {/* As páginas filhas (HomePage, ProfilePage, RestauranteHome) serão renderizadas aqui */}
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;