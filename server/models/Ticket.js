const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketCode: { type: String, required: true, unique: true },  // e.g., 'TKT-2026-0042'
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketType: { type: String, enum: ['member', 'non-member'], required: true },
  price: { type: Number, required: true },  // actual price paid at time of purchase
  status: { type: String, enum: ['valid', 'used', 'cancelled'], default: 'valid' },
  checkedInAt: { type: Date, default: null },  // set when scanned at door
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
}, { timestamps: true });

ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
