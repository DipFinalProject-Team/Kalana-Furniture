import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import Modal from '../components/Modal';
import { supplierService } from '../services/api';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await supplierService.deleteAccount();
      // Clear any auth tokens or user data
      localStorage.removeItem('supplierToken');
      localStorage.removeItem('supplier_user');
      
      setIsDeleteModalOpen(false);
      // Redirect to login or show success message
      navigate('/login');
    } catch (error) {
      console.error('Account deletion failed:', error);
      // Handle error - could show a toast or error message
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await supplierService.logout();
      // Clear any auth tokens or user data
      localStorage.removeItem('supplierToken');
      localStorage.removeItem('supplier_user');
      
      setIsLogoutModalOpen(false);
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local data and redirect even if API call fails
      localStorage.removeItem('supplierToken');
      localStorage.removeItem('supplier_user');
      navigate('/login');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        type="warning"
        confirmText="Logout"
        onConfirm={confirmLogout}
      >
        <p className="text-stone-600">
          Are you sure you want to log out? You will need to sign in again to access your account.
        </p>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
        type="danger"
        confirmText="Delete Account"
        onConfirm={confirmDeleteAccount}
      >
        <div className="space-y-3">
          <p className="text-stone-600">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <div className="bg-red-50 p-3 rounded-md border border-red-100 text-sm text-red-800">
            <p className="font-medium flex items-center gap-2">
              <FiAlertTriangle /> Warning
            </p>
            <p className="mt-1">
              All your data, including order history and profile information, will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>

      <h1 className="text-3xl font-serif text-amber-900 mb-8">Settings</h1>
      
      <div className="space-y-6">
        {/* Logout Zone */}
        <div className="bg-white rounded-lg shadow-md border border-amber-100 overflow-hidden">
          <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
            <FiLogOut className="text-amber-600 text-xl" />
            <h2 className="text-lg font-semibold text-amber-900">Session Management</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-stone-500 mb-4">Sign out of your account on this device.</p>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-amber-200 text-amber-700 rounded-md hover:bg-amber-50 transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-md border border-red-200 overflow-hidden">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
            <FiAlertTriangle className="text-red-600 text-xl" />
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          </div>
          <div className="p-6">
            <h3 className="text-md font-medium text-gray-900 mb-2">Delete Account</h3>
            <p className="text-sm text-stone-500 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FiTrash2 />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
