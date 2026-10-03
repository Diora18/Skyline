const Event = require('../models/Event');
const EventVolunteer = require('../models/EventVolunteer');
const { canManageEvent } = require('../middleware/roleCheck');

const getEvent = async (eventId) => Event.findById(eventId);

// GET /api/events/volunteers/my
exports.getMyVolunteerAssignments = async (req, res) => {
  try {
    const applications = await EventVolunteer.find({
      user: req.user._id,
      status: 'approved',
    })
      .populate('event', 'title description venue startDate endDate status')
      .populate('approvedBy', 'name email')
      .sort({ 'event.startDate': 1 });

    res.status(200).json({
      success: true,
      data: { applications },
      message: 'Approved volunteer assignments fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching volunteer assignments',
    });
  }
};

// POST /api/events/:eventId/volunteers
exports.applyToVolunteer = async (req, res) => {
  try {
    const event = await getEvent(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    if (!['draft', 'published'].includes(event.status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Volunteer applications are closed for this event.',
      });
    }

    const existingApplication = await EventVolunteer.findOne({
      event: event._id,
      user: req.user._id,
    });

    if (existingApplication && ['pending', 'approved'].includes(existingApplication.status)) {
      return res.status(409).json({
        success: false,
        data: { application: existingApplication },
        message: `You already have a ${existingApplication.status} volunteer application for this event.`,
      });
    }

    const application = existingApplication
      ? await EventVolunteer.findByIdAndUpdate(
        existingApplication._id,
        {
          status: 'pending',
          responsibilities: req.body.responsibilities || [],
          appliedAt: new Date(),
          approvedAt: null,
          approvedBy: null,
        },
        { new: true, runValidators: true },
      )
      : await EventVolunteer.create({
        event: event._id,
        user: req.user._id,
        responsibilities: req.body.responsibilities || [],
      });

    await application.populate('user', 'name email studentId major');

    return res.status(existingApplication ? 200 : 201).json({
      success: true,
      data: { application },
      message: existingApplication
        ? 'Volunteer application resubmitted successfully'
        : 'Volunteer application submitted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error submitting volunteer application',
    });
  }
};

// GET /api/events/:eventId/volunteers
exports.getEventVolunteers = async (req, res) => {
  try {
    const event = await getEvent(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    const isManager = req.user.role === 'officer' || canManageEvent(event, req.user._id);
    const query = isManager
      ? { event: event._id }
      : { event: event._id, user: req.user._id };

    const applications = await EventVolunteer.find(query)
      .populate('user', 'name email studentId major')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { applications },
      message: 'Event volunteer applications fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching volunteer applications',
    });
  }
};

// PATCH /api/events/:eventId/volunteers/:userId
exports.updateVolunteerApplication = async (req, res) => {
  try {
    const { status, responsibilities } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "status must be either 'approved' or 'rejected'",
      });
    }

    const event = await getEvent(req.params.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Event not found',
      });
    }

    if (req.user.role !== 'officer' && !canManageEvent(event, req.user._id)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden: Only an officer or event manager can review volunteer applications.',
      });
    }

    const application = await EventVolunteer.findOne({
      event: event._id,
      user: req.params.userId,
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Volunteer application not found',
      });
    }

    application.status = status;
    if (responsibilities !== undefined) application.responsibilities = responsibilities;
    application.approvedAt = status === 'approved' ? new Date() : null;
    application.approvedBy = status === 'approved' ? req.user._id : null;
    await application.save();
    await application.populate('user', 'name email studentId major');
    await application.populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      data: { application },
      message: `Volunteer application ${status} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error updating volunteer application',
    });
  }
};

// DELETE /api/events/:eventId/volunteers (withdraw own application)
exports.withdrawVolunteerApplication = async (req, res) => {
  try {
    const application = await EventVolunteer.findOne({
      event: req.params.eventId,
      user: req.user._id,
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Volunteer application not found',
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.status(200).json({
      success: true,
      data: { application },
      message: 'Volunteer application withdrawn successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error withdrawing volunteer application',
    });
  }
};
