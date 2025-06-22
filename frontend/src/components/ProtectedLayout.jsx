import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header/Header';

function ProtectedLayout() {
  console.log(Header);
  return (
    <div>
      <Header />
      <main>
        {/* As páginas filhas (HomePage, ProfilePage) serão renderizadas aqui */}
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;