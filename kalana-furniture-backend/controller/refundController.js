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

exports.getAllRefundRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('refund_requests')
      .select(`
        refund_request_id,
        order_id,
        user_id,
        message,
        response,
        created_at,
        orders!inner (
          total,
          delivery_name,
          delivery_email,
          delivery_phone
        ),
        users!inner (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match the expected format
    const transformedData = data.map(refund => ({
      id: refund.refund_request_id,
      order_id: refund.order_id,
      user_id: refund.user_id,
      first_name: refund.orders.delivery_name.split(' ')[0] || '',
      last_name: refund.orders.delivery_name.split(' ').slice(1).join(' ') || '',
      email: refund.orders.delivery_email,
      mobile_number: refund.orders.delivery_phone,
      amount: refund.orders.total,
      reason: refund.message,
      response: refund.response,
      status: refund.response ? 'Resolved' : 'Pending',
      created_at: refund.created_at
    }));

    res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund requests'
    });
  }
};

exports.updateRefundRequestStatus = async (req, res) => {
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
    const updateData = {};
    if (response !== undefined) {
      updateData.response = response;
    }

    // Update refund request response
    const { data, error } = await supabase
      .from('refund_requests')
      .update(updateData)
      .eq('refund_request_id', id)
      .select(`
        refund_request_id,
        order_id,
        user_id,
        message,
        response,
        created_at,
        orders!inner (
          total,
          delivery_name,
          delivery_email,
          delivery_phone
        ),
        users!inner (
          name,
          email
        )
      `);

    if (error) {
      console.error('Update refund request error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update refund request'
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    // Transform the updated data
    const refund = data[0];
    const transformedData = {
      id: refund.refund_request_id,
      order_id: refund.order_id,
      user_id: refund.user_id,
      first_name: refund.orders.delivery_name.split(' ')[0] || '',
      last_name: refund.orders.delivery_name.split(' ').slice(1).join(' ') || '',
      email: refund.orders.delivery_email,
      mobile_number: refund.orders.delivery_phone,
      amount: refund.orders.total,
      reason: refund.message,
      response: refund.response,
      status: refund.response ? 'Resolved' : 'Pending',
      created_at: refund.created_at
    };

    res.status(200).json({
      success: true,
      message: 'Refund request updated successfully',
      data: transformedData
    });
  } catch (error) {
    console.error('Update refund request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update refund request: ' + error.message
    });
  }
};
