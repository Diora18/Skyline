const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  deadline: { type: Date },
  linkedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

projectSchema.index({ status: 1 });
projectSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Project', projectSchema);
