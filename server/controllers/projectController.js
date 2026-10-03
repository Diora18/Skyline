const Project = require('../models/Project');
const Task = require('../models/Task');
const EventVolunteer = require('../models/EventVolunteer');
const Event = require('../models/Event');
const { canManageEvent, isApprovedEventVolunteer } = require('../middleware/roleCheck');

const canAccessProject = async (project, user) => {
  if (!project || !user) return false;
  if (user.role === 'officer') return true;
  if (!project.linkedEvent) return project.createdBy?._id?.toString() === user._id.toString();
  const event = project.linkedEvent._id ? project.linkedEvent : await Event.findById(project.linkedEvent);
  return canManageEvent(event, user._id) || isApprovedEventVolunteer(event._id, user._id);
};

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    let projectQuery = {};
    if (req.user.role !== 'officer') {
      const [managedEventIds, approvedEventIds, assignedProjectIds] = await Promise.all([
        Event.find({
          $or: [{ createdBy: req.user._id }, { managers: req.user._id }],
        }).distinct('_id'),
        EventVolunteer.find({
          user: req.user._id,
          status: 'approved',
        }).distinct('event'),
        Task.find({ assignee: req.user._id }).distinct('project'),
      ]);

      projectQuery = {
        $or: [
          { createdBy: req.user._id },
          { linkedEvent: { $in: [...managedEventIds, ...approvedEventIds] } },
          { _id: { $in: assignedProjectIds } },
        ],
      };
    }

    const projects = await Project.find(projectQuery)
      .populate('createdBy', 'name email')
      .populate('linkedEvent', 'title startDate')
      .sort({ createdAt: -1 });

    // Aggregate task counts for each project
    const projectsWithMetrics = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const doneTasks = await Task.countDocuments({ project: project._id, status: 'done' });
        return {
          ...project.toObject(),
          totalTasks,
          doneTasks,
          progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { projects: projectsWithMetrics },
      message: 'Projects fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching projects',
    });
  }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('linkedEvent', 'title startDate venue managers createdBy');

    if (!project) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Project not found',
      });
    }

    if (!await canAccessProject(project, req.user)) {
      return res.status(403).json({ success: false, data: null, message: 'Forbidden: You do not have access to this project.' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email role studentId')
      .sort({ createdAt: 1 });

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const eventId = project.linkedEvent?._id;
    const eligibleVolunteers = eventId
      ? await EventVolunteer.find({ event: eventId, status: 'approved' })
        .populate('user', 'name email role studentId')
        .then((applications) => applications.map((application) => application.user))
      : [];

    res.status(200).json({
      success: true,
      data: {
        project: {
          ...project.toObject(),
          tasks,
          totalTasks,
          doneTasks,
          progress,
          eligibleVolunteers,
          canManage: req.user.role === 'officer' || await canAccessProject(project, req.user) && (
            req.user.role === 'officer' || canManageEvent(project.linkedEvent, req.user._id)
          ),
        },
      },
      message: 'Project details and task board fetched',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error fetching project',
    });
  }
};

// POST /api/projects (Officer only)
exports.createProject = async (req, res) => {
  try {
    const { title, description, deadline, linkedEvent } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Project title is required',
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description || '',
      deadline: deadline ? new Date(deadline) : undefined,
      linkedEvent: linkedEvent || null,
      status: 'active',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: { project },
      message: 'Project created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error creating project',
    });
  }
};

// PATCH /api/projects/:id (Officer only)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Project not found',
      });
    }

    const allowedUpdates = ['title', 'description', 'deadline', 'linkedEvent', 'status'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    res.status(200).json({
      success: true,
      data: { project },
      message: 'Project updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error updating project',
    });
  }
};
