const supabase = require('../config/supabaseClient');

exports.submitContactForm = async (req, res) => {
  try {
    const { first_name, last_name, mobile_number, email, message, user_id } = req.body;

    if (!first_name || !last_name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('customer_contact_form')
      .insert([{
        user_id: user_id || null,
        first_name,
        last_name,
        mobile_number,
        email,
        message
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Message sent successfully', data });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
