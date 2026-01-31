import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaCheckCircle, FaClock, FaSearch, FaFilter, FaEye, FaTimesCircle } from 'react-icons/fa';
import { AxiosError } from 'axios';
import { adminService } from '../services/api';
import type { Invoice } from '../services/api';
import Toast from '../components/Toast';

interface ErrorResponse {
  message?: string;
  error?: string;
}

const SupplierInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await adminService.getInvoices();
      setInvoices(data);
    } catch (err: unknown) {
      console.error('Error fetching invoices:', err);
      const axiosError = err as AxiosError<ErrorResponse>;
      const errorMessage = axiosError?.response?.data?.message || 
                          axiosError?.response?.data?.error || 
                          axiosError?.message || 
                          'Failed to load invoices. Please check your connection and try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await adminService.markInvoiceAsPaid(id);
      
      // Update local state
      setInvoices(invoices.map(inv => 
        inv.id === id ? { ...inv, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] } : inv
      ));
      
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice({ ...selectedInvoice, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] });
      }
      
      // Close the modal
      setShowDetailsModal(false);
      
      showToast('Invoice marked as Paid successfully!', 'success');
    } catch (err: unknown) {
      console.error('Error marking invoice as paid:', err);
      const axiosError = err as AxiosError<ErrorResponse>;
      const errorMessage = axiosError?.response?.data?.message || 
                          axiosError?.response?.data?.error || 
                          axiosError?.message || 
                          'Failed to mark invoice as paid. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-800">Supplier Invoices</h1>
          <p className="text-gray-500 mt-1">Manage and track payments to suppliers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
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
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <FaFileInvoiceDollar size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Invoices</p>
            <h3 className="text-2xl font-bold text-gray-800">{invoices.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full">
            <FaClock size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending Payments</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {invoices.filter(i => i.status === 'Pending').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-full">
            <FaTimesCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Overdue Invoices</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {invoices.filter(i => i.status === 'Overdue').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Loading invoices...</div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Invoice Number</th>
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Supplier</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 font-semibold">Payment Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-600">{invoice.id}</td>
                    <td className="p-4 font-mono text-sm text-gray-600">{invoice.orderId}</td>
                    <td className="p-4 text-gray-800 font-medium">{invoice.supplierName}</td>
                    <td className="p-4 font-bold text-gray-800">Rs. {invoice.amount.toLocaleString()}</td>
                    <td className="p-4 text-gray-600">{invoice.dueDate}</td>
                    <td className="p-4 text-gray-600">{invoice.paymentDate || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setSelectedInvoice(invoice); setShowDetailsModal(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No invoices found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Invoice Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm text-gray-500">Invoice ID</p>
                  <p className="font-bold text-lg text-gray-800">{selectedInvoice.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-800">{selectedInvoice.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium text-gray-800">{selectedInvoice.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-medium text-gray-800">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium text-gray-800">{selectedInvoice.dueDate}</p>
                </div>
              </div>

              {selectedInvoice.status === 'Pending' && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full justify-center"
                  >
                    <FaCheckCircle /> Mark as Paid
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

export default SupplierInvoices;
