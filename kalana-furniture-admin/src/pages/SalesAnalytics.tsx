import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { analyticsService } from '../services/api';
import { FaChartLine, FaShoppingCart, FaTrophy } from 'react-icons/fa';

interface TopSellingProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  sales: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface MonthlySalesData {
  name: string;
  sales: number;
  [key: string]: string | number;
}

interface OrdersData {
  date: string;
  orders: number;
  [key: string]: string | number;
}

const SalesAnalytics: React.FC = () => {
  const [monthlySalesData, setMonthlySalesData] = useState<MonthlySalesData[]>([]);
  const [ordersData, setOrdersData] = useState<OrdersData[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [monthlySales, ordersTrend, salesCategory, topProducts] = await Promise.all([
        analyticsService.getMonthlySales(),
        analyticsService.getOrdersTrend(),
        analyticsService.getSalesByCategory(),
        analyticsService.getTopSellingProducts()
      ]);

      setMonthlySalesData(monthlySales);
      setOrdersData(ordersTrend);
      setSalesByCategory(salesCategory);
      setTopSellingProducts(topProducts);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sales & Performance Analytics</h1>
        <p className="text-gray-500 mt-1">Visual insights into business health and performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FaChartLine />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Monthly Sales Revenue</h2>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlySalesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `Rs. ${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number | string | Array<number | string> | undefined) => [`Rs. ${value}`, 'Sales']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders per Day/Month */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <FaShoppingCart />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Orders Trend</h2>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ordersData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Sales by Category</h2>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {!loading && (
            <div className="mt-4 space-y-3">
              {salesByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-gray-600">{category.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{category.value} Sales</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <FaTrophy />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Top Selling Products</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {topSellingProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={product.image || '/placeholder-image.jpg'} 
                      alt={product.name || 'Product'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{product.name || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-500">{product.category || 'Uncategorized'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-wood-brown">{product.sales || 0} Sold</p>
                    <p className="text-xs text-gray-500">Rs. {product.price || 0}</p>
                  </div>
                  <div className="w-24 bg-gray-100 rounded-full h-2 hidden sm:block">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ 
                        width: `${topSellingProducts.length > 0 && topSellingProducts[0].sales > 0 
                          ? Math.min((product.sales / topSellingProducts[0].sales) * 100, 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default SalesAnalytics;
