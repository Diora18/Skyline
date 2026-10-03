const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  basePrice: { type: Number, required: true },
  category: { type: String, enum: ['hoodie', 'tshirt', 'cap', 'sticker', 'other'], required: true },
  variants: [{
    size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE'], required: true },
    color: { type: String, default: 'Default' },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ isActive: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
