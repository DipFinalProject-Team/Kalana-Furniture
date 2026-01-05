const supabase = require('./config/supabaseClient');

async function updateUsersTable() {
  try {
    console.log('Updating users table with new columns...');

    // Add phone column if it doesn't exist
    const { error: phoneError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;`
    });

    if (phoneError) {
      console.error('Error adding phone column:', phoneError);
    } else {
      console.log('Phone column added successfully');
    }

    // Add address column if it doesn't exist
    const { error: addressError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address text;`
    });

    if (addressError) {
      console.error('Error adding address column:', addressError);
    } else {
      console.log('Address column added successfully');
    }

    // Add profile_picture column if it doesn't exist
    const { error: profilePicError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture text;`
    });

    if (profilePicError) {
      console.error('Error adding profile_picture column:', profilePicError);
    } else {
      console.log('Profile picture column added successfully');
    }

    console.log('Users table update completed!');
  } catch (error) {
    console.error('Failed to update users table:', error);
  }
}

updateUsersTable();