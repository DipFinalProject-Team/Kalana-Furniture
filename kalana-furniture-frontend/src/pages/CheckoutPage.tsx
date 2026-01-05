import { useState } from 'react';
import { FaShippingFast, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaMoneyBillWave } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import SnowAnimation from '../components/SnowAnimation'; // Reusing the snow animation for a consistent feel
import Toast from '../components/Toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, appliedDiscount } = useCart();

  const [deliveryDetails, setDeliveryDetails] = useState({
    name: 'John Doe',
    address: '123 Furniture St, Wood City, WC 12345',
    phone: '+94771234567',
    email: 'john.doe@example.com',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((acc: number, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 500 ? 0 : 50; // Free shipping for orders over Rs 500
  const total = subtotal + shippingFee - appliedDiscount;

  const handleConfirmOrder = () => {
    // In a real app, you'd send this to a backend
    console.log('Order Confirmed:', {
      deliveryDetails,
      items: cartItems,
      total,
    });

    // Show a confirmation message and navigate home
    setToast({ type: 'success', message: 'Your order has been placed successfully!' });
    clearCart();
    setTimeout(() => {
      navigate('/');
    }, 2000); // Navigate after showing the toast
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-wood-brown via-nav-brown to-wood-accent py-[140px] px-4 relative overflow-hidden">
        <SnowAnimation
            containerClass="absolute inset-0 pointer-events-none overflow-hidden"
            numFlakes={25}
            minDuration={8}
            maxDuration={15}
            minDelay={0}
            maxDelay={5}
            minSize={8}
            maxSize={20}
            opacity={0.5}
        />

        <div className="max-w-6xl mx-auto z-10 relative">
          <div className="text-center mb-12">
            <h1 className="font-sans text-5xl font-bold text-white drop-shadow-lg">Checkout</h1>
            <p className="text-wood-light mt-2 text-md">Finalize your order</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left side: Delivery and Payment */}
            <div className="lg:col-span-3 space-y-8">
              {/* Delivery Details */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <FaShippingFast className="mr-3 text-wood-accent" />
                    Delivery Details
                  </h2>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-wood-accent font-semibold hover:text-white transition-colors"
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <FaUser className="absolute top-3 left-3 text-wood-light" />
                      <input type="text" name="name" value={deliveryDetails.name} onChange={handleInputChange} className="w-full bg-white/20 border border-white/30 rounded-lg text-white pl-10 p-2 focus:outline-none focus:ring-2 focus:ring-wood-accent"/>
                    </div>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute top-3 left-3 text-wood-light" />
                      <textarea name="address" value={deliveryDetails.address} onChange={handleInputChange} className="w-full bg-white/20 border border-white/30 rounded-lg text-white pl-10 p-2 focus:outline-none focus:ring-2 focus:ring-wood-accent" rows={3}></textarea>
                    </div>
                    <div className="relative">
                      <FaPhone className="absolute top-3 left-3 text-wood-light" />
                      <input type="text" name="phone" value={deliveryDetails.phone} onChange={handleInputChange} className="w-full bg-white/20 border border-white/30 rounded-lg text-white pl-10 p-2 focus:outline-none focus:ring-2 focus:ring-wood-accent"/>
                    </div>
                    <div className="relative">
                      <FaEnvelope className="absolute top-3 left-3 text-wood-light" />
                      <input type="email" name="email" value={deliveryDetails.email} onChange={handleInputChange} className="w-full bg-white/20 border border-white/30 rounded-lg text-white pl-10 p-2 focus:outline-none focus:ring-2 focus:ring-wood-accent"/>
                    </div>
                  </div>
                ) : (
                  <div className="text-wood-light space-y-3">
                    <p className="flex items-center"><FaUser className="mr-4 text-white" /> {deliveryDetails.name}</p>
                    <p className="flex items-start"><FaMapMarkerAlt className="mr-4 mt-1 text-white" /> {deliveryDetails.address}</p>
                    <p className="flex items-center"><FaPhone className="mr-4 text-white" /> {deliveryDetails.phone}</p>
                    <p className="flex items-center"><FaEnvelope className="mr-4 text-white" /> {deliveryDetails.email}</p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <FaMoneyBillWave className="mr-3 text-wood-accent" />
                  Payment Method
                </h2>
                <div className="bg-white/20 border-2 border-wood-accent rounded-lg p-6 flex items-center justify-between cursor-pointer">
                  <div>
                    <h3 className="font-bold text-white text-lg">Cash on Delivery</h3>
                    <p className="text-wood-light text-sm">Pay with cash upon receiving your order.</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-wood-accent flex items-center justify-center">
                    <div className="w-3 h-3 bg-wood-accent rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-lg sticky top-32">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Order Summary</h2>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-wood-light">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg mr-4 object-cover"/>
                        <div>
                            <p className="text-white font-semibold">{item.name}</p>
                            <p className="text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-white font-semibold">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <hr className="border-white/20 my-6"/>
                <div className="space-y-3 text-wood-light">
                    <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p className="text-white font-semibold">Rs.{subtotal.toFixed(2)}</p>
                    </div>
                    {appliedDiscount > 0 && (
                        <div className="flex justify-between text-green-400">
                            <p>Discount</p>
                            <p className="font-semibold">-Rs.{appliedDiscount.toFixed(2)}</p>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <p>Shipping Fee</p>
                        <p className="text-white font-semibold">{shippingFee === 0 ? 'Free' : `Rs.${shippingFee.toFixed(2)}`}</p>
                    </div>
                </div>
                <hr className="border-white/20 my-6"/>
                <div className="flex justify-between text-white font-bold text-xl">
                    <p>Total</p>
                    <p>Rs.{total.toFixed(2)}</p>
                </div>
                <button 
                  onClick={handleConfirmOrder}
                  disabled={cartItems.length === 0}
                  className="w-full mt-8 bg-wood-accent text-white font-bold py-3 rounded-lg hover:bg-wood-accent-hover transform hover:scale-105 transition-all duration-300 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default CheckoutPage;
