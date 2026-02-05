import React, { useState, useEffect } from 'react';
import { LuSearch, LuFilter, LuEye, LuCheck, LuX, LuTrash } from 'react-icons/lu';
import { supplierService, type Supplier } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'toggle' | 'approve' | 'reject' | 'delete'>('toggle');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = suppliers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, statusFilter]);

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsModalOpen(true);
  };

  const handleApprove = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setConfirmAction('approve');
    setIsStatusModalOpen(true);
  };

  const handleReject = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setConfirmAction('reject');
    setIsStatusModalOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setConfirmAction('delete');
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedSupplier) return;

    try {
      setUpdatingStatus(true);
      
      let newStatus = '';
      if (confirmAction === 'delete') {
         if (selectedSupplier.id) {
           await supplierService.delete(selectedSupplier.id);
           setSuppliers(prev => prev.filter(s => s.id !== selectedSupplier.id));
           setFilteredSuppliers(prev => prev.filter(s => s.id !== selectedSupplier.id));
         }
      } else {
        if (confirmAction === 'approve') {
          await supplierService.approve(selectedSupplier.id);
          newStatus = 'approved';
        } else if (confirmAction === 'reject') {
          await supplierService.reject(selectedSupplier.id);
          newStatus = 'rejected';
        } else {
          newStatus = selectedSupplier.status === 'Active' ? 'Inactive' : 'Active';
          await supplierService.updateStatus(selectedSupplier.id, newStatus);
        }

        // Update local state
        setSuppliers(prev => prev.map(supplier =>
          supplier.id === selectedSupplier.id
            ? { ...supplier, status: newStatus }
            : supplier
        ));
      }

      setIsStatusModalOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      console.error('Error updating supplier status:', err);
      setError('Failed to update supplier status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-wood-brown">Supplier Management</h1>
          <p className="text-gray-600">Manage and monitor supplier information</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="w-5 h-5 text-red-500 mr-3">⚠️</div>
            <p className="text-red-700 font-medium flex-1">{error}</p>
            <button
              onClick={fetchSuppliers}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100/50">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="w-full md:w-96">
            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search suppliers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wood-brown focus:border-wood-brown outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LuFilter className="text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wood-brown focus:border-wood-brown outline-none"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-wood-light/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-wood-brown uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-wood-brown uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-wood-brown uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-wood-brown uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-wood-brown uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.company_name || supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.email}</div>
                    <div className="text-sm text-gray-500">{supplier.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(supplier.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(supplier)}
                        className="text-wood-brown hover:text-wood-accent transition-colors"
                        title="View Details"
                      >
                        <LuEye className="w-4 h-4" />
                      </button>
                      
                      {supplier.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(supplier)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Approve Supplier"
                          >
                            <LuCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(supplier)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Reject Supplier"
                          >
                            <LuX className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteClick(supplier)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Supplier"
                      >
                        <LuTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <LuSearch className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No suppliers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Supplier Details Modal */}
      {isDetailsModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif text-wood-brown">Supplier Details</h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Company Name</label>
                <p className="text-gray-900 font-medium text-lg">{selectedSupplier.company_name || selectedSupplier.name}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                  <p className="text-gray-900">{selectedSupplier.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Phone</label>
                  <p className="text-gray-900">{selectedSupplier.phone}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Address</label>
                <p className="text-gray-900">{selectedSupplier.address}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Products/Categories</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSupplier.categories ? (
                    selectedSupplier.categories.split(',').map((cat, i) => (
                      <span key={i} className="px-2 py-1 bg-wood-light/50 text-wood-brown text-xs rounded-md">
                        {cat.trim()}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No categories specified</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Additional Message</label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {selectedSupplier.message || "No message provided."}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedSupplier.status)}`}>
                        {selectedSupplier.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Joined Date</label>
                  <p className="text-gray-900">{new Date(selectedSupplier.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={confirmStatusChange}
        title={
          confirmAction === 'approve' ? 'Approve Supplier' : 
          confirmAction === 'reject' ? 'Reject Supplier' : 
          confirmAction === 'delete' ? 'Delete Supplier' :
          'Change Supplier Status'
        }
        message={
          confirmAction === 'approve' ? `Are you sure you want to approve ${selectedSupplier?.name}? They will be able to log in.` :
          confirmAction === 'reject' ? `Are you sure you want to reject ${selectedSupplier?.name}?` :
          confirmAction === 'delete' ? `Are you sure you want to delete ${selectedSupplier?.name}? This action cannot be undone.` :
          `Are you sure you want to ${selectedSupplier?.status === 'Active' ? 'deactivate' : 'activate'} ${selectedSupplier?.name}?`
        }
        confirmText={
          updatingStatus ? 'Updating...' : 
          confirmAction === 'delete' ? 'Delete' : 'Confirm'
        }
        type={confirmAction === 'reject' || confirmAction === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default SupplierManagement;