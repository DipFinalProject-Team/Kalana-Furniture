import { useState, useEffect } from 'react';
import { FaShippingFast, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaMoneyBillWave } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import Header from '../components/Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SnowAnimation from '../components/SnowAnimation';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import AuthRequiredMessage from '../components/AuthRequiredMessage';
import { orderService, productService, promotionService, type Product, type Promotion } from '../services/api';


const CheckoutPage = () => {
  // Function to apply promotions to a product
  const applyPromotionsToProduct = (product: Product, promotionsList: Promotion[]): Product & { discountPrice?: number; discountPercentage?: number } => {
    let bestDiscountPrice = product.discountPrice || product.price; // Start with existing discount or original price
    let bestDiscountPercentage = 0;

    promotionsList.forEach(promotion => {
      // Only apply general discounts (where code is null)
      if (promotion.code !== null) return;
      
      // Skip inactive promotions (though getActive should only return active ones)
      if (!promotion.is_active) return;

      // Check if promotion applies to this product
      let appliesToProduct = false;

      if (promotion.applies_to === 'All Products') {
        appliesToProduct = true;
      } else if (promotion.applies_to && promotion.applies_to.startsWith('Category: ')) {
        const category = promotion.applies_to.replace('Category: ', '');
        appliesToProduct = product.category === category;
      }

      if (appliesToProduct) {
        let discountPrice = product.price;

        if (promotion.type === 'percentage') {
          discountPrice = product.price * (1 - promotion.value / 100);
        } else if (promotion.type === 'fixed') {
          discountPrice = Math.max(0, product.price - promotion.value);
        }

        if (discountPrice < bestDiscountPrice) {
          bestDiscountPrice = discountPrice;
          bestDiscountPercentage = promotion.type === 'percentage' ? promotion.value : Math.round(((product.price - discountPrice) / product.price) * 100);
        }
      }
    });

    if (bestDiscountPrice < product.price) {
      return {
        ...product,
        discountPrice: Math.round(bestDiscountPrice),
        discountPercentage: bestDiscountPercentage
      };
    }

    return product;
  };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const { cartItems, clearCart, appliedDiscount, promoCode, applyPromoCode, removePromoCode, promoMessage } = useCart();

  const isBuyNow = searchParams.get('buyNow') === 'true';
  const buyNowProductId = searchParams.get('productId');
  const buyNowQuantity = parseInt(searchParams.get('quantity') || '1');

  const [buyNowProduct, setBuyNowProduct] = useState<(Product & { discountPrice?: number; discountPercentage?: number }) | null>(null);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [localPromoCode, setLocalPromoCode] = useState('');

  // Populate delivery details with user information
  useEffect(() => {
    if (user) {
      setDeliveryDetails({
        name: user.name || '',
        address: user.address || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Fetch buy now product details
  useEffect(() => {
    if (isBuyNow && buyNowProductId) {
      const fetchBuyNowProduct = async () => {
        setBuyNowLoading(true);
        try {
          const [productData, promotionsData] = await Promise.all([
            productService.getById(buyNowProductId),
            promotionService.getActive()
          ]);
          
          // Apply promotions to the product
          const productWithDiscount = applyPromotionsToProduct(productData, promotionsData);
          
          setBuyNowProduct(productWithDiscount);
        } catch (error) {
          console.error('Error fetching buy now product:', error);
          setToast({ type: 'error', message: 'Failed to load product details. Please try again.' });
        } finally {
          setBuyNowLoading(false);
        }
      };
      fetchBuyNowProduct();
    }
  }, [isBuyNow, buyNowProductId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyPromoCode = () => {
    applyPromoCode(localPromoCode);
    setLocalPromoCode('');
  };

  const handleRemovePromoCode = () => {
    removePromoCode();
    setLocalPromoCode('');
  };

  const subtotal = isBuyNow && buyNowProduct 
    ? (buyNowProduct.discountPrice || buyNowProduct.price) * buyNowQuantity 
    : cartItems.reduce((acc: number, item) => {
        const price = item.discountPrice || item.price;
        return acc + price * item.quantity;
      }, 0);
  const shippingFee = 0; // No shipping fees
  const total = subtotal + shippingFee - appliedDiscount;

  const handleConfirmOrder = async () => {
    if (!user) {
      setToast({ type: 'error', message: 'Please log in to place an order' });
      return;
    }

    try {
      if (isBuyNow && buyNowProduct) {
        // Handle buy now order
        const orderData = {
          customer_id: user.id,
          product_id: parseInt(buyNowProductId!),
          quantity: buyNowQuantity,
          total: Math.max(((buyNowProduct.discountPrice || buyNowProduct.price) * buyNowQuantity) - appliedDiscount, 0),
          deliveryDetails: deliveryDetails,
          promoCode: promoCode || null // Include promo code if applied
        };

        await orderService.create(orderData);
        setToast({ type: 'success', message: 'Your order has been placed successfully!' });
        removePromoCode(); // Remove promo code after successful order
      } else {
        // Handle cart checkout
        const orderPromises = cartItems.map(async (item) => {
          const itemSubtotal = (item.discountPrice || item.price) * item.quantity;
          const discountPortion = appliedDiscount > 0 ? (itemSubtotal / subtotal) * appliedDiscount : 0;
          const orderData = {
            customer_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity,
            total: Math.max(itemSubtotal - discountPortion, 0),
            deliveryDetails: deliveryDetails,
            promoCode: promoCode || null // Include promo code if applied
          };

          return orderService.create(orderData);
        });

        // Wait for all orders to be created
        await Promise.all(orderPromises);
        setToast({ type: 'success', message: 'Your orders have been placed successfully!' });
        clearCart();
        removePromoCode(); // Remove promo code after successful order
      }

      // Navigate to home after showing the toast
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: unknown) {
      console.error('Error creating order:', error);
      let errorMessage = 'Failed to place order. Please try again.';

      // Check if it's an axios error with response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }

      setToast({
        type: 'error',
        message: errorMessage
      });
    }
  };

  return (
    <>
      <Header />
      {isLoading || buyNowLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-wood-light rounded-full animate-spin border-t-wood-brown mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-wood-brown rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-wood-brown mb-4">Loading Checkout</h2>
            <p className="text-gray-600 mb-8">Preparing your checkout experience...</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-wood-accent rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-wood-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-wood-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      ) : !user ? (
        <AuthRequiredMessage
          title="Authentication Required"
          message="Please log in to proceed with checkout."
          description="You need to be logged in to complete your order and access checkout features."
        />
      ) : (
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
                  {isBuyNow && buyNowProduct ? (
                    <div className="flex justify-between items-center text-wood-light">
                      <div className="flex items-center">
                        <img src={buyNowProduct.images[0]} alt={buyNowProduct.productName} className="w-12 h-12 rounded-lg mr-4 object-cover"/>
                        <div>
                            <p className="text-white font-semibold">{buyNowProduct.productName}</p>
                            <p className="text-sm">Qty: {buyNowQuantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {buyNowProduct.discountPrice ? (
                          <div className="flex flex-col items-end">
                            <span className="text-gray-400 line-through text-sm">Rs.{(buyNowProduct.price * buyNowQuantity).toFixed(2)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-red-400 font-bold">Rs.{(buyNowProduct.discountPrice * buyNowQuantity).toFixed(2)}</span>
                              {buyNowProduct.discountPercentage && (
                                <span className="bg-red-100 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                                  -{buyNowProduct.discountPercentage}%
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-white font-semibold">
                            Rs.{(buyNowProduct.price * buyNowQuantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-wood-light">
                        <div className="flex items-center">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg mr-4 object-cover"/>
                          <div>
                              <p className="text-white font-semibold">{item.name}</p>
                              <p className="text-sm">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {item.discountPrice ? (
                            <div className="flex flex-col items-end">
                              <span className="text-gray-400 line-through text-sm">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                              <span className="text-red-400 font-bold">Rs.{(item.discountPrice * item.quantity).toFixed(2)}</span>
                            </div>
                          ) : (
                            <p className="text-white font-semibold">
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <hr className="border-white/20 my-6"/>

                {/* Promo Code Section for Buy Now */}
                {isBuyNow && (
                  <div className="mb-6">
                    <label className="flex items-center text-sm font-medium text-wood-light mb-2">
                      <span className="text-wood-accent mr-2">🏷️</span>
                      Have a Promo Code?
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
                )}

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
                </div>
                <hr className="border-white/20 my-6"/>
                <div className="flex justify-between text-white font-bold text-xl">
                    <p>Total</p>
                    <p>Rs.{total.toFixed(2)}</p>
                </div>
                <button 
                  onClick={handleConfirmOrder}
                  disabled={(isBuyNow && !buyNowProduct) || (!isBuyNow && cartItems.length === 0) || buyNowLoading}
                  className="w-full mt-8 bg-wood-accent text-white font-bold py-3 rounded-lg hover:bg-wood-accent-hover transform hover:scale-105 transition-all duration-300 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {buyNowLoading ? 'Loading...' : 'Confirm Order'}
                </button>
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
      </div>
      )}
    </>
  );
};

export default CheckoutPage;
