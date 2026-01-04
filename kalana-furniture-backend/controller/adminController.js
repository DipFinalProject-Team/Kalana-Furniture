const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/supabaseClient');
const https = require('https');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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