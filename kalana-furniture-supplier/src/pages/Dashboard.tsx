import React, { useState, useEffect } from 'react';
import { FaBoxOpen, FaClipboardList, FaCheckCircle, FaMoneyBillWave, FaShoppingCart, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { supplierService } from '../services/api';

interface DashboardStats {
  totalProductsSupplied: number;
  pendingSupplyOrders: number;
  completedSupplies: number;
  totalEarnings: number;
  newPurchaseRequests: number;
}

interface SupplyOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  date: string;
}

interface OrderTrend {
  month: string;
  year: number;
  orders: number;
}

const Dashboard: React.FC = () => {
  const [supplierStatus, setSupplierStatus] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProductsSupplied: 0,
    pendingSupplyOrders: 0,
    completedSupplies: 0,
    totalEarnings: 0,
    newPurchaseRequests: 0
  });
  const [recentOrders, setRecentOrders] = useState<SupplyOrder[]>([]);
  const [orderTrends, setOrderTrends] = useState<OrderTrend[]>([]);
  const [hoveredBar, setHoveredBar] = useState<{ index: number; orders: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const supplierData = Cookies.get('supplierUser') || localStorage.getItem('supplierUser');
    if (supplierData) {
      try {
        const supplier = JSON.parse(supplierData);
        setSupplierStatus(supplier.status || '');
      } catch (error) {
        console.error('Error parsing supplier data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (supplierStatus === 'approved') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [supplierStatus]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsResponse, ordersResponse, trendsResponse] = await Promise.all([
        supplierService.getDashboardStats(),
        supplierService.getRecentSupplyOrders(),
        supplierService.getOrderTrends()
      ]);

      if (statsResponse.success) {
        setDashboardStats(statsResponse.stats);
      }

      if (ordersResponse.success) {
        // Filter to only show completed orders
        const completedOrders = ordersResponse.orders.filter((order: SupplyOrder) => 
          order.status === 'completed' || order.status === 'delivered'
        );
        setRecentOrders(completedOrders);
      }

      if (trendsResponse.success) {
        setOrderTrends(trendsResponse.trends);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show waiting message for non-approved suppliers
  if (supplierStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <FaClock className="mx-auto h-16 w-16 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Our account is pending approval. Please wait for admin approval.
          </p>
        </div>
      </div>
    );
  }

  if (supplierStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <FaExclamationTriangle className="mx-auto h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Rejected</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your supplier application has been rejected.
            Please contact our support team for more information.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <span className="text-red-800 text-sm">
              Contact support@kalanafurniture.com for assistance.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (supplierStatus === 'approved' && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-serif text-amber-900 mb-6">Dashboard</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
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
          value={`LKR ${dashboardStats.totalEarnings.toLocaleString()}`} 
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
                  <th className="pb-2 text-sm font-medium text-gray-600">Products</th>
                  <th className="pb-2 text-sm font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 text-sm text-gray-800">{order.orderNumber}</td>
                    <td className="py-3 text-sm text-gray-800">
                      {order.items.map((item, index) => (
                        <div key={index}>
                          {item.productName} (x{item.quantity})
                          {index < order.items.length - 1 && ', '}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 text-sm text-gray-800">LKR {order.total.toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Trend Graph */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-amber-100">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Orders Trend</h2>
          <div className="relative h-64 flex items-end justify-between space-x-1">
            {orderTrends.length > 0 ? orderTrends.map((trend, index) => {
              // Calculate bar height based on orders (max height = 256px for h-64)
              const maxOrders = Math.max(...orderTrends.map(t => t.orders));
              const barHeight = maxOrders > 0 ? (trend.orders / maxOrders) * 256 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-amber-500 w-6 rounded-t mb-2 transition-all duration-300 hover:bg-amber-600 cursor-pointer" 
                    style={{ height: `${barHeight}px`, minHeight: '4px' }}
                    onMouseEnter={() => setHoveredBar({ index, orders: trend.orders })}
                    onMouseLeave={() => setHoveredBar(null)}
                  ></div>
                  <span className="text-xs text-gray-600">{trend.month}</span>
                </div>
              );
            }) : (
              // Fallback to sample data if no trends data
              <>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-16 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Jan</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-24 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Feb</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-20 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Mar</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-32 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Apr</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-28 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">May</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-36 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Jun</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-22 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Jul</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-30 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Aug</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-26 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Sep</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-34 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Oct</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-18 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Nov</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-amber-500 w-6 h-40 rounded-t mb-2"></div>
                  <span className="text-xs text-gray-600">Dec</span>
                </div>
              </>
            )}
            
            {/* Hover Tooltip */}
            {hoveredBar && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-10">
                <div className="text-center">
                  <div className="font-bold">{hoveredBar.orders} Orders</div>
                  <div className="text-xs opacity-75">{orderTrends[hoveredBar.index]?.month} {orderTrends[hoveredBar.index]?.year}</div>
                </div>
                {/* Arrow pointing down */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Monthly Order Volume</p>
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
