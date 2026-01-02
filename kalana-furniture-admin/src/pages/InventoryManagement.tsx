import React, { useState } from 'react';
import { FaSearch, FaFilter, FaBoxOpen, FaExclamationTriangle, FaTimesCircle, FaEdit, FaCheck, FaPlus, FaMinus, FaHistory } from 'react-icons/fa';
import { inventoryData } from '../data/mockData';
import Toast from '../components/Toast';

interface InventoryItem {
  id: number;
  productName: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  lastUpdated: string;
  image: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(inventoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  // Stats
  const totalProducts = inventory.length;
  const lowStockItems = inventory.filter(item => item.stock > 0 && item.stock < 5).length;
  const outOfStockItems = inventory.filter(item => item.stock === 0).length;
  const totalStock = inventory.reduce((acc, item) => acc + item.stock, 0);

  const handleStockUpdate = (id: number, newStock: number) => {
    if (newStock < 0) return;
    
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
  };

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditStockValue(item.stock);
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
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products or SKU..."
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
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
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
                      <button
                        onClick={() => startEditing(item)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Update Stock"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No inventory items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
