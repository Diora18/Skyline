const mongoose = require('mongoose');

const eventVolunteerSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  responsibilities: [{ type: String, trim: true }],
  appliedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date, default: null },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

eventVolunteerSchema.index({ event: 1, user: 1 }, { unique: true });
eventVolunteerSchema.index({ event: 1, status: 1 });
eventVolunteerSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('EventVolunteer', eventVolunteerSchema);
