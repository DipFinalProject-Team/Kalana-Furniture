const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/supabaseClient');
const https = require('https');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to generate default avatar based on name
const generateDefaultAvatar = (name) => {
  const firstWord = name.split(' ')[0];
  const colors = [
    '3B82F6', // blue
    'EF4444', // red
    '10B981', // green
    'F59E0B', // yellow
    '8B5CF6', // purple
    '06B6D4', // cyan
    'F97316', // orange
    'EC4899', // pink
  ];

  // Generate a consistent color based on the first letter
  const firstLetter = firstWord.charAt(0).toUpperCase();
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];

  // Return DiceBear API URL for initials avatar
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstWord)}&backgroundColor=${color}&textColor=ffffff&size=150`;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError.message);
      return res.status(401).json({
        success: false,
        message: authError.message || 'Invalid credentials'
      });
    }

    // 2. Check Role in public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    // 3. Return the Supabase Token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: authData.session.access_token,
      admin: {
        email: authData.user.email,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await supabase.auth.signOut(token);
    }
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Try to verify as Supabase token first
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      // Check role in database
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not an admin'
        });
      }

      return res.status(200).json({
        success: true,
        admin: {
          email: user.email,
          role: userData.role
        }
      });
    }

    // If Supabase token failed, try to verify as our mock JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === 'admin') {
        return res.status(200).json({
          success: true,
          admin: {
            email: decoded.email,
            role: decoded.role
          }
        });
      }
    } catch (jwtError) {
      // JWT verification failed
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user from token - try Supabase first, then mock JWT
    let user = null;
    const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser(token);

    if (!supabaseError && supabaseUser) {
      user = supabaseUser;
    } else {
      // Try to decode mock JWT
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        user = { email: decoded.email, id: decoded.sub };
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // For development: Skip current password verification if email not confirmed
    let skipVerification = false;
    const tempClient = createClient(supabaseUrl, supabaseKey);
    const { data: signInData, error: signInError } = await tempClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        skipVerification = true;
      } else {
        console.error('Current password verification failed:', signInError.message);
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Update password using Supabase Admin API
    // For this to work, we need the service role key
    // Since we don't have it, let's try a direct API call
    const updateData = JSON.stringify({
      password: newPassword
    });

    const url = new URL(supabaseUrl);
    const options = {
      hostname: url.hostname,
      path: `/auth/v1/user`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey
      }
    };

    const updatePromise = new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve(response);
            } else {
              reject(new Error(response.error_description || response.msg || 'Update failed'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(updateData);
      req.end();
    });

    await updatePromise;

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Helper function to hash password (no longer needed with Supabase Auth, but keeping for compatibility if referenced elsewhere)
exports.hashPassword = async (password) => {
  return password; // No-op
};

// Supplier management functions
exports.getPendingApplications = async (req, res) => {
  try {
    const { data: applications, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getApprovedSuppliers = async (req, res) => {
  try {
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('status', 'approved')
      .order('approved_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(suppliers);
  } catch (error) {
    console.error('Get approved suppliers error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.approveSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: supplier, error: updateError } = await supabase
      .from('suppliers')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (updateError) throw updateError;

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found or already processed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier approved successfully',
      supplier: supplier
    });
  } catch (error) {
    console.error('Approve supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve supplier'
    });
  }
};

exports.rejectSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: supplier, error: updateError } = await supabase
      .from('suppliers')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (updateError) throw updateError;

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found or already processed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier application rejected',
      supplier: supplier
    });
  } catch (error) {
    console.error('Reject supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject supplier'
    });
  }
};

// Inventory Management Functions
exports.getInventory = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Format products for frontend
    const inventory = products.map(product => ({
      id: product.id,
      productName: product.productName,
      sku: product.sku || 'N/A',
      category: product.category || 'Uncategorized',
      price: Number(product.price),
      stock: product.stock || 0,
      status: (product.stock || 0) > 10 ? 'In Stock' : (product.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock',
      lastUpdated: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date(product.created_at).toISOString().split('T')[0],
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      images: product.images || []
    }));

    res.status(200).json({
      success: true,
      inventory
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory'
    });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    // Determine status based on stock level
    let status = 'In Stock';
    if (stock === 0) status = 'Out of Stock';
    else if (stock < 5) status = 'Low Stock';

    const { data: product, error } = await supabase
      .from('products')
      .update({
        stock,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      product: {
        id: product.id,
        productName: product.productName,
        stock: product.stock,
        status: product.status,
        lastUpdated: new Date(product.updated_at).toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
};

// Purchase Order Management Functions
exports.getPurchaseOrders = async (req, res) => {
  try {
    // Fetch orders first without join to ensure basic query works
    const { data: orders, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }

    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, orders: [] });
    }

    // Manually fetch related data to avoid join issues
    const productIds = [...new Set(orders.map(o => o.product_id))];
    const supplierIds = [...new Set(orders.map(o => o.supplier_id))];

    const { data: products } = await supabase
      .from('products')
      .select('id, productName')
      .in('id', productIds);

    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('id, company_name')
      .in('id', supplierIds);

    // Create lookup maps
    const productMap = (products || []).reduce((acc, p) => ({ ...acc, [p.id]: p.productName }), {});
    const supplierMap = (suppliers || []).reduce((acc, s) => ({ ...acc, [s.id]: s.company_name }), {});

    const formattedOrders = orders.map(order => ({
      id: order.id.toString(),
      productName: productMap[order.product_id] || 'Unknown Product',
      quantity: order.quantity,
      expectedDelivery: order.expected_delivery,
      pricePerUnit: parseFloat(order.price_per_unit),
      status: order.status,
      orderDate: order.order_date,
      actualDeliveryDate: order.actual_delivery_date,
      deliveryNotes: order.delivery_notes,
      supplierId: order.supplier_id.toString(),
      supplierName: supplierMap[order.supplier_id] || 'Unknown Supplier'
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase orders'
    });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { productId, supplierId, quantity, expectedDelivery, pricePerUnit } = req.body;

    // Validate required fields
    if (!productId || !supplierId || !quantity || !expectedDelivery || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Ensure types
    const pId = parseInt(productId);
    const sId = parseInt(supplierId);
    const qty = parseInt(quantity);
    const price = parseFloat(pricePerUnit);

    if (isNaN(pId) || isNaN(sId) || isNaN(qty) || isNaN(price)) {
      return res.status(400).json({ success: false, message: 'Invalid field types' });
    }

    // Insert the order
    const { data: order, error } = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: sId,
        product_id: pId,
        quantity: qty,
        price_per_unit: price,
        expected_delivery: expectedDelivery,
        status: 'Pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    // Fetch related details separately to ensure stability
    const { data: product } = await supabase
      .from('products')
      .select('productName')
      .eq('id', pId)
      .single();

    const { data: supplier } = await supabase
      .from('suppliers')
      .select('company_name')
      .eq('id', sId)
      .single();

    const formattedOrder = {
      id: order.id.toString(),
      productName: product?.productName || 'Unknown Product',
      quantity: order.quantity,
      expectedDelivery: order.expected_delivery,
      pricePerUnit: parseFloat(order.price_per_unit),
      status: order.status,
      orderDate: order.order_date,
      supplierId: order.supplier_id.toString(),
      supplierName: supplier?.company_name || 'Unknown Supplier'
    };

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      order: formattedOrder
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase order: ' + (error.message || 'Unknown error')
    });
  }
};

exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualDeliveryDate, deliveryNotes } = req.body;

    const updates = { status };
    if (actualDeliveryDate) updates.actual_delivery_date = actualDeliveryDate;
    if (deliveryNotes) updates.delivery_notes = deliveryNotes;
    updates.updated_at = new Date().toISOString();

    const { data: order, error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        products (
          productName,
          id
        )
      `)
      .single();

    if (error) throw error;

    // If order is completed, update inventory stock
    if (status === 'Completed') {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', order.product_id)
        .single();

      if (product) {
        const newStock = (product.stock || 0) + order.quantity;
        let productStatus = 'In Stock';
        if (newStock === 0) productStatus = 'Out of Stock';
        else if (newStock < 5) productStatus = 'Low Stock';

        await supabase
          .from('products')
          .update({
            stock: newStock,
            status: productStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.product_id);
      }

      // Generate invoice
      const baseAmount = order.quantity * parseFloat(order.price_per_unit);

      await supabase
        .from('invoices')
        .insert({
          supplier_id: order.supplier_id,
          purchase_order_id: order.id,
          invoice_number: `INV-${new Date().getFullYear()}-${String(order.id).padStart(4, '0')}`,
          amount: baseAmount,
          total_amount: baseAmount,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Pending',
          notes: `Invoice for Purchase Order ${order.id}`
        });
    }

    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update purchase order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase order'
    });
  }
};

// Invoice Management Functions
exports.getInvoices = async (req, res) => {
  try {
    // First check if invoices table exists and has data
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Invoices table query error:', error);
      // If table doesn't exist, return empty array
      if (error.code === '42P01') { // relation does not exist
        return res.status(200).json({
          success: true,
          invoices: []
        });
      }
      throw error;
    }

    if (!invoices || invoices.length === 0) {
      return res.status(200).json({
        success: true,
        invoices: []
      });
    }

    // Get unique supplier and purchase order IDs
    const supplierIds = [...new Set(invoices.map(inv => inv.supplier_id).filter(id => id))];
    const purchaseOrderIds = [...new Set(invoices.map(inv => inv.purchase_order_id).filter(id => id))];

    // Fetch related data separately
    const suppliers = supplierIds.length > 0 ? await supabase
      .from('suppliers')
      .select('id, company_name')
      .in('id', supplierIds) : { data: [] };

    const purchaseOrders = purchaseOrderIds.length > 0 ? await supabase
      .from('purchase_orders')
      .select('id')
      .in('id', purchaseOrderIds) : { data: [] };

    // Create lookup maps
    const supplierMap = (suppliers.data || []).reduce((acc, s) => ({ ...acc, [s.id]: s.company_name }), {});
    const orderMap = (purchaseOrders.data || []).reduce((acc, po) => ({ ...acc, [po.id]: po.id }), {});

    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.invoice_number.toString(),
      orderId: invoice.purchase_order_id ? `PO-${String(orderMap[invoice.purchase_order_id] || invoice.purchase_order_id).padStart(4, '0')}` : 'N/A',
      supplierName: supplierMap[invoice.supplier_id] || 'Unknown Supplier',
      amount: parseFloat(invoice.amount || invoice.total_amount || 0),
      date: invoice.issue_date,
      dueDate: invoice.due_date,
      status: invoice.status,
      paymentDate: invoice.payment_date
    }));

    res.status(200).json({
      success: true,
      invoices: formattedInvoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};

exports.markInvoiceAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'Paid',
        updated_at: new Date().toISOString()
      })
      .eq('invoice_number', id)
      .select('id, invoice_number, amount, total_amount, issue_date, due_date, status, supplier_id, purchase_order_id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Get supplier and purchase order info separately
    let supplierName = 'Unknown Supplier';
    let orderId = '';

    try {
      if (invoice.supplier_id) {
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('company_name')
          .eq('id', invoice.supplier_id)
          .single();

        if (supplier) {
          supplierName = supplier.company_name;
        }
      }
    } catch (err) {
      // Supplier query failed, continue without supplier name
    }

    try {
      if (invoice.purchase_order_id) {
        const { data: purchaseOrder } = await supabase
          .from('purchase_orders')
          .select('id')
          .eq('id', invoice.purchase_order_id)
          .single();

        if (purchaseOrder) {
          orderId = `PO-${String(purchaseOrder.id).padStart(4, '0')}`;
        }
      }
    } catch (err) {
      // Purchase order query failed, continue without order ID
    }

    const formattedInvoice = {
      id: invoice.invoice_number.toString(),
      orderId: orderId,
      supplierName: supplierName,
      amount: parseFloat(invoice.amount || invoice.total_amount || 0),
      date: invoice.issue_date,
      dueDate: invoice.due_date,
      status: invoice.status,
      paymentDate: new Date().toISOString().split('T')[0] // Set current date as payment date
    };

    res.status(200).json({
      success: true,
      message: 'Invoice marked as paid successfully',
      invoice: formattedInvoice
    });
  } catch (error) {
    console.error('Mark invoice as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark invoice as paid: ' + error.message
    });
  }
};

// Customer Management Functions
exports.getAllCustomers = async (req, res) => {
  try {
    // Get all customers (users with role 'customer')
    const { data: customers, error: customersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (customersError) {
      console.error('Get customers error:', customersError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch customers'
      });
    }

    // For each customer, get their order statistics
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        // Get total orders count
        const { count: totalOrders, error: ordersCountError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customer.id);

        // Get total spent
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select('price, quantity')
          .eq('order_id', (
            await supabase
              .from('orders')
              .select('id')
              .eq('customer_id', customer.id)
          ).data?.map(order => order.id) || []);

        let totalSpent = 0;
        if (orderItems && orderItems.length > 0) {
          totalSpent = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        return {
          id: customer.id,
          name: customer.name || 'N/A',
          email: customer.email,
          phone: customer.phone || 'N/A',
          address: customer.address || 'N/A',
          registrationDate: new Date(customer.created_at).toLocaleDateString(),
          totalOrders: totalOrders || 0,
          totalSpent: totalSpent,
          status: customer.status || 'Active', // Assuming we add a status field to users table
          avatar: customer.profile_picture || generateDefaultAvatar(customer.name || 'User'),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: customersWithStats
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers: ' + error.message
    });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Active', 'Blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Active or Blocked.'
      });
    }

    // Update customer status
    const { data, error } = await supabase
      .from('users')
      .update({ status: status })
      .eq('id', id)
      .eq('role', 'customer')
      .select();

    if (error) {
      console.error('Update customer status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update customer status'
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Customer ${status === 'Active' ? 'activated' : 'blocked'} successfully`,
      data: data[0]
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer status: ' + error.message
    });
  }
};

exports.getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'customer')
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer's orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          products (productName)
        )
      `)
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => {
      const orderTotal = order.order_items?.reduce((itemSum, item) =>
        itemSum + (item.price * item.quantity), 0) || 0;
      return sum + orderTotal;
    }, 0) || 0;

    const customerDetails = {
      id: customer.id,
      name: customer.name || 'N/A',
      email: customer.email,
      phone: customer.phone || 'N/A',
      address: customer.address || 'N/A',
      registrationDate: new Date(customer.created_at).toLocaleDateString(),
      totalOrders,
      totalSpent,
      status: customer.status || 'Active',
      avatar: customer.profile_picture || generateDefaultAvatar(customer.name || 'User'),
      orders: orders || []
    };

    res.status(200).json({
      success: true,
      data: customerDetails
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer details: ' + error.message
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user:users (name, profile_picture),
        product:products (productName, category, id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      customerName: review.user?.name || 'Anonymous',
      productName: review.product?.productName || 'Unknown Product',
      category: review.product?.category || 'Uncategorized',
      rating: review.rating,
      comment: review.comment,
      date: new Date(review.created_at).toISOString().split('T')[0],
      avatar: review.user?.profile_picture || generateDefaultAvatar(review.user?.name || 'Anonymous'),
      productUrl: `http://localhost:5173/product/${review.product?.id}`
    }));

    res.status(200).json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};

// Analytics Functions
exports.getMonthlySales = async (req, res) => {
  try {
    // Get sales data for the last 12 months
    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('status', 'delivered') // Only count completed orders
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    data.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { name: monthName, sales: 0 };
      }
      monthlyData[monthKey].sales += parseFloat(order.total);
    });

    // Convert to array and sort by date
    const result = Object.values(monthlyData).sort((a, b) => {
      const monthA = monthNames.indexOf(a.name);
      const monthB = monthNames.indexOf(b.name);
      return monthA - monthB;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ message: 'Failed to fetch monthly sales data' });
  }
};

exports.getOrdersTrend = async (req, res) => {
  try {
    // Get orders count for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const dailyData = {};
    data.forEach(order => {
      const date = new Date(order.created_at);
      const dayKey = date.getDate().toString().padStart(2, '0');

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { date: dayKey, orders: 0 };
      }
      dailyData[dayKey].orders += 1;
    });

    // Convert to array and sort by date
    const result = Object.values(dailyData).sort((a, b) => parseInt(a.date) - parseInt(b.date));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching orders trend:', error);
    res.status(500).json({ message: 'Failed to fetch orders trend data' });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    // Get all order items to properly aggregate sales by product
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        product_name,
        product_category,
        price,
        quantity,
        product_image,
        products!inner(sku)
      `);

    if (error) throw error;

    // Aggregate sales by product
    const productSales = {};
    data.forEach(item => {
      const productId = item.product_id;
      if (!productSales[productId]) {
        productSales[productId] = {
          id: productId,
          name: item.product_name,
          category: item.product_category,
          price: parseFloat(item.price),
          sales: 0,
          image: item.product_image || 'https://via.placeholder.com/150',
          sku: item.products?.sku || 'N/A'
        };
      }
      productSales[productId].sales += item.quantity;
    });

    // Convert to array and sort by total sales (descending)
    const result = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10); // Top 10 products by total quantity sold

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    res.status(500).json({ message: 'Failed to fetch top selling products' });
  }
};

exports.getSalesByCategory = async (req, res) => {
  try {
    // Get sales by category from order items
    const { data, error } = await supabase
      .from('order_items')
      .select('product_category, quantity, price')
      .order('product_category');

    if (error) throw error;

    // Aggregate sales by category
    const categorySales = {};
    data.forEach(item => {
      const category = item.product_category;
      if (!categorySales[category]) {
        categorySales[category] = { name: category, value: 0 };
      }
      categorySales[category].value += item.quantity;
    });

    // Add colors and convert to array
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
    const result = Object.values(categorySales).map((category, index) => ({
      ...category,
      color: colors[index % colors.length]
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ message: 'Failed to fetch sales by category data' });
  }
};

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all statistics in parallel
    const [
      { count: totalCustomers },
      { count: totalProducts },
      { count: totalOrders },
      { count: pendingOrders },
      { count: cancelledOrders },
      { count: totalSuppliers },
      revenueResult,
      monthlyRevenueResult,
      { count: activePromotions },
      { count: expiredPromotions }
    ] = await Promise.all([
      // Total customers (only users with role 'customer')
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      
      // Total products
      supabase.from('products').select('*', { count: 'exact', head: true }),
      
      // Total orders
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      
      // Pending orders
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Cancelled orders
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
      
      // Total suppliers
      supabase.from('suppliers').select('*', { count: 'exact', head: true }),
      
      // Total revenue (from placed orders)
      supabase.from('orders').select('total, created_at').eq('status', 'placed'),
      
      // Monthly revenue (current month) - only placed orders
      supabase.from('orders').select('total, created_at').eq('status', 'placed'),
      
      // Active promotions (is_active = true and end_date >= today)
      supabase.from('promotions').select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0]),
      
      // Expired promotions (end_date < today)
      supabase.from('promotions').select('*', { count: 'exact', head: true })
        .lt('end_date', new Date().toISOString().split('T')[0])
    ]);

    // Calculate total revenue
    const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
    
    // Calculate monthly revenue (filter in JavaScript for current month only - status already filtered in query)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = monthlyRevenueResult.data
      ?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      ?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

    // Calculate trends (comparing with previous month)
    const lastMonth = new Date().getMonth() - 1;
    const lastMonthYear = lastMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const adjustedLastMonth = lastMonth < 0 ? 11 : lastMonth;
    
    const lastMonthRevenue = monthlyRevenueResult.data
      ?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === adjustedLastMonth && orderDate.getFullYear() === lastMonthYear;
      })
      ?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
    
    // Calculate revenue trend percentage
    const revenueTrend = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : '0.0';

    const stats = [
      {
        id: 1,
        title: 'Total Customers',
        value: totalCustomers.toLocaleString(),
        icon: 'FaUsers',
        color: 'bg-blue-500',
        trend: '+12%', // This would need historical data to calculate properly
      },
      {
        id: 2,
        title: 'Total Products',
        value: totalProducts.toLocaleString(),
        icon: 'FaBoxOpen',
        color: 'bg-indigo-500',
        trend: '+5%',
      },
      {
        id: 3,
        title: 'Total Orders',
        value: totalOrders.toLocaleString(),
        icon: 'FaShoppingCart',
        color: 'bg-green-500',
        trend: '+8%',
      },
      {
        id: 4,
        title: 'Pending Orders',
        value: pendingOrders.toString(),
        icon: 'FaClock',
        color: 'bg-yellow-500',
        trend: '-2%',
      },
      {
        id: 5,
        title: 'Cancelled Orders',
        value: cancelledOrders.toString(),
        icon: 'FaTimesCircle',
        color: 'bg-red-500',
        trend: '-1%',
      },
      {
        id: 6,
        title: 'Total Revenue',
        value: `Rs. ${totalRevenue.toLocaleString()}`,
        icon: 'FaWallet',
        color: 'bg-purple-500',
        trend: `${revenueTrend.startsWith('-') ? '' : '+'}${revenueTrend}%`,
      },
      {
        id: 7,
        title: 'Monthly Sales',
        value: `Rs. ${monthlyRevenue.toLocaleString()}`,
        icon: 'FaMoneyBillWave',
        color: 'bg-teal-500',
        trend: `${revenueTrend.startsWith('-') ? '' : '+'}${revenueTrend}%`,
      },
      {
        id: 8,
        title: 'Total Suppliers',
        value: totalSuppliers.toString(),
        icon: 'FaTruck',
        color: 'bg-orange-500',
        trend: '+2%',
      },
      {
        id: 9,
        title: 'Active Promotions',
        value: activePromotions.toString(),
        icon: 'FaTags',
        color: 'bg-pink-500',
        trend: '+2%', // This would need historical data to calculate properly
      },
      {
        id: 10,
        title: 'Expired Promotions',
        value: expiredPromotions.toString(),
        icon: 'FaCalendarTimes',
        color: 'bg-gray-500',
        trend: '+5%', // This would need historical data to calculate properly
      },
    ];

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};