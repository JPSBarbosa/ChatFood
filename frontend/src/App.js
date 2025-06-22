import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; // Os imports podem precisar de ajuste no caminho
import Register from "./pages/Register";
import RestauranteHome from "./pages/RestauranteHome";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ProtectedLayout from "./components/ProtectedLayout"; // Ajuste o caminho conforme necessário

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/restaurante/home" element={<RestauranteHome />} />
          <Route path="/homepage" element={<HomePage />} />
        </Route>

        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
      </Routes>
    </Router>
  );
}

export default App;