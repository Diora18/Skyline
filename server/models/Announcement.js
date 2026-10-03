const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  category: { type: String, enum: ['meeting', 'deadline', 'update', 'urgent'], required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emailSent: { type: Boolean, default: false },  // whether email blast was triggered
}, { timestamps: true });

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ category: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
