import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supplierToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const supplierService = {
  register: async (data: any) => {
    const response = await api.post('/suppliers/register', data);
    return response.data;
  },

  login: async (credentials: any) => {
    const response = await api.post('/suppliers/login', credentials);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/suppliers/verify');
    return response.data;
  },

  logout: async () => {
    // Client-side logout
    localStorage.removeItem('supplierToken');
  }
};
