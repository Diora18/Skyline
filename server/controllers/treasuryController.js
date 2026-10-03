const Transaction = require('../models/Transaction');

// GET /api/treasury/summary (Treasurer & Officer)
exports.getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let totalIncome = 0;
    let totalExpenses = 0;
    const breakdown = {
      dues: 0,
      ticket_sale: 0,
      merch_sale: 0,
      reimbursement: 0,
      other: 0,
    };

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        totalIncome += amt;
      } else if (t.type === 'expense') {
        totalExpenses += amt;
      }

      if (breakdown[t.category] !== undefined) {
        breakdown[t.category] += amt;
      } else {
        breakdown.other += amt;
      }
    });

    const netBalance = totalIncome - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance,
        breakdown,
        transactionCount: transactions.length,
      },
      message: 'Treasury summary fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error computing treasury summary',
    });
  }
};

// GET /api/treasury/transactions (Treasurer & Officer)
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      message: 'Treasury transactions fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching transactions',
    });
  }
};

// POST /api/treasury/transactions (Manual cash transaction entry)
exports.createManualTransaction = async (req, res) => {
  try {
    const { type, category, amount, description } = req.body;

    if (!type || !category || amount === undefined || !description) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'type (income/expense), category, amount, and description are required',
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "type must be 'income' or 'expense'",
      });
    }

    const transaction = await Transaction.create({
      type,
      category,
      amount: Math.abs(Number(amount)),
      description: description.trim(),
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: { transaction },
      message: 'Manual cash transaction recorded in treasury ledger',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error recording transaction',
    });
  }
};
