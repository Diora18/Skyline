const Event = require('../models/Event');
const Project = require('../models/Project');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const EventVolunteerApplication = require('../models/EventVolunteerApplication');
const { canManageEvent } = require('../middleware/roleCheck');

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { category, status, sort = 'startDate', page = 1, limit = 12 } = req.query;
    const query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status (default to published for public unless officer requests otherwise)
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .populate('managers', 'name email role')
      .sort({ [sort]: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        events,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      message: 'Events fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching events',
    });
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('managers', 'name email role studentId')
      .populate('linkedProject');

    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { event },
      message: 'Event fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching event details',
    });
  }
};

// POST /api/events (Officer only)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      bannerImage,
      venue,
      address,
      startDate,
      endDate,
      memberPrice = 0,
      nonMemberPrice = 0,
      capacity = null,
      status = 'published',
      createLinkedProject = false,
    } = req.body;

    if (!title || !category || !venue || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title, category, venue, startDate, and endDate are required.',
      });
    }

    const event = new Event({
      title: title.trim(),
      description: description || '',
      category,
      bannerImage: bannerImage || '',
      venue: venue.trim(),
      address: address || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      memberPrice: Number(memberPrice) || 0,
      nonMemberPrice: Number(nonMemberPrice) || 0,
      capacity: capacity ? Number(capacity) : null,
      status,
      createdBy: req.user._id,
      managers: [],
    });

    if (createLinkedProject) {
      const project = await Project.create({
        title: `${title} - Operations & Logistics`,
        description: `Planning and task board for ${title}`,
        deadline: new Date(startDate),
        linkedEvent: event._id,
        status: 'active',
        createdBy: req.user._id,
      });
      event.linkedProject = project._id;
    }

    await event.save();
    await event.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: { event },
      message: 'Event created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error creating event',
    });
  }
};

// PATCH /api/events/:id (Officer OR Event Manager for this event)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    // Permission check: Global officer OR assigned Event Manager
    const isAuthorized = req.user.role === 'officer' || canManageEvent(event, req.user._id);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden: You do not have permission to manage this event.',
      });
    }

    const allowedUpdates = [
      'title', 'description', 'category', 'bannerImage', 'venue',
      'address', 'startDate', 'endDate', 'memberPrice', 'nonMemberPrice',
      'capacity', 'status'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();
    await event.populate('managers', 'name email role');
    await event.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: { event },
      message: 'Event updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error updating event',
    });
  }
};

// DELETE /api/events/:id (Officer or Event Manager)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    const isAuthorized = req.user.role === 'officer' || canManageEvent(event, req.user._id);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden: You do not have permission to delete this event.',
      });
    }

    // Clean up associated tickets and volunteer applications
    await Ticket.deleteMany({ event: event._id });
    await EventVolunteerApplication.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error deleting event',
    });
  }
};

// PATCH /api/events/:id/managers (Officer only: Add or Remove Event Managers)
exports.manageEventManagers = async (req, res) => {
  try {
    const { action, userId } = req.body;

    if (!action || !userId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Both 'action' ('add' or 'remove') and 'userId' are required.",
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User to assign as manager was not found',
      });
    }

    if (action === 'add') {
      const alreadyManager = event.managers.some(m => m.toString() === userId.toString());
      if (alreadyManager) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'User is already assigned as a manager for this event',
        });
      }
      event.managers.push(userId);
    } else if (action === 'remove') {
      event.managers = event.managers.filter(m => m.toString() !== userId.toString());
    } else {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid action. Use 'add' or 'remove'.",
      });
    }

    await event.save();
    await event.populate('managers', 'name email role studentId');

    res.status(200).json({
      success: true,
      data: { event },
      message: action === 'add'
        ? `Added ${userExists.name} as Event Manager for ${event.title}`
        : `Removed ${userExists.name} from Event Managers for ${event.title}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error managing event managers',
    });
  }
};
