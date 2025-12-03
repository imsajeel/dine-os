import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('admin_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  }
  return config;
});

export default api;
