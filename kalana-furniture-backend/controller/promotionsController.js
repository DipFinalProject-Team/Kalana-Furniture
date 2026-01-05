const supabase = require('../config/supabaseClient');

exports.getAllPromotions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getActivePromotions = async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', currentDate)
      .gte('end_date', currentDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Promotion not found' });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPromotion = async (req, res) => {
  try {
    const promotionData = req.body;

    // Prepare promotion object
    const promotion = {
      code: promotionData.code || null, // Allow null for general discounts
      description: promotionData.description,
      type: promotionData.type,
      value: promotionData.value,
      start_date: promotionData.startDate,
      end_date: promotionData.endDate,
      applies_to: promotionData.appliesTo,
      is_active: promotionData.isActive,
    };

    // Validate required fields
    if (!promotion.description || !promotion.type || promotion.value == null) {
      return res.status(400).json({ error: 'Description, type, and value are required' });
    }

    // For general discounts (no code), only allow percentage type
    if (!promotion.code && promotion.type !== 'percentage') {
      return res.status(400).json({ error: 'General discounts can only be percentage-based' });
    }

    // For discount codes, code is required
    if (promotion.code && !promotion.code.trim()) {
      return res.status(400).json({ error: 'Discount code cannot be empty' });
    }

    const { data, error } = await supabase
      .from('promotions')
      .insert([promotion])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      // Handle unique constraint violation for code
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Discount code already exists' });
      }
      throw error;
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Promotion creation failed:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotionData = req.body;

    const updates = {
      code: promotionData.code || null,
      description: promotionData.description,
      type: promotionData.type,
      value: promotionData.value,
      start_date: promotionData.startDate,
      end_date: promotionData.endDate,
      applies_to: promotionData.appliesTo,
      is_active: promotionData.isActive,
      updated_at: new Date().toISOString(),
    };

    // Validate required fields
    if (!updates.description || !updates.type || updates.value == null) {
      return res.status(400).json({ error: 'Description, type, and value are required' });
    }

    // For general discounts (no code), only allow percentage type
    if (!updates.code && updates.type !== 'percentage') {
      return res.status(400).json({ error: 'General discounts can only be percentage-based' });
    }

    // For discount codes, code is required
    if (updates.code && !updates.code.trim()) {
      return res.status(400).json({ error: 'Discount code cannot be empty' });
    }

    const { data, error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      // Handle unique constraint violation for code
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Discount code already exists' });
      }
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Promotion update failed:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    res.status(200).json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Promotion deletion failed:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.togglePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // First get current status
    const { data: current, error: fetchError } = await supabase
      .from('promotions')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!current) return res.status(404).json({ error: 'Promotion not found' });

    // Toggle status
    const { data, error } = await supabase
      .from('promotions')
      .update({ is_active: !current.is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};