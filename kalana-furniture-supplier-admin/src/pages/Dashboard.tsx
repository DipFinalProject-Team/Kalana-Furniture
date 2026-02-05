import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuUsers, LuMessageSquare, LuTrendingUp, LuActivity, LuDownload } from 'react-icons/lu';
import { supplierService, supplierContactService, type Supplier, type SupplierContact } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalSuppliers: 0,
    activeContacts: 0,
    activeSuppliersCount: 0,
    newSuppliersThisMonth: 0,
    responseRate: 0,
    resolvedContacts: 0,
    loading: true,
    error: null as string | null,
    suppliers: [] as Supplier[],
    contacts: [] as SupplierContact[]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch suppliers and contacts data
      const [suppliersResponse, contactsResponse] = await Promise.all([
        supplierService.getAll(),
        supplierContactService.getAll()
      ]);

      const suppliers = suppliersResponse;
      const contacts = contactsResponse;

      // Calculate metrics
      const totalSuppliers = suppliers.length;
      const activeContacts = contacts.length;
      
      // Calculate active suppliers (status is 'approved' in backend)
      const activeSuppliersCount = suppliers.filter(s => s.status?.toLowerCase() === 'approved').length;

      // Calculate new suppliers this month
      const now = new Date();
      const newSuppliersThisMonth = suppliers.filter(s => {
          const d = new Date(s.created_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // Calculate Response Rate
      const resolvedCount = contacts.filter(c => c.status === 'Resolved' || !!c.response).length;
      const responseRate = activeContacts > 0 ? Math.round((resolvedCount / activeContacts) * 100) : 0;

      setDashboardData({
        totalSuppliers,
        activeContacts,
        activeSuppliersCount,
        newSuppliersThisMonth,
        responseRate,
        resolvedContacts: resolvedCount,
        loading: false,
        error: null,
        suppliers,
        contacts
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

  const generateReport = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 69, 19); // Wood brown
    doc.text('Kalana Furniture - Supplier Analytics Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 30);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Performance Summary', 14, 45);
    
    const summaryData = [
      ['Total Suppliers', dashboardData.totalSuppliers.toString()],
      ['Active Suppliers', dashboardData.activeSuppliersCount.toString()],
      ['New This Month', dashboardData.newSuppliersThisMonth.toString()],
      ['Total Messages', dashboardData.activeContacts.toString()],
      ['Response Rate', `${dashboardData.responseRate}%`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19] },
      styles: { fontSize: 10 }
    });

    // Suppliers List
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Recent Suppliers', 14, finalY);

    const supplierRows = dashboardData.suppliers.slice(0, 15).map(s => [
      s.name,
      s.email,
      s.status,
      new Date(s.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Name', 'Email', 'Status', 'Joined Date']],
      body: supplierRows,
      theme: 'striped',
      headStyles: { fillColor: [139, 69, 19] },
      styles: { fontSize: 9 }
    });

    doc.save(`supplier_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-wood-brown">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Supplier Administrator.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 hidden md:block">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <button
            onClick={generateReport}
            className="flex items-center gap-2 px-4 py-2 bg-wood-brown text-white rounded-lg hover:bg-wood-dark transition-colors shadow-sm text-sm"
          >
            <LuDownload className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Suppliers"
          value={dashboardData.totalSuppliers.toString()}
          icon={<LuUsers className="w-6 h-6 text-blue-600" />}
          trend={`${dashboardData.newSuppliersThisMonth} new this month`}
          color="bg-blue-50"
          loading={dashboardData.loading}
        />
        <StatCard
          title="Contact Messages"
          value={dashboardData.activeContacts.toString()}
          icon={<LuMessageSquare className="w-6 h-6 text-amber-600" />}
          trend={`${dashboardData.activeContacts} total messages`}
          color="bg-amber-50"
          loading={dashboardData.loading}
        />
        <StatCard
          title="Response Rate"
          value={`${dashboardData.responseRate}%`}
          icon={<LuTrendingUp className="w-6 h-6 text-green-600" />}
          trend={`${dashboardData.resolvedContacts} resolved messages`}
          color="bg-green-50"
          loading={dashboardData.loading}
        />
        <StatCard
          title="Active Suppliers"
          value={dashboardData.activeSuppliersCount.toString()}
          icon={<LuActivity className="w-6 h-6 text-purple-600" />}
          trend={`${dashboardData.totalSuppliers > 0 ? Math.round((dashboardData.activeSuppliersCount / dashboardData.totalSuppliers) * 100) : 0}% of total`}
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
            <h3 className="text-lg font-bold text-wood-brown font-serif">Supplier Status</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Active vs inactive suppliers</p>
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
                      strokeDasharray={`${dashboardData.totalSuppliers > 0 ? (dashboardData.activeSuppliersCount / dashboardData.totalSuppliers) * 100 : 0}, 100`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">
                      {dashboardData.totalSuppliers > 0 ? Math.round((dashboardData.activeSuppliersCount / dashboardData.totalSuppliers) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <span className="text-sm font-semibold">{dashboardData.activeSuppliersCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-sm text-gray-600">Inactive</span>
                  </div>
                  <span className="text-sm font-semibold">{dashboardData.totalSuppliers - dashboardData.activeSuppliersCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50">
          <div className="flex items-center gap-3 mb-4">
            <LuActivity className="w-5 h-5 text-wood-brown" />
            <h3 className="text-lg font-bold text-wood-brown font-serif">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.contacts.slice(0, 4).map((contact, index) => (
              <div key={contact.supplier_contact_form_id || index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    New contact from {contact.supplier?.name || 'Supplier'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {dashboardData.contacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <LuActivity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50">
          <h3 className="text-lg font-bold text-wood-brown mb-4 font-serif">Supplier Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center gap-3">
                <LuUsers className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total Suppliers</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{dashboardData.totalSuppliers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center gap-3">
                <LuActivity className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Active Suppliers</span>
              </div>
              <span className="text-xl font-bold text-green-600">{dashboardData.activeSuppliersCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50">
          <h3 className="text-lg font-bold text-wood-brown mb-4 font-serif">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/suppliers')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-wood-light hover:text-wood-brown transition-all text-center group border border-gray-100"
            >
               <span className="font-semibold block mb-1 group-hover:scale-105 transition-transform">View Suppliers</span>
               <span className="text-xs text-gray-500">Manage supplier list</span>
            </button>
            <button 
              onClick={() => navigate('/contacts')}
              className="p-4 bg-gray-50 rounded-lg hover:bg-wood-light hover:text-wood-brown transition-all text-center group border border-gray-100"
            >
               <span className="font-semibold block mb-1 group-hover:scale-105 transition-transform">View Contacts</span>
               <span className="text-xs text-gray-500">Check messages</span>
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