import React from 'react';
import { dashboardStats, recentSupplyOrders, lowStockRequests } from '../data/mockdata';
import { FaBoxOpen, FaClipboardList, FaCheckCircle, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-serif text-amber-900 mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <SummaryCard 
          title="Total Products Supplied" 
          value={dashboardStats.totalProductsSupplied} 
          icon={<FaBoxOpen className="text-blue-500 text-2xl" />} 
          bgColor="bg-blue-50"
        />
        <SummaryCard 
          title="Pending Orders" 
          value={dashboardStats.pendingSupplyOrders} 
          icon={<FaClipboardList className="text-orange-500 text-2xl" />} 
          bgColor="bg-orange-50"
        />
        <SummaryCard 
          title="Completed Supplies" 
          value={dashboardStats.completedSupplies} 
          icon={<FaCheckCircle className="text-green-500 text-2xl" />} 
          bgColor="bg-green-50"
        />
        <SummaryCard 
          title="New Requests" 
          value={dashboardStats.newPurchaseRequests} 
          icon={<FaShoppingCart className="text-purple-500 text-2xl" />} 
          bgColor="bg-purple-50"
        />
      </div>

      {/* Earnings Card - Full Width */}
      <div className="mb-8">
        <SummaryCard 
          title="Total Earnings" 
          value={dashboardStats.totalEarnings} 
          icon={<FaMoneyBillWave className="text-amber-500 text-2xl" />} 
          bgColor="bg-amber-50"
        />
      </div>

      {/* Quick View Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Supply Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-amber-100">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Recent Supply Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-sm font-medium text-gray-600">Order ID</th>
                  <th className="pb-2 text-sm font-medium text-gray-600">Product</th>
                  <th className="pb-2 text-sm font-medium text-gray-600">Qty</th>
                  <th className="pb-2 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSupplyOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 text-sm text-gray-800">{order.id}</td>
                    <td className="py-3 text-sm text-gray-800">{order.product}</td>
                    <td className="py-3 text-sm text-gray-800">{order.quantity}</td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Requests */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-amber-100">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Low-Stock Items Requested</h2>
          <div className="space-y-4">
            {lowStockRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-800">{req.product}</h3>
                  <p className="text-sm text-gray-500">Requested Qty: {req.requestedQty}</p>
                </div>
                <div className="flex items-center">
                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.urgency === 'High' ? 'bg-red-100 text-red-800' :
                        req.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {req.urgency} Priority
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4 bg-white`}>
      <div className={`p-3 rounded-full ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
