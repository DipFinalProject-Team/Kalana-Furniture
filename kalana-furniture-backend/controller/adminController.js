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
    console.log('Admin Login Attempt:', { email, password });

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
        console.log('Email not confirmed - allowing password change for development');
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

exports.getAllSuppliers = async (req, res) => {
  try {
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Get all suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers'
    });
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

exports.updateSupplierStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Active or Inactive.'
      });
    }

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update({ status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier status updated successfully',
      supplier: supplier
    });
  } catch (error) {
    console.error('Update supplier status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier status'
    });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete related contact forms first (since no cascade)
    const { error: contactError } = await supabase
      .from('supplier_contact_form')
      .delete()
      .eq('supplier_id', id);

    if (contactError) {
      console.error('Error deleting supplier contacts:', contactError);
      throw contactError;
    }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier: ' + (error.message || 'Unknown error'),
      error: error
    });
  }
};

exports.getAllSupplierContacts = async (req, res) => {
  try {
    // Note: 'response' and 'status' columns might not exist in the database yet.
    // Reverting to previous select but mapping defaults for them.
    // Also reverting 'company_name' to 'name' inside suppliers join if that was what worked before,
    // although schema says company_name. If name fails, change to company_name.
    // Ideally we select * or check schema, but let's be conservative.
    // If 'name' fails, it might be 'company_name'. The previous code used 'name'.
    
    // Using try-catch for the query itself if possible? No.
    // Let's assume the issue is response/status not existing.
    
    const { data: contacts, error } = await supabase
      .from('supplier_contact_form')
      .select(`
        supplier_contact_form_id,
        supplier_id,
        message,
        response,
        status,
        created_at,
        suppliers (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
       // Check if error is due to missing 'name' column in suppliers
       if (error.message && error.message.includes('name')) {
         // Retry with company_name
         const { data: contactsRetry, error: errorRetry } = await supabase
          .from('supplier_contact_form')
          .select(`
            supplier_contact_form_id,
            supplier_id,
            message,
            response,
            status,
            created_at,
            suppliers (
              company_name,
              email
            )
          `)
          .order('created_at', { ascending: false });
          
          if (errorRetry) throw errorRetry;
          
          const transformedContactsRetry = contactsRetry.map(contact => ({
            supplier_contact_form_id: contact.supplier_contact_form_id,
            supplier_id: contact.supplier_id,
            message: contact.message,
            response: contact.response || null, // These won't be in the select result anyway
            status: contact.status || 'Pending',
            created_at: contact.created_at,
            supplier: contact.suppliers ? {
              name: contact.suppliers.company_name,
              email: contact.suppliers.email
            } : null
          }));
          
          return res.status(200).json({
            success: true,
            data: transformedContactsRetry
          });
       }
       throw error;
    }

    // Transform the data to match the expected format
    const transformedContacts = contacts.map(contact => ({
      supplier_contact_form_id: contact.supplier_contact_form_id,
      supplier_id: contact.supplier_id,
      message: contact.message,
      // Default values since columns likely missing or not selected
      response: contact.response || null,
      status: contact.status || 'Pending',
      created_at: contact.created_at,
      supplier: contact.suppliers ? {
        name: contact.suppliers.name, // The previous code expected 'name'
        email: contact.suppliers.email
      } : null
    }));

    res.status(200).json({
      success: true,
      data: transformedContacts
    });
  } catch (error) {
    console.error('Get supplier contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier contacts'
    });
  }
};

exports.updateSupplierContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (response !== undefined) updateData.response = response;

    const { data, error } = await supabase
      .from('supplier_contact_form')
      .update(updateData)
      .eq('supplier_contact_form_id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data
    });
  } catch (error) {
    console.error('Update supplier contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact'
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

    // Fetch images for all products
    const { data: productImages, error: imagesError } = await supabase
      .from('product_images')
      .select('product_id, image_url');
      
    if (imagesError) {
      console.error('Error fetching product images:', imagesError);
      // Continue without images if there's an error
    }

    // Create a map of product_id -> images array
    const imagesMap = {};
    if (productImages) {
      productImages.forEach(img => {
        if (!imagesMap[img.product_id]) {
          imagesMap[img.product_id] = [];
        }
        imagesMap[img.product_id].push(img.image_url);
      });
    }

    // Format products for frontend
    const inventory = products.map(product => {
      const images = imagesMap[product.id] || [];
      return {
        id: product.id,
        productName: product.productName,
        sku: product.sku || 'N/A',
        category: product.category || 'Uncategorized',
        price: Number(product.price),
        stock: product.stock || 0,
        status: (product.stock || 0) > 10 ? 'In Stock' : (product.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock',
        lastUpdated: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date(product.created_at).toISOString().split('T')[0],
        image: images.length > 0 ? images[0] : '',
        images: images
      };
    });

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
    const { data: orders, error } = await supabase
      .from('supplier_orders')
      .select(`
        *,
        products (
          productName
        ),
        suppliers (
          company_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedOrders = orders.map(order => ({
      id: order.id,
      productName: order.products?.productName || 'Unknown Product',
      quantity: order.quantity,
      expectedDelivery: order.expected_delivery,
      totalPrice: parseFloat(order.total_price),
      status: order.status,
      orderDate: order.order_date,
      actualDeliveryDate: order.actual_delivery_date,
      deliveryNotes: order.delivery_notes,
      supplierId: order.supplier_id,
      supplierName: order.suppliers?.company_name || 'Unknown Supplier'
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
    if (!productId || !supplierId || !quantity || !expectedDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, supplier ID, quantity, and expected delivery are required'
      });
    }

    const orderData = {
      supplier_id: supplierId,
      product_id: productId,
      quantity,
      expected_delivery: expectedDelivery,
      status: 'Pending'
    };

    // Only include total_price if provided
    if (pricePerUnit !== undefined) {
      orderData.total_price = pricePerUnit;
    }

    const { data: order, error } = await supabase
      .from('supplier_orders')
      .insert(orderData)
      .select(`
        *,
        products (
          productName
        ),
        suppliers (
          company_name
        )
      `)
      .single();

    if (error) throw error;

    const formattedOrder = {
      id: order.id,
      productName: order.products?.productName || 'Unknown Product',
      quantity: order.quantity,
      expectedDelivery: order.expected_delivery,
      totalPrice: order.total_price ? parseFloat(order.total_price) : null,
      status: order.status,
      orderDate: order.order_date,
      supplierId: order.supplier_id,
      supplierName: order.suppliers?.company_name || 'Unknown Supplier'
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
      message: 'Failed to create purchase order'
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
      .from('supplier_orders')
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
      const baseAmount = parseFloat(order.total_price);

      await supabase
        .from('invoices')
        .insert({
          supplier_id: order.supplier_id,
          supplier_order_id: order.id,
          amount: baseAmount,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Pending'
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
    // First, test Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('suppliers')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Supabase connection test failed:', testError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: testError.message
      });
    }

    // For now, let's just get basic invoice data without joins
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, supplier_id, supplier_order_id, amount, issue_date, due_date, payment_date, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Invoices query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to query invoices table',
        error: error.message
      });
    }

    // If we have invoices, try to get supplier names separately
    let formattedInvoices = [];
    if (invoices && invoices.length > 0) {
      // Get unique supplier IDs
      const supplierIds = [...new Set(invoices.map(inv => inv.supplier_id).filter(id => id))];
      
      let supplierMap = {};
      if (supplierIds.length > 0) {
        const { data: suppliers, error: supplierError } = await supabase
          .from('suppliers')
          .select('id, company_name')
          .in('id', supplierIds);

        if (!supplierError && suppliers) {
          supplierMap = suppliers.reduce((map, supplier) => {
            map[supplier.id] = supplier.company_name;
            return map;
          }, {});
        }
      }

      formattedInvoices = invoices.map(invoice => ({
        id: `INV-${String(invoice.supplier_order_id).padStart(4, '0')}`,
        orderId: invoice.supplier_order_id ? `SO-${String(invoice.supplier_order_id).padStart(4, '0')}` : 'N/A',
        supplierName: supplierMap[invoice.supplier_id] || 'Unknown Supplier',
        amount: parseFloat(invoice.amount || 0),
        date: invoice.issue_date,
        dueDate: invoice.due_date,
        status: invoice.status || 'Pending',
        paymentDate: invoice.payment_date
      }));
    }

    res.status(200).json({
      success: true,
      invoices: formattedInvoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

exports.markInvoiceAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Marking invoice as paid:', id);

    // Extract supplier_order_id from invoice number (format: INV-XXXX)
    const supplierOrderId = parseInt(id.replace('INV-', ''));

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'Paid',
        payment_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('supplier_order_id', supplierOrderId)
      .select('id, amount, issue_date, due_date, payment_date, status, supplier_id, supplier_order_id')
      .single();

    console.log('Update result:', { error, invoice: invoice ? 'found' : 'not found' });

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

    console.log('Step 1: Fetching supplier');
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
      console.log('Supplier query failed:', err.message);
    }

    console.log('Step 2: Fetching supplier order');
    try {
      if (invoice.supplier_order_id) {
        const { data: supplierOrder } = await supabase
          .from('supplier_orders')
          .select('id')
          .eq('id', invoice.supplier_order_id)
          .single();

        if (supplierOrder) {
          orderId = `SO-${String(supplierOrder.id).padStart(4, '0')}`;
        }
      }
    } catch (err) {
      console.log('Supplier order query failed:', err.message);
    }

    console.log('Step 3: Formatting invoice');
    const formattedInvoice = {
      id: `INV-${String(invoice.supplier_order_id).padStart(4, '0')}`,
      orderId: orderId,
      supplierName: supplierName,
      amount: parseFloat(invoice.amount || 0),
      date: invoice.issue_date,
      dueDate: invoice.due_date,
      status: invoice.status,
      paymentDate: new Date().toISOString().split('T')[0] // Set current date as payment date
    };

    console.log('Step 4: Sending response', formattedInvoice);
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
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('total')
          .eq('customer_id', customer.id);

        let totalSpent = 0;
        if (orders && orders.length > 0) {
          totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
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
        product:products(productName)
      `)
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

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
      productUrl: `/products/${review.product?.id}`
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

// Analytics functions
exports.getMonthlySales = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('total, created_at')
      .eq('status', 'Placed'); // Only count placed orders as sales

    if (error) throw error;

    // Group by month
    const monthlyData = {};
    data.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += parseFloat(order.total);
    });

    // Convert to array format for charts
    const result = Object.keys(monthlyData).map(month => ({
      name: month,
      sales: Math.round(monthlyData[month])
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ message: 'Failed to fetch monthly sales data' });
  }
};

exports.getOrdersTrend = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at')
      // Removed status filters to show all order activity
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date (last 30 days)
    const ordersByDate = {};
    const today = new Date();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      ordersByDate[dateKey] = 0;
    }

    // Count orders per date
    data.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (ordersByDate.hasOwnProperty(date)) {
        ordersByDate[date] += 1;
      }
    });

    // Convert to array format
    const result = Object.keys(ordersByDate).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      orders: ordersByDate[date]
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching orders trend:', error);
    res.status(500).json({ message: 'Failed to fetch orders trend data' });
  }
};

exports.getSalesByCategory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        products:product_id (
          category
        )
      `)
      // Removed status filter to show all data for now
      // .eq('status', 'Placed'); 

    if (error) throw error;

    // Group by category and count orders
    const categoryData = {};
    data.forEach(order => {
      const category = order.products?.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += 1; // Count orders, not revenue
    });

    // Define colors for categories
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
    
    // Convert to array format
    const result = Object.keys(categoryData).map((category, index) => ({
      name: category,
      value: categoryData[category],
      color: colors[index % colors.length]
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ message: 'Failed to fetch sales by category data' });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        quantity,
        products:product_id (
          id,
          productName,
          category,
          price
        )
      `)
      // Removed status filter for now
      // .eq('status', 'Placed');

    if (error) throw error;

    // Fetch product images manually for the found products
    // Get unique product IDs
    const productIds = [...new Set(data.map(order => order.products?.id).filter(id => id))];
    
    // Fetch images for these products
    let productImages = {};
    if (productIds.length > 0) {
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .in('product_id', productIds);
        
      if (images) {
        images.forEach(img => {
          if (!productImages[img.product_id]) {
            productImages[img.product_id] = img.image_url;
          }
        });
      }
    }

    // Group by product
    const productData = {};
    data.forEach(order => {
      const product = order.products;
      if (product) {
        const productId = product.id;
        if (!productData[productId]) {
          productData[productId] = {
            id: productId,
            name: product.productName,
            category: product.category,
            price: product.price,
            image: productImages[productId] || '/placeholder-image.jpg',
            sales: 0
          };
        }
        productData[productId].sales += parseInt(order.quantity);
      }
    });

    // Sort by sales and take top 5
    const result = Object.values(productData)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    res.status(500).json({ message: 'Failed to fetch top selling products data' });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total customers
    const { count: totalCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get order statistics
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total, created_at');

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    const placedOrders = orders.filter(order => order.status === 'Placed');

    // Calculate total revenue from placed orders
    const totalRevenue = placedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Calculate monthly sales (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = placedOrders
      .filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Get total suppliers
    const { count: totalSuppliers } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Calculate trends (simplified - in real app you'd compare with previous periods)
    const stats = [
      {
        id: 1,
        title: 'Total Customers',
        value: totalCustomers.toString(),
        icon: 'FaUsers',
        color: 'bg-blue-500',
        trend: '+12%', // You'd calculate this based on previous data
      },
      {
        id: 2,
        title: 'Total Products',
        value: totalProducts.toString(),
        icon: 'FaBoxOpen',
        color: 'bg-indigo-500',
        trend: '+5%',
      },
      {
        id: 3,
        title: 'Total Orders',
        value: totalOrders.toString(),
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
        trend: '+15%',
      },
      {
        id: 7,
        title: 'Monthly Sales',
        value: `Rs. ${monthlySales.toLocaleString()}`,
        icon: 'FaMoneyBillWave',
        color: 'bg-teal-500',
        trend: '+10%',
      },
      {
        id: 8,
        title: 'Total Suppliers',
        value: totalSuppliers.toString(),
        icon: 'FaTruck',
        color: 'bg-orange-500',
        trend: '+2%',
      },
    ];

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

// Review management functions
exports.getAllReviews = async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        comment,
        rating,
        created_at,
        product_id,
        products (
          productName,
          category
        ),
        users!inner (
          name,
          profile_picture
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedReviews = reviews
      .filter(review => review.product_id && review.product_id !== null && review.product_id !== undefined)
      .map(review => ({
      id: review.id,
      customerName: review.users.name,
      productName: review.products.productName,
      category: review.products.category,
      rating: review.rating,
      comment: review.comment,
      date: new Date(review.created_at).toLocaleDateString(),
      avatar: review.users.profile_picture || generateDefaultAvatar(review.users.name),
      productUrl: `http://localhost:5173/product/${review.product_id}`,
      product_id: review.product_id
    }));

    res.status(200).json(formattedReviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
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

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};