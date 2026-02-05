const supabase = require('../config/supabaseClient');

exports.submitSupplierContactForm = async (req, res) => {
  try {
    const { supplier_id, message } = req.body;

    if (!supplier_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('supplier_contact_form')
      .insert([{
        supplier_id,
        message
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Message sent successfully', data });
  } catch (error) {
    console.error('Error submitting supplier contact form:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
