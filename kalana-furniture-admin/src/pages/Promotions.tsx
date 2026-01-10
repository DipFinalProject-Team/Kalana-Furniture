import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTag, FaCalendarAlt, FaPercent, FaCheck, FaTimes } from 'react-icons/fa';
import { promotionService } from '../services/api';
import type { Promotion } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [promotionType, setPromotionType] = useState<'code' | 'discount'>('code');

  // Fetch promotions on component mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        
        const data = await promotionService.getAll();
        setPromotions(data);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        showToast('Failed to load promotions', 'error');
        // Set loading to false even on error
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handleOpenModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingId(promotion.id);
      // Determine promotion type based on whether it has a code
      const isCode = !!promotion.code;
      setPromotionType(isCode ? 'code' : 'discount');
      
      // For general discounts, ensure type is percentage
      const formData = { ...promotion };
      if (!isCode && formData.type === 'fixed') {
        formData.type = 'percentage';
      }
      
      setFormData(formData);
    } else {
      setEditingId(null);
      setPromotionType('code');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // For discount type, clear the code
      if (promotionType === 'discount') {
        submitData.code = '';
      }
      
      if (editingId) {
        const updatedPromotion = await promotionService.update(editingId, submitData);
        setPromotions(promotions.map(p => p.id === editingId ? updatedPromotion : p));
        showToast('Promotion updated successfully!', 'success');
      } else {
        const newPromotion = await promotionService.create(submitData);
        setPromotions([...promotions, newPromotion]);
        showToast('Promotion created successfully!', 'success');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving promotion:', error);
      showToast('Failed to save promotion', 'error');
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const updatedPromotion = await promotionService.toggleStatus(id);
      setPromotions(promotions.map(p => p.id === id ? updatedPromotion : p));
      showToast('Promotion status updated!', 'success');
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await promotionService.delete(deleteId);
        setPromotions(promotions.filter(p => p.id !== deleteId));
        showToast('Promotion deleted successfully!', 'success');
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting promotion:', error);
        showToast('Failed to delete promotion', 'error');
      }
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
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-brown"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promo) => (
          <div key={promo.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-4 rounded-full ${promo.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <FaTag size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-800">{promo.code || 'General Discount'}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {promo.code && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      Code
                    </span>
                  )}
                  {!promo.code && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      General
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{promo.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    {promo.type === 'percentage' ? <FaPercent /> : <span className="font-bold">Rs.</span>}
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
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit' : 'Create'} {promotionType === 'code' ? 'Discount Code' : 'General Discount'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Promotion Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="promotionType"
                      value="code"
                      checked={promotionType === 'code'}
                      onChange={(e) => setPromotionType(e.target.value as 'code' | 'discount')}
                      className="mr-2 text-wood-brown focus:ring-wood-brown"
                    />
                    <span className="text-sm text-gray-700">Discount Code</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="promotionType"
                      value="discount"
                      checked={promotionType === 'discount'}
                      onChange={(e) => {
                        const newType = e.target.value as 'code' | 'discount';
                        setPromotionType(newType);
                        if (newType === 'discount' && formData.type === 'fixed') {
                          setFormData({...formData, type: 'percentage'});
                        }
                      }}
                      className="mr-2 text-wood-brown focus:ring-wood-brown"
                    />
                    <span className="text-sm text-gray-700">General Discount</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {promotionType === 'code' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
                    <input
                      type="text"
                      required={promotionType === 'code'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="e.g. SUMMER25"
                    />
                  </div>
                )}
                <div className={promotionType === 'code' ? '' : 'col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'percentage' | 'fixed'})}
                  >
                    <option value="percentage">Percentage (%)</option>
                    {promotionType === 'code' && (
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  placeholder='0'
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({...formData, value: e.target.value ? Number(e.target.value) : 0})}
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

              {promotionType === 'code' && (
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
              )}

              {promotionType === 'discount' && (
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
              )}

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
                  {editingId ? 'Update' : 'Create'} {promotionType === 'code' ? 'Discount Code' : 'General Discount'}
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
