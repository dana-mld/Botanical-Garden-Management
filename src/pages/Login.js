import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Login = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);
        
        onLoginSuccess();
        window.location.reload(); 
      } else {
        setError(data.message || t('loginError'));
      }
    } catch (err) {
      console.error("Eroare rețea:", err);
      setError(t('networkError'));
    }
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: 'white' }}>
      <h3>{t('loginTitle')}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>{t('username')}:</label>
          <input 
            type="text" 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>{t('password')}:</label>
          <input 
            type="password" 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {t('login')}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default Login;