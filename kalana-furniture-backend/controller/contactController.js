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
        message,
        status: 'Pending'
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

exports.getAllContactForms = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer_contact_form')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching contact forms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact forms'
    });
  }
};

exports.updateContactFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending or Resolved.'
      });
    }

    // Update contact form status
    const { data, error } = await supabase
      .from('customer_contact_form')
      .update({ status: status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update contact form status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update contact form status'
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    res.status(200).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Update contact form status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact form status: ' + error.message
    });
  }
};

exports.updateContactFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    // Validate status
    if (!['Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending or Resolved.'
      });
    }

    // Prepare update data
    const updateData = { status };
    if (response !== undefined) {
      updateData.response = response;
    }

    // Update contact form status and response
    const { data, error } = await supabase
      .from('customer_contact_form')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update contact form status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update contact form status'
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact form updated successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('Update contact form status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact form status: ' + error.message
    });
  }
};
