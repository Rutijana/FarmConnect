const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const {
  placeOrder, respondToOrder, makePayment,
  confirmDelivery, raiseDispute, getMyOrders
} = require('../controllers/orderController');

router.get('/my', authenticate, getMyOrders);
router.post('/', authenticate, authorizeRole('buyer'), placeOrder);
router.put('/respond', authenticate, authorizeRole('farmer'), respondToOrder);
router.post('/pay', authenticate, authorizeRole('buyer'), makePayment);
router.put('/confirm-delivery', authenticate, authorizeRole('buyer'), confirmDelivery);
router.post('/dispute', authenticate, raiseDispute);

module.exports = router;