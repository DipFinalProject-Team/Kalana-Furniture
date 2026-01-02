import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTag, FaCalendarAlt, FaPercent, FaDollarSign, FaCheck, FaTimes } from 'react-icons/fa';
import { promotionsData } from '../data/mockData';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

interface Promotion {
  id: number;
  code: string;
  description: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  appliesTo: string;
  isActive: boolean;
}

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(promotionsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  // Form State
  const [formData, setFormData] = useState<Omit<Promotion, 'id'>>({
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    startDate: '',
    endDate: '',
    appliesTo: 'All Products',
    isActive: true,
  });

  const handleOpenModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingId(promotion.id);
      setFormData({ ...promotion });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        description: '',
        type: 'percentage',
        value: 0,
        startDate: '',
        endDate: '',
        appliesTo: 'All Products',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setPromotions(promotions.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
      showToast('Promotion updated successfully!', 'success');
    } else {
      setPromotions([...promotions, { ...formData, id: Date.now() }]);
      showToast('Promotion created successfully!', 'success');
    }
    handleCloseModal();
  };

  const toggleStatus = (id: number) => {
    setPromotions(promotions.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    showToast('Promotion status updated!', 'success');
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setPromotions(promotions.filter(p => p.id !== deleteId));
      showToast('Promotion deleted successfully!', 'success');
      setIsDeleteModalOpen(false);
      setDeleteId(null);
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
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Promotion"
        message="Are you sure you want to delete this promotion? This action cannot be undone."
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Promotions & Discounts</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-wood-brown hover:bg-wood-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          style={{ backgroundColor: '#8B4513' }} // Fallback if tailwind color not set
        >
          <FaPlus /> Create Promotion
        </button>
      </div>

      {/* Promotions List */}
      <div className="grid gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-4 rounded-full ${promo.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <FaTag size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-800">{promo.code}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600">{promo.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    {promo.type === 'percentage' ? <FaPercent /> : <FaDollarSign />}
                    {promo.value} {promo.type === 'percentage' ? 'OFF' : 'Discount'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt /> {promo.startDate} - {promo.endDate}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {promo.appliesTo}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStatus(promo.id)}
                className={`p-2 rounded-lg transition-colors ${promo.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                title={promo.isActive ? "Deactivate" : "Activate"}
              >
                {promo.isActive ? <FaTimes /> : <FaCheck />}
              </button>
              <button
                onClick={() => handleOpenModal(promo)}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="Edit"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteClick(promo.id)}
                className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Delete"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Promotion' : 'Create New Promotion'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. SUMMER25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'percentage' | 'fixed'})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. Summer Sale Discount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable To</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                  value={formData.appliesTo}
                  onChange={(e) => setFormData({...formData, appliesTo: e.target.value})}
                >
                  <option value="All Products">All Products</option>
                  <option value="Category: Bedroom">Category: Bedroom</option>
                  <option value="Category: Living Room">Category: Living Room</option>
                  <option value="Category: Dining">Category: Dining</option>
                  <option value="Category: Office">Category: Office</option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded text-wood-brown focus:ring-wood-brown"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active immediately</label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-wood-brown text-white rounded-lg hover:bg-wood-accent transition-colors"
                  style={{ backgroundColor: '#8B4513' }}
                >
                  {editingId ? 'Update Promotion' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
