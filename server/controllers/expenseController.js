const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const { canManageEvent, isApprovedEventVolunteer } = require('../middleware/roleCheck');

// POST /api/expenses (Approved event volunteer, Treasurer, Officer)
exports.submitExpense = async (req, res) => {
  try {
    const { amount, category, description, eventId, linkedProject, receiptUrl } = req.body;

    if (!amount || !category || !description) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Amount, category, and description are required to submit an expense claim',
      });
    }

    let event = null;
    if (eventId) {
      event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Event not found',
        });
      }
    }

    const isStaff = ['treasurer', 'officer'].includes(req.user.role);
    const isEventManager = event && canManageEvent(event, req.user._id);
    const isApprovedVolunteer = event && await isApprovedEventVolunteer(event._id, req.user._id);
    if (!isStaff && !isEventManager && !isApprovedVolunteer) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'An approved volunteer assignment for the event is required to submit this expense.',
      });
    }

    const expense = await Expense.create({
      submittedBy: req.user._id,
      amount: Math.abs(Number(amount)),
      category,
      description: description.trim(),
      event: event ? event._id : null,
      linkedProject: linkedProject || null,
      receiptUrl: receiptUrl || '',
      status: 'submitted',
    });

    await expense.populate('submittedBy', 'name studentId email role');

    res.status(201).json({
      success: true,
      data: { expense },
      message: 'Expense reimbursement claim submitted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error submitting expense claim',
    });
  }
};

// GET /api/expenses/my
exports.getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ submittedBy: req.user._id })
      .populate('linkedProject', 'title')
      .populate('event', 'title startDate venue')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { expenses },
      message: 'User expense claims fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching user expense claims',
    });
  }
};

// GET /api/expenses (Treasurer & Officer review queue)
exports.getAllExpenses = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('submittedBy', 'name studentId email role')
      .populate('linkedProject', 'title')
      .populate('event', 'title startDate venue')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      message: 'All expense claims fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching expense claims',
    });
  }
};

// PATCH /api/expenses/:id/review (Treasurer & Officer: Approve or Reject)
exports.reviewExpense = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "action must be either 'approve' or 'reject'",
      });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Expense claim not found',
      });
    }

    if (action === 'approve') {
      expense.status = 'approved';
      expense.rejectionReason = '';
    } else {
      expense.status = 'rejected';
      expense.rejectionReason = rejectionReason || 'Claim does not meet reimbursement criteria.';
    }

    expense.reviewedBy = req.user._id;
    expense.reviewedAt = new Date();
    await expense.save();

    await expense.populate('submittedBy', 'name email studentId');
    await expense.populate('reviewedBy', 'name role');

    res.status(200).json({
      success: true,
      data: { expense },
      message: action === 'approve'
        ? 'Expense claim approved successfully'
        : 'Expense claim rejected with stated reason',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error reviewing expense claim',
    });
  }
};

// PATCH /api/expenses/:id/reimburse (Treasurer & Officer: Payout & Auto-Ledger)
exports.reimburseExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('submittedBy', 'name studentId');
    if (!expense) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Expense claim not found',
      });
    }

    if (expense.status === 'reimbursed') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'This expense claim has already been reimbursed and paid out.',
      });
    }

    expense.status = 'reimbursed';
    expense.reviewedBy = req.user._id;
    expense.reviewedAt = new Date();
    await expense.save();

    // Auto-create negative outflow Transaction in Treasury ledger
    await Transaction.create({
      type: 'expense',
      category: 'reimbursement',
      amount: expense.amount,
      description: `Reimbursement paid to ${expense.submittedBy.name} (${expense.description})`,
      referenceModel: 'Expense',
      referenceId: expense._id,
      createdBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: { expense },
      message: 'Expense marked as reimbursed. Outflow transaction auto-logged in Treasury.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error reimbursing expense',
    });
  }
};
