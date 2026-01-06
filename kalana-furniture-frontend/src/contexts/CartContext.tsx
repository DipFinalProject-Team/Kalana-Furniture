import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, promotionService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export interface CartItem {
  id: number; // cart item id
  product_id: number; // product id
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  stock: number;
  category: string;
  sku: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  appliedDiscount: number;
  promoCode: string;
  promoMessage: string;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load cart items when user logs in
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/cart');
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      setError('Please log in to add items to cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/cart', { productId, quantity });
      await loadCart(); // Reload cart to get updated data
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.error || 'Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await api.delete(`/cart/${cartItemId}`);
      await loadCart(); // Reload cart to get updated data
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.error || 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.put(`/cart/${cartItemId}`, { quantity });
      await loadCart(); // Reload cart to get updated data
    } catch (err: any) {
      console.error('Error updating cart quantity:', err);
      setError(err.response?.data?.error || 'Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await api.delete('/cart');
      setCartItems([]);
      // Clear promo code state when cart is cleared
      setAppliedDiscount(0);
      setPromoCode('');
      setPromoMessage('');
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.error || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = useCallback(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const applyPromoCode = async (code: string): Promise<boolean> => {
    if (!user) {
      setPromoMessage('Please log in to apply promo codes');
      return false;
    }

    try {
      const response = await promotionService.apply(code);

      if (response.valid) {
        const { promotion } = response;
        const subtotal = getTotalPrice();

        let discountAmount = 0;
        if (promotion.type === 'percentage') {
          discountAmount = subtotal * (promotion.value / 100);
        } else if (promotion.type === 'fixed') {
          discountAmount = Math.min(promotion.value, subtotal);
        }

        setAppliedDiscount(discountAmount);
        setPromoCode(code.toUpperCase().trim());
        setPromoMessage(promotion.description);
        return true;
      } else {
        setAppliedDiscount(0);
        setPromoCode('');
        setPromoMessage(response.error || 'Invalid promo code');
        return false;
      }
    } catch (err: any) {
      console.error('Error applying promo code:', err.message || err);
      setAppliedDiscount(0);
      setPromoCode('');
      setPromoMessage(err.message || 'Failed to apply promo code');
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setAppliedDiscount(0);
    setPromoMessage('');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      appliedDiscount,
      promoCode,
      promoMessage,
      applyPromoCode,
      removePromoCode,
      loading,
      error
    }}>
      {children}
    </CartContext.Provider>
  );
};