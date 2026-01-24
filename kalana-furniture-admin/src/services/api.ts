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

export type SupplierApplication = {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  categories: string;
  message: string;
  status: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  profile_image?: string;
};

export interface Review {
  id: number;
  customerName: string;
  productName: string;
  category: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  productUrl: string;
  product_id: number;
}

export interface DashboardStat {
  id: number;
  title: string;
  value: string;
  icon: string;
  color: string;
  trend: string;
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
  applicableProducts?: number[];
  applicableCategories?: string[];
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
  applicable_products?: number[];
  applicable_categories?: string[];
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
    applicableProducts: data.applicable_products || [],
    applicableCategories: data.applicable_categories || [],
  };
};

export interface AdminCredentials {
  email: string;
  password: string;
}

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
  status: string;
  paymentDate: string | null;
}

export const supplierService = {
  // Supplier-specific functions can be added here if needed
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
    return response.data;  },

  // Supplier management functions
  getPendingApplications: async (): Promise<SupplierApplication[]> => {
    const response = await api.get('/admin/suppliers/pending');
    return response.data;
  },

  getApprovedSuppliers: async (): Promise<SupplierApplication[]> => {
    const response = await api.get('/admin/suppliers/approved');
    return response.data;
  },

  approveSupplier: async (id: number): Promise<{ success: boolean; message: string; supplier: SupplierApplication }> => {
    const response = await api.put(`/admin/suppliers/${id}/approve`);
    return response.data;
  },

  rejectSupplier: async (id: number): Promise<{ success: boolean; message: string; supplier: SupplierApplication }> => {
    const response = await api.put(`/admin/suppliers/${id}/reject`);
    return response.data;  },

  // Inventory management functions
  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/admin/inventory');
    return response.data.inventory;
  },

  updateStock: async (id: number, stock: number): Promise<{ success: boolean; message: string; product: InventoryItem }> => {
    const response = await api.put(`/admin/inventory/${id}/stock`, { stock });
    return response.data;
  },

  // Supplier order management functions
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

  // Invoice management functions
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/admin/invoices');
    return response.data.invoices;
  },

  markInvoiceAsPaid: async (id: string): Promise<{ success: boolean; message: string; invoice: Invoice }> => {
    const response = await api.put(`/admin/invoices/${id}/pay`);
    return response.data;
  },

  // Review management functions
  getAllReviews: async (): Promise<Review[]> => {
    const response = await api.get('/admin/reviews');
    return response.data;
  },

  deleteReview: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  // Dashboard stats function
  getDashboardStats: async (): Promise<DashboardStat[]> => {
    const response = await api.get('/admin/dashboard/stats');
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

// Customer Management
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
  avatar: string;
}
export interface Order {
  id: number;
  customer_id: string;
  product_id: number;
  quantity: number;
  total: number;
  status: string;
  delivery_name: string;
  delivery_address: string;
  delivery_phone: string;
  delivery_email: string;
  created_at: string;
  customer?: {
    name: string;
    email: string;
  };
  product?: {
    productName: string;
    images: string[];
  };
}

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/admin/orders');
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  }
};

export const analyticsService = {
  getMonthlySales: async () => {
    const response = await api.get('/admin/analytics/monthly-sales');
    return response.data;
  },

  getOrdersTrend: async () => {
    const response = await api.get('/admin/analytics/orders-trend');
    return response.data;
  },

  getSalesByCategory: async () => {
    const response = await api.get('/admin/analytics/sales-by-category');
    return response.data;
  },

  getTopSellingProducts: async () => {
    const response = await api.get('/admin/analytics/top-selling-products');
    return response.data;
  }
};

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/admin/customers');
    return response.data.data;
  },

  updateStatus: async (id: string, status: 'Active' | 'Blocked'): Promise<Customer> => {
    const response = await api.put(`/admin/customers/${id}/status`, { status });
    return response.data.data;
  },

  getDetails: async (id: string): Promise<Customer> => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data.data;
  }
};
