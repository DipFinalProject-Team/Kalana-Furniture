const supabase = require('../config/supabaseClient');

// Get user's cart items
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // First get active promotions
    const currentDate = new Date().toISOString().split('T')[0];
    const { data: promotions, error: promoError } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', currentDate)
      .gte('end_date', currentDate);

    if (promoError) {
      console.error('Promotions fetch error:', promoError);
      // Continue without promotions if there's an error
    }

    const { data, error } = await supabase
      .from('cart')
      .select(`
        id,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          productName,
          price,
          stock,
          category,
          sku
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Fetch images for the products in cart
    const productIds = data.map(item => item.products.id);
    let productImages = {};
    
    if (productIds.length > 0) {
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .in('product_id', productIds);
        
      if (images) {
        images.forEach(img => {
          if (!productImages[img.product_id]) {
            productImages[img.product_id] = [];
          }
          productImages[img.product_id].push(img.image_url);
        });
      }
    }

    // Apply promotions to products
    const applyPromotionsToProduct = (product, promotionsList) => {
      // Attach images to product
      const productWithImages = {
        ...product,
        images: productImages[product.id] || []
      };

      let bestDiscountPrice = productWithImages.price;
      let bestDiscountPercentage = 0;

      if (promotionsList) {
        promotionsList.forEach(promotion => {
          // Only apply general discounts (where code is null)
          // Only apply general discounts (where code is null or 'GENERAL_DISCOUNT')
          if (promotion.code && promotion.code !== 'GENERAL_DISCOUNT') return;

          // Check if promotion applies to this product
          let appliesToProduct = false;

          if (promotion.applies_to === 'All Products') {
            appliesToProduct = true;
          } else if (promotion.applies_to && promotion.applies_to.startsWith('Category: ')) {
            const category = promotion.applies_to.replace('Category: ', '');
            appliesToProduct = productWithImages.category === category;
          }

          if (appliesToProduct) {
            let discountPrice = productWithImages.price;

            if (promotion.type === 'percentage') {
              discountPrice = productWithImages.price * (1 - promotion.value / 100);
            } else if (promotion.type === 'fixed') {
              discountPrice = Math.max(0, productWithImages.price - promotion.value);
            }

            if (discountPrice < bestDiscountPrice) {
              bestDiscountPrice = discountPrice;
              bestDiscountPercentage = promotion.type === 'percentage' ? promotion.value : Math.round(((productWithImages.price - discountPrice) / productWithImages.price) * 100);
            }
          }
        });
      }

      if (bestDiscountPrice < productWithImages.price) {
        return {
          ...productWithImages,
          discountPrice: Math.round(bestDiscountPrice * 100) / 100, // Round to 2 decimal places
          discountPercentage: bestDiscountPercentage
        };
      }

      return productWithImages;
    };

    // Format the response to match frontend expectations
    const formattedCart = data.map(item => {
      const productWithDiscount = applyPromotionsToProduct(item.products, promotions);
      return {
        id: item.id,
        product_id: productWithDiscount.id,
        name: productWithDiscount.productName,
        price: productWithDiscount.price,
        discountPrice: productWithDiscount.discountPrice,
        discountPercentage: productWithDiscount.discountPercentage,
        image: productWithDiscount.images && productWithDiscount.images.length > 0 ? productWithDiscount.images[0] : '',
        quantity: item.quantity,
        stock: productWithDiscount.stock,
        category: productWithDiscount.category,
        sku: productWithDiscount.sku
      };
    });

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    // Check if product exists and has sufficient stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('cart')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }

    let result;
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }

      const { data, error } = await supabase
        .from('cart')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.status(201).json({
      message: 'Item added to cart successfully',
      cartItem: result
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Get cart item with product info
    const { data: cartItem, error: cartError } = await supabase
      .from('cart')
      .select(`
        id,
        quantity,
        products (
          stock
        )
      `)
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .single();

    if (cartError || !cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity > cartItem.products.stock) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const { data, error } = await supabase
      .from('cart')
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Cart item updated successfully',
      cartItem: data
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;

    const { data, error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows deleted
        return res.status(404).json({ error: 'Cart item not found' });
      }
      throw error;
    }

    res.status(200).json({
      message: 'Item removed from cart successfully',
      cartItem: data
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: 'Cart cleared successfully',
      deletedItems: data
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};