import API from './api';

export const authService = {
  login: async (username, password) => {
    const response = await API.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);
    }
    return response.data;
  },

  logout: () => {
    localStorage.clear();
  }
};