const supabase = require('../config/supabaseClient');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper to upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'kalana-furniture' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

exports.getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Sanitize data: Remove large Base64 strings (legacy data) to speed up response
    // Cloudinary URLs are short (< 200 chars), Base64 images are huge (> 10000 chars)
    const sanitizedData = data.map(product => {
      const newProduct = { ...product };
      
      // Filter images array
      if (Array.isArray(newProduct.images)) {
        newProduct.images = newProduct.images.filter(img => img && img.length < 1000);
      }
      
      // Clear legacy image field if it's a large string
      if (typeof newProduct.image === 'string' && newProduct.image.length > 1000) {
        newProduct.image = null;
      }
      
      return newProduct;
    });

    res.status(200).json(sanitizedData);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Sanitize data: Remove large Base64 strings (legacy data) to speed up response
    const sanitizedData = data.map(product => {
      const newProduct = { ...product };
      
      // Filter images array
      if (Array.isArray(newProduct.images)) {
        newProduct.images = newProduct.images.filter(img => img && img.length < 1000);
      }
      
      // Clear legacy image field if it's a large string
      if (typeof newProduct.image === 'string' && newProduct.image.length > 1000) {
        newProduct.image = null;
      }
      
      return newProduct;
    });

    res.status(200).json(sanitizedData);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) throw productError;
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Get reviews for this product
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        comment,
        rating,
        created_at,
        users!inner(name)
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Reviews Error:', reviewsError);
      // Don't fail the request if reviews fail, just return empty array
    }

    // Format reviews to match frontend interface
    const formattedReviews = (reviews || []).map(review => ({
      id: review.id,
      user: review.users?.name || 'Anonymous',
      comment: review.comment,
      rating: review.rating
    }));

    // Return product with reviews
    const productWithReviews = {
      ...product,
      reviews: formattedReviews
    };

    res.status(200).json(productWithReviews);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const startTime = Date.now();
  try {
    const productData = req.body;
    
    // Handle image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} images to Cloudinary...`);
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      imageUrls.push(...results);
      console.log('Images uploaded successfully');
    }

    // Prepare product object
    const product = {
      productName: productData.productName,
      sku: productData.sku,
      category: productData.category,
      price: productData.price,
      stock: productData.stock,
      description: productData.description,
      images: imageUrls,
      status: productData.status || 'In Stock'
    };

    // Validate required fields
    if (!product.productName || !product.sku) {
      return res.status(400).json({ error: 'Product name and SKU are required' });
    }

    console.log(`Creating product: ${product.productName}`);

    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log(`Product created successfully in ${Date.now() - startTime}ms`);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error(`Product creation failed after ${Date.now() - startTime}ms:`, error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    // Handle new image uploads
    let imageUrls = [];
    
    // Keep existing images if provided (as strings)
    if (productData.existingImages) {
      imageUrls = Array.isArray(productData.existingImages) 
        ? productData.existingImages 
        : [productData.existingImages];
    }

    // Upload new images
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      imageUrls.push(...results);
    }

    const updates = {
      productName: productData.productName,
      sku: productData.sku,
      category: productData.category,
      price: productData.price,
      stock: productData.stock,
      description: productData.description,
      images: imageUrls,
      status: productData.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Product not found' });

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
