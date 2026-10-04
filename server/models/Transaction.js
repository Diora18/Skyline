const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, enum: ['dues', 'ticket_sale', 'merch_sale', 'reimbursement', 'other'], required: true },
  amount: { type: Number, required: true, min: 0 },  // always positive, type determines +/-
  description: { type: String, required: true },
  referenceModel: { type: String, enum: ['User', 'Ticket', 'Order', 'Expense', null], default: null },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

transactionSchema.index({ type: 1, category: 1 });
transactionSchema.index({ createdAt: 1 });
transactionSchema.index({ referenceId: 1, referenceModel: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
