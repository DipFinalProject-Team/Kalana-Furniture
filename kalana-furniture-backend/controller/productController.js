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
      .select('*, product_images(image_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Transform data to flat structure expected by frontend
    const sanitizedData = data.map(product => {
      const newProduct = { ...product };
      
      // Convert joined product_images table to simple images array
      if (newProduct.product_images) {
        newProduct.images = newProduct.product_images.map(img => img.image_url);
        delete newProduct.product_images;
      } else {
        newProduct.images = [];
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
      .select('*, product_images(image_url)')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Transform data
    const sanitizedData = data.map(product => {
      const newProduct = { ...product };
      
      // Convert joined product_images table to simple images array
      if (newProduct.product_images) {
        newProduct.images = newProduct.product_images.map(img => img.image_url);
        delete newProduct.product_images;
      } else {
        newProduct.images = [];
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
    
    // Validate id parameter
    if (!id || id === 'undefined' || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const productId = Number(id);
    
    // Get product
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*, product_images(image_url)')
      .eq('id', productId);

    if (productError) throw productError;
    if (!products || products.length === 0) return res.status(404).json({ error: 'Product not found' });

    // Take the first product if multiple exist (data integrity issue)
    const product = { ...products[0] };

    // Format images
    if (product.product_images) {
      product.images = product.product_images.map(img => img.image_url);
      delete product.product_images;
    } else {
      product.images = [];
    }

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
      .eq('product_id', productId)
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
      status: productData.status || 'In Stock'
    };

    // Validate required fields
    if (!product.productName || !product.sku) {
      return res.status(400).json({ error: 'Product name and SKU are required' });
    }

    console.log(`Creating product: ${product.productName}`);

    // 1. Insert product details first
    const { data: productResult, error } = await supabase
      .from('products')
      .insert([product])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    const newProduct = productResult[0];

    // 2. Insert images into product_images table
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map(url => ({
        product_id: newProduct.id,
        image_url: url
      }));

      const { error: imageError } = await supabase
        .from('product_images')
        .insert(imageRecords);
        
      if (imageError) {
        console.error('Error saving images:', imageError);
        // We log but don't fail the request, product was created
      }
    }
    
    // Add images to response
    newProduct.images = imageUrls;

    console.log(`Product created successfully in ${Date.now() - startTime}ms`);
    res.status(201).json(newProduct);
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
      status: productData.status,
      updated_at: new Date().toISOString()
    };

    // 1. Update product details
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'Product not found' });

    // 2. Update images (Delete all old, insert all new)
    // First delete existing
    await supabase.from('product_images').delete().eq('product_id', id);

    // Then insert new ones
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map(url => ({
        product_id: id,
        image_url: url
      }));

      const { error: imageError } = await supabase
        .from('product_images')
        .insert(imageRecords);

      if (imageError) console.error('Error updating images:', imageError);
    }
    
    // Add images to response
    const updatedProduct = data[0];
    updatedProduct.images = imageUrls;

    res.status(200).json(updatedProduct);
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
