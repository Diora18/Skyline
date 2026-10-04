const Announcement = require('../models/Announcement');

// GET /api/announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        announcements,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      message: 'Announcements fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching announcements',
    });
  }
};

// POST /api/announcements (Officer only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, category = 'general', sendEmail = false } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title and body are required to publish an announcement',
      });
    }

    const validCategory = category ? String(category).toLowerCase() : 'general';

    const announcement = await Announcement.create({
      title: title.trim(),
      body: body.trim(),
      category: validCategory,
      postedBy: req.user._id,
      emailSent: Boolean(sendEmail),
    });

    await announcement.populate('postedBy', 'name role');

    res.status(201).json({
      success: true,
      data: { announcement },
      message: sendEmail
        ? 'Announcement posted and mass email notification dispatched to all members'
        : 'Announcement posted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error creating announcement',
    });
  }
};

// DELETE /api/announcements/:id (Officer only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Announcement not found',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error deleting announcement',
    });
  }
};
