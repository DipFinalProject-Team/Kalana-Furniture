import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEnvelope, FaPhone, FaUser, FaTimes } from 'react-icons/fa';
import { refundService, type RefundRequest } from '../services/api';
import Toast from '../components/Toast';

const RefundRequests: React.FC = () => {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refund Detail Modal State
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const data = await refundService.getAll();
      setRefundRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching refund requests:', err);
      setError('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const handleViewRefund = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setResponseText(refund.response || '');
    setIsDetailModalOpen(true);
  };

  const handleSendResponse = async () => {
    if (selectedRefund && responseText.trim()) {
      try {
        await refundService.updateStatus(selectedRefund.id, 'Resolved', responseText.trim());

        // Update local state
        setRefundRequests(refundRequests.map(r => r.id === selectedRefund.id ? { ...r, status: 'Resolved', response: responseText.trim() } : r));

        // Update selected refund
        setSelectedRefund({ ...selectedRefund, status: 'Resolved', response: responseText.trim() });

        showToast('Response sent successfully! Refund request marked as resolved.', 'success');
        setIsDetailModalOpen(false);
        setResponseText('');
      } catch (err) {
        console.error('Error sending response:', err);
        showToast('Failed to send response', 'error');
      }
    } else {
      showToast('Please enter a response message', 'error');
    }
  };

  const filteredRefunds = refundRequests.filter(refund => {
    const fullName = `${refund.first_name} ${refund.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      refund.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.order_id?.toString().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Refund Requests</h1>
          <p className="text-gray-600 mt-1">Manage customer refund requests</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search refunds..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Refund Requests List */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-medium text-gray-700">Customer</th>
                <th className="p-4 font-medium text-gray-700">Order Details</th>
                <th className="p-4 font-medium text-gray-700">Refund Reason</th>
                <th className="p-4 font-medium text-gray-700">Amount</th>
                <th className="p-4 font-medium text-gray-700">Submitted</th>
                <th className="p-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                      <div className="text-gray-500">Loading refund requests...</div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="text-red-500 mb-2">{error}</div>
                    <button
                      onClick={fetchRefundRequests}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((refund) => (
                  <tr
                    key={refund.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewRefund(refund)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                          {refund.first_name.charAt(0)}{refund.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{refund.first_name} {refund.last_name}</p>
                          <p className="text-xs text-gray-500">ID: #{String(refund.id).slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        <p>Order #{refund.order_id}</p>
                        <p>${refund.amount?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-gray-600 text-sm">
                        {refund.reason.length > 80
                          ? `${refund.reason.substring(0, 80)}...`
                          : refund.reason
                        }
                      </p>
                    </td>
                    <td className="p-4 text-gray-900 font-medium">
                      ${refund.amount?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(refund.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        refund.status === 'Resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {refund.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && filteredRefunds.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No refund requests found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Refund Detail Modal */}
      {isDetailModalOpen && selectedRefund && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRefund.first_name} {selectedRefund.last_name}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Submitted on {new Date(selectedRefund.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedRefund.status === 'Resolved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedRefund.status}
                </span>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedRefund.status === 'Pending' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Refund Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                          <FaEnvelope className="text-gray-400" />
                          {selectedRefund.email}
                        </div>
                        {selectedRefund.mobile_number && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <FaPhone className="text-gray-400" />
                            {selectedRefund.mobile_number}
                          </div>
                        )}
                        {selectedRefund.user_id && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <FaUser className="text-gray-400" />
                            Registered User
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order & Refund Details</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="font-medium">#{selectedRefund.order_id}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-sm text-gray-500">Refund Amount</p>
                          <p className="font-medium text-green-600">${selectedRefund.amount?.toFixed(2) || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Reason</h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-gray-700">{selectedRefund.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Response Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Response</h3>
                    <div className="space-y-4">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Type your response to the refund request..."
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                        rows={8}
                      />
                      <p className="text-sm text-gray-500">
                        Sending a response will automatically mark this refund request as resolved.
                      </p>
                      <button
                        onClick={handleSendResponse}
                        disabled={!responseText.trim()}
                        className={`w-full py-2 px-4 rounded text-white ${
                          responseText.trim()
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Send Response
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <FaEnvelope className="text-gray-400" />
                        {selectedRefund.email}
                      </div>
                      {selectedRefund.mobile_number && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <FaPhone className="text-gray-400" />
                          {selectedRefund.mobile_number}
                        </div>
                      )}
                      {selectedRefund.user_id && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <FaUser className="text-gray-400" />
                          Registered User
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order & Refund Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-medium">#{selectedRefund.order_id}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-500">Refund Amount</p>
                        <p className="font-medium text-green-600">${selectedRefund.amount?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Reason</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-gray-700">{selectedRefund.reason}</p>
                    </div>
                  </div>

                  {selectedRefund.response && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
                      <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                        <p className="text-gray-700">{selectedRefund.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundRequests;