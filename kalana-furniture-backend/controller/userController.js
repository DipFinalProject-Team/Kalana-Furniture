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
