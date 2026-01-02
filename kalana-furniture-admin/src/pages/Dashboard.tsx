import React from 'react';
import { dashboardStats, inventoryData } from '../data/mockData';
import { FaExclamationTriangle, FaClock, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  // Get low stock items (stock < 10)
  const lowStockItems = inventoryData.filter(item => item.stock < 10).slice(0, 5);
  
  // Get recently added items (simulated by taking the last few items)
  const recentItems = [...inventoryData].reverse().slice(0, 5);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Welcome back, Admin</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block ${
                  stat.trend.startsWith('+') ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                }`}>
                  {stat.trend} from last month
                </span>
              </div>
              <div className={`p-3 rounded-full text-white ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FaClock />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Recently Added Products</h2>
            </div>
            <Link to="/products" className="text-sm text-wood-brown hover:underline flex items-center gap-1">
              View All <FaArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentItems.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{product.productName}</h4>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-wood-brown text-sm">${product.price}</p>
                  <p className="text-xs text-gray-400">{product.lastUpdated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <FaExclamationTriangle />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Low Stock Alerts</h2>
            </div>
            <Link to="/inventory" className="text-sm text-wood-brown hover:underline flex items-center gap-1">
              Manage Inventory <FaArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {lowStockItems.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{product.productName}</h4>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                    product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.stock} left
                  </span>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No low stock items found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
