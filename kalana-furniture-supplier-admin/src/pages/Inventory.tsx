import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaBoxOpen, FaExclamationTriangle, FaTimesCircle, FaCheck, FaPlus, FaMinus, FaHistory, FaCartPlus, FaClipboardList } from 'react-icons/fa';
import { inventoryService } from '../services/api';
import type { InventoryItem, SupplierOrder } from '../services/api';
import Toast from '../components/Toast';

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Order filters
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Supplier Order State
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<SupplierOrder[]>([]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  useEffect(() => {
    fetchInventory();
    fetchPurchaseOrders();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventory();
      setInventory(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await inventoryService.getPurchaseOrders();
      setPurchaseOrders(response);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  // Stats
  const totalProducts = inventory.length;
  const lowStockItems = inventory.filter(item => item.stock > 0 && item.stock < 5).length;
  const outOfStockItems = inventory.filter(item => item.stock === 0).length;
  const totalStock = inventory.reduce((acc, item) => acc + item.stock, 0);

  const handleStockUpdate = async (id: number, newStock: number) => {
    if (newStock < 0) return;

    try {
      await inventoryService.updateStock(id, newStock);
      
      // Update local state
      setInventory(inventory.map(item => {
        if (item.id === id) {
          let status = 'In Stock';
          if (newStock === 0) status = 'Out of Stock';
          else if (newStock < 5) status = 'Low Stock';
          
          return {
            ...item,
            stock: newStock,
            status: status,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      }));
      setEditingId(null);
      showToast('Stock updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating stock:', err);
      showToast('Failed to update stock', 'error');
    }
  };

  const openOrderModal = (item?: InventoryItem) => {
    if (item) {
      navigate('/inventory/create-order', { state: { productId: item.id } });
    } else {
      navigate('/inventory/create-order');
    }
  };



  const handleViewOrderDetails = (order: SupplierOrder) => {
    if (['Dispatched', 'Delivered', 'Completed'].includes(order.status)) {
      setSelectedOrder(order);
      setShowOrderDetailsModal(true);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await inventoryService.updatePurchaseOrderStatus(parseInt(orderId), 'Completed', {
        actualDeliveryDate: new Date().toISOString().split('T')[0]
      });

      // Update local state
      const order = purchaseOrders.find(o => o.id === orderId);
      if (order) {
        // Update order status
        const updatedOrders = purchaseOrders.map(o => 
          o.id === orderId ? { ...o, status: 'Completed' as const, actualDeliveryDate: new Date().toISOString().split('T')[0] } : o
        );
        setPurchaseOrders(updatedOrders);

        // Update inventory stock
        const product = inventory.find(p => p.productName === order.productName);
        if (product) {
          const newStock = product.stock + order.quantity;
          await handleStockUpdate(product.id, newStock);
        }
      }

      setShowOrderDetailsModal(false);
      showToast('Delivery confirmed! Stock updated and invoice generated. Redirecting to Invoices...', 'success');
      
      // Navigate to Invoices page to show the generated invoice
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
    } catch (err) {
      console.error('Error confirming delivery:', err);
      showToast('Failed to confirm delivery', 'error');
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'Low Stock' && item.stock < 5 && item.stock > 0) ||
      (filterStatus === 'Out of Stock' && item.stock === 0) ||
      (filterStatus === 'In Stock' && item.stock >= 5);

    return matchesSearch && matchesStatus;
  });

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.productName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      (order.supplierName && order.supplierName.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
      `PO-${String(order.id).padStart(4, '0')}`.toLowerCase().includes(orderSearchTerm.toLowerCase());
    
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Check if any order has total price
  const hasTotalPrice = filteredOrders.some(order => order.totalPrice !== null && order.totalPrice !== undefined);

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-2xl">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Track stock levels and manage inventory</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Recent Supplier Orders
        </button>
      </div>

      {/* Search and Filter for Orders */}
      {activeTab === 'orders' && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown appearance-none bg-white"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="w-80">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by product, supplier, or order ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Widgets */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
              <FaBoxOpen size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalProducts}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
              <FaClipboardList size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Purchase Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{purchaseOrders.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-green-100 text-green-600 rounded-full">
              <FaCheck size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Stock Items</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalStock}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
              <FaExclamationTriangle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-gray-800">{lowStockItems}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-red-100 text-red-600 rounded-full">
              <FaTimesCircle size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Out of Stock</p>
              <h3 className="text-2xl font-bold text-gray-800">{outOfStockItems}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter for Products */}
      {activeTab === 'products' && (
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-start">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown appearance-none bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
          
          <div className="w-80">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Inventory List */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">Loading inventory...</div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-500">{error}</div>
                <button 
                  onClick={fetchInventory}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Product</th>
                    <th className="p-4 font-semibold">SKU</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Stock Level</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Last Updated</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.productName} 
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                          <span className="font-bold text-gray-800">{item.productName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-sm">{item.sku}</td>
                      <td className="p-4 text-gray-600">{item.category}</td>
                      <td className="p-4 font-medium text-gray-800">Rs. {item.price}</td>
                      <td className="p-4">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditStockValue(Math.max(0, editStockValue - 1))}
                              className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <FaMinus size={10} />
                            </button>
                            <input 
                              type="number" 
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(parseInt(e.target.value) || 0)}
                              className="w-16 text-center border rounded py-1"
                            />
                            <button 
                              onClick={() => setEditStockValue(editStockValue + 1)}
                              className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                        ) : (
                          <span className={`font-bold ${
                            item.stock === 0 ? 'text-red-600' : 
                            item.stock < 5 ? 'text-orange-600' : 'text-gray-800'
                          }`}>
                            {item.stock}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          item.stock === 0 
                            ? 'bg-red-100 text-red-700' 
                            : item.stock < 5 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-green-100 text-green-700'
                        }`}>
                          {item.stock === 0 ? <FaTimesCircle size={10} /> : 
                           item.stock < 5 ? <FaExclamationTriangle size={10} /> : 
                           <FaCheck size={10} />}
                          {item.stock === 0 ? 'Out of Stock' : item.stock < 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm flex items-center gap-1">
                        <FaHistory size={10} /> {item.lastUpdated}
                      </td>
                      <td className="p-4 text-right">
                        {editingId === item.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleStockUpdate(item.id, editStockValue)}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="Save"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Cancel"
                            >
                              <FaTimesCircle />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openOrderModal(item)}
                              className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                              title="Create Purchase Order"
                            >
                              <FaCartPlus />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {!loading && !error && filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No inventory items found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Purchase Orders Section */}
      {activeTab === 'orders' && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Purchase Orders</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredOrders.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold">Product</th>
                    <th className="p-4 font-semibold">Supplier</th>
                    <th className="p-4 font-semibold">Quantity</th>
                    {hasTotalPrice && <th className="p-4 font-semibold">Total Price (LKR)</th>}
                    <th className="p-4 font-semibold">Expected Delivery</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-gray-50 ${['Dispatched', 'Delivered', 'Completed'].includes(order.status) ? 'cursor-pointer' : ''}`}
                      onClick={() => handleViewOrderDetails(order)}
                    >
                      <td className="p-4 font-mono text-sm text-gray-600">SO-{String(order.id).padStart(4, '0')}</td>
                      <td className="p-4 font-medium text-sm text-gray-800">{order.productName}</td>
                      <td className="p-4 text-gray-600 text-sm">{order.supplierName || '-'}</td>
                      <td className="p-4 text-gray-600">{order.quantity}</td>
                      {hasTotalPrice && <td className="p-4 text-gray-600">{order.totalPrice ? order.totalPrice.toLocaleString() : 'N/A'}</td>}
                      <td className="p-4 text-gray-600">{order.expectedDelivery}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'Dispatched' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">{order.orderDate.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FaClipboardList className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">No purchase orders found matching your criteria.</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter settings.</p>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Order Details: PO-{String(selectedOrder.id).padStart(4, '0')}</h2>
              <button 
                onClick={() => setShowOrderDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-medium text-gray-800">{selectedOrder.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium text-gray-800">{selectedOrder.supplierName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    selectedOrder.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                    selectedOrder.status === 'Dispatched' ? 'bg-purple-100 text-purple-700' :
                    selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-800">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium text-gray-800">Rs. {selectedOrder.totalPrice ? selectedOrder.totalPrice.toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="font-medium text-gray-800">Rs. {selectedOrder.totalPrice ? selectedOrder.totalPrice.toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Delivery</p>
                  <p className="font-medium text-gray-800">{selectedOrder.expectedDelivery}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Delivery Information</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Actual Delivery Date</p>
                    <p className="font-medium text-gray-800">{selectedOrder.actualDeliveryDate || 'Not yet delivered'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedOrder.deliveryNotes || 'No notes provided.'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrder.status === 'Delivered' && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleConfirmDelivery(selectedOrder.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaCheck /> Confirm Receipt & Update Stock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
