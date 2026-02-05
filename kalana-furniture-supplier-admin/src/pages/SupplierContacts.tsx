import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaCheckCircle, FaEnvelope, FaCalendarAlt, FaTimes, FaBuilding } from 'react-icons/fa';
import { supplierContactService, type SupplierContact } from '../services/api';
import Toast from '../components/Toast';

const SupplierContacts: React.FC = () => {
  const [contacts, setContacts] = useState<SupplierContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedContact, setSelectedContact] = useState<SupplierContact | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await supplierContactService.getAll();
      setContacts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load supplier contacts');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const handleViewContact = (contact: SupplierContact) => {
    setSelectedContact(contact);
    setResponseText(contact.response || '');
    setIsDetailModalOpen(true);
  };

  const handleSendResponse = async () => {
    if (selectedContact && responseText.trim()) {
      try {
        await supplierContactService.updateStatus(selectedContact.supplier_contact_form_id, 'Resolved', responseText.trim());

        // Update local state
        setContacts(contacts.map(c => c.supplier_contact_form_id === selectedContact.supplier_contact_form_id ? { ...c, status: 'Resolved', response: responseText.trim() } : c));

        // Update selected contact
        setSelectedContact({ ...selectedContact, status: 'Resolved', response: responseText.trim() });

        showToast('Response sent successfully! Contact marked as resolved.', 'success');
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

  const filteredContacts = contacts.filter(contact => {
    const supplierName = contact.supplier?.name || 'Unknown Supplier';
    const matchesSearch =
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.supplier?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || (contact.status || 'Pending') === filterStatus;

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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Supplier Contacts</h1>
          <p className="text-gray-500 mt-1">Manage messages and inquiries from suppliers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown appearance-none bg-white w-full md:w-40"
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

      {/* Contacts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Supplier</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Message Preview</th>
                <th className="p-4 font-semibold">Received</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="text-gray-500">Loading contacts...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="text-red-500">{error}</div>
                    <button
                      onClick={fetchContacts}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.supplier_contact_form_id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <FaBuilding />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{contact.supplier?.name || 'Unknown Supplier'}</p>
                          <p className="text-xs text-gray-500">ID: #{contact.supplier_contact_form_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaEnvelope className="text-gray-400 text-xs" /> {contact.supplier?.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-gray-600 text-sm truncate">
                        {contact.message.length > 100
                          ? `${contact.message.substring(0, 100)}...`
                          : contact.message
                        }
                      </p>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        contact.status === 'Resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {contact.status === 'Resolved' ? <FaCheckCircle size={10} /> : null}
                        {contact.status || 'Pending'}
                        {contact.response && <span className="ml-1 text-xs">💬</span>}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Full Message"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No contacts found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedContact && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
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
                    {selectedContact.supplier?.name || 'Unknown Supplier'}
                  </h2>
                  <p className="text-gray-500 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" /> Received on {new Date(selectedContact.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                   <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${
                      selectedContact.status === 'Resolved'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {selectedContact.status === 'Resolved' ? <FaCheckCircle /> : null}
                      {selectedContact.status || 'Pending'}
                    </span>
                </div>
              </div>

              {(selectedContact.status || 'Pending') === 'Pending' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Supplier Information</h3>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <FaEnvelope />
                        </div>
                        {selectedContact.supplier?.email}
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                            <FaBuilding />
                        </div>
                        ID: #{selectedContact.supplier_id}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Message</h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
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
                          placeholder="Type your response to the supplier..."
                          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-accent resize-vertical min-h-[200px]"
                          rows={8}
                        />
                        <p className="text-sm text-gray-500">
                          Sending a response will automatically mark this message as resolved.
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
                  {/* Left Column - Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Supplier Information</h3>
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <FaEnvelope />
                        </div>
                        {selectedContact.supplier?.email}
                      </div>
                       <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                            <FaBuilding />
                        </div>
                        ID: #{selectedContact.supplier_id}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Message</h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Response */}
                  <div className="space-y-6">
                    {selectedContact.response && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Response</h3>
                        <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.response}</p>
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

export default SupplierContacts;