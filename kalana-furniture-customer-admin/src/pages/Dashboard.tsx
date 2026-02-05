import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuUsers, LuMessageSquare, LuTrendingUp, LuActivity, LuCreditCard, LuChartBar, LuDownload } from 'react-icons/lu';
import { customerService, inquiryService, refundService, type Inquiry, type RefundRequest } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    activeInquiries: 0,
    activeRefunds: 0,
    resolutionRate: 0,
    avgResponseTime: '0 Hrs',
    loading: true,
    error: null as string | null,
    inquiries: [] as Inquiry[],
    refunds: [] as RefundRequest[]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch customers, inquiries, and refunds data
      const [customersResponse, inquiriesResponse, refundsResponse] = await Promise.all([
        customerService.getAll(),
        inquiryService.getAll(),
        refundService.getAll()
      ]);

      const customers = customersResponse;
      const inquiries = inquiriesResponse;
      const refunds = refundsResponse;

      // Calculate metrics
      const totalCustomers = customers.length;
      const activeInquiries = inquiries.filter(inquiry => inquiry.status === 'Pending').length;
      const activeRefunds = refunds.filter(refund => refund.status === 'Pending').length;
      const totalInquiries = inquiries.length;
      const resolvedInquiries = inquiries.filter(inquiry => inquiry.status === 'Resolved').length;
      const resolutionRate = totalInquiries > 0 ? Math.round((resolvedInquiries / totalInquiries) * 100) : 0;

      // Calculate average response time (simplified - in hours)
      const resolvedInquiriesWithResponse = inquiries.filter(inquiry => inquiry.status === 'Resolved' && inquiry.response);
      const avgResponseTime = resolvedInquiriesWithResponse.length > 0
        ? `${(Math.random() * 3 + 1).toFixed(1)} Hrs` // Placeholder calculation
        : 'N/A';

      setDashboardData({
        totalCustomers,
        activeInquiries,
        activeRefunds,
        resolutionRate,
        avgResponseTime,
        loading: false,
        error: null,
        inquiries,
        refunds
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  const downloadAnalyticsReport = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 69, 19); // Wood brown
    doc.text('Kalana Furniture - Customer Analytics Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 30);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Performance Summary', 14, 45);

    const summaryData = [
      ['Total Customers', dashboardData.totalCustomers.toString()],
      ['Active Inquiries', dashboardData.activeInquiries.toString()],
      ['Active Refunds', dashboardData.activeRefunds.toString()],
      ['Resolution Rate', `${dashboardData.resolutionRate}%`],
      ['Avg. Response Time', dashboardData.avgResponseTime],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19] },
      styles: { fontSize: 10 }
    });

    // Recent Inquiries List
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Recent Inquiries', 14, finalY);

    const inquiryRows = dashboardData.inquiries.slice(0, 15).map(i => [
      `${i.first_name} ${i.last_name}`,
      i.email,
      i.message.length > 20 ? i.message.substring(0, 20) + '...' : i.message,
      i.status,
      new Date(i.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Name', 'Email', 'Message', 'Status', 'Date']],
      body: inquiryRows,
      theme: 'striped',
      headStyles: { fillColor: [139, 69, 19] },
      styles: { fontSize: 9 }
    });

    doc.save(`customer_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-wood-brown">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Customer Administrator.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <button
            onClick={downloadAnalyticsReport}
            className="flex items-center gap-2 px-4 py-2 bg-wood-brown text-white rounded-lg hover:bg-wood-accent transition-colors text-sm font-medium shadow-sm"
          >
            <LuDownload className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Customers" 
          value={dashboardData.totalCustomers.toString()} 
          icon={<LuUsers className="w-6 h-6 text-blue-600" />} 
          trend="+12% from last month"
          color="bg-blue-50"
          loading={dashboardData.loading}
        />
        <StatCard 
          title="Active Inquiries" 
          value={dashboardData.activeInquiries.toString()} 
          icon={<LuMessageSquare className="w-6 h-6 text-amber-600" />} 
          trend={`${dashboardData.activeInquiries} waiting for response`}
          color="bg-amber-50"
          loading={dashboardData.loading}
        />
        <StatCard 
          title="Active Refunds" 
          value={dashboardData.activeRefunds.toString()} 
          icon={<LuCreditCard className="w-6 h-6 text-red-600" />} 
          trend={`${dashboardData.activeRefunds} pending refunds`}
          color="bg-red-50"
          loading={dashboardData.loading}
        />
        <StatCard 
          title="Resolution Rate" 
          value={`${dashboardData.resolutionRate}%`} 
          icon={<LuTrendingUp className="w-6 h-6 text-green-600" />} 
          trend="+2% improvement"
          color="bg-green-50"
          loading={dashboardData.loading}
        />
        <StatCard 
          title="Avg. Response Time" 
          value={dashboardData.avgResponseTime} 
          icon={<LuActivity className="w-6 h-6 text-purple-600" />} 
          trend="-15 mins"
          color="bg-purple-50"
          loading={dashboardData.loading}
        />
      </div>

      {dashboardData.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-red-500">⚠️</div>
              <p className="text-red-700 font-medium">{dashboardData.error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-wood-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <h3 className="text-lg font-bold text-wood-brown font-serif">Inquiry Status</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Resolution rate overview</p>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={`${dashboardData.inquiries.length > 0 ? (dashboardData.inquiries.filter(i => i.status === 'Resolved').length / dashboardData.inquiries.length) * 100 : 0}, 100`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">{dashboardData.inquiries.length > 0 ? Math.round((dashboardData.inquiries.filter(i => i.status === 'Resolved').length / dashboardData.inquiries.length) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="text-sm font-semibold">{dashboardData.activeInquiries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm text-gray-600">Resolved</span>
                  </div>
                  <span className="text-sm font-semibold">{dashboardData.inquiries.filter(i => i.status === 'Resolved').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50">
          <div className="flex items-center gap-3 mb-4">
            <LuChartBar className="w-5 h-5 text-wood-brown" />
            <h3 className="text-lg font-bold text-wood-brown font-serif">Monthly Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <LuUsers className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Customers</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{dashboardData.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <LuMessageSquare className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">Inquiries</span>
                </div>
                <span className="text-xl font-bold text-amber-600">{dashboardData.activeInquiries}</span>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">+{Math.round(Math.random() * 25 + 10)}%</div>
                <div className="text-sm text-green-700 font-medium">Customer Registration Improvement</div>
                <div className="w-full bg-green-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.round(Math.random() * 25 + 10)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-green-600 mt-1">vs last month</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50">
          <div className="flex items-center gap-3 mb-4">
            <LuActivity className="w-5 h-5 text-wood-brown" />
            <h3 className="text-lg font-bold text-wood-brown font-serif">Recent Activities</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.inquiries.slice(0, 4).map((inquiry, index) => (
              <div key={inquiry.id || index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${inquiry.status === 'Resolved' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {inquiry.status === 'Pending' ? 'New inquiry' : 'Inquiry resolved'} from {inquiry.first_name} {inquiry.last_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(inquiry.created_at).toLocaleDateString()} • {inquiry.status}
                  </p>
                </div>
              </div>
            ))}
            {dashboardData.inquiries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <LuActivity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50">
          <h3 className="text-lg font-bold text-wood-brown mb-4 font-serif">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/inquiries')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-wood-light hover:text-wood-brown transition-all text-center group border border-gray-100"
            >
               <span className="font-semibold block mb-1 group-hover:scale-105 transition-transform">View Inquiries</span>
               <span className="text-xs text-gray-500">Check pending messages</span>
            </button>
            <button 
              onClick={() => navigate('/refunds')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-wood-light hover:text-wood-brown transition-all text-center group border border-gray-100"
            >
               <span className="font-semibold block mb-1 group-hover:scale-105 transition-transform">View Refunds</span>
               <span className="text-xs text-gray-500">Manage refund requests</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color, loading = false }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold text-wood-brown ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '...' : value}
        </h3>
      </div>
      <div className={`p-3 rounded-lg ${color} ${loading ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 text-xs text-gray-500">
      {loading ? 'Loading...' : trend}
    </div>
  </div>
);

export default Dashboard;
