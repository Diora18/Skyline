const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/razorpay/create-order', auth, paymentController.createRazorpayOrder);
router.post('/razorpay/verify', auth, paymentController.verifyRazorpayPayment);

module.exports = router;
