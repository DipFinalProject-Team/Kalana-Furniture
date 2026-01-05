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
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export const userService = {
  register: async (userData: RegisterData): Promise<{ success: boolean; message: string; token?: string; user?: User; requiresConfirmation?: boolean }> => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<{ success: boolean; message: string; token?: string; user?: User }> => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/users/logout');
    return response.data;
  },

  verifyToken: async (): Promise<{ success: boolean; user?: User }> => {
    const response = await api.get('/users/verify');
    return response.data;
  },

  getProfile: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<{ success: boolean; message: string; user: User }> => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  uploadProfilePicture: async (formData: FormData): Promise<{ success: boolean; message: string; imageUrl: string; user: User }> => {
    const response = await api.post('/users/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};