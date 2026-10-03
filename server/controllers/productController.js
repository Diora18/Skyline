const Product = require('../models/Product');

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

    if (!name || basePrice === undefined || !category) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Name, basePrice, and category are required',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description || '',
      image: image || '',
      basePrice: Number(basePrice),
      category,
      variants: Array.isArray(variants) && variants.length > 0
        ? variants
        : [{ size: 'ONE_SIZE', color: 'Default', stock: 10, sold: 0 }],
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

    if (variantIndex === undefined || stock === undefined) {
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
