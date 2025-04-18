import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import RestauranteHome from "./pages/RestauranteHome";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/cliente/home" element={<Home />} />
        <Route path="/restaurante/home" element={<RestauranteHome />} />
      </Routes>
    </Router>
  );
}

export default App;
