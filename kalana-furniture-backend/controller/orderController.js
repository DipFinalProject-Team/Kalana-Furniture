const supabase = require('../config/supabaseClient');

exports.getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        customer:users(name, email)
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
        items:order_items(*)
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
        items:order_items(*),
        customer:users(name, email)
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
      items, 
      total, 
      status,
      deliveryDetails,
      promoCode
    } = req.body;
    
    // Validate required fields
    if (!customer_id || !items || !total || !deliveryDetails) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!deliveryDetails.name || !deliveryDetails.address || !deliveryDetails.phone || !deliveryDetails.email) {
      return res.status(400).json({ error: 'Delivery details are incomplete' });
    }
    
    // Start a transaction-like approach (Supabase doesn't support multi-table transactions in client directly easily without RPC, but we'll do sequential inserts)
    
    // 1. Create Order with delivery details
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id,
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

    // 2. Create Order Items with product details
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_category: item.product_category,
      product_sku: item.product_sku,
      product_image: item.image || item.product_image || null, // Store the first image or product image
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
        // Ideally rollback order here
        console.error("Error creating items, order might be inconsistent:", itemsError);
        throw itemsError;
    }

    // 3. Clear user's cart after successful order
    const { error: cartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', customer_id);

    if (cartError) {
      console.error("Error clearing cart:", cartError);
      // Don't fail the order for cart clearing error
    }

    // 4. Record promo code usage if promo code was applied
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
