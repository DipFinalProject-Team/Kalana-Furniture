import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import { allProducts } from '../data/mockdata';
import { FaStar } from 'react-icons/fa';

const ReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = allProducts.find((p) => p.id === Number(id));

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, you would submit this data to your backend
    console.log({
      productId: product.id,
      rating,
      comment,
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect back to the product page after submission
      navigate(`/product/${product.id}`);
    }, 1500);
  };

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-wood-brown via-nav-brown to-wood-accent py-[100px] px-4 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="font-serif text-4xl font-bold text-white mb-4 text-center">Leave a Review</h1>
          <div className="flex items-center mb-8">
            <img src={product.images[0]} alt={product.name} className="w-24 h-24 rounded-lg object-cover mr-6" />
            <div>
              <h2 className="text-2xl font-bold text-white">{product.name}</h2>
              <p className="text-wood-light">{product.category}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-lg font-medium text-white mb-2">Your Rating</label>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={index}>
                      <input
                        type="radio"
                        name="rating"
                        value={ratingValue}
                        onClick={() => setRating(ratingValue)}
                        className="hidden"
                      />
                      <FaStar
                        className="cursor-pointer"
                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                        size={40}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <label htmlFor="comment" className="block text-lg font-medium text-white mb-2">Your Comment</label>
              <textarea
                id="comment"
                rows={6}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think about this product..."
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 focus:ring-wood-accent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim() === ''}
              className="w-full bg-wood-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-wood-accent-hover transition-all duration-300 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReviewPage;
