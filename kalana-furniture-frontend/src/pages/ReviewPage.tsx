import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuthRequiredMessage from '../components/AuthRequiredMessage';
import { productService, reviewService, type Product, type Review } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { FaStar, FaUserCircle, FaCamera, FaTimes } from 'react-icons/fa';

const ReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext)!;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [productData, reviewsData] = await Promise.all([
          productService.getById(id),
          reviewService.getProductReviews(id)
        ]);

        setProduct(productData);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load product and reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 min-h-screen pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 min-h-screen pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">{error || 'Product not found'}</div>
          </div>
        </div>
      </>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and size
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Please select only image files under 5MB each');
      return;
    }

    // Limit to 5 images
    const newFiles = [...images, ...validFiles].slice(0, 5);
    setImages(newFiles);

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Clean up object URLs
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    try {
      const response = await reviewService.createReview(id, {
        comment,
        rating,
        images
      });

      if (response.success) {
        // Refresh reviews
        const updatedReviews = await reviewService.getProductReviews(id);
        setReviews(updatedReviews);

        // Reset form
        setRating(0);
        setComment('');
        setImages([]);
        setImagePreviews([]);

        // Show success message or navigate
        navigate(`/product/${id}`);
      } else {
        alert(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <AuthRequiredMessage
      title="Authentication Required"
      message="You need to be logged in to write a review."
      description="Please log in to your account to share your thoughts about this product."
    />;
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Product Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex items-center gap-6">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-24 h-24 object-cover rounded-md"
            />
            <div>
              <h1 className="text-3xl font-serif font-bold text-wood-brown">{product.name}</h1>
              <p className="text-gray-600">Reviews & Ratings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews List - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
              
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FaUserCircle className="text-gray-400 text-3xl" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{review.user_name}</h3>
                          <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">Verified Purchase</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                    {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-lg text-center text-gray-500">
                  No reviews yet. Be the first to share your thoughts!
                </div>
              )}
            </div>

            {/* Write Review Form - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                          <label key={index} className="cursor-pointer">
                            <input
                              type="radio"
                              name="rating"
                              value={ratingValue}
                              onClick={() => setRating(ratingValue)}
                              className="hidden"
                            />
                            <FaStar
                              className="transition-colors"
                              color={ratingValue <= (hover || rating) ? "#fbbf24" : "#e5e7eb"}
                              size={24}
                              onMouseEnter={() => setHover(ratingValue)}
                              onMouseLeave={() => setHover(0)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
                    <div className="space-y-3">
                      {/* Image Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-wood-accent transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <FaCamera className="mx-auto text-gray-400 text-2xl mb-2" />
                          <p className="text-gray-600">Click to upload photos</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB each (max 5 photos)</p>
                        </label>
                      </div>

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-wood-accent focus:border-wood-accent"
                      placeholder="What did you like or dislike?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0 || comment.trim() === ''}
                    className="w-full bg-wood-brown text-white py-2 px-4 rounded-md hover:bg-wood-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewPage;
