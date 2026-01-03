import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-gradient-to-br from-wood-light to-white rounded-2xl shadow-2xl border-4 border-wood-brown p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-wood-accent via-wood-brown to-wood-accent rounded-t-2xl"></div>
        
        <div className="flex justify-between items-center border-b-2 border-wood-accent pb-6 mb-8">
          <h2 className="text-4xl font-serif font-bold text-wood-brown">Order Details</h2>
          <button onClick={onClose} className="text-wood-brown hover:text-wood-accent text-4xl font-bold transition-colors">&times;</button>
        </div>
        
        <div className="mb-8 bg-wood-light p-6 rounded-xl shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg"><span className="font-serif font-semibold text-wood-brown">Order ID:</span> <span className="text-gray-800">{order.id}</span></p>
              <p className="text-lg"><span className="font-serif font-semibold text-wood-brown">Date:</span> <span className="text-gray-800">{order.date}</span></p>
            </div>
            <div>
              <p className="text-lg"><span className="font-serif font-semibold text-wood-brown">Status:</span> <span className={`font-bold ${order.status === 'Completed' ? 'text-green-600' : order.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'}`}>{order.status}</span></p>
              <p className="text-2xl font-serif font-bold text-wood-accent mt-2"><span className="font-serif font-semibold text-wood-brown">Total:</span> Rs.{order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6 mb-8">
          <h3 className="text-2xl font-serif font-semibold text-wood-brown border-b-2 border-wood-accent pb-2">Items Purchased</h3>
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow border border-wood-accent">
              <div className="flex items-center gap-6">
                <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-lg border-2 border-wood-brown" />
                <div>
                  <Link to={`/product/${item.id}`} className="font-serif font-bold text-xl text-wood-brown hover:text-wood-accent transition-colors">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>
              <p className="font-serif font-bold text-xl text-wood-accent">Rs.{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-6 mt-10">
          {order.status === 'Pending' && (
            <button
              onClick={handleCancelOrder}
              className="bg-red-600 text-white px-8 py-3 rounded-full font-serif font-semibold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-wood-accent text-white px-8 py-3 rounded-full font-serif font-semibold hover:bg-wood-accent-hover transition-all transform hover:scale-105 shadow-lg"
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
      <div className="bg-gray-50 py-[150px] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">Your Order History</h1>
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
