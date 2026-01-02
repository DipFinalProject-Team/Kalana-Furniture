import React, { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaTrash, FaCheckCircle, FaClock, FaBoxOpen, FaChevronDown, FaTimesCircle } from 'react-icons/fa';
import { ordersList } from '../data/mockData';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  items: OrderItem[];
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(ordersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  
  // View Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Delete Order State
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Place Order Confirmation State
  const [orderToPlace, setOrderToPlace] = useState<Order | null>(null);
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);
  
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

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
    
    // Update selected order if open in details modal
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    showToast(`Order ${id} status updated to ${newStatus}`, 'success');
  };

  const handlePlaceOrderClick = (order: Order) => {
    setOrderToPlace(order);
    setIsPlaceOrderModalOpen(true);
  };

  const confirmPlaceOrder = () => {
    if (orderToPlace) {
      handleStatusChange(orderToPlace.id, 'Placed');
      setIsPlaceOrderModalOpen(false);
      setOrderToPlace(null);
    }
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      setOrders(orders.map(order => 
        order.id === orderToDelete.id ? { ...order, status: 'Cancelled' } : order
      ));
      showToast(`Order ${orderToDelete.id} has been cancelled`, 'success');
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Placed': return <FaCheckCircle />;
      case 'Pending': return <FaClock />;
      case 'Cancelled': return <FaTimesCircle />;
      default: return <FaBoxOpen />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-2xl">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteOrder}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${orderToDelete?.id}?`}
        confirmText="Cancel Order"
        cancelText="Keep Order"
      />

      <ConfirmationModal
        isOpen={isPlaceOrderModalOpen}
        onClose={() => setIsPlaceOrderModalOpen(false)}
        onConfirm={confirmPlaceOrder}
        title="Confirm Order Placement"
        message={`Are you sure you want to mark order ${orderToPlace?.id} as Placed?`}
        confirmText="Yes"
        cancelText="Cancel"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage customer orders</p>
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
              <option value="Pending">Pending</option>
              <option value="Placed">Placed</option>
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono font-medium text-gray-800">{order.id}</td>
                  <td className="p-4 text-gray-800 font-medium">{order.customerName}</td>
                  <td className="p-4 text-gray-600 text-sm">{order.orderDate}</td>
                  <td className="p-4 font-bold text-gray-800">Rs. {order.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        if (order.status === 'Pending') {
                            handlePlaceOrderClick(order);
                        }
                      }}
                      disabled={order.status === 'Placed' || order.status === 'Cancelled'}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                        order.status === 'Placed' ? 'bg-green-50 text-green-700 border-green-200 cursor-default' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200 cursor-default' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                      {order.status === 'Pending' && (
                        <FaChevronDown className="ml-1" size={10} />
                      )}
                    </button>
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
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleDeleteClick(order)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel Order"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
                  <p className="font-bold text-gray-800">{selectedOrder.customerName}</p>
                  <p className="text-gray-600 text-sm">{selectedOrder.orderDate}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Order Status</h3>
                  <div className="relative inline-block text-left">
                    <select
                      value={selectedOrder.status}
                      disabled={selectedOrder.status === 'Placed' || selectedOrder.status === 'Cancelled'}
                      onChange={(e) => {
                        handleStatusChange(selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }}
                      className={`appearance-none pl-8 pr-8 py-1 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-wood-brown ${getStatusColor(selectedOrder.status)} ${
                        selectedOrder.status === 'Placed' || selectedOrder.status === 'Cancelled' ? 'cursor-default opacity-100' : 'cursor-pointer'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Placed">Placed</option>
                    </select>
                    <div className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none ${
                      selectedOrder.status === 'Placed' ? 'text-green-700' :
                      selectedOrder.status === 'Pending' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {getStatusIcon(selectedOrder.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-wood-brown border border-gray-200">
                          <FaBoxOpen />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-800">Rs. {item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <p className="font-bold text-gray-800">Total Amount</p>
                  <p className="text-xl font-bold text-wood-brown">Rs. {selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
