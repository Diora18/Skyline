const Order = require('../models/Order');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { generateOrderNumber } = require('../utils/generateCode');

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { productId, variant, quantity = 1 } = req.body;

    if (!productId || !variant || !variant.size) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'productId and variant (with size) are required to place an order.',
      });
    }

    // Verify active membership
    if (req.user.membershipStatus !== 'active') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Exclusive Access: Merchandise ordering is reserved for active Skyline members.',
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Product is not available for purchase.',
      });
    }

    // Match variant by size and (optional) color
    const matchedVariant = product.variants.find(
      v => v.size === variant.size && (!variant.color || v.color === variant.color)
    );

    if (!matchedVariant) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Selected size (${variant.size}) is not available for this item.`,
      });
    }

    const orderQty = Math.max(1, Number(quantity));
    if (matchedVariant.stock < orderQty) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Insufficient inventory. Only ${matchedVariant.stock} left in stock for size ${variant.size}.`,
      });
    }

    // Decrement stock and increment sold
    matchedVariant.stock -= orderQty;
    matchedVariant.sold += orderQty;
    await product.save();

    const totalPrice = product.basePrice * orderQty;

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let collision = await Order.findOne({ orderNumber });
    while (collision) {
      orderNumber = generateOrderNumber();
      collision = await Order.findOne({ orderNumber });
    }

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      product: product._id,
      variant: {
        size: matchedVariant.size,
        color: matchedVariant.color || 'Default',
      },
      quantity: orderQty,
      totalPrice,
      status: 'placed',
    });

    // Auto-create positive Transaction in Treasury ledger
    await Transaction.create({
      type: 'income',
      category: 'merch_sale',
      amount: totalPrice,
      description: `Merch order (${orderNumber}) - ${product.name} (Size: ${matchedVariant.size})`,
      referenceModel: 'Order',
      referenceId: order._id,
      createdBy: req.user._id,
    });

    await order.populate('product', 'name image basePrice category');

    res.status(201).json({
      success: true,
      data: { order },
      message: 'Order placed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error placing order',
    });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('product', 'name image basePrice category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { orders },
      message: 'User orders fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching orders',
    });
  }
};

// GET /api/orders (Officer only)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name studentId email phone')
      .populate('product', 'name image basePrice category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        orders,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      message: 'All orders fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching all orders',
    });
  }
};

// PATCH /api/orders/:id/status (Officer only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'ready', 'collected', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Order not found',
      });
    }

    order.status = status;
    await order.save();
    await order.populate('user', 'name studentId email');
    await order.populate('product', 'name image');

    res.status(200).json({
      success: true,
      data: { order },
      message: `Order status advanced to '${status}' successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error updating order status',
    });
  }
};
