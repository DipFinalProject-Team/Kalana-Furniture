import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import { orderService } from '../services/api';
import type { Order } from '../services/api';
import Toast from '../components/Toast';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getAll();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };


  // View Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toString().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cancelled':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Cancelled
          </span>
        );
      case 'Placed':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Placed
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-2">
             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
             Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-2">
             <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
             Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
             Delivered
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-2xl">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-500 mt-1">View customer orders</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID or Customer..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown appearance-none bg-white w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="Placed">Placed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Total Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-medium text-gray-800">#{order.id}</td>
                    <td className="p-4 text-gray-800 font-medium">
                      {order.customer?.name || 'N/A'}
                      <div className="text-sm text-gray-500">{order.customer?.email}</div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-gray-800">Rs. {order.total.toFixed(2)}</td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-500">ID: {selectedOrder.id}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Customer Info</h3>
                  <p className="font-bold text-gray-800">{selectedOrder.customer?.name || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">{selectedOrder.customer?.email || 'N/A'}</p>
                  <p className="text-gray-600 text-sm">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Delivery Info</h3>
                  <p className="font-bold text-gray-800">{selectedOrder.delivery_name}</p>
                  <p className="text-gray-600 text-sm">{selectedOrder.delivery_address}</p>
                  <p className="text-gray-600 text-sm">{selectedOrder.delivery_phone}</p>
                  <p className="text-gray-600 text-sm">{selectedOrder.delivery_email}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Order Status</h3>
                {getStatusBadge(selectedOrder.status)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Order Item</h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedOrder.product?.images?.[0] || '/placeholder-image.jpg'}
                      alt={selectedOrder.product?.productName || 'Product'}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{selectedOrder.product?.productName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Qty: {selectedOrder.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-800">Rs. {(selectedOrder.total / selectedOrder.quantity).toFixed(2)} each</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 px-8 border-t border-gray-200 flex justify-between items-center">
              <p className="font-bold text-gray-800">Total Amount</p>
              <p className="text-xl font-bold text-wood-brown">Rs. {selectedOrder.total.toFixed(2)}</p>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
