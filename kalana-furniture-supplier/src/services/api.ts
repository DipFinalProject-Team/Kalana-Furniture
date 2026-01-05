import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get('supplierToken') || localStorage.getItem('supplierToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const supplierService = {
  register: async (data: unknown) => {
    const response = await api.post('/suppliers/register', data);
    return response.data;
  },

  login: async (credentials: unknown) => {
    const response = await api.post('/suppliers/login', credentials);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/suppliers/verify');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/suppliers/logout');
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/suppliers/account');
    return response.data;
  },

  updateProfile: async (data: unknown) => {
    const response = await api.put('/suppliers/profile', data);
    return response.data;
  },

  changePassword: async (data: unknown) => {
    const response = await api.put('/suppliers/password', data);
    return response.data;
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/suppliers/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
