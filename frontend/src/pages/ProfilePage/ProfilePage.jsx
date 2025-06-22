// src/pages/ProfilePage/ProfilePage.jsx

import React, { useState, useEffect, useRef } from 'react';
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
  // === DECLARAÇÕES DE ESTADO (Onde 'setPreview' é criado) ===
  const [profile, setProfile] = useState(null);
  const [nome, setNome] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div>Carregando perfil...</div>;
  if (!profile) return <div>Não foi possível carregar o perfil.</div>;

  return (
    <div className="profile-page-container">
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
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;