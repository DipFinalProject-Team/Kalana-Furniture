const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          phone: phone,
          address: address
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError.message);
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // If user is created but needs email confirmation
    if (authData.user && !authData.session) {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to confirm your account.',
        requiresConfirmation: true
      });
    }

    // If user is created and session exists, create profile in users table
    if (authData.user && authData.session) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: name,
          email: email,
          phone: phone,
          address: address,
          role: 'customer'
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError.message);
        // Don't fail registration if profile creation fails
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token: authData.session.access_token,
        user: {
          id: authData.user.id,
          name: name,
          email: email,
          phone: phone,
          address: address,
          profile_picture: null,
          role: 'customer'
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
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

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Auth error:', authError.message);
      return res.status(401).json({
        success: false,
        message: authError.message || 'Invalid credentials'
      });
    }

    // Get user profile from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('User profile error:', userError.message);
      // Create profile if it doesn't exist
      const { error: createError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: authData.user.user_metadata?.name || 'User',
          email: authData.user.email,
          role: 'customer'
        }]);

      if (createError) {
        console.error('Profile creation error:', createError.message);
      }

      // Return with basic user data
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: authData.session.access_token,
        user: {
          id: authData.user.id,
          name: authData.user.user_metadata?.name || 'User',
          email: authData.user.email,
          profile_picture: null,
          role: 'customer'
        }
      });
    }

    // Return successful login
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: authData.session.access_token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        profile_picture: userData.profile_picture,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
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

    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Get user profile
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    res.status(200).json({
      success: true,
      user: {
        id: userData?.id || user.id,
        name: userData?.name || user.user_metadata?.name,
        email: userData?.email || user.email,
        phone: userData?.phone,
        address: userData?.address,
        profile_picture: userData?.profile_picture,
        role: userData?.role || 'customer'
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
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await supabase.auth.signOut(token);
    }
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

exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUserProfile = async (req, res) => {
  try {
    const { id, name, email, role } = req.body; // id should match auth.users id
    const { data, error } = await supabase
      .from('users')
      .insert([{ id, name, email, role: role || 'customer' }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { name, phone, address, email } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (email !== undefined) updates.email = email;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ success: true, user: data[0], message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    // Get user from Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const cloudinary = require('../config/cloudinary');
    const streamifier = require('streamifier');

    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'kalana-furniture/profiles' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    const imageUrl = await uploadToCloudinary(req.file.buffer);

    // Update user profile with image URL
    const { data, error } = await supabase
      .from('users')
      .update({ profile_picture: imageUrl })
      .eq('id', userId)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      imageUrl: imageUrl,
      user: data[0]
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
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

    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      console.error('Forgot password error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to send reset email. Please check your email address.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link to it.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, accessToken, refreshToken } = req.body;

    if (!password || !accessToken || !refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Password, access token, and refresh token are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Set the session with the tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link'
      });
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(400).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Get user data from database to verify current password
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password by attempting to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: currentPassword
    });

    if (signInError) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(400).json({
        success: false,
        message: 'Failed to update password'
      });
    }

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
