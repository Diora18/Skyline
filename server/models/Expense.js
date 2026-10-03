const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['supplies', 'food', 'decorations', 'transport', 'venue', 'other'], required: true },
  description: { type: String, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  linkedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  receiptUrl: { type: String, default: '' },  // URL or file path to uploaded receipt image
  status: { type: String, enum: ['submitted', 'approved', 'rejected', 'reimbursed'], default: 'submitted' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });

expenseSchema.index({ status: 1 });
expenseSchema.index({ submittedBy: 1 });
expenseSchema.index({ event: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
