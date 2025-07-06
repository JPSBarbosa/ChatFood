// src/pages/ProfilePage/ProfilePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

// Instância do axios que já configuramos
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(async config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function ProfilePage() {
  const navigate = useNavigate();
  
  // === DECLARAÇÕES DE ESTADO (Onde 'setPreview' é criado) ===
  const [profile, setProfile] = useState(null);
  const [nome, setNome] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState(60); // 1 minuto em segundos
  const [timerStarted, setTimerStarted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/user/perfil')
      .then(response => {
        // === DECLARAÇÃO DA VARIÁVEL 'userData' ===
        const userData = response.data;
        setProfile(userData);
        setNome(userData.nome || '');

        if (userData.url_foto_perfil) {
          setPreview(`http://localhost:3001${userData.url_foto_perfil}`);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados do perfil:", error);
        setLoading(false);
      });
  }, []);

  // Timer para deletar conta
  useEffect(() => {
    let interval;
    if (timerStarted && deleteTimer > 0) {
      interval = setInterval(() => {
        setDeleteTimer(prev => prev - 1);
      }, 1000);
    } else if (timerStarted && deleteTimer === 0) {
      handleDeleteAccount();
    }
    return () => clearInterval(interval);
  }, [timerStarted, deleteTimer]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('nome', nome);
    if (selectedFile) {
      formData.append('profilePic', selectedFile);
    }

    try {
      const response = await api.put('/user/perfil', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const { user, token } = response.data;
      alert('Perfil atualizado com sucesso!');
      localStorage.setItem('token', token);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert('Falha ao atualizar o perfil.');
    }
  };

  const handleBackButton = () => {
    // Verificar o tipo de usuário e redirecionar adequadamente
    if (profile && profile.tipo === 'restaurante') {
      navigate('/restaurante/home');
    } else {
      navigate('/homepage');
    }
  };

  const getBackButtonText = () => {
    if (profile && profile.tipo === 'restaurante') {
      return '← Voltar para Painel do Restaurante';
    } else {
      return '← Voltar para Home';
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
    setDeleteTimer(60); // Reset timer para 1 minuto
    setTimerStarted(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTimer(60);
    setTimerStarted(false);
  };

  const handleStartDeleteTimer = () => {
    setTimerStarted(true);
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/user/conta');
      localStorage.removeItem('token');
      alert('Conta deletada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      alert('Erro ao deletar conta. Tente novamente.');
      setShowDeleteConfirm(false);
      setDeleteTimer(60);
      setTimerStarted(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) return <div>Carregando perfil...</div>;
  if (!profile) return <div>Não foi possível carregar o perfil.</div>;

  return (
    <div className="profile-page-container">
      <div className="back-button-container">
        <button 
          className="back-button" 
          onClick={handleBackButton}
        >
          {getBackButtonText()}
        </button>
      </div>
      <form className="profile-card" onSubmit={handleSaveChanges}>
        <h1>Meu Perfil</h1>
        <div className="profile-picture-section">
          <img 
            src={preview || 'https://i.pravatar.cc/150'} 
            alt="Foto do perfil" 
            className="profile-main-pic"
            onClick={() => fileInputRef.current.click()}
          />
          <input 
            type="file" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
          />
          <button type="button" className="edit-pic-button" onClick={() => fileInputRef.current.click()}>
            Alterar Foto
          </button>
        </div>
        <div className="profile-details">
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input 
              type="text" 
              id="name" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={profile.email} disabled />
          </div>
          <button type="submit" className="save-button">Salvar Alterações</button>
          
          <button 
            type="button" 
            className="delete-account-button"
            onClick={handleDeleteConfirm}
          >
            Deletar Conta
          </button>
        </div>
      </form>

      {/* Modal de confirmação de deletar conta */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>⚠️ Confirmar Exclusão da Conta</h2>
            <p>
              <strong>Atenção!</strong> Esta ação não pode ser desfeita.
            </p>
            {timerStarted ? (
              <>
                <p>Sua conta será permanentemente deletada em:</p>
                <div className="timer-display">
                  <span className="timer">{formatTime(deleteTimer)}</span>
                </div>
                <p>
                  Se você for um restaurante, o restaurante também será deletado junto com todos os pratos.
                </p>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={handleCancelDelete}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  Se você for um restaurante, o restaurante também será deletado junto com todos os pratos.
                </p>
                <p>
                  <strong>Clique em "Confirmar Exclusão" para iniciar o timer de 1 minuto.</strong>
                </p>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={handleCancelDelete}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="confirm-delete-button"
                    onClick={handleStartDeleteTimer}
                  >
                    Confirmar Exclusão
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;