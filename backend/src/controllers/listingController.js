const pool = require('../config/db');

// CREATE LISTING (farmers only)
exports.createListing = async (req, res) => {
  const { crop_type, quantity_kg, price_per_kg, harvest_date } = req.body;
  const farmer_id = req.user.userId;
  const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

  try {
    if (!crop_type || !quantity_kg || !price_per_kg) {
      return res.status(400).json({ error: 'Crop type, quantity, and price are required.' });
    }

    const result = await pool.query(
      `INSERT INTO produce_listings
         (farmer_id, crop_type, quantity_kg, price_per_kg, harvest_date, photos)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [farmer_id, crop_type, quantity_kg, price_per_kg, harvest_date || null, photos]
    );

    res.status(201).json({
      message: 'Listing created successfully!',
      listing: result.rows[0]
    });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Could not create listing.' });
  }
};

// GET ALL LISTINGS (buyers browse this)
exports.getAllListings = async (req, res) => {
  const { crop, district, min_price, max_price } = req.query;
  try {
    let query = `
      SELECT
        pl.*,
        u.name AS farmer_name,
        f.district,
        f.sector,
        f.is_id_verified
      FROM produce_listings pl
      JOIN users u ON pl.farmer_id = u.user_id
      JOIN farmers f ON pl.farmer_id = f.farmer_id
      WHERE pl.status = 'active'
    `;
    const params = [];

    if (crop) {
      params.push(`%${crop}%`);
      query += ` AND pl.crop_type ILIKE $${params.length}`;
    }
    if (district) {
      params.push(`%${district}%`);
      query += ` AND f.district ILIKE $${params.length}`;
    }
    if (min_price) {
      params.push(min_price);
      query += ` AND pl.price_per_kg >= $${params.length}`;
    }
    if (max_price) {
      params.push(max_price);
      query += ` AND pl.price_per_kg <= $${params.length}`;
    }

    query += ' ORDER BY pl.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ listings: result.rows, count: result.rows.length });

  } catch (err) {
    console.error('Get listings error:', err);
    res.status(500).json({ error: 'Could not fetch listings.' });
  }
};

// GET MY LISTINGS (farmer sees their own)
exports.getMyListings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM produce_listings
       WHERE farmer_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json({ listings: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch your listings.' });
  }
};

// UPDATE LISTING (farmer edits price/quantity)
exports.updateListing = async (req, res) => {
  const { listing_id } = req.params;
  const { quantity_kg, price_per_kg } = req.body;
  try {
    const result = await pool.query(
      `UPDATE produce_listings
       SET quantity_kg = $1, price_per_kg = $2
       WHERE listing_id = $3 AND farmer_id = $4
       RETURNING *`,
      [quantity_kg, price_per_kg, listing_id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or not yours.' });
    }
    res.json({ listing: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Could not update listing.' });
  }
};

// DELETE LISTING
exports.deleteListing = async (req, res) => {
  const { listing_id } = req.params;
  try {
    await pool.query(
      `UPDATE produce_listings SET status = 'deleted'
       WHERE listing_id = $1 AND farmer_id = $2`,
      [listing_id, req.user.userId]
    );
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete listing.' });
  }
};