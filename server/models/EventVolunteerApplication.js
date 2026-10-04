const mongoose = require('mongoose');

const eventVolunteerApplicationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  responsibility: { type: String, trim: true, maxlength: 120, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

eventVolunteerApplicationSchema.index({ event: 1, user: 1 }, { unique: true });
eventVolunteerApplicationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('EventVolunteerApplication', eventVolunteerApplicationSchema);
