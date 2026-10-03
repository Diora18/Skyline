/**
 * Role-based authorization middleware factory
 * @param  {...string} allowedRoles Roles permitted to access the route ('student', 'treasurer', 'officer')
 */
const EventVolunteer = require('../models/EventVolunteer');

const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required prior to role verification.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role. Current role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

/**
 * Helper to check if a user is an Event Manager for a specific event or a global officer
 * @param {object} event The event document
 * @param {string|object} userId User ID
 */
const canManageEvent = (event, userId) => {
  if (!event || !userId) return false;
  const targetId = userId._id ? userId._id.toString() : userId.toString();
  
  // Event creator has full rights on their created event
  if (event.createdBy && event.createdBy.toString() === targetId) return true;

  // Check if user is in event.managers array
  if (Array.isArray(event.managers)) {
    return event.managers.some(m => (m._id ? m._id.toString() : m.toString()) === targetId);
  }

  return false;
};

const isApprovedEventVolunteer = async (eventId, userId) => {
  if (!eventId || !userId) return false;
  const application = await EventVolunteer.exists({
    event: eventId,
    user: userId,
    status: 'approved',
  });
  return Boolean(application);
};

module.exports = {
  roleCheck,
  canManageEvent,
  isApprovedEventVolunteer,
};
