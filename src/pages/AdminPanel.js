import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    passwordHash: '',
    role: 'VISITOR',
    active: true,
    phoneNumber: ''
  });
  const [notificationMessage, setNotificationMessage] = useState('');

  const userRole = localStorage.getItem('role');

 useEffect(() => {
  fetchUsers();
}, [roleFilter])


 const fetchUsers = async () => {
  setLoading(true);
  try {
    const url = roleFilter ? `/users?role=${roleFilter}` : '/users';
    const response = await API.get(url);
    setUsers(response.data);
    setFilteredUsers(response.data);
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    setLoading(false);
  }
};
 

  const getUserIdNumber = (user) => {
    if (!user) return null;
    if (typeof user === 'number') return user;
    if (typeof user === 'string') return parseInt(user);
    if (user.id?.id) return user.id.id;
    if (user.id) return user.id;
    return null;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
        const method = editingUser ? 'PUT' : 'POST';
        
        let body = { ...formData };
        
        if (editingUser) {
            const userId = getUserIdNumber(editingUser);
            body = { ...formData, id: { id: userId } };
        }
        
        if (!body.passwordHash) {
            delete body.passwordHash;
        }
        
        console.log("Saving user:", body);
        
        const response = await API[method === 'PUT' ? 'put' : 'post']('/users', body);
        
        if (response.status === 200 || response.status === 201) {
            alert(editingUser ? t('userUpdated') : t('userCreated'));
            resetForm();
            await fetchUsers();
            
            if (editingUser && notificationMessage) {
                const userId = getUserIdNumber(editingUser);
                if (userId && userId > 0) {
                    await sendNotification(userId, notificationMessage);
                }
            }
        }
    } catch (err) {
        console.error("Save error:", err.response?.data);
        alert(t('error') + ": " + (err.response?.data?.message || err.message));
    }
  };

  const sendNotification = async (userId, message) => {
    let parsedUserId = userId;
    if (userId && typeof userId === 'object') {
      parsedUserId = userId.id;
    }
    parsedUserId = parseInt(parsedUserId);
    
    if (isNaN(parsedUserId) || !parsedUserId || parsedUserId <= 0) {
      console.error("❌ User ID is invalid, skipping notification:", userId);
      return;
    }
    
    console.log("📨 Sending notification for userId:", parsedUserId);
    
    try {
      await API.post('/notifications', {
        userId: parsedUserId,
        channel: 'EMAIL',
        message: message
      });
      
      await API.post('/notifications', {
        userId: parsedUserId,
        channel: 'WHATSAPP',
        message: message
      });
      
      alert(t('notificationsSent'));
    } catch (err) {
      console.error("❌ Error sending notification:", err.response?.data);
      alert(t('notificationsFailed'));
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`${t('confirmDelete')} ${username}?`)) return;
    
    const userId = typeof id === 'object' ? id.id : id;
    
    try {
      await API.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(t('error') + ": " + (err.response?.data?.message || err.message));
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      passwordHash: '',
      role: user.role || 'VISITOR',
      active: user.active !== undefined ? user.active : true,
      phoneNumber: user.phoneNumber || ''
    });
    setShowAddForm(true);
    setNotificationMessage('');
  };

  const resetForm = () => {
    setFormData({
        username: '',
        email: '',
        passwordHash: '',
        role: 'VISITOR',
        active: true,
        phoneNumber: ''
    });
    setEditingUser(null);
    setShowAddForm(false);
    setNotificationMessage('');
  };

 const exportUsersToCSV = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8080/api/exports/users-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roleFilter: roleFilter || null
      })
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 19)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert(t('exportSuccess'));
    } else {
      alert(t('exportFailed'));
    }
  } catch (err) {
    console.error("Export error:", err);
    alert(t('exportFailed'));
  }
};

  if (userRole !== 'ADMIN') {
    return <p style={{ color: 'red', padding: '20px' }}>{t('accessDenied')}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>{t('adminPanel')} - {t('users')}</h2>
        <div>
          <button 
            onClick={exportUsersToCSV}
            style={{ background: '#2e7d32', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
          >
            📥 {t('export')} CSV
          </button>
         <button 
  onClick={() => setShowAddForm(!showAddForm)}
  style={{ background: '#2196f3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
>
  {showAddForm ? '❌' : '+ '}{showAddForm ? t('cancel') : t('addUser')}
</button>
        </div>
      </div>

      {showAddForm && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <h3>{editingUser ? t('editUser') : t('addUser')}</h3>
          <form onSubmit={handleSaveUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input 
              placeholder={t('username')} 
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              required 
              style={{ padding: '8px' }}
            />
            <input 
              placeholder={t('email')} 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
              style={{ padding: '8px' }}
            />
            <input 
              placeholder={t('password')} 
              type="password"
              value={formData.passwordHash}
              onChange={e => setFormData({...formData, passwordHash: e.target.value})}
              required={!editingUser}
              style={{ padding: '8px' }}
            />
            <input 
              placeholder={t('phoneNumber')} 
              type="tel"
              value={formData.phoneNumber}
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              style={{ padding: '8px' }}
            />
            <select 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              style={{ padding: '8px' }}
            >
              <option value="EMPLOYEE">{t('employee')}</option>
              <option value="MANAGER">{t('manager')}</option>
              <option value="ADMIN">{t('admin')}</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={formData.active}
                onChange={e => setFormData({...formData, active: e.target.checked})}
              /> {t('active')}
            </label>
            {editingUser && (
              <textarea
                placeholder={t('notificationMessage')}
                value={notificationMessage}
                onChange={e => setNotificationMessage(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '10px' }}
                rows="2"
              />
            )}
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ background: '#2e7d32', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', flex: 1 }}>
                {editingUser ? t('save') : t('create')}
              </button>
              <button type="button" onClick={resetForm} style={{ background: '#999', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', flex: 1 }}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>{t('filterByRole')}:</label>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px' }}
        >
          <option value="">{t('all')}</option>
          <option value="EMPLOYEE">{t('employee')}</option>
          <option value="MANAGER">{t('manager')}</option>
          <option value="ADMIN">{t('admin')}</option>
        </select>
      </div>

      {loading ? (
        <p>{t('loading')}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#2e7d32', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>{t('id')}</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>{t('username')}</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>{t('email')}</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>{t('role')}</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>{t('status')}</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>{t('phoneNumber')}</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const userId = getUserIdNumber(user);
                return (
                  <tr key={userId} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{userId}</td>
                    <td style={{ padding: '10px' }}>{user.username}</td>
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        background: user.role === 'ADMIN' ? '#d32f2f' : user.role === 'MANAGER' ? '#ffa000' : user.role === 'EMPLOYEE' ? '#2196f3' : '#999',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {user.role === 'ADMIN' ? t('admin') : user.role === 'MANAGER' ? t('manager') : t('employee')}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ color: user.active ? '#2e7d32' : '#999' }}>
                        {user.active ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>{user.phoneNumber || '-'}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button 
                        onClick={() => startEdit(user)}
                        style={{ background: '#ffa000', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {filteredUsers.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>{t('noData')}</p>
      )}
    </div>
  );
};

export default AdminPanel;