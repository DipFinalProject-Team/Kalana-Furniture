const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createAdmin = async () => {
  const email = 'admin@kalana.com';
  const password = 'admin123';

  console.log(`Setting up admin user: ${email}`);

  // Check if user exists in auth
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (!signInError && signInData.user) {
    console.log('User exists and can sign in. ID:', signInData.user.id);
    await setAdminRole(signInData.user.id, email);
    return;
  }

  // If sign in failed, try to sign up
  console.log('User not found or password incorrect. Attempting to sign up...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    // If user already exists, we can't update password here
    // Let's check if user exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('User exists in database but auth sign in failed. This might be due to email confirmation.');
      console.log('For development, you may need to confirm the email in Supabase dashboard or disable email confirmation.');
    } else {
      console.log('User does not exist in database. Let me try to find the user ID from auth and create the database entry.');
      // Try to get user from auth.users (this requires admin privileges)
      try {
        // For development, let's try to sign in with a different approach
        console.log('Attempting to find existing auth user...');
        // Since we can't query auth.users directly, let's try to sign in with the password
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: 'admin123' // Try with admin123 as mentioned by user
        });

        if (!signInError && signInData.user) {
          console.log('Found existing user with admin123 password. Setting admin role...');
          await setAdminRole(signInData.user.id, email);
          return;
        }

        // If admin123 doesn't work, try admin2004
        const { data: signInData2, error: signInError2 } = await supabase.auth.signInWithPassword({
          email,
          password: 'admin2004'
        });

        if (!signInError2 && signInData2.user) {
          console.log('Found existing user with admin2004 password. Setting admin role...');
          await setAdminRole(signInData2.user.id, email);
          return;
        }

        console.log('Could not find existing user. You may need to:');
        console.log('1. Delete the user from Supabase Auth dashboard');
        console.log('2. Or manually create the user entry in the users table');
        console.log('3. Or confirm the email in Supabase Auth');

      } catch (e) {
        console.log('Could not find existing user. You may need to manually create the admin user.');
      }
    }
    return;
  }

  if (authData.user) {
    console.log('Auth user created:', authData.user.id);
    await setAdminRole(authData.user.id, email);
  }
};

const setAdminRole = async (userId, email) => {
  // 2. Insert or Update public.users with role 'admin'
  const { data, error } = await supabase
    .from('users')
    .upsert([
      { 
        id: userId, 
        email: email, 
        role: 'admin',
        name: 'Admin User'
      }
    ])
    .select();

  if (error) {
    console.error('Error setting admin role:', error.message);
  } else {
    console.log('Admin role set successfully for user:', data[0]);
  }
};

createAdmin();
