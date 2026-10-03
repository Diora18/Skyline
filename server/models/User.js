const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },  // hashed, excluded from queries by default
  phone: { type: String, default: '' },
  studentId: { type: String, required: true, unique: true, trim: true },  // university roll number
  major: { type: String, default: '' },
  graduationYear: { type: Number },
  profileImage: { type: String, default: '' },
  role: { type: String, enum: ['student', 'treasurer', 'officer'], default: 'student' },
  membershipStatus: { type: String, enum: ['none', 'active', 'expired'], default: 'none' },
  membershipPaidAt: { type: Date, default: null },
  membershipExpiresAt: { type: Date, default: null },
}, { timestamps: true });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
