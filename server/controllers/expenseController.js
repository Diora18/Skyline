const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const EventVolunteerApplication = require('../models/EventVolunteerApplication');
const { canManageEvent } = require('../middleware/roleCheck');

// POST /api/expenses (global expense roles or approved volunteers for the linked event)
exports.submitExpense = async (req, res) => {
  try {
    const { amount, category, description, linkedProject, receiptUrl, event: eventId } = req.body;

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0 || !category || !description?.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'A positive amount, category, and description are required to submit an expense claim',
      });
    }

    let event = null;
    if (eventId) {
      event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'The event linked to this expense claim was not found.',
        });
      }

      const hasApprovedAssignment = await EventVolunteerApplication.exists({
        event: event._id,
        user: req.user._id,
        status: { $in: ['approved', 'completed'] },
      });
      const canSubmitForEvent = ['volunteer', 'treasurer', 'officer'].includes(req.user.role) ||
        canManageEvent(event, req.user._id) ||
        Boolean(hasApprovedAssignment);

      if (!canSubmitForEvent) {
        return res.status(403).json({
          success: false,
          data: null,
          message: 'Only an approved event volunteer, authorized event manager, Volunteer, Treasurer, or Officer may submit an expense for this event.',
        });
      }
    } else if (!['volunteer', 'treasurer', 'officer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'An approved event volunteer must link the claim to their assigned event.',
      });
    }

    const expense = await Expense.create({
      submittedBy: req.user._id,
      amount: Number(amount),
      category,
      description: description.trim(),
      event: event?._id || null,
      linkedProject: event
        ? (event.linkedProject || null)
        : (linkedProject || null),
      receiptUrl: receiptUrl || '',
      status: 'submitted',
    });

    await expense.populate('submittedBy', 'name studentId email role');
    await expense.populate('event', 'title startDate venue');
    await expense.populate('linkedProject', 'title');

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
      .populate('event', 'title startDate venue')
      .populate('linkedProject', 'title')
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
      .populate('event', 'title startDate venue')
      .populate('linkedProject', 'title')
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
