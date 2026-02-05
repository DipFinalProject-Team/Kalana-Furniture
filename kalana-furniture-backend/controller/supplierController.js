const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.register = async (req, res) => {
  try {
    const { company_name, email, phone, address, password, categories, message } = req.body;

    // Validate input
    if (!company_name || !address || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Company name, address, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if supplier already exists
    const { data: existingSupplier } = await supabase
      .from('suppliers')
      .select('email')
      .eq('email', email)
      .single();

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'A supplier with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create supplier record with pending status
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .insert([{
        company_name: company_name,
        email: email,
        phone: phone,
        address: address,
        password: hashedPassword,
        categories: categories,
        message: message,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (supplierError) {
      console.error('Supplier registration error:', supplierError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to register supplier'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Please wait for admin approval.',
      supplier: {
        id: supplierData.id,
        company_name: supplierData.company_name,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        status: supplierData.status
      }
    });

  } catch (error) {
    console.error('Supplier registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Supplier Admin Login Attempt:', { email, password });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find supplier by email
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('email', email)
      .single();

    if (supplierError || !supplier) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, supplier.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if supplier is approved
    if (supplier.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. Please wait for approval before logging in.'
      });
    }

    if (supplier.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected. Please contact support.'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        email: supplier.email,
        role: 'supplier',
        type: 'supplier',
        sub: supplier.id,
        companyName: supplier.company_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      supplier: {
        id: supplier.id,
        companyName: supplier.company_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        categories: supplier.categories,
        message: supplier.message,
        status: supplier.status,
        profileImage: supplier.profile_image
      }
    });

  } catch (error) {
    console.error('Supplier login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if supplier exists
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('id, email, status')
      .eq('email', email)
      .single();

    if (supplierError || !supplier) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link to it.'
      });
    }

    // Check if supplier is approved
    if (supplier.status !== 'approved') {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link to it.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { 
        email: supplier.email,
        type: 'password_reset',
        sub: supplier.id
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Use the origin from the request to ensure the link points to the correct frontend port
    const origin = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${origin}/supplier/reset-password?token=${resetToken}`;
    
    // Send email via Supabase
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: resetLink
    });

    // Note: Since we are managing suppliers in a custom table and not using Supabase Auth users directly for suppliers,
    // we can't use Supabase's built-in password reset email easily without creating Auth users.
    // However, we can use Supabase Edge Functions or a third-party email service (like Resend, SendGrid) here.
    
    // For this implementation, assuming we want to use Supabase's email capability, 
    // we'll use a workaround or just log that we need an email service.
    // Since we don't have an email service configured, I will simulate the "Real Mode" by NOT returning the link
    // but logging it to the server console so the admin can see it (or for debugging).
    
    // In a true production environment, replace this console.log with:
    // await sendEmail({ to: email, subject: 'Reset Password', html: `Click here: <a href="${resetLink}">Reset Password</a>` });
    
    console.log(`[EMAIL SERVICE] Sending password reset link to ${email}: ${resetLink}`);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link to it.'
    });
  } catch (error) {
    console.error('Supplier forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Check if supplier exists
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('id, email, status')
      .eq('id', decoded.sub)
      .single();

    if (supplierError || !supplier) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Check if supplier is approved
    if (supplier.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Account is not approved'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ password: hashedPassword })
      .eq('id', supplier.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Supplier reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
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

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        message: 'Not a supplier account'
      });
    }

    // Get supplier data
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', decoded.sub)
      .single();

    if (!supplier || supplier.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Account access denied'
      });
    }

    res.status(200).json({
      success: true,
      supplier: {
        id: supplier.id,
        companyName: supplier.company_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        categories: supplier.categories,
        message: supplier.message,
        status: supplier.status,
        profileImage: supplier.profile_image
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // For JWT, logout is handled client-side by removing the token
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const supplierId = req.supplier.sub; // From auth middleware (JWT sub field)

    // Delete supplier from database
    const { error: deleteError } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);

    if (deleteError) {
      console.error('Delete supplier error:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;
    const { companyName, phone, address, categories, message } = req.body;

    const { data: updatedSupplier, error } = await supabase
      .from('suppliers')
      .update({
        company_name: companyName,
        phone: phone,
        address: address,
        categories: categories,
        message: message
      })
      .eq('id', supplierId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      supplier: {
        id: updatedSupplier.id,
        companyName: updatedSupplier.company_name,
        email: updatedSupplier.email,
        phone: updatedSupplier.phone,
        address: updatedSupplier.address,
        categories: updatedSupplier.categories,
        status: updatedSupplier.status,
        message: updatedSupplier.message,
        profileImage: updatedSupplier.profile_image
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const { data: supplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('password')
      .eq('id', supplierId)
      .single();

    if (fetchError || !supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, supplier.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ password: hashedPassword })
      .eq('id', supplierId);

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'kalana-furniture/suppliers',
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Update supplier record with image URL
    const { data: updatedSupplier, error } = await supabase
      .from('suppliers')
      .update({ profile_image: result.secure_url })
      .eq('id', supplierId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image'
    });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;

    const { data: orders, error } = await supabase
      .from('supplier_orders')
      .select(`
        *,
        products (
          productName,
          sku
        )
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedOrders = orders.map(order => ({
      id: order.id,
      productName: order.products?.productName || 'Unknown Product',
      quantity: order.quantity,
      totalAmount: parseFloat(order.total_price),
      status: order.status,
      orderDate: order.created_at,
      deliveryDate: order.expected_delivery,
      actualDeliveryDate: order.actual_delivery_date,
      deliveryNotes: order.delivery_notes
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

exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualDeliveryDate, deliveryNotes } = req.body;
    const supplierId = req.supplier.sub;

    const updates = { status };

    // When marking as dispatched, also save actual delivery date and notes
    if (status === 'Dispatched') {
      if (!actualDeliveryDate) {
        return res.status(400).json({
          success: false,
          message: 'Actual delivery date is required when marking as dispatched'
        });
      }
      updates.actual_delivery_date = actualDeliveryDate;
      if (deliveryNotes) {
        updates.delivery_notes = deliveryNotes;
      }
    }

    const { data: order, error } = await supabase
      .from('supplier_orders')
      .update(updates)
      .eq('id', id)
      .eq('supplier_id', supplierId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

exports.updatePurchaseOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryDate, notes, totalPrice } = req.body;
    const supplierId = req.supplier.sub;

    const updates = {};
    if (deliveryDate) updates.expected_delivery_date = deliveryDate;
    if (notes) updates.notes = notes;
    if (totalPrice !== undefined) updates.total_price = parseFloat(totalPrice);

    const { data: order, error } = await supabase
      .from('supplier_orders')
      .update(updates)
      .eq('id', id)
      .eq('supplier_id', supplierId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Order details updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order details'
    });
  }
};

// Invoice Management Functions
exports.getInvoices = async (req, res) => {
  try {
    const supplierId = parseInt(req.supplier.sub);

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, amount, issue_date, due_date, payment_date, status, supplier_order_id')
      .eq('supplier_id', supplierId)
      .order('issue_date', { ascending: false });

    if (error) throw error;

    // Format the response to match frontend interface
    const formattedInvoices = invoices?.map(invoice => {
      return {
        id: `INV-${String(invoice.supplier_order_id).padStart(4, '0')}`,
        orderId: invoice.supplier_order_id ? `SO-${String(invoice.supplier_order_id).padStart(4, '0')}` : 'N/A',
        amount: parseFloat(invoice.amount),
        date: new Date(invoice.issue_date).toLocaleDateString(),
        dueDate: new Date(invoice.due_date).toLocaleDateString(),
        status: invoice.status === 'Paid' ? 'Paid' : 'Pending',
        paymentDate: invoice.payment_date ? new Date(invoice.payment_date).toLocaleDateString() : null
      };
    }) || [];

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

exports.getInvoiceDetails = async (req, res) => {
  try {
    const supplierId = parseInt(req.supplier.sub);
    const { id: invoiceNumber } = req.params;

    // Extract supplier_order_id from invoice number (format: INV-XXXX)
    const supplierOrderId = parseInt(invoiceNumber.replace('INV-', ''));

    // 1. Get Invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, supplier_id, supplier_order_id, amount, issue_date, due_date, status, payment_date')
      .eq('supplier_id', supplierId)
      .eq('supplier_order_id', supplierOrderId)
      .single();

    if (invoiceError || !invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // 2. Get Purchase Order
    let purchaseOrder = null;
    if (invoice.supplier_order_id) {
      const { data: po, error: poError } = await supabase
        .from('supplier_orders')
        .select(`
          *,
          products (
            productName
          )
        `)
        .eq('id', invoice.supplier_order_id)
        .single();
      
      if (!poError) {
        purchaseOrder = po;
      }
    }

    // Format the response
    const formattedInvoice = {
      id: `INV-${String(invoice.supplier_order_id).padStart(4, '0')}`,
      orderId: invoice.supplier_order_id ? `SO-${String(invoice.supplier_order_id).padStart(4, '0')}` : 'N/A',
      amount: parseFloat(invoice.amount),
      date: new Date(invoice.issue_date).toLocaleDateString(),
      dueDate: new Date(invoice.due_date).toLocaleDateString(),
      status: invoice.status === 'Paid' ? 'Paid' : 'Pending',
      paymentDate: invoice.payment_date ? new Date(invoice.payment_date).toLocaleDateString() : null,
      items: purchaseOrder ? [{
        product: purchaseOrder.products?.productName || 'Unknown Product',
        quantity: purchaseOrder.quantity,
        unitPrice: parseFloat(purchaseOrder.total_price) / purchaseOrder.quantity,
        total: parseFloat(purchaseOrder.total_price)
      }] : []
    };

    res.status(200).json({
      success: true,
      invoice: formattedInvoice
    });

  } catch (error) {
    console.error('Get invoice details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice details'
    });
  }
};

// Dashboard methods
exports.getDashboardStats = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;

    // Get total products supplied (distinct products with completed orders)
    const { data: totalProductsData, error: totalProductsError } = await supabase
      .from('supplier_orders')
      .select('product_id')
      .eq('supplier_id', supplierId)
      .eq('status', 'Completed');

    if (totalProductsError) throw totalProductsError;

    const totalProductsSupplied = new Set(totalProductsData.map(item => item.product_id)).size;

    // Get pending supply orders
    const { count: pendingOrdersCount, error: pendingError } = await supabase
      .from('supplier_orders')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .in('status', ['Pending', 'Accepted']);

    if (pendingError) throw pendingError;

    // Get completed supplies
    const { count: completedCount, error: completedError } = await supabase
      .from('supplier_orders')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .eq('status', 'Completed');

    if (completedError) throw completedError;

    // Get total earnings (sum of completed purchase orders)
    const { data: earningsData, error: earningsError } = await supabase
      .from('supplier_orders')
      .select('total_price')
      .eq('supplier_id', supplierId)
      .eq('status', 'Completed');

    if (earningsError) throw earningsError;

    const totalEarnings = earningsData.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

    // Get new purchase requests (orders from last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: newRequestsCount, error: newRequestsError } = await supabase
      .from('supplier_orders')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (newRequestsError) throw newRequestsError;

    const stats = {
      totalProductsSupplied,
      pendingSupplyOrders: pendingOrdersCount || 0,
      completedSupplies: completedCount || 0,
      totalEarnings,
      newPurchaseRequests: newRequestsCount || 0
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

exports.getRecentSupplyOrders = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;

    // Get recent purchase orders with product details
    const { data: ordersData, error: ordersError } = await supabase
      .from('supplier_orders')
      .select(`
        id,
        quantity,
        total_price,
        status,
        order_date,
        products (
          productName,
          sku,
          category
        )
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) throw ordersError;

    // Format the orders
    const orders = ordersData.map(order => ({
      id: order.id,
      orderNumber: `SO-${order.id.toString().padStart(6, '0')}`,
      customerName: 'Admin', // Since it's admin ordering from supplier
      items: [{
        productName: order.products.productName,
        quantity: order.quantity,
        price: parseFloat(order.total_price) / order.quantity // Calculate unit price for display
      }],
      total: parseFloat(order.total_price),
      status: order.status.toLowerCase(),
      date: new Date(order.order_date).toLocaleDateString()
    }));

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get recent supply orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent supply orders'
    });
  }
};

exports.getLowStockRequests = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;

    // Get products supplied by this supplier that are low in stock
    const { data: suppliedProducts, error: suppliedError } = await supabase
      .from('supplier_orders')
      .select('product_id')
      .eq('supplier_id', supplierId);

    if (suppliedError) throw suppliedError;

    const productIds = [...new Set(suppliedProducts.map(po => po.product_id))];

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        requests: []
      });
    }

    // Get products with low stock
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('id, productName, sku, category, stock, status')
      .in('id', productIds)
      .or('stock.lt.10,status.eq.Out of Stock');

    if (lowStockError) throw lowStockError;

    const requests = lowStockProducts.map(product => ({
      id: product.id,
      productName: product.productName,
      sku: product.sku,
      category: product.category,
      currentStock: product.stock,
      status: product.status,
      lastUpdated: new Date().toISOString() // Since updated_at not used, use current
    }));

    res.status(200).json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Get low stock requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock requests'
    });
  }
};

exports.getOrderTrends = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;

    // Get monthly order trends for the last 12 months
    const trends = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed

      // Get orders for this month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 1);

      const { count: orderCount, error } = await supabase
        .from('supplier_orders')
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', supplierId)
        .gte('created_at', startOfMonth.toISOString())
        .lt('created_at', endOfMonth.toISOString());

      if (error) throw error;

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      trends.push({
        month: monthNames[month - 1],
        year: year,
        orders: orderCount || 0
      });
    }

    res.status(200).json({
      success: true,
      trends
    });

  } catch (error) {
    console.error('Get order trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order trends'
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;

    // Fetch messages from supplier_contact_form where response is not null
    const { data: notifications, error } = await supabase
      .from('supplier_contact_form')
      .select('*')
      .eq('supplier_id', supplierId)
      .not('response', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};