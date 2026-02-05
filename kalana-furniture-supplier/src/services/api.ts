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

  forgotPassword: async (data: { email: string }) => {
    const response = await api.post('/suppliers/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const response = await api.post('/suppliers/reset-password', data);
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
  },

  getDashboardStats: async () => {
    const response = await api.get('/suppliers/dashboard/stats');
    return response.data;
  },

  getRecentSupplyOrders: async () => {
    const response = await api.get('/suppliers/dashboard/orders');
    return response.data;
  },

  getLowStockRequests: async () => {
    const response = await api.get('/suppliers/dashboard/low-stock');
    return response.data;
  },

  getOrderTrends: async () => {
    const response = await api.get('/suppliers/dashboard/trends');
    return response.data;
  },
  getInvoices: async () => {
    const response = await api.get('/suppliers/invoices');
    return response.data;
  },

  getInvoiceDetails: async (id: string) => {
    const response = await api.get(`/suppliers/invoices/${id}`);
    return response.data;
  },

  // Order management methods
  getSupplierOrders: async () => {
    const response = await api.get('/suppliers/orders');
    return response.data;
  },

  updateSupplierOrderStatus: async (id: string, status: string, actualDeliveryDate?: string, deliveryNotes?: string) => {
    const response = await api.put(`/suppliers/orders/${id}/status`, { 
      status, 
      actualDeliveryDate, 
      deliveryNotes 
    });
    return response.data;
  },

  updateSupplierOrderDetails: async (id: string, data: { deliveryDate?: string; notes?: string; totalPrice?: number }) => {
    const response = await api.put(`/suppliers/orders/${id}/details`, data);
    return response.data;
  },

  submitContactForm: async (data: { supplier_id: string, message: string }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/supplier-contact', data);
    return response.data;
  }
};
