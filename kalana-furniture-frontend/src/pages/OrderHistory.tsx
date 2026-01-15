import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory } from 'react-icons/fa';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';
import AuthRequiredMessage from '../components/AuthRequiredMessage';
import { orderService } from '../services/api';
import type { GroupedOrder } from '../services/api';

const OrderModal = ({ order, onClose, onCancel }: { order: GroupedOrder; onClose: () => void; onCancel: () => void }) => {

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white/10 backdrop-blur-md shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in border border-white/20 rounded-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/20 flex justify-between items-start bg-white/5 backdrop-blur-md rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Order Details</h2>
            <p className="text-sm text-wood-light mt-1">Order ID: #{order.id}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-wood-accent/20 text-wood-accent border border-wood-accent/50">
                Order #{order.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Order Status & Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <p className="text-xs uppercase tracking-wider text-wood-light mb-2 font-semibold">Order Date</p>
              <p className="font-bold text-white text-lg">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <p className="text-xs uppercase tracking-wider text-wood-light mb-2 font-semibold">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                order.status === 'delivered' ? 'bg-green-500/20 text-green-300 border border-green-400/50' :
                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50' :
                order.status === 'processing' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50' :
                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50' :
                'bg-red-500/20 text-red-300 border border-red-400/50'
              }`}>
                {order.status || 'pending'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <p className="text-xs uppercase tracking-wider text-wood-light mb-2 font-semibold">Total Amount</p>
              <p className="font-bold text-2xl text-wood-accent">Rs. {order.total?.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <p className="text-xs uppercase tracking-wider text-wood-light mb-2 font-semibold">Payment Method</p>
              <p className="font-bold text-white">Cash on Delivery</p>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              Delivery Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-wood-light mb-1">Recipient Name</p>
                <p className="font-semibold text-white">{order.delivery_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-wood-light mb-1">Phone Number</p>
                <p className="font-semibold text-white">{order.delivery_phone || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-wood-light mb-1">Delivery Address</p>
                <p className="font-semibold text-white">{order.delivery_address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-wood-light mb-1">Email</p>
                <p className="font-semibold text-white">{order.delivery_email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center">
              Product Details
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-6 items-center p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className="relative">
                    <img
                      src={item.product?.images?.[0] || '/placeholder-image.jpg'}
                      alt={item.product?.productName}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-white/30 shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-wood-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-lg truncate block mb-2">
                      {item.product?.productName || 'Product'}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-wood-light">Unit Price</p>
                        <p className="font-semibold text-white">Rs. {(item.total / item.quantity).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-wood-light">Quantity</p>
                        <p className="font-semibold text-white">{item.quantity}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-wood-light text-sm mb-1">Total</p>
                    <p className="font-bold text-wood-accent text-xl">Rs. {item.total?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-white/5 backdrop-blur-md flex justify-end gap-3 rounded-b-2xl">
          {order.items.some((item) => item.status === 'pending') && (
            <button
              onClick={onCancel}
              className="px-6 py-3 text-red-300 bg-red-500/20 border border-red-400/50 rounded-lg hover:bg-red-500/30 font-bold transition-all duration-200"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-wood-accent text-white rounded-lg hover:bg-wood-accent-hover font-bold transition-all duration-200 shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
const OrderHistoryPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<GroupedOrder | null>(null);
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getUserOrders();
      
      // Group orders by customer and creation time (within 5 minutes)
      const groupedOrders: Record<string, GroupedOrder> = ordersData.reduce((groups: Record<string, GroupedOrder>, order) => {
        const orderTime = order.created_at ? new Date(order.created_at).getTime() : Date.now();
        const groupKey = `${order.customer_id || 'unknown'}_${Math.floor(orderTime / (5 * 60 * 1000))}`; // Group by 5-minute windows
        
        if (!groups[groupKey]) {
          groups[groupKey] = {
            id: order.id ?? 0, // Use first order ID as main ID
            customer_id: order.customer_id || '',
            created_at: order.created_at || '',
            status: order.status || 'pending',
            delivery_name: order.delivery_name || '',
            delivery_address: order.delivery_address || '',
            delivery_phone: order.delivery_phone || '',
            delivery_email: order.delivery_email || '',
            items: [],
            total: 0
          };
        }
        
        groups[groupKey].items.push({
          id: order.id ?? 0,
          product: order.product || { productName: 'Product', images: [] },
          quantity: order.quantity,
          total: order.total,
          status: order.status || 'pending'
        });
        groups[groupKey].total += order.total;
        
        return groups;
      }, {});
      
      const groupedOrdersArray: GroupedOrder[] = Object.values(groupedOrders);
      setOrders(groupedOrdersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setToast({ message: 'Failed to load orders', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleCancelOrder = async (order: GroupedOrder) => {
    try {
      // Cancel all items in the order group
      const cancelPromises = order.items.map((item) => 
        orderService.updateStatus(item.id, 'cancelled')
      );
      
      await Promise.all(cancelPromises);
      
      showToast(`Order #${order.id} has been successfully cancelled.`, 'success');
      setSelectedOrder(null);
      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('Failed to cancel order. Please try again.', 'error');
    }
  };

  return (
    <>
      <Header />
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-wood-light">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown mx-auto mb-4"></div>
            <p className="text-wood-brown">Loading...</p>
          </div>
        </div>
      ) : !user ? (
        <AuthRequiredMessage
          title="Authentication Required"
          message="Please log in to view your order history."
          description="You need to be logged in to view your order history, track shipments, and manage your purchases."
        />
      ) : loading ? (
        <div className="min-h-screen flex items-center justify-center bg-wood-light">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown mx-auto mb-4"></div>
            <p className="text-wood-brown">Loading orders...</p>
          </div>
        </div>
      ) : (
      <div className="bg-[url('/wood-bg.jpg')] bg-cover bg-center bg-fixed py-[150px] min-h-screen relative">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-start mb-8">
            <h1 className="font-sans text-4xl font-bold text-white mb-4 drop-shadow-lg flex items-center justify-center">
              <FaHistory className="mr-4 text-wood-accent" />
              Your Order History
            </h1>
          </div>
          <div className="bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border border-white/20">
            <div className="overflow-x-auto overflow-y-auto max-h-106">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {orders.map((order: GroupedOrder) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-wood-light">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {order.items.map((item, index: number) => (
                            <div key={item.id} className="flex items-center space-x-4">
                              {/* Horizontal Scrollable Image Gallery */}
                              <div className="relative">
                                <div className="flex overflow-x-auto space-x-2 max-w-24" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.3) transparent'}}>
                                  {(item.product?.images && item.product.images.length > 0 ? item.product.images : ['/placeholder-image.jpg']).map((image, imgIndex) => (
                                    <img
                                      key={imgIndex}
                                      className="h-12 w-12 flex-shrink-0 rounded-lg object-cover border-2 border-white/30 shadow-lg"
                                      src={image}
                                      alt={`${item.product?.productName || 'Product'} ${imgIndex + 1}`}
                                    />
                                  ))}
                                </div>
                                {/* Quantity badge */}
                                <div className="absolute -top-2 -right-2 bg-wood-accent text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                                  {item.quantity}
                                </div>
                              </div>
                              <div className="text-sm">
                                <p className="font-semibold text-white truncate max-w-xs">{item.product?.productName || 'Product'}</p>
                                <p className="text-xs text-wood-light">Qty: {item.quantity} × Rs.{(item.total / item.quantity).toFixed(2)}</p>
                              </div>
                              {index < order.items.length - 1 && <hr className="border-white/20 w-full mt-2" />}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-wood-accent">Rs.{order.total?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full border ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-300 border-green-400/50' :
                          order.status === 'shipped' ? 'bg-blue-500/20 text-blue-300 border-blue-400/50' :
                          order.status === 'processing' ? 'bg-purple-500/20 text-purple-300 border-purple-400/50' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50' :
                          'bg-red-500/20 text-red-300 border-red-400/50'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-wood-accent hover:text-white font-bold transition-colors duration-200 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-white mb-2">No Orders Found</h2>
              <p className="text-wood-light mb-6 max-w-md mx-auto">You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <Link to="/" className="bg-wood-accent text-white px-8 py-3 rounded-full font-bold hover:bg-wood-accent-hover transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                Start Shopping
              </Link>
            </div>
          )}
        </div>

        {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onCancel={() => handleCancelOrder(selectedOrder)} />}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
      )}
    </>
  );
};

export default OrderHistoryPage;
