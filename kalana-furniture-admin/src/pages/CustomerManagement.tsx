import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaBan, FaCheckCircle, FaEnvelope, FaPhone, FaCalendarAlt, FaShoppingBag, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { customerService, type Customer } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Profile Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Block/Unblock State
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsProfileModalOpen(true);
  };

  const handleToggleStatusClick = (customer: Customer) => {
    setCustomerToToggle(customer);
    setIsBlockModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (customerToToggle) {
      try {
        const newStatus = customerToToggle.status === 'Active' ? 'Blocked' : 'Active';
        await customerService.updateStatus(customerToToggle.id, newStatus);
        
        // Update local state
        setCustomers(customers.map(c => c.id === customerToToggle.id ? { ...c, status: newStatus } : c));
        
        // Update selected customer if open in modal
        if (selectedCustomer && selectedCustomer.id === customerToToggle.id) {
          setSelectedCustomer({ ...selectedCustomer, status: newStatus });
        }

        showToast(`Customer ${newStatus === 'Active' ? 'activated' : 'blocked'} successfully!`, 'success');
        setIsBlockModalOpen(false);
        setCustomerToToggle(null);
      } catch (err) {
        console.error('Error updating customer status:', err);
        showToast('Failed to update customer status', 'error');
      }
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;

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
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={confirmToggleStatus}
        title={customerToToggle?.status === 'Active' ? 'Block Customer' : 'Activate Customer'}
        message={`Are you sure you want to ${customerToToggle?.status === 'Active' ? 'block' : 'activate'} ${customerToToggle?.name}? ${customerToToggle?.status === 'Active' ? 'They will no longer be able to log in.' : 'They will regain access to their account.'}`}
        confirmText={customerToToggle?.status === 'Active' ? 'Block' : 'Activate'}
        cancelText="Cancel"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-gray-500 mt-1">Manage customer accounts and view details</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
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
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Contact Info</th>
                <th className="p-4 font-semibold">Registration Date</th>
                <th className="p-4 font-semibold text-center">Orders</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="text-gray-500">Loading customers...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="text-red-500">{error}</div>
                    <button 
                      onClick={fetchCustomers}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={customer.avatar} 
                          alt={customer.name} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-800">{customer.name}</p>
                          <p className="text-xs text-gray-500">ID: #{customer.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaEnvelope className="text-gray-400 text-xs" /> {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-gray-400 text-xs" /> {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {customer.registrationDate}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        customer.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {customer.status === 'Active' ? <FaCheckCircle size={10} /> : <FaBan size={10} />}
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewProfile(customer)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleToggleStatusClick(customer)}
                          className={`p-2 rounded-lg transition-colors ${
                            customer.status === 'Active' 
                              ? 'text-red-500 hover:bg-red-50' 
                              : 'text-green-500 hover:bg-green-50'
                          }`}
                          title={customer.status === 'Active' ? "Block Account" : "Activate Account"}
                        >
                          {customer.status === 'Active' ? <FaBan /> : <FaCheckCircle />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && !error && filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Customer Profile Modal */}
      {isProfileModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="relative h-32 bg-wood-brown">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <img 
                  src={selectedCustomer.avatar} 
                  alt={selectedCustomer.name} 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
                <div className="mb-2">
                   <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${
                      selectedCustomer.status === 'Active' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {selectedCustomer.status === 'Active' ? <FaCheckCircle /> : <FaBan />}
                      {selectedCustomer.status}
                    </span>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-1">{selectedCustomer.name}</h2>
              <p className="text-gray-500 mb-8 flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" /> Member since {selectedCustomer.registrationDate}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Contact Information</h3>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <FaEnvelope />
                    </div>
                    {selectedCustomer.email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                      <FaPhone />
                    </div>
                    {selectedCustomer.phone}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                      <FaMapMarkerAlt />
                    </div>
                    {selectedCustomer.address}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Order Statistics</h3>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <FaShoppingBag />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-xl font-bold text-gray-800">{selectedCustomer.totalOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <span className="font-bold">$</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <p className="text-xl font-bold text-gray-800">${selectedCustomer.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    handleToggleStatusClick(selectedCustomer);
                  }}
                  className={`px-6 py-2 rounded-lg text-white transition-colors shadow-md ${
                    selectedCustomer.status === 'Active'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {selectedCustomer.status === 'Active' ? 'Block Account' : 'Activate Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
