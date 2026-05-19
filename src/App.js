import React, { useState, useEffect } from 'react';
import './i18n';
import { useTranslation } from 'react-i18next';  
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import StatisticsPanel from './pages/StatisticsPanel';

function App() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState('catalog');  
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'ro');
  
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language, i18n]);

  const changeLanguage = (lng) => {
    setLanguage(lng);
  };

  const logout = () => {
    localStorage.clear();
    setView('catalog');  
    window.location.reload();
  };

  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <nav style={{ 
        background: '#2e7d32', 
        color: 'white', 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => setView('catalog')}>
          🌿 {t('title')}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Selector limbă */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => changeLanguage('ro')} style={{ background: language === 'ro' ? '#fff' : 'transparent', color: language === 'ro' ? '#2e7d32' : 'white', border: '1px solid white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>RO</button>
            <button onClick={() => changeLanguage('en')} style={{ background: language === 'en' ? '#fff' : 'transparent', color: language === 'en' ? '#2e7d32' : 'white', border: '1px solid white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>EN</button>
            <button onClick={() => changeLanguage('hu')} style={{ background: language === 'hu' ? '#fff' : 'transparent', color: language === 'hu' ? '#2e7d32' : 'white', border: '1px solid white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>HU</button>
          </div>

          <button onClick={() => setView('catalog')} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
            {t('catalog')}
          </button>

          {token && userRole === 'MANAGER' && (
            <button onClick={() => setView('statistics')} style={{ background: '#ffa000', border: 'none', color: 'white', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
              📊 {t('statistics')}
            </button>
          )}

          {token && userRole === 'ADMIN' && (
            <button onClick={() => setView('admin')} style={{ background: '#d32f2f', border: 'none', color: 'white', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
              👑 {t('adminPanel')}
            </button>
          )}

          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '20px' }}>
              <span style={{ marginRight: '15px' }}>👋 <b>{username}</b> <small>({userRole})</small></span>
              <button onClick={logout} style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>{t('logout')}</button>
            </div>
          ) : (
            <button onClick={() => setView('login')} style={{ background: 'white', color: '#2e7d32', border: 'none', padding: '8px 20px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
              {t('login')}
            </button>
          )}
        </div>
      </nav>

      <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        {view === 'catalog' && <Catalog />}
        {view === 'login' && <Login onLoginSuccess={() => setView('catalog')} />}
        {view === 'admin' && <AdminPanel />}
        {view === 'statistics' && <StatisticsPanel />}
      </div>
    </div>
  );
}

export default App;