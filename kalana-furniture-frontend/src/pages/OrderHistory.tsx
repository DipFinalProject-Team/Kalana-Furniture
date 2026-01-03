import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHistory } from 'react-icons/fa';
import Header from '../components/Header';
import { mockOrders } from '../data/orders';
import type { Order, OrderItem } from '../data/orders';
import Toast from '../components/Toast';

const OrderModal = ({ order, onClose, showToast }: { order: Order; onClose: () => void; showToast: (message: string, type: 'success' | 'error') => void }) => {
  const handleCancelOrder = () => {
    // Here you would typically call an API to update the order status
    console.log(`Order ${order.id} cancelled`);
    showToast(`Order ${order.id} has been successfully cancelled.`, 'success');
    onClose();
  };

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
              <p className="font-medium text-gray-900">{order.date}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Total Amount</p>
              <p className="font-serif font-bold text-xl text-wood-brown">Rs. {order.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Payment Method</p>
              <p className="font-medium text-gray-900">Credit Card</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Items Purchased</h3>
            <div className="space-y-4">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex gap-4 items-center p-3 rounded-lg border border-gray-100 hover:border-wood-accent/30 transition-colors bg-white shadow-sm">
                  <img 
                    src={item.images[0]} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded-md bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`} className="font-medium text-gray-900 hover:text-wood-brown transition-colors truncate block">
                      {item.name}
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
          {order.status === 'Pending' && (
            <button
              onClick={handleCancelOrder}
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Header />
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
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="relative group">
                              <img
                                className="h-20 w-20 rounded-md object-cover border border-gray-200"
                                src={item.images[0]}
                                alt={item.name}
                              />
                              <div className="absolute bottom-full mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                {item.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">Rs.{order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                          {order.status}
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
          {mockOrders.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Found</h2>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <Link to="/" className="bg-wood-accent text-white px-8 py-3 rounded-full font-bold hover:bg-wood-accent-hover transition-colors">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} showToast={showToast} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default OrderHistoryPage;
