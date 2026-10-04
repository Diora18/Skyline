const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },  // e.g., 'ORD-2026-0015'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: {
    size: { type: String, required: true },
    color: { type: String, default: 'Default' },
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  totalPrice: { type: Number, required: true },  // basePrice * quantity
  status: { type: String, enum: ['placed', 'confirmed', 'ready', 'collected', 'cancelled'], default: 'placed' },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
}, { timestamps: true });

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
