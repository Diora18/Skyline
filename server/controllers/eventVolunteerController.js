const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventVolunteerApplication = require('../models/EventVolunteerApplication');
const { canManageEvent } = require('../middleware/roleCheck');

const isEventManager = (event, user) =>
  user.role === 'officer' || canManageEvent(event, user._id);

const populateApplication = (query) => query
  .populate('user', 'name email studentId role membershipStatus')
  .populate('reviewedBy', 'name')
  .populate('event', 'title startDate endDate venue status');

exports.applyToEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid event ID.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, data: null, message: 'Event not found.' });
    }
    if (event.status !== 'published' || new Date(event.startDate) <= new Date()) {
      return res.status(400).json({ success: false, data: null, message: 'Volunteer applications are only available for upcoming published events.' });
    }

    let application = await EventVolunteerApplication.findOne({ event: event._id, user: req.user._id });
    if (application && application.status !== 'rejected') {
      return res.status(409).json({
        success: false,
        data: { application },
        message: 'You already have an application for this event.',
      });
    }

    if (application) {
      application.status = 'pending';
      application.responsibility = '';
      application.reviewedBy = null;
      application.reviewedAt = null;
      await application.save();
    } else {
      try {
        application = await EventVolunteerApplication.create({
          event: event._id,
          user: req.user._id,
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        return res.status(409).json({
          success: false,
          data: null,
          message: 'You already have an application for this event.',
        });
      }
    }

    const populatedApplication = await populateApplication(
      EventVolunteerApplication.findById(application._id)
    );
    return res.status(201).json({
      success: true,
      data: { application: populatedApplication },
      message: 'Volunteer application submitted.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Unable to submit volunteer application.',
    });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await populateApplication(
      EventVolunteerApplication.find({ user: req.user._id }).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      data: { applications },
      message: 'Your event volunteering records were fetched.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Unable to fetch volunteering records.',
    });
  }
};

exports.getEventApplications = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid event ID.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, data: null, message: 'Event not found.' });
    }
    if (!isEventManager(event, req.user)) {
      return res.status(403).json({ success: false, data: null, message: 'Only this event’s officer or manager can view volunteer applications.' });
    }

    const applications = await populateApplication(
      EventVolunteerApplication.find({ event: event._id }).sort({ createdAt: 1 })
    );

    return res.status(200).json({
      success: true,
      data: { applications },
      message: 'Event volunteer applications were fetched.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Unable to fetch event volunteer applications.',
    });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { status, responsibility } = req.body;
    const allowedStatuses = ['approved', 'rejected', 'completed'];
    if ((status !== undefined && !allowedStatuses.includes(status)) ||
        (responsibility !== undefined && (typeof responsibility !== 'string' || responsibility.length > 120))) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Provide a supported status and/or a responsibility of at most 120 characters.',
      });
    }
    if (status === undefined && responsibility === undefined) {
      return res.status(400).json({ success: false, data: null, message: 'A status or responsibility update is required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.applicationId) ||
        !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid event or application ID.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, data: null, message: 'Event not found.' });
    }
    if (!isEventManager(event, req.user)) {
      return res.status(403).json({ success: false, data: null, message: 'Only this event’s officer or manager can update volunteer applications.' });
    }

    const application = await EventVolunteerApplication.findOne({
      _id: req.params.applicationId,
      event: event._id,
    });
    if (!application) {
      return res.status(404).json({ success: false, data: null, message: 'Volunteer application not found for this event.' });
    }

    if (status === 'approved' || status === 'rejected') {
      if (application.status !== 'pending') {
        return res.status(409).json({ success: false, data: null, message: 'Only pending applications can be approved or rejected.' });
      }
      application.status = status;
      application.reviewedBy = req.user._id;
      application.reviewedAt = new Date();
    } else if (status === 'completed') {
      if (application.status !== 'approved') {
        return res.status(409).json({ success: false, data: null, message: 'Only approved volunteers can be marked completed.' });
      }
      if (new Date(event.endDate) > new Date()) {
        return res.status(400).json({ success: false, data: null, message: 'Volunteering can only be marked completed after the event ends.' });
      }
      application.status = 'completed';
      application.reviewedBy = req.user._id;
      application.reviewedAt = new Date();
    } else if (responsibility !== undefined && !['approved', 'completed'].includes(application.status)) {
      return res.status(409).json({ success: false, data: null, message: 'Responsibility can only be set for an approved or completed volunteer.' });
    }

    if (responsibility !== undefined) application.responsibility = responsibility.trim();
    await application.save();
    const populatedApplication = await populateApplication(
      EventVolunteerApplication.findById(application._id)
    );

    return res.status(200).json({
      success: true,
      data: { application: populatedApplication },
      message: 'Volunteer application updated.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Unable to update volunteer application.',
    });
  }
};
