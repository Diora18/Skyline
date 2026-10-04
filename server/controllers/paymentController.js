/**
 * server/controllers/paymentController.js
 * Razorpay Payment Gateway Controller (Demo / Sandbox integration)
 */

const crypto = require('crypto');

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', description = 'Skyline SSA Payment', itemType = 'general', itemId = null } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Valid payment amount is required.',
      });
    }

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);
    const orderId = `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_skylineSSA2026';

    return res.status(200).json({
      success: true,
      data: {
        orderId,
        amount: amountInPaise,
        currency,
        keyId: razorpayKeyId,
        description,
        itemType,
        itemId,
      },
      message: 'Razorpay order created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Unable to create Razorpay order.',
    });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentMethod = 'upi',
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Missing required Razorpay payment verification details.',
      });
    }

    // Generate mock verification signature for sandbox testing
    const paymentId = razorpay_payment_id || `pay_${Date.now()}`;
    const timestamp = new Date().toISOString();

    return res.status(200).json({
      success: true,
      data: {
        paymentId,
        orderId: razorpay_order_id,
        signatureVerified: true,
        paymentMethod,
        timestamp,
        status: 'captured',
      },
      message: 'Razorpay payment verified successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Razorpay payment verification failed.',
    });
  }
};
