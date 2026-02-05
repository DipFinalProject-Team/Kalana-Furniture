import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('customerAdminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/admin/verify');
    return response.data;
  },
};

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/admin/customers');
    return response.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    await api.put(`/admin/customers/${id}/status`, { status });
  },
};

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  registrationDate: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
}

export const inquiryService = {
  getAll: async (): Promise<Inquiry[]> => {
    const response = await api.get('/contact');
    return response.data.data;
  },

  updateStatus: async (id: number, status: string, response?: string): Promise<void> => {
    await api.put(`/contact/${id}/status`, { status, response });
  },
};

export const refundService = {
  getAll: async (): Promise<RefundRequest[]> => {
    const response = await api.get('/refunds');
    return response.data.data;
  },

  updateStatus: async (id: number, status: string, response?: string): Promise<void> => {
    await api.put(`/refunds/${id}/status`, { status, response });
  },
};

export interface Inquiry {
  id: number;
  user_id: string | null;
  first_name: string;
  last_name: string;
  mobile_number: string | null;
  email: string;
  message: string;
  response: string | null;
  status: string;
  created_at: string;
}

export interface RefundRequest {
  id: number;
  user_id: string | null;
  first_name: string;
  last_name: string;
  mobile_number: string | null;
  email: string;
  order_id: number | null;
  amount: number | null;
  reason: string;
  response: string | null;
  status: string;
  created_at: string;
}
