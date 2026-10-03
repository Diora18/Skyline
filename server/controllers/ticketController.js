const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Transaction = require('../models/Transaction');
const EventVolunteerApplication = require('../models/EventVolunteerApplication');
const { generateTicketCode } = require('../utils/generateCode');
const { canManageEvent } = require('../middleware/roleCheck');

// POST /api/tickets (Purchase ticket)
exports.purchaseTicket = async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'eventId is required to purchase a ticket',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Tickets cannot be purchased for an unpublished or completed event.',
      });
    }

    // Capacity limit check
    if (event.capacity !== null && event.ticketsSold >= event.capacity) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Event is completely sold out.',
      });
    }

    // Check if user already holds a ticket for this event
    const existingTicket = await Ticket.findOne({
      event: event._id,
      user: req.user._id,
      status: { $in: ['valid', 'used'] },
    });

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        data: { ticket: existingTicket },
        message: 'You already possess an active ticket for this event.',
      });
    }

    // Price and ticket tier determined by user's membership status
    const isMember = req.user.membershipStatus === 'active';
    const ticketType = isMember ? 'member' : 'non-member';
    const price = isMember ? event.memberPrice : event.nonMemberPrice;

    // Generate unique collision-free ticket code
    let ticketCode = generateTicketCode();
    let collision = await Ticket.findOne({ ticketCode });
    while (collision) {
      ticketCode = generateTicketCode();
      collision = await Ticket.findOne({ ticketCode });
    }

    const ticket = await Ticket.create({
      ticketCode,
      event: event._id,
      user: req.user._id,
      ticketType,
      price,
      status: 'valid',
    });

    // Increment tickets sold counter on Event
    event.ticketsSold += 1;
    await event.save();

    // Auto-create positive Transaction entry in Treasury
    if (price > 0) {
      await Transaction.create({
        type: 'income',
        category: 'ticket_sale',
        amount: price,
        description: `Ticket sale (${ticketCode}) for ${event.title} - ${req.user.name}`,
        referenceModel: 'Ticket',
        referenceId: ticket._id,
        createdBy: req.user._id,
      });
    }

    await ticket.populate('event', 'title startDate venue address');

    res.status(201).json({
      success: true,
      data: { ticket },
      message: 'Ticket purchased successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error processing ticket purchase',
    });
  }
};

// GET /api/tickets/my
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event', 'title category venue address startDate endDate bannerImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tickets },
      message: 'User tickets fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching user tickets',
    });
  }
};

// GET /api/tickets/event/:eventId (Staff & Event Managers)
exports.getEventTickets = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    const hasApprovedAssignment = await EventVolunteerApplication.exists({
      event: event._id,
      user: req.user._id,
      status: 'approved',
    });
    const isAuthorized = ['officer', 'treasurer', 'volunteer'].includes(req.user.role) ||
      canManageEvent(event, req.user._id) ||
      Boolean(hasApprovedAssignment);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden: You do not have permissions to view attendees for this event.',
      });
    }

    const tickets = await Ticket.find({ event: event._id })
      .populate('user', 'name studentId email major')
      .sort({ createdAt: -1 });

    const total = tickets.length;
    const checkedIn = tickets.filter(t => t.status === 'used').length;
    const remaining = total - checkedIn;

    res.status(200).json({
      success: true,
      data: {
        tickets,
        total,
        checkedIn,
        remaining,
      },
      message: 'Event tickets fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching event tickets',
    });
  }
};

// POST /api/tickets/scan (Door Check-In Scanner)
exports.scanTicket = async (req, res) => {
  try {
    const { ticketCode } = req.body;
    if (!ticketCode) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ticketCode is required to verify admission',
      });
    }

    const ticket = await Ticket.findOne({ ticketCode: ticketCode.trim() })
      .populate('user', 'name studentId email')
      .populate('event', 'title startDate venue managers createdBy');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Invalid ticket code. No matching ticket found.',
      });
    }

    const hasApprovedAssignment = await EventVolunteerApplication.exists({
      event: ticket.event._id,
      user: req.user._id,
      status: 'approved',
    });
    const isAuthorized = ['officer', 'volunteer'].includes(req.user.role) ||
      canManageEvent(ticket.event, req.user._id) ||
      Boolean(hasApprovedAssignment);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden: You are not authorized to scan tickets for this event.',
      });
    }

    // Check if already used
    if (ticket.status === 'used') {
      const timeStr = ticket.checkedInAt
        ? new Date(ticket.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'earlier';
      return res.status(400).json({
        success: false,
        data: {
          checkedInAt: ticket.checkedInAt,
          attendeeName: ticket.user ? ticket.user.name : 'Unknown',
        },
        message: `Already checked in at ${timeStr}. Ticket has already been used!`,
      });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'This ticket has been cancelled or refunded.',
      });
    }

    // Mark as used
    ticket.status = 'used';
    ticket.checkedInAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      data: {
        ticket,
        attendeeName: ticket.user ? ticket.user.name : 'Attendee',
        eventTitle: ticket.event.title,
      },
      message: `Valid ticket - Welcome, ${ticket.user ? ticket.user.name : 'Attendee'}!`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error processing ticket scan',
    });
  }
};
