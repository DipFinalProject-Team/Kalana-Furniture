const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.register = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, password, categories, message } = req.body;

    // Validate input
    if (!companyName || !contactPerson || !email || !password || !categories) {
      return res.status(400).json({
        success: false,
        message: 'Company name, contact person, email, password, and categories are required'
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
        company_name: companyName,
        contact_person: contactPerson,
        email: email,
        phone: phone,
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
        companyName: supplierData.company_name,
        contactPerson: supplierData.contact_person,
        email: supplierData.email,
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
        contactPerson: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        categories: supplier.categories,
        status: supplier.status
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
        contactPerson: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        categories: supplier.categories,
        status: supplier.status
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