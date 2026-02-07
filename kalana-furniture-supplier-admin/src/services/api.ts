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


export interface InventoryItem {
  id: number;
  productName: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  lastUpdated: string;
  image: string;
  description?: string;
  images?: string[];
}

export interface SupplierOrder {
  id: string;
  productName: string;
  quantity: number;
  expectedDelivery: string;
  totalPrice: number | null;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Dispatched' | 'Delivered' | 'Completed';
  orderDate: string;
  actualDeliveryDate?: string;
  deliveryNotes?: string;
  supplierId?: string;
  supplierName?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  supplierName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  paymentDate?: string;
}

export const inventoryService = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/admin/inventory');
    return response.data.inventory;
  },

  updateStock: async (id: number, stock: number): Promise<{ success: boolean; message: string; product: InventoryItem }> => {
    const response = await api.put(`/admin/inventory/${id}/stock`, { stock });
    return response.data;
  },

  getPurchaseOrders: async (): Promise<SupplierOrder[]> => {
    const response = await api.get('/admin/purchase-orders');
    return response.data.orders;
  },

  createPurchaseOrder: async (orderData: {
    productId: number;
    supplierId: number;
    quantity: number;
    expectedDelivery: string;
    pricePerUnit?: number;
  }): Promise<{ success: boolean; message: string; order: SupplierOrder }> => {
    const response = await api.post('/admin/purchase-orders', orderData);
    return response.data;
  },

  updatePurchaseOrderStatus: async (id: number, status: string, additionalData?: {
    actualDeliveryDate?: string;
    deliveryNotes?: string;
  }): Promise<{ success: boolean; message: string; order: SupplierOrder }> => {
    const response = await api.put(`/admin/purchase-orders/${id}/status`, { status, ...additionalData });
    return response.data;
  },

  getApprovedSuppliers: async (): Promise<Supplier[]> => {
     const response = await api.get('/admin/suppliers/approved');
     return response.data;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/admin/invoices');
    return response.data.invoices;
  },

  markInvoiceAsPaid: async (id: string): Promise<void> => {
    await api.put(`/admin/invoices/${id}/pay`);
  }
};

export { api };