const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/create-order', auth, paymentController.createRazorpayOrder);
router.post('/verify', auth, paymentController.verifyPaymentSignature);
router.post('/webhook', paymentController.handleRazorpayWebhook);

module.exports = router;
