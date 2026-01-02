import React, { useState } from 'react';
import { FaStar, FaTrash, FaSearch, FaFilter, FaExternalLinkAlt } from 'react-icons/fa';
import { reviewsData } from '../data/mockData';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

interface Review {
  id: number;
  customerName: string;
  productName: string;
  category: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  productUrl: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(reviewsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setReviews(reviews.filter(review => review.id !== deleteId));
      setToast({ message: 'Review deleted successfully!', type: 'success', isVisible: true });
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating === filterRating;

    return matchesSearch && matchesRating;
  });

  const averageRating = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);

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
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reviews & Ratings</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(Number(averageRating)) ? "text-yellow-400" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-gray-600 font-medium">{averageRating} Average Rating</span>
            <span className="text-gray-400">({reviews.length} reviews)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown appearance-none bg-white w-full"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <img 
                  src={review.avatar} 
                  alt={review.customerName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800">{review.customerName}</h3>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-wood-brown bg-orange-50 px-2 py-0.5 rounded">
                      {review.productName}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {review.category}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a
                  href={review.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View on Website"
                >
                  <FaExternalLinkAlt />
                </a>
                <button
                  onClick={() => handleDeleteClick(review.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Review"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">No reviews found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
