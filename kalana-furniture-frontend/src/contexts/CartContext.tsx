import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  description: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  appliedDiscount: number;
  promoCode: string;
  promoMessage: string;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Elegant Oak Dining Table',
      image: 'https://images.unsplash.com/photo-1604074131665-7a4b13870ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      price: 799.99,
      quantity: 1,
      description: 'A beautifully crafted dining table made from solid oak, perfect for family gatherings.'
    },
    {
      id: 2,
      name: 'Modern Velvet Sofa',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      price: 1299.99,
      quantity: 1,
      description: 'Luxurious and comfortable sofa, upholstered in premium velvet for a modern touch.'
    },
    {
      id: 3,
      name: 'Rustic Bookshelf',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      price: 450.00,
      quantity: 2,
      description: 'Charming rustic bookshelf made from reclaimed wood, adding character to any room.'
    },
  ]);

  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const applyPromoCode = (code: string): boolean => {
    const upperCode = code.toUpperCase().trim();
    
    // Sample promo codes - in a real app, this would come from a backend
    const promoCodes = {
      'SAVE10': { discount: 0.1, type: 'percentage' }, // 10% off
      'SAVE20': { discount: 0.2, type: 'percentage' }, // 20% off
      'FIXED50': { discount: 50, type: 'fixed' }, // Rs 50 off
      'WOODLOVER': { discount: 0.15, type: 'percentage' }, // 15% off
    };

    if (promoCodes[upperCode as keyof typeof promoCodes]) {
      const promo = promoCodes[upperCode as keyof typeof promoCodes];
      const subtotal = getTotalPrice();
      
      let discountAmount = 0;
      if (promo.type === 'percentage') {
        discountAmount = subtotal * promo.discount;
      } else {
        discountAmount = Math.min(promo.discount, subtotal);
      }
      
      setAppliedDiscount(discountAmount);
      setPromoCode(upperCode);
      setPromoMessage(`Promo code applied! You saved Rs.${discountAmount.toFixed(2)}`);
      return true;
    } else {
      setAppliedDiscount(0);
      setPromoCode('');
      setPromoMessage('Invalid promo code. Please try again.');
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
      removePromoCode
    }}>
      {children}
    </CartContext.Provider>
  );
};