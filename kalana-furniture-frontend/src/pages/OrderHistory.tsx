import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory } from 'react-icons/fa';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';
import AuthRequiredMessage from '../components/AuthRequiredMessage';
import { orderService } from '../services/api';
import type { Order } from '../services/api';

const OrderModal = ({ order, onClose, onCancel }: { order: Order; onClose: () => void; onCancel: () => void }) => {

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-wood-brown">Order Details</h2>
            <p className="text-sm text-gray-500 mt-1">ID: Order #{order.id}</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Order Status & Info */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Order Date</p>
              <p className="font-medium text-gray-900">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'placed' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status || 'pending'}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Total Amount</p>
              <p className="font-serif font-bold text-xl text-wood-brown">Rs. {order.total?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Payment Method</p>
              <p className="font-medium text-gray-900">Cash on Delivery</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Items Purchased</h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id || item.product_id} className="flex gap-4 items-center p-3 rounded-lg border border-gray-100 hover:border-wood-accent/30 transition-colors bg-white shadow-sm">
                  <img 
                    src={item.product_image || '/placeholder-image.jpg'} 
                    alt={item.product_name} 
                    className="w-16 h-16 object-cover rounded-md bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} className="font-medium text-gray-900 hover:text-wood-brown transition-colors truncate block">
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} • SKU: {item.product_sku || item.product_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Rs. {item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          {order.status === 'pending' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 font-medium transition-colors"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-wood-brown text-white rounded-lg hover:bg-wood-accent font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
const OrderHistoryPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
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
      setOrders(ordersData);
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

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.updateStatus(orderId, 'cancelled');
      showToast(`Order ${orderId} has been successfully cancelled.`, 'success');
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
          {/* Professional Order Table */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/10 backdrop-blur-sm">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Payment
                    </th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/10 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-semibold text-white">Order #{order.id}</div>
                            <div className="text-sm text-white/70">{order.items?.length || 0} item(s)</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </div>
                        <div className="text-sm text-white/60">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {order.items?.slice(0, 3).map((item) => (
                            <div key={item.id || item.product_id} className="relative group">
                              <img
                                className="h-12 w-12 rounded-lg object-cover border border-white/30 hover:border-white/50 transition-colors"
                                src={item.product_image || '/placeholder-image.jpg'}
                                alt={item.product_name}
                              />
                              <div className="absolute -top-1 -right-1 bg-wood-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {item.quantity}
                              </div>
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                {item.product_name}
                              </div>
                            </div>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xs font-medium text-white">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-white">Rs. {order.total?.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' :
                          order.status === 'placed' ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' :
                          order.status === 'pending' ? 'bg-amber-500/20 text-amber-100 border border-amber-400/30' :
                          'bg-red-500/20 text-red-100 border border-red-400/30'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        Cash on Delivery
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-white/80 hover:text-white font-medium transition-colors duration-200"
                          >
                            View Details
                          </button>
                          {order.status === 'pending' && (
                            <>
                              <span className="text-white/40">|</span>
                              <button
                                onClick={() => handleCancelOrder(order.id!)}
                                className="text-red-300 hover:text-red-200 font-medium transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {orders.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
                <p className="text-white/80 mb-8 max-w-md mx-auto">
                  You haven't placed any orders yet. Your order history will appear here once you make your first purchase.
                </p>
                <Link
                  to="/"
                  className="inline-flex mt-8 bg-wood-accent text-white font-bold py-3 px-10 rounded-lg hover:bg-wood-accent-hover transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(200,162,124,0.5)] items-center justify-center"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onCancel={() => handleCancelOrder(selectedOrder.id!)} />}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
      )}
    </>
  );
};

export default OrderHistoryPage;
