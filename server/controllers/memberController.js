const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/members (Officer only)
exports.getMembers = async (req, res) => {
  try {
    const { status, role, search, page = 1, limit = 100 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.membershipStatus = status;
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const members = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        members,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      message: 'Members fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching members',
    });
  }
};

// GET /api/members/:id
exports.getMemberById = async (req, res) => {
  try {
    // Non-officers can only view their own profile
    if (req.user.role !== 'officer' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Access denied: You may only view your own membership profile.',
      });
    }

    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Member not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user: member },
      message: 'Member fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching member',
    });
  }
};

// POST /api/members/pay-dues
exports.payDues = async (req, res) => {
  try {
    const amount = 25;
    const now = new Date();
    const membershipExpiresAt = new Date(now);
    membershipExpiresAt.setFullYear(now.getFullYear() + 1);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found',
      });
    }

    user.membershipStatus = 'active';
    user.membershipPaidAt = now;
    user.membershipExpiresAt = membershipExpiresAt;
    await user.save();

    // Auto-create positive inflow transaction in the treasury ledger
    await Transaction.create({
      type: 'income',
      category: 'dues',
      amount,
      description: `Membership dues paid by ${user.name} (${user.studentId})`,
      referenceModel: 'User',
      referenceId: user._id,
      createdBy: user._id,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: 'Membership activated successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error processing dues payment',
    });
  }
};

// PATCH /api/members/:id/role (Officer only)
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'volunteer', 'treasurer', 'officer'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Member not found',
      });
    }

    member.role = role;
    await member.save();

    res.status(200).json({
      success: true,
      data: { user: member },
      message: `User role updated to '${role}' successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error updating member role',
    });
  }
};

// POST /api/members/:id/send-reminder (Officer only)
exports.sendReminder = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Member not found',
      });
    }

    // In hackathon demo, simulate email dispatch
    res.status(200).json({
      success: true,
      data: null,
      message: `Renewal reminder email simulated and dispatched to ${member.email}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error sending reminder',
    });
  }
};
