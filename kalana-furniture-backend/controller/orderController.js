const supabase = require('../config/supabaseClient');

exports.getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users(name, email),
        product:products(productName)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Fetch product images manually since we changed the schema
    const ordersWithImages = await Promise.all(data.map(async (order) => {
      if (order.product_id) {
        const { data: images } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', order.product_id)
          .limit(1);
          
        if (order.product) {
          order.product.images = images ? images.map(img => img.image_url) : [];
        }
      }
      return order;
    }));

    res.status(200).json(ordersWithImages);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(productName)
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch product images manually
    const ordersWithImages = await Promise.all(data.map(async (order) => {
      if (order.product_id) {
        const { data: images } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', order.product_id)
          .limit(1);
          
        if (order.product) {
          order.product.images = images ? images.map(img => img.image_url) : [];
        }
      }
      return order;
    }));

    res.status(200).json(ordersWithImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users(name, email),
        product:products(productName)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Fetch product images
    if (order.product_id && order.product) {
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', order.product_id);
        
      order.product.images = images ? images.map(img => img.image_url) : [];
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      customer_id,
      product_id,
      quantity,
      total,
      status,
      deliveryDetails,
      promoCode
    } = req.body;

    // Validate required fields
    if (!customer_id || !product_id || !quantity || !total || !deliveryDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!deliveryDetails.name || !deliveryDetails.address || !deliveryDetails.phone || !deliveryDetails.email) {
      return res.status(400).json({ error: 'Delivery details are incomplete' });
    }

    // Check product stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Create Order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id,
        product_id,
        quantity,
        total,
        status: status || 'pending',
        delivery_name: deliveryDetails.name,
        delivery_address: deliveryDetails.address,
        delivery_phone: deliveryDetails.phone,
        delivery_email: deliveryDetails.email
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Update product stock
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: product.stock - quantity })
      .eq('id', product_id);

    if (stockError) {
      console.error("Error updating stock:", stockError);
      // Don't fail the order for stock update error
    }

    // Clear user's cart after successful order (remove the specific product)
    const { error: cartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', customer_id)
      .eq('product_id', product_id);

    if (cartError) {
      console.error("Error clearing cart:", cartError);
      // Don't fail the order for cart clearing error
    }

    // Record promo code usage if promo code was applied
    if (promoCode) {
      // Get promotion details to get promotion_id
      const { data: promotion, error: promoError } = await supabase
        .from('promotions')
        .select('id')
        .eq('code', promoCode.toUpperCase())
        .single();

      if (promoError || !promotion) {
        console.error("Error finding promotion for code:", promoCode, promoError);
        // Don't fail the order
      } else {
        const { error: usageError } = await supabase
          .from('promo_code_usage')
          .insert([{
            user_id: customer_id,
            promotion_id: promotion.id,
            order_id: orderData.id
          }]);

        if (usageError) {
          console.error("Error recording promo code usage:", usageError);
          // Don't fail the order for usage recording error
        }
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: orderData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
