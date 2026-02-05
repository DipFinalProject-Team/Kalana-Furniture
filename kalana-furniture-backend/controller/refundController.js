const supabase = require('../config/supabaseClient');

exports.createRefundRequest = async (req, res) => {
  try {
    const { order_id, user_id, message } = req.body;

    if (!order_id || !user_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('refund_requests')
      .insert([{
        order_id,
        user_id,
        message,
        response: null // Response column is initially empty
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Refund request created successfully', data });
  } catch (error) {
    console.error('Error creating refund request:', error);
    res.status(500).json({ error: 'Failed to create refund request' });
  }
};
