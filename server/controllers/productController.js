const Product = require('../models/Product');
const { isNonNegativeNumber, isNonNegativeInteger, isValidUrl } = require('../utils/validation');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, active } = req.query;
    const query = {};

    if (active !== undefined) {
      query.isActive = active === 'true';
    } else {
      query.isActive = true; // Default to active products for public store
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { products },
      message: 'Products fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching products',
    });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
      message: 'Product fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching product',
    });
  }
};

// POST /api/products (Officer only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, image, basePrice, category, variants } = req.body;

    if (!name || String(name).trim().length > 160 || String(description || '').length > 3000 ||
        basePrice === undefined || !isNonNegativeNumber(basePrice) || !category ||
        (image && !isValidUrl(image)) || (variants !== undefined && !Array.isArray(variants))) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Name, basePrice, and category are required',
      });
    }

    const normalizedVariants = Array.isArray(variants) && variants.length > 0 ? variants : [{ size: 'ONE_SIZE', color: 'Default', stock: 10, sold: 0 }];
    if (normalizedVariants.some((variant) =>
      !variant || typeof variant.size !== 'string' ||
      !Number.isInteger(Number(variant.stock ?? 0)) || Number(variant.stock ?? 0) < 0 ||
      !Number.isInteger(Number(variant.sold ?? 0)) || Number(variant.sold ?? 0) < 0
    )) {
      return res.status(400).json({ success: false, data: null, message: 'Each product variant must have valid non-negative integer stock and sold values.' });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description || '',
      image: image || '',
      basePrice: Number(basePrice),
      category,
      variants: normalizedVariants,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: { product },
      message: 'Product created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error creating product',
    });
  }
};

// PATCH /api/products/:id (Officer only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Product not found',
      });
    }

    const { name, description, image, basePrice, category, variants } = req.body;
    const validCategories = ['hoodie', 'tshirt', 'cap', 'sticker', 'other'];
    if ((name !== undefined && (!String(name).trim() || String(name).length > 160)) ||
        (description !== undefined && String(description).length > 3000) ||
        (image !== undefined && image && !isValidUrl(image)) ||
        (basePrice !== undefined && !isNonNegativeNumber(basePrice)) ||
        (category !== undefined && !validCategories.includes(category)) ||
        (variants !== undefined && (!Array.isArray(variants) || variants.some((variant) =>
          !variant || typeof variant.size !== 'string' ||
          !isNonNegativeInteger(variant.stock ?? 0) || !isNonNegativeInteger(variant.sold ?? 0)
        )))) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid product details.' });
    }

    const allowedUpdates = ['name', 'description', 'image', 'basePrice', 'category', 'variants', 'isActive'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      data: { product },
      message: 'Product updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error updating product',
    });
  }
};

// PATCH /api/products/:id/stock (Officer only: update specific variant stock)
exports.updateVariantStock = async (req, res) => {
  try {
    const { variantIndex, stock } = req.body;

    if (variantIndex === undefined || stock === undefined ||
        !Number.isInteger(Number(variantIndex)) || Number(variantIndex) < 0 ||
        !isNonNegativeInteger(stock)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Both 'variantIndex' and 'stock' (number) are required",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Product not found',
      });
    }

    if (!product.variants[variantIndex]) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Variant at index ${variantIndex} does not exist`,
      });
    }

    product.variants[variantIndex].stock = Math.max(0, Number(stock));
    await product.save();

    res.status(200).json({
      success: true,
      data: { product },
      message: 'Variant stock updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error updating variant stock',
    });
  }
};
