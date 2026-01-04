const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.register = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, password, categories, message } = req.body;

    // Validate input
    if (!companyName || !contactPerson || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Company name, contact person, email, and password are required'
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

exports.updateProfile = async (req, res) => {
  try {
    const supplierId = req.supplier.sub;
    const { companyName, contactPerson, phone, categories, message } = req.body;

    const { data: updatedSupplier, error } = await supabase
      .from('suppliers')
      .update({
        company_name: companyName,
        contact_person: contactPerson,
        phone: phone,
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
        contactPerson: updatedSupplier.contact_person,
        email: updatedSupplier.email,
        phone: updatedSupplier.phone,
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