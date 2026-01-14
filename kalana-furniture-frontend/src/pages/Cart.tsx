import { useMemo, useState } from 'react';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaCreditCard, FaTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SnowAnimation from '../components/SnowAnimation';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import AuthRequiredMessage from '../components/AuthRequiredMessage';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, appliedDiscount, promoMessage, applyPromoCode, removePromoCode } = useCart();
  const { user, isLoading } = useAuth();
  
  const [localPromoCode, setLocalPromoCode] = useState('');

  const handleQuantityChange = (id: number, delta: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + delta);
    }
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };

  const handleApplyPromoCode = () => {
    applyPromoCode(localPromoCode);
  };

  const handleRemovePromoCode = () => {
    removePromoCode();
    setLocalPromoCode('');
  };

  const subtotal = useMemo(() => getTotalPrice(), [getTotalPrice]);
  const total = useMemo(() => Math.max(subtotal - appliedDiscount, 0), [subtotal, appliedDiscount]);

  return (
    <>
    <div>
      <Header />
    </div>
    {isLoading ? (
      <div className="min-h-screen flex items-center justify-center bg-wood-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown mx-auto mb-4"></div>
          <p className="text-wood-brown">Loading...</p>
        </div>
      </div>
    ) : !user ? (
      <AuthRequiredMessage
        title="Authentication Required"
        message="Please log in to access your cart."
        description="You need to be logged in to view your shopping cart, apply promo codes, and proceed to checkout."
      />
    ) : (
    <div className="min-h-screen bg-[url('/wood-bg.jpg')] bg-cover bg-center bg-fixed py-[140px] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/60"></div>
      <SnowAnimation
        containerClass="absolute inset-0 pointer-events-none overflow-hidden"
        numFlakes={25}
        minDuration={10}
        maxDuration={20}
        opacity={0.4}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">

        <div className="text-start mb-8">
          <h1 className="font-sans text-4xl font-bold text-white mb-4 drop-shadow-lg flex items-center justify-center">
            <FaShoppingCart className="mr-4 text-wood-accent" />
            Your Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
            <p className="text-wood-light mb-8">Looks like you haven't added anything to your cart yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-wood-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-wood-accent-hover transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 transform hover:scale-[1.02] transition-transform animate-in fade-in-0 slide-in-from-left-4 duration-500">
                  <img src={item.image} alt={item.name} className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover border-2 border-wood-accent/50 shadow-lg" />
                  <div className="flex-grow ml-6">
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <p className="text-sm text-wood-light mt-1">Category: {item.category}</p>
                    <div className="mt-2">
                      {item.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 line-through text-sm">Rs.{item.price.toFixed(2)}</span>
                          <span className="text-red-400 font-bold text-lg">Rs.{item.discountPrice.toFixed(2)}</span>
                          {item.discountPercentage && (
                            <span className="bg-red-100 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                              -{item.discountPercentage}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-lg font-semibold text-wood-accent">Rs.{item.price.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-4 ml-4">
                    <div className="flex items-center bg-white/20 rounded-full">
                      <button onClick={() => handleQuantityChange(item.id, -1)} className="p-2 text-white hover:text-wood-accent transition-colors duration-200 rounded-full">
                        <FaMinus />
                      </button>
                      <span className="px-4 font-bold text-white">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)} className="p-2 text-white hover:text-wood-accent transition-colors duration-200 rounded-full">
                        <FaPlus />
                      </button>
                    </div>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 transition-colors duration-200 flex items-center text-sm">
                      <FaTrash className="mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 animate-in fade-in-0 slide-in-from-right-4 duration-700">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-4">Order Summary</h2>
                
                {/* Promo Code Section */}
                <div className="mb-6">
                  <label className="flex items-center text-sm font-medium text-wood-light mb-2">
                    <FaTag className="mr-2" />
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={localPromoCode}
                      onChange={(e) => setLocalPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 focus:ring-wood-accent focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyPromoCode}
                      className="px-4 py-2 bg-wood-accent text-white rounded-lg hover:bg-wood-accent-hover transition-colors duration-200 font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-sm mt-2 ${appliedDiscount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {promoMessage}
                    </p>
                  )}
                  {appliedDiscount > 0 && (
                    <button
                      onClick={handleRemovePromoCode}
                      className="text-xs text-red-400 hover:text-red-300 mt-1 underline"
                    >
                      Remove promo code
                    </button>
                  )}
                </div>

                <div className="space-y-4 border-t border-white/20 pt-4">
                  <div className="flex justify-between text-white">
                    <span>Subtotal</span>
                    <span>Rs.{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-Rs.{appliedDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold text-white border-t border-white/20 pt-4">
                    <span>Total</span>
                    <span>Rs.{total.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-8 bg-wood-accent text-white font-bold py-4 px-6 rounded-lg hover:bg-wood-accent-hover transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(200,162,124,0.5)] flex items-center justify-center">
                  <FaCreditCard className="mr-3" />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    )}
  </>
  );
};

export default Cart;
