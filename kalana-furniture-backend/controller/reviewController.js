const supabase = require('../config/supabaseClient');
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        comment,
        rating,
        images,
        created_at,
        user:user_id (
          name,
          email
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Transform data to match frontend expectations
    const transformedData = data.map(review => {
      let images = [];
      try {
        // Parse images if it's a string, otherwise use as is
        images = typeof review.images === 'string' ? JSON.parse(review.images) : (review.images || []);
      } catch (e) {
        images = [];
      }
      
      return {
        id: review.id,
        user: review.user?.name || 'Anonymous',
        comment: review.comment,
        rating: review.rating,
        images: images,
        created_at: review.created_at
      };
    });

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { comment, rating } = req.body;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'reviews',
                public_id: `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                transformation: [
                  { width: 800, height: 600, crop: 'limit' },
                  { quality: 'auto' }
                ]
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              }
            );
            stream.end(file.buffer);
          });
        });

        imageUrls = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload images' });
      }
    }

    // Allow multiple reviews per user per product
    // Check if user already reviewed this product - removed to allow multiple reviews

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        comment,
        rating: parseInt(rating),
        images: imageUrls
      })
      .select(`
        id,
        comment,
        rating,
        images,
        created_at,
        user:user_id (
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Transform response
    let images = [];
    try {
      // Parse images if it's a string, otherwise use as is
      images = typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []);
    } catch (e) {
      images = [];
    }
    
    const transformedData = {
      id: data.id,
      user: data.user?.name || 'Anonymous',
      comment: data.comment,
      rating: data.rating,
      images: images,
      created_at: data.created_at
    };

    res.status(201).json(transformedData);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment, rating } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({
        comment,
        rating: parseInt(rating)
      })
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select(`
        id,
        comment,
        rating,
        created_at,
        user:user_id (
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Review not found or not authorized' });
    }

    // Transform response
    const transformedData = {
      id: data.id,
      user: data.user?.name || 'Anonymous',
      comment: data.comment,
      rating: data.rating,
      created_at: data.created_at
    };

    res.status(200).json(transformedData);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};