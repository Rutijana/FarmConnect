const pool = require('../config/db');

// PLACE ORDER (buyer)
exports.placeOrder = async (req, res) => {
  const { listing_id, quantity_kg } = req.body;
  const buyer_id = req.user.userId;

  try {
    const listing = await pool.query(
      'SELECT * FROM produce_listings WHERE listing_id = $1 AND status = $2',
      [listing_id, 'active']
    );
    if (listing.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or no longer available.' });
    }

    const l = listing.rows[0];
    if (parseFloat(quantity_kg) > parseFloat(l.quantity_kg)) {
      return res.status(400).json({
        error: `Only ${l.quantity_kg} kg available. You requested ${quantity_kg} kg.`
      });
    }

    const total_amount = parseFloat(quantity_kg) * parseFloat(l.price_per_kg);

    const order = await pool.query(
      `INSERT INTO orders (listing_id, buyer_id, farmer_id, quantity_kg, total_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [listing_id, buyer_id, l.farmer_id, quantity_kg, total_amount]
    );

    res.status(201).json({
      message: 'Order placed! Waiting for farmer to accept.',
      order: order.rows[0]
    });
  } catch (err) {
    console.error('Place order error:', err);
    res.status(500).json({ error: 'Could not place order.' });
  }
};

// ACCEPT OR REJECT ORDER (farmer)
exports.respondToOrder = async (req, res) => {
  const { order_id, action } = req.body;
  const farmer_id = req.user.userId;

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be "accept" or "reject".' });
  }

  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1 AND farmer_id = $2 AND status = $3',
      [order_id, farmer_id, 'pending']
    );
    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or already responded to.' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const result = await pool.query(
      `UPDATE orders
       SET status = $1, accepted_at = NOW()
       WHERE order_id = $2
       RETURNING *`,
      [newStatus, order_id]
    );

    const msg = action === 'accept'
      ? 'Order accepted! Buyer will now make payment.'
      : 'Order rejected.';

    res.json({ message: msg, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Could not respond to order.' });
  }
};

// SIMULATE PAYMENT (in production this calls MTN/Airtel API)
exports.makePayment = async (req, res) => {
  const { order_id, provider } = req.body;
  const buyer_id = req.user.userId;

  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1 AND buyer_id = $2 AND status = $3',
      [order_id, buyer_id, 'accepted']
    );
    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or not yet accepted by farmer.' });
    }

    const o = order.rows[0];
    const fee = parseFloat(o.total_amount) * (parseFloat(process.env.PLATFORM_FEE_PERCENT) / 100);
    const payout = parseFloat(o.total_amount) - fee;

    // Create escrow payment record
    await pool.query(
      `INSERT INTO payments
         (order_id, amount, escrow_status, provider, platform_fee, farmer_payout)
       VALUES ($1, $2, 'locked', $3, $4, $5)`,
      [order_id, o.total_amount, provider || 'test', fee, payout]
    );

    await pool.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2',
      ['paid', order_id]
    );

    res.json({
      message: 'Payment locked in escrow. Deliver the goods and buyer will confirm.',
      amount: o.total_amount,
      escrow_status: 'locked'
    });
  } catch (err) {
    res.status(500).json({ error: 'Payment failed.' });
  }
};

// CONFIRM DELIVERY (buyer — releases escrow)
exports.confirmDelivery = async (req, res) => {
  const { order_id } = req.body;
  const buyer_id = req.user.userId;

  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1 AND buyer_id = $2 AND status = $3',
      [order_id, buyer_id, 'paid']
    );
    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or payment not yet made.' });
    }

    await pool.query(
      `UPDATE orders SET status = 'completed', delivered_at = NOW() WHERE order_id = $1`,
      [order_id]
    );

    await pool.query(
      `UPDATE payments SET escrow_status = 'released' WHERE order_id = $1`,
      [order_id]
    );

    const payment = await pool.query(
      'SELECT farmer_payout FROM payments WHERE order_id = $1', [order_id]
    );

    res.json({
      message: 'Delivery confirmed! Payment released to farmer.',
      farmer_payout: payment.rows[0]?.farmer_payout
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not confirm delivery.' });
  }
};

// RAISE DISPUTE
exports.raiseDispute = async (req, res) => {
  const { order_id, reason } = req.body;
  try {
    // Freeze escrow
    await pool.query(
      `UPDATE payments SET escrow_status = 'pending' WHERE order_id = $1`, [order_id]
    );
    await pool.query(
      `UPDATE orders SET status = 'disputed' WHERE order_id = $1`, [order_id]
    );
    await pool.query(
      `INSERT INTO disputes (order_id, raised_by, reason) VALUES ($1, $2, $3)`,
      [order_id, req.user.userId, reason]
    );
    res.json({ message: 'Dispute raised. An admin will review within 48 hours.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not raise dispute.' });
  }
};

// GET MY ORDERS
exports.getMyOrders = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  try {
    const field = role === 'buyer' ? 'buyer_id' : 'farmer_id';
    const result = await pool.query(
      `SELECT o.*, pl.crop_type, u.name AS other_party_name
       FROM orders o
       JOIN produce_listings pl ON o.listing_id = pl.listing_id
       JOIN users u ON u.user_id = (CASE WHEN o.buyer_id = $1 THEN o.farmer_id ELSE o.buyer_id END)
       WHERE o.${field} = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch orders.' });
  }
};