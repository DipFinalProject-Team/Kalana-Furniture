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
            <p className="text-sm text-gray-500 mt-1">ID: {order.id}</p>
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
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {order.items?.slice(0, 3).map((item) => (
                            <div key={item.id || item.product_id} className="relative group">
                              <img
                                className="h-20 w-20 rounded-md object-cover border border-gray-200"
                                src={item.product_image || '/placeholder-image.jpg'}
                                alt={item.product_name}
                              />
                              <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                {item.product_name}
                              </div>
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="h-20 w-20 rounded-md bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">Rs.{order.total?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status || 'pending')}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-wood-accent hover:text-wood-accent-hover font-semibold"
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
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Found</h2>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <Link to="/" className="bg-wood-accent text-white px-8 py-3 rounded-full font-bold hover:bg-wood-accent-hover transition-colors">
                Start Shopping
              </Link>
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
