import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions for cookies
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getCookie('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to standardize responses
api.interceptors.response.use(
  (response) => {
    // If response data is an array, return as is
    if (Array.isArray(response.data)) {
      return response;
    }
    // For successful responses, wrap in success format
    return {
      ...response,
      data: {
        success: true,
        message: 'Success',
        ...response.data
      }
    };
  },
  (error) => {
    // For error responses, wrap in error format
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      success: false,
      message
    });
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
  role: string;
  status?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
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

// Product Service
export interface Product {
  id: number;
  productName: string;
  name?: string;
  category: string;
  sku: string;
  price: number;
  discountPrice?: number;
  images: string[];
  rating: number;
  stock: number;
  description?: string;
  reviews?: Review[];
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
    return response.data;
  },

  create: async (productData: FormData): Promise<{ success: boolean; message: string; product: Product }> => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: number, productData: Partial<Product>): Promise<{ success: boolean; message: string; product: Product }> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Category Service
export interface Category {
  id: number;
  name: string;
  image: string;
  description?: string;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData: Omit<Category, 'id'>): Promise<{ success: boolean; message: string; category: Category }> => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id: number, categoryData: Partial<Category>): Promise<{ success: boolean; message: string; category: Category }> => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

// Review Service
export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
}

// Raw review data from API
interface RawReview {
  id: number;
  user: string;
  comment: string;
  rating: number;
  images?: string[] | null;
  created_at: string;
}

export const reviewService = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data.map((review: RawReview) => ({
      id: review.id,
      product_id: 0, // This will be set by the component if needed
      user_id: '', // Not returned by API
      user_name: review.user,
      rating: review.rating,
      comment: review.comment,
      images: Array.isArray(review.images) ? review.images : [],
      created_at: review.created_at
    }));
  },

  createReview: async (productId: string, reviewData: { comment: string; rating: number; images?: File[] }): Promise<{ success: boolean; message: string; review?: Review }> => {
    try {
      const formData = new FormData();
      formData.append('comment', reviewData.comment);
      formData.append('rating', reviewData.rating.toString());

      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await api.post(`/reviews/product/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: response.data.success,
        message: response.data.message,
        review: {
          id: response.data.id,
          product_id: parseInt(productId),
          user_id: '',
          user_name: response.data.user,
          rating: response.data.rating,
          comment: response.data.comment,
          images: response.data.images || [],
          created_at: response.data.created_at
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  updateReview: async (reviewId: string, reviewData: { comment: string; rating: number }): Promise<{ success: boolean; message: string; review: Review }> => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

// Order Service
export interface OrderItem {
  id?: number;
  product_id: number;
  product_name: string;
  product_category: string;
  product_sku: string;
  quantity: number;
  price: number;
  product_image?: string;
  product?: Product;
}

export interface DeliveryDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Order {
  id?: number;
  customer_id?: string;
  items: OrderItem[];
  total: number;
  status?: string;
  deliveryDetails?: DeliveryDetails;
  created_at?: string;
}

export const orderService = {
  create: async (orderData: { items: OrderItem[], total: number, deliveryDetails: DeliveryDetails }): Promise<{ message: string; order: Order }> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/user');
    return response.data;
  },

  getAll: async (userId?: string): Promise<Order[]> => {
    const url = userId ? `/orders?customer_id=${userId}` : '/orders';
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<{ success: boolean; message: string; order: Order }> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }
};

// Promotion Service
export interface Promotion {
  id: number;
  code: string | null;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  start_date: string;
  end_date: string;
  applies_to: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const promotionService = {
  getAll: async (): Promise<Promotion[]> => {
    const response = await api.get('/promotions');
    return response.data;
  },

  getActive: async (): Promise<Promotion[]> => {
    const response = await api.get('/promotions/active');
    return response.data;
  },

  getById: async (id: number): Promise<Promotion> => {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },

  create: async (promotionData: Omit<Promotion, 'id'>): Promise<{ success: boolean; message: string; promotion: Promotion }> => {
    const response = await api.post('/promotions', promotionData);
    return response.data;
  },

  update: async (id: number, promotionData: Partial<Promotion>): Promise<{ success: boolean; message: string; promotion: Promotion }> => {
    const response = await api.put(`/promotions/${id}`, promotionData);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  },

  apply: async (code: string): Promise<{ valid: boolean; promotion?: any; error?: string }> => {
    const response = await api.post('/promotions/apply', { code });
    return response.data;
  }
};

export { api };