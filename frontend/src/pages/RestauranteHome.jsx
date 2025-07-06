import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RestauranteHome.css';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use(async config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function RestauranteHome() {
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState(null);
  const [pratos, setPratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showForm, setShowForm] = useState(false);
  const [showPratoForm, setShowPratoForm] = useState(false);
  const [editingPrato, setEditingPrato] = useState(null);
  const [userId, setUserId] = useState(null);

  // Estados para formulário do restaurante
  const [formData, setFormData] = useState({
    nome: '',
    url_logo: ''
  });

  // Estados para formulário de prato
  const [pratoForm, setPratoForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    url_imagem: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Buscar dados do usuário logado
      const userResponse = await api.get('/api/user/perfil');
      const currentUserId = userResponse.data.id;
      setUserId(currentUserId);
      
      // Buscar restaurante do usuário logado
      const restaurantesResponse = await api.get(`/restaurantes/usuario/${currentUserId}`);
      
      if (restaurantesResponse.data.length > 0) {
        const meuRestaurante = restaurantesResponse.data[0];
        setRestaurante(meuRestaurante);
        setFormData({
          nome: meuRestaurante.nome,
          url_logo: meuRestaurante.url_logo || ''
        });
        
        // Buscar pratos do restaurante
        const pratosResponse = await api.get(`/api/pratos/restaurante/${meuRestaurante.id}`);
        setPratos(pratosResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestauranteSubmit = async (e) => {
    e.preventDefault();
    try {
      if (restaurante) {
        // Atualizar restaurante existente
        await api.put(`/restaurantes/${restaurante.id}`, formData);
      } else {
        // Criar novo restaurante
        const result = await api.post('/restaurantes', {
          ...formData,
          id_usuario: userId
        });
        setRestaurante(result.data);
      }
      setShowForm(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar restaurante:', error);
      alert('Erro ao salvar restaurante');
    }
  };

  const handlePratoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPrato) {
        // Atualizar prato existente
        await api.put(`/api/pratos/${editingPrato.id}`, pratoForm);
      } else {
        // Criar novo prato
        await api.post('/api/pratos', {
          ...pratoForm,
          restaurante_id: restaurante.id
        });
      }
      setShowPratoForm(false);
      setEditingPrato(null);
      setPratoForm({ nome: '', descricao: '', preco: '', url_imagem: '' });
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar prato:', error);
      alert('Erro ao salvar prato');
    }
  };

  const editarPrato = (prato) => {
    setEditingPrato(prato);
    setPratoForm({
      nome: prato.nome,
      descricao: prato.descricao,
      preco: prato.preco.toString(),
      url_imagem: prato.url_imagem || ''
    });
    setShowPratoForm(true);
  };

  const deletarPrato = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este prato?')) {
      try {
        await api.delete(`/api/pratos/${id}`);
        carregarDados();
      } catch (error) {
        console.error('Erro ao deletar prato:', error);
        alert('Erro ao deletar prato');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="restaurante-loading">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="restaurante-container">
      <div className="restaurante-header">
        <h1>Painel do Restaurante</h1>
        <button className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </div>

      {!restaurante ? (
        <div className="no-restaurante">
          <h2>Bem-vindo! Crie seu restaurante</h2>
          <p>Para começar a adicionar pratos, você precisa criar seu restaurante primeiro.</p>
          <button className="create-restaurante-btn" onClick={() => setShowForm(true)}>
            Criar Restaurante
          </button>
        </div>
      ) : (
        <div className="restaurante-content">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Informações
            </button>
            <button 
              className={`tab ${activeTab === 'pratos' ? 'active' : ''}`}
              onClick={() => setActiveTab('pratos')}
            >
              Pratos ({pratos.length})
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="info-tab">
              <div className="restaurante-info">
                <h2>{restaurante.nome}</h2>
                {restaurante.url_logo && (
                  <div className="restaurante-logo">
                    <img src={restaurante.url_logo} alt="Logo do restaurante" />
                  </div>
                )}
                <button className="edit-btn" onClick={() => setShowForm(true)}>
                  Editar Informações
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pratos' && (
            <div className="pratos-tab">
              <div className="pratos-header">
                <h2>Gerenciar Pratos</h2>
                <button className="add-prato-btn" onClick={() => setShowPratoForm(true)}>
                  + Adicionar Prato
                </button>
              </div>
              
              <div className="pratos-grid">
                {pratos.map(prato => (
                  <div key={prato.id} className="prato-card">
                    {prato.url_imagem && (
                      <img src={prato.url_imagem} alt={prato.nome} className="prato-image" />
                    )}
                    <div className="prato-info">
                      <h3>{prato.nome}</h3>
                      <p>{prato.descricao}</p>
                      <p className="prato-preco">R$ {parseFloat(prato.preco).toFixed(2)}</p>
                    </div>
                    <div className="prato-actions">
                      <button onClick={() => editarPrato(prato)} className="edit-prato-btn">
                        Editar
                      </button>
                      <button onClick={() => deletarPrato(prato.id)} className="delete-prato-btn">
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal do Restaurante */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{restaurante ? 'Editar Restaurante' : 'Criar Restaurante'}</h2>
            <form onSubmit={handleRestauranteSubmit}>
              <div className="form-group">
                <label>Nome do Restaurante</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL do Logo (opcional)</label>
                <input
                  type="url"
                  value={formData.url_logo}
                  onChange={(e) => setFormData({...formData, url_logo: e.target.value})}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal do Prato */}
      {showPratoForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingPrato ? 'Editar Prato' : 'Adicionar Prato'}</h2>
            <form onSubmit={handlePratoSubmit}>
              <div className="form-group">
                <label>Nome do Prato</label>
                <input
                  type="text"
                  value={pratoForm.nome}
                  onChange={(e) => setPratoForm({...pratoForm, nome: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={pratoForm.descricao}
                  onChange={(e) => setPratoForm({...pratoForm, descricao: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preço</label>
                <input
                  type="number"
                  step="0.01"
                  value={pratoForm.preco}
                  onChange={(e) => setPratoForm({...pratoForm, preco: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL da Imagem (opcional)</label>
                <input
                  type="url"
                  value={pratoForm.url_imagem}
                  onChange={(e) => setPratoForm({...pratoForm, url_imagem: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowPratoForm(false);
                  setEditingPrato(null);
                  setPratoForm({ nome: '', descricao: '', preco: '', url_imagem: '' });
                }}>Cancelar</button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestauranteHome;
  