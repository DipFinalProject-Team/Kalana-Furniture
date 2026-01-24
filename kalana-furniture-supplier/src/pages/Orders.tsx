import React, { useState, useEffect } from 'react';
import { supplierService } from '../services/api';
import { FaCheck, FaTimes, FaTruck, FaBoxOpen, FaSearch } from 'react-icons/fa';
import Toast from '../components/Toast';

interface SupplierOrderBackend {
  id: number;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  deliveryDate: string | null;
  actualDeliveryDate: string | null;
  deliveryNotes: string | null;
}

interface SupplierOrder {
  id: string;
  product: string;
  quantity: number;
  expectedDelivery: string;
  pricePerUnit: number;
  totalPrice: number;
  status: string;
  orderDate: string;
  actualDeliveryDate?: string;
  deliveryNotes?: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  useEffect(() => {
    fetchOrders();
  });

  const fetchOrders = async () => {
    try {
      const response = await supplierService.getSupplierOrders();
      if (response.success) {
        const mappedOrders = response.orders.map((order: SupplierOrderBackend) => ({
          id: order.id.toString(),
          product: order.productName,
          quantity: order.quantity,
          expectedDelivery: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
          pricePerUnit: order.totalAmount ? Math.round(order.totalAmount / order.quantity) : 0,
          totalPrice: order.totalAmount || 0,
          status: order.status,
          orderDate: new Date(order.orderDate).toISOString().split('T')[0],
          actualDeliveryDate: order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toISOString().split('T')[0] : '',
          deliveryNotes: order.deliveryNotes || ''
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to fetch orders', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const order = orders.find(o => o.id === id);
    
    if (newStatus === 'Dispatched') {
      if (!order?.actualDeliveryDate) {
        showToast('Please enter the Actual Delivery Date before marking as Dispatched.', 'error');
        return;
      }
    }

    if (newStatus === 'Accepted') {
      if (!order?.totalPrice || order.totalPrice <= 0) {
        showToast('Please enter the Total Price before accepting the order.', 'error');
        return;
      }
    }

    try {
      // For accepting orders, also update the total price
      if (newStatus === 'Accepted' && order?.totalPrice) {
        await supplierService.updateSupplierOrderDetails(id, { totalPrice: order.totalPrice });
      }
      
      // Pass actual delivery date and notes when dispatching
      const actualDeliveryDate = newStatus === 'Dispatched' ? order?.actualDeliveryDate : undefined;
      const deliveryNotes = newStatus === 'Dispatched' ? order?.deliveryNotes : undefined;
      
      await supplierService.updateSupplierOrderStatus(id, newStatus, actualDeliveryDate, deliveryNotes);
      
      const updatedOrders = orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      showToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleDetailsUpdate = (id: string, field: 'actualDeliveryDate' | 'deliveryNotes' | 'totalPrice', value: string | number) => {
    const updatedOrders = orders.map(order => 
      order.id === id ? { ...order, [field]: value } : order
    );
    setOrders(updatedOrders);
    
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, [field]: value });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Accepted': return 'bg-blue-100 text-blue-800';
      case 'Dispatched': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-serif text-amber-900 mb-6">Supplier Order Management</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Accepted', 'Dispatched', 'Delivered', 'Completed', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-[338px]">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-amber-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Delivery</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Delivery</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedOrder?.id === order.id ? 'bg-amber-50' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.expectedDelivery}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.actualDeliveryDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{order.deliveryNotes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No orders found for this status.
              </div>
            )}
          </div>
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white p-6 rounded-lg shadow-md border border-amber-100 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-amber-900">Order Details</h2>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-medium text-lg">{selectedOrder.product}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price per Unit</p>
                    <p className="font-medium">LKR {selectedOrder.pricePerUnit.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="font-bold text-amber-600 text-lg">LKR {selectedOrder.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Delivery</p>
                  <p className="font-medium">{selectedOrder.expectedDelivery}</p>
                </div>

                {selectedOrder.status === 'Pending' && (
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Total Price (LKR)</label>
                    <input
                      type="number"
                      value={selectedOrder.totalPrice || ''}
                      onChange={(e) => handleDetailsUpdate(selectedOrder.id, 'totalPrice', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="Enter total price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                {['Accepted', 'Dispatched', 'Delivered', 'Completed'].includes(selectedOrder.status) && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Actual Delivery Date</label>
                      <input
                        type="date"
                        value={selectedOrder.actualDeliveryDate || ''}
                        onChange={(e) => handleDetailsUpdate(selectedOrder.id, 'actualDeliveryDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Delivery Notes</label>
                      <textarea
                        value={selectedOrder.deliveryNotes || ''}
                        onChange={(e) => handleDetailsUpdate(selectedOrder.id, 'deliveryNotes', e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        placeholder="Enter delivery details..."
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">                
                {selectedOrder.status === 'Pending' && (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'Accepted')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <FaCheck /> Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'Rejected')}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </>
                )}

                {selectedOrder.status === 'Accepted' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'Dispatched')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <FaTruck /> Mark as Dispatched
                  </button>
                )}

                {selectedOrder.status === 'Dispatched' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'Delivered')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <FaBoxOpen /> Mark as Delivered
                  </button>
                )}

                {['Delivered', 'Completed', 'Rejected'].includes(selectedOrder.status) && (
                  <p className="text-sm text-gray-500 text-center italic">
                    No further actions available.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg border border-dashed border-gray-300 text-center h-full flex flex-col justify-center items-center text-gray-500">
              <FaBoxOpen className="text-4xl mb-2 opacity-20" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default Orders;
