const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['gala', 'fundraiser', 'meeting', 'workshop', 'social'], required: true },
  bannerImage: { type: String, default: '' },
  venue: { type: String, required: true },
  address: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  memberPrice: { type: Number, default: 0 },     // 0 = free for members
  nonMemberPrice: { type: Number, default: 0 },   // 0 = free for non-members
  capacity: { type: Number, default: null },       // null = unlimited
  ticketsSold: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // per-event managers with scoped admin access
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  linkedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
}, { timestamps: true });

eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
