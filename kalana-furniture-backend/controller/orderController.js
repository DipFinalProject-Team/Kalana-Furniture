const supabase = require('../config/supabaseClient');

exports.getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users(name, email),
        product:products(productName, images)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
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
        product:products(productName, images)
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:users(name, email),
        product:products(productName, images)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });

    res.status(200).json(data);
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
      const { error: usageError } = await supabase
        .from('promo_code_usage')
        .insert([{
          user_id: customer_id,
          promo_code: promoCode.toUpperCase(),
          order_id: orderData.id
        }]);

      if (usageError) {
        console.error("Error recording promo code usage:", usageError);
        // Don't fail the order for usage recording error
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
