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
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Product {
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

interface BackendProduct {
  id: number;
  productName: string;
  sku?: string;
  category?: string;
  price: number;
  stock?: number;
  updated_at?: string;
  created_at: string;
  images?: string[];
  description?: string;
}

// Helper to map backend product to frontend product
const mapProduct = (data: BackendProduct): Product => {
  return {
    id: data.id,
    productName: data.productName,
    sku: data.sku || 'N/A',
    category: data.category || 'Uncategorized',
    price: Number(data.price),
    stock: data.stock || 0,
    status: (data.stock || 0) > 10 ? 'In Stock' : (data.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock',
    lastUpdated: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : new Date(data.created_at).toISOString().split('T')[0],
    image: data.images && data.images.length > 0 ? data.images[0] : '',
    description: data.description,
    images: data.images || []
  };
};

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data.map(mapProduct);
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return mapProduct(response.data);
  },

  create: async (product: Partial<Product>, files?: File[]): Promise<Product> => {
    const formData = new FormData();
    
    // Append regular fields
    Object.keys(product).forEach(key => {
      if (key !== 'images' && key !== 'image' && product[key as keyof Product] !== undefined) {
        formData.append(key, String(product[key as keyof Product]));
      }
    });

    // Append files
    if (files) {
      files.forEach(file => {
        formData.append('images', file);
      });
    }

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return mapProduct(response.data);
  },

  update: async (id: number, product: Partial<Product>, files?: File[]): Promise<Product> => {
    const formData = new FormData();
    
    // Append regular fields
    Object.keys(product).forEach(key => {
      if (key !== 'images' && key !== 'image' && product[key as keyof Product] !== undefined) {
        formData.append(key, String(product[key as keyof Product]));
      }
    });

    // Append existing images (as strings)
    if (product.images) {
      product.images.forEach(img => {
        formData.append('existingImages', img);
      });
    }

    // Append new files
    if (files) {
      files.forEach(file => {
        formData.append('images', file);
      });
    }
    
    formData.append('updated_at', new Date().toISOString());

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return mapProduct(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  }
};

export interface Promotion {
  id: number;
  code: string;
  description: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  appliesTo: string;
  isActive: boolean;
}

interface BackendPromotion {
  id: number;
  code: string;
  description: string;
  type: string;
  value: number;
  start_date: string;
  end_date: string;
  applies_to: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper to map backend promotion to frontend promotion
const mapPromotion = (data: BackendPromotion): Promotion => {
  return {
    id: data.id,
    code: data.code,
    description: data.description,
    type: data.type,
    value: Number(data.value),
    startDate: data.start_date,
    endDate: data.end_date,
    appliesTo: data.applies_to,
    isActive: data.is_active,
  };
};

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface SupplierApplication {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  categories: string;
  message?: string;
  status: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
}

export const supplierService = {
  getPendingApplications: async (): Promise<SupplierApplication[]> => {
    const response = await api.get('/suppliers/pending');
    return response.data;
  },

  getApprovedSuppliers: async (): Promise<SupplierApplication[]> => {
    const response = await api.get('/suppliers/approved');
    return response.data;
  },

  approveSupplier: async (id: string): Promise<{ success: boolean; message: string; supplier: SupplierApplication }> => {
    const response = await api.put(`/suppliers/${id}/approve`);
    return response.data;
  },

  rejectSupplier: async (id: string): Promise<{ success: boolean; message: string; supplier: SupplierApplication }> => {
    const response = await api.put(`/suppliers/${id}/reject`);
    return response.data;
  }
};

export const adminService = {
  login: async (credentials: AdminCredentials): Promise<{ success: boolean; token?: string; message?: string }> => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/admin/logout');
  },

  verifyToken: async (): Promise<{ success: boolean; message?: string }> => {
    const response = await api.get('/admin/verify');
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/admin/change-password', data);
    return response.data;
  }
};

export const promotionService = {
  getAll: async (): Promise<Promotion[]> => {
    const response = await api.get('/promotions');
    return response.data.map(mapPromotion);
  },

  getById: async (id: number): Promise<Promotion> => {
    const response = await api.get(`/promotions/${id}`);
    return mapPromotion(response.data);
  },

  create: async (promotion: Omit<Promotion, 'id'>): Promise<Promotion> => {
    const response = await api.post('/promotions', {
      code: promotion.code,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      appliesTo: promotion.appliesTo,
      isActive: promotion.isActive,
    });
    return mapPromotion(response.data);
  },

  update: async (id: number, promotion: Omit<Promotion, 'id'>): Promise<Promotion> => {
    const response = await api.put(`/promotions/${id}`, {
      code: promotion.code,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      appliesTo: promotion.appliesTo,
      isActive: promotion.isActive,
    });
    return mapPromotion(response.data);
  },

  toggleStatus: async (id: number): Promise<Promotion> => {
    const response = await api.put(`/promotions/${id}/toggle`);
    return mapPromotion(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/promotions/${id}`);
  }
};
