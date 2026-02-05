import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaCheckCircle, FaEnvelope, FaPhone, FaCalendarAlt, FaUser, FaTimes } from 'react-icons/fa';
import { inquiryService, type Inquiry } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

const Inquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inquiry Detail Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Status Update State
  const [inquiryToUpdate, setInquiryToUpdate] = useState<Inquiry | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await inquiryService.getAll();
      setInquiries(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setResponseText(inquiry.response || '');
    setIsDetailModalOpen(true);
  };

  const handleStatusClick = (inquiry: Inquiry) => {
    setInquiryToUpdate(inquiry);
    setIsStatusModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (inquiryToUpdate) {
      try {
        const newStatus = inquiryToUpdate.status === 'Pending' ? 'Resolved' : 'Pending';
        await inquiryService.updateStatus(inquiryToUpdate.id, newStatus);

        // Update local state
        setInquiries(inquiries.map(i => i.id === inquiryToUpdate.id ? { ...i, status: newStatus } : i));

        // Update selected inquiry if open in modal
        if (selectedInquiry && selectedInquiry.id === inquiryToUpdate.id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }

        showToast(`Inquiry marked as ${newStatus.toLowerCase()}!`, 'success');
        setIsStatusModalOpen(false);
        setInquiryToUpdate(null);
      } catch (err) {
        console.error('Error updating inquiry status:', err);
        showToast('Failed to update inquiry status', 'error');
      }
    }
  };

  const handleSendResponse = async () => {
    if (selectedInquiry && responseText.trim()) {
      try {
        await inquiryService.updateStatus(selectedInquiry.id, 'Resolved', responseText.trim());

        // Update local state
        setInquiries(inquiries.map(i => i.id === selectedInquiry.id ? { ...i, status: 'Resolved', response: responseText.trim() } : i));

        // Update selected inquiry
        setSelectedInquiry({ ...selectedInquiry, status: 'Resolved', response: responseText.trim() });

        showToast('Response sent successfully! Inquiry marked as resolved.', 'success');
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

  const filteredInquiries = inquiries.filter(inquiry => {
    const fullName = `${inquiry.first_name} ${inquiry.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;

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

      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        title={inquiryToUpdate?.status === 'Pending' ? 'Mark as Resolved' : 'Mark as Pending'}
        message={`Are you sure you want to mark this inquiry as ${inquiryToUpdate?.status === 'Pending' ? 'resolved' : 'pending'}?`}
        confirmText={inquiryToUpdate?.status === 'Pending' ? 'Mark Resolved' : 'Mark Pending'}
        cancelText="Cancel"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Inquiries</h1>
          <p className="text-gray-500 mt-1">Manage customer contact form submissions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search inquiries..."
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
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Message Preview</th>
                <th className="p-4 font-semibold">Submitted</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="text-gray-500">Loading inquiries...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="text-red-500">{error}</div>
                    <button
                      onClick={fetchInquiries}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <FaUser />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{inquiry.first_name} {inquiry.last_name}</p>
                          <p className="text-xs text-gray-500">ID: #{String(inquiry.id).slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaEnvelope className="text-gray-400 text-xs" /> {inquiry.email}
                        </div>
                        {inquiry.mobile_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaPhone className="text-gray-400 text-xs" /> {inquiry.mobile_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-gray-600 text-sm truncate">
                        {inquiry.message.length > 100
                          ? `${inquiry.message.substring(0, 100)}...`
                          : inquiry.message
                        }
                      </p>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        inquiry.status === 'Resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inquiry.status === 'Resolved' ? <FaCheckCircle size={10} /> : null}
                        {inquiry.status}
                        {inquiry.response && <span className="ml-1 text-xs">💬</span>}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewInquiry(inquiry)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Full Message"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleStatusClick(inquiry)}
                          className={`p-2 rounded-lg transition-colors ${
                            inquiry.status === 'Pending'
                              ? 'text-green-500 hover:bg-green-50'
                              : 'text-yellow-500 hover:bg-yellow-50'
                          }`}
                          title={inquiry.status === 'Pending' ? "Mark as Resolved" : "Mark as Pending"}
                        >
                          {inquiry.status === 'Pending' ? <FaCheckCircle /> : null}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && filteredInquiries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No inquiries found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {isDetailModalOpen && selectedInquiry && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="relative h-20 bg-wood-brown">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="px-8 pb-8">
              <div className="flex justify-between items-center mt-6 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">
                    {selectedInquiry.first_name} {selectedInquiry.last_name}
                  </h2>
                  <p className="text-gray-500 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" /> Submitted on {new Date(selectedInquiry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                   <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${
                      selectedInquiry.status === 'Resolved'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {selectedInquiry.status === 'Resolved' ? <FaCheckCircle /> : null}
                      {selectedInquiry.status}
                    </span>
                </div>
              </div>

              {selectedInquiry.status === 'Pending' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Inquiry Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Contact Information</h3>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <FaEnvelope />
                        </div>
                        {selectedInquiry.email}
                      </div>
                      {selectedInquiry.mobile_number && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <FaPhone />
                          </div>
                          {selectedInquiry.mobile_number}
                        </div>
                      )}
                      {selectedInquiry.user_id && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                            <FaUser />
                          </div>
                          Registered User
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Message</h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Response Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Your Response</h3>
                      <div className="space-y-4">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type your response to the customer inquiry..."
                          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-accent resize-vertical min-h-[200px]"
                          rows={8}
                        />
                        <p className="text-sm text-gray-500">
                          Sending a response will automatically mark this inquiry as resolved.
                        </p>
                        <button
                          onClick={handleSendResponse}
                          disabled={!responseText.trim()}
                          className={`w-full py-3 px-6 rounded-lg text-white transition-colors shadow-md ${
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
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Inquiry Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Contact Information</h3>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <FaEnvelope />
                        </div>
                        {selectedInquiry.email}
                      </div>
                      {selectedInquiry.mobile_number && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <FaPhone />
                          </div>
                          {selectedInquiry.mobile_number}
                        </div>
                      )}
                      {selectedInquiry.user_id && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                            <FaUser />
                          </div>
                          Registered User
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Message</h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Response */}
                  <div className="space-y-6">
                    {selectedInquiry.response && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Response</h3>
                        <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.response}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;