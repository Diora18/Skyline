const TeamMember = require('../models/TeamMember');
const User = require('../models/User');

const generateInitials = (name) => {
  if (!name) return 'TM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const defaultMembers = [
  { name: 'Priya Mehta', role: 'President', major: 'Business Admin, Senior', initials: 'PM', order: 1 },
  { name: 'Jordan Lee', role: 'Vice President', major: 'Marketing, Junior', initials: 'JL', order: 2 },
  { name: 'Aisha Khan', role: 'Treasurer', major: 'Finance, Senior', initials: 'AK', order: 3 },
  { name: 'Carlos Rivera', role: 'Events Lead', major: 'Engineering, Junior', initials: 'CR', order: 4 },
];

exports.getTeamMembers = async (req, res) => {
  try {
    let members = await TeamMember.find().sort({ order: 1, createdAt: 1 });

    if (members.length === 0) {
      members = await TeamMember.insertMany(defaultMembers);
    }

    return res.status(200).json({
      success: true,
      data: { members },
      message: 'Board members fetched successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to fetch board members',
    });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { name, role, major, email, userId } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Name and role are required',
      });
    }

    let initials = req.body.initials;
    let selectedUser = null;

    if (userId) {
      selectedUser = await User.findById(userId);
    }

    const memberName = name || (selectedUser ? selectedUser.name : '');
    if (!initials) {
      initials = generateInitials(memberName);
    }

    const count = await TeamMember.countDocuments();

    const newMember = await TeamMember.create({
      name: memberName.trim(),
      role: role.trim(),
      major: (major || (selectedUser ? `${selectedUser.major || ''} ${selectedUser.graduationYear || ''}`.trim() : '')).trim(),
      email: (email || (selectedUser ? selectedUser.email : '')).trim(),
      initials,
      user: userId || null,
      order: count + 1,
      createdBy: req.user ? req.user._id : null,
    });

    return res.status(201).json({
      success: true,
      data: { member: newMember },
      message: 'Board member added successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to add board member',
    });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, major, email, initials } = req.body;

    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Board member not found',
      });
    }

    if (name) member.name = name.trim();
    if (role) member.role = role.trim();
    if (major !== undefined) member.major = major.trim();
    if (email !== undefined) member.email = email.trim();
    if (initials) member.initials = initials.trim();

    await member.save();

    return res.status(200).json({
      success: true,
      data: { member },
      message: 'Board member updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to update board member',
    });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid board member ID.',
      });
    }

    const member = await TeamMember.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Board member not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { id },
      message: 'Board member deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Failed to delete board member',
    });
  }
};
