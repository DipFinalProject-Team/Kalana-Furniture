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
  const token = localStorage.getItem('supplierAdminToken');
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

export interface Supplier {
  id: number;
  name: string;
  company_name?: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
  categories?: string;
  message?: string;
}

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get('/admin/suppliers');
    return response.data.data;
  },

  updateStatus: async (id: number, status: string): Promise<void> => {
    await api.put(`/admin/suppliers/${id}/status`, { status });
  },

  approve: async (id: number): Promise<void> => {
    await api.put(`/admin/suppliers/${id}/approve`);
  },

  reject: async (id: number): Promise<void> => {
    await api.put(`/admin/suppliers/${id}/reject`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/suppliers/${id}`);
  },
};

export interface SupplierContact {
  supplier_contact_form_id: number;
  supplier_id: number;
  message: string;
  response?: string;
  status: string;
  created_at: string;
  supplier?: {
    name: string;
    email: string;
  };
}

export const supplierContactService = {
  getAll: async (): Promise<SupplierContact[]> => {
    const response = await api.get('/admin/supplier-contacts');
    return response.data.data;
  },

  updateStatus: async (id: number, status: string, responseText?: string): Promise<void> => {
     await api.put(`/admin/supplier-contacts/${id}`, { status, response: responseText });
  },
};

export { api };