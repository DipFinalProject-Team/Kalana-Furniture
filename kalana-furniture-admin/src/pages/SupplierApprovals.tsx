import React, { useState } from 'react';
import { supplierApplications, suppliers } from '../data/mockData';
import { FaCheck, FaTimes, FaEye, FaBuilding, FaUser, FaEnvelope, FaPhone, FaList, FaCalendarAlt, FaUserCheck } from 'react-icons/fa';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

interface Application {
  id: string;
  companyName?: string;
  name?: string;
  contactPerson: string;
  username?: string;
  email: string;
  phone: string;
  categories: string;
  message?: string;
  date?: string;
  status: string;
  joinedDate?: string;
}

const SupplierApprovals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [applications, setApplications] = useState<Application[]>(supplierApplications);
  const [approvedSuppliers, setApprovedSuppliers] = useState<Application[]>(suppliers);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
    setIsDetailsModalOpen(true);
  };

  const handleActionClick = (app: Application, type: 'approve' | 'reject') => {
    setSelectedApp(app);
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedApp || !actionType) return;

    if (actionType === 'approve') {
      // Move from pending to approved
      const newSupplier = { ...selectedApp, status: 'Active', joinedDate: new Date().toISOString().split('T')[0] };
      setApprovedSuppliers([...approvedSuppliers, newSupplier]);
      setApplications(applications.filter(app => app.id !== selectedApp.id));
      setToast({ message: `Supplier ${selectedApp.companyName || selectedApp.name} approved successfully!`, type: 'success' });
    } else {
      // Reject
      setApplications(applications.filter(app => app.id !== selectedApp.id));
      setToast({ message: `Application for ${selectedApp.companyName || selectedApp.name} rejected.`, type: 'error' });
    }

    setIsConfirmModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedApp(null);
    setActionType(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-nav-brown font-bold">Supplier Management</h1>
          <p className="text-gray-500 mt-1">Manage supplier applications and active partnerships</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          className={`pb-2 px-4 font-medium transition-colors relative ${
            activeTab === 'pending' 
              ? 'text-wood-brown border-b-2 border-wood-brown' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Applications
          {applications.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
              {applications.length}
            </span>
          )}
        </button>
        <button
          className={`pb-2 px-4 font-medium transition-colors relative ${
            activeTab === 'approved' 
              ? 'text-wood-brown border-b-2 border-wood-brown' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Suppliers
          <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
            {approvedSuppliers.length}
          </span>
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}

      {activeTab === 'pending' ? (
        applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-wood-brown/10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No pending supplier applications at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-md border border-wood-brown/10 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-wood-accent/20 rounded-lg flex items-center justify-center text-wood-brown">
                      <FaBuilding className="text-xl" />
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      {app.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{app.companyName || app.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <FaUser className="w-3 h-3" /> {app.contactPerson}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400 w-4 h-4" />
                      <span className="truncate">{app.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400 w-4 h-4" />
                      <span>{app.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400 w-4 h-4" />
                      <span>Applied: {app.date}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => handleViewDetails(app)}
                    className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaEye /> View
                  </button>
                  <button
                    onClick={() => handleActionClick(app, 'approve')}
                    className="flex-1 py-2 px-4 bg-wood-brown text-white rounded-lg hover:bg-nav-brown font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaCheck /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Approved Suppliers List
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                    <FaUserCheck className="text-xl" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{supplier.companyName || supplier.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <FaUser className="w-3 h-3" /> {supplier.contactPerson}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400 w-4 h-4" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400 w-4 h-4" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaList className="text-gray-400 w-4 h-4" />
                    <span className="truncate">{supplier.categories}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewDetails(supplier)}
                  className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <FaEye /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-wood-brown/5">
              <div>
                <h2 className="text-2xl font-serif font-bold text-nav-brown">
                  {activeTab === 'pending' ? 'Application Details' : 'Supplier Profile'}
                </h2>
                <p className="text-sm text-gray-500">ID: {selectedApp.id}</p>
              </div>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Company Info Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaBuilding className="text-wood-brown" /> Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Company Name</p>
                    <p className="text-gray-900 font-medium">{selectedApp.companyName || selectedApp.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Product Categories</p>
                    <p className="text-gray-900 font-medium">{selectedApp.categories || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">About / Message</p>
                    <p className="text-gray-700 leading-relaxed">{selectedApp.message || 'No additional information provided.'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUser className="text-wood-brown" /> Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Contact Person</p>
                    <p className="text-gray-900 font-medium">{selectedApp.contactPerson}</p>
                  </div>
                  {selectedApp.username && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Username</p>
                      <p className="text-gray-900 font-medium">{selectedApp.username}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</p>
                    <p className="text-gray-900 font-medium">{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</p>
                    <p className="text-gray-900 font-medium">{selectedApp.phone}</p>
                  </div>
                  {selectedApp.joinedDate && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Joined Date</p>
                      <p className="text-gray-900 font-medium">{selectedApp.joinedDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {activeTab === 'pending' && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => handleActionClick(selectedApp, 'reject')}
                  className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                >
                  <FaTimes /> Reject Application
                </button>
                <button
                  onClick={() => handleActionClick(selectedApp, 'approve')}
                  className="px-6 py-2.5 bg-wood-brown text-white rounded-xl hover:bg-nav-brown font-medium shadow-lg shadow-wood-brown/20 transition-all flex items-center gap-2"
                >
                  <FaCheck /> Approve Supplier
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={actionType === 'approve' ? "Approve Supplier" : "Reject Application"}
        message={
          actionType === 'approve' 
            ? `Are you sure you want to approve ${selectedApp?.companyName || selectedApp?.name}? They will receive an email with their login credentials.`
            : `Are you sure you want to reject the application from ${selectedApp?.companyName || selectedApp?.name}? This action cannot be undone.`
        }
        confirmText={actionType === 'approve' ? "Approve" : "Reject"}
      />
    </div>
  );
};

export default SupplierApprovals;
