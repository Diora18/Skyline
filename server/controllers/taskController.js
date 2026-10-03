const Task = require('../models/Task');
const Project = require('../models/Project');
const Event = require('../models/Event');
const EventVolunteer = require('../models/EventVolunteer');
const { canManageEvent, isApprovedEventVolunteer } = require('../middleware/roleCheck');

const getProjectAccess = async (project, user) => {
  if (user.role === 'officer') return { manager: true, volunteer: false };
  if (!project.linkedEvent) return { manager: false, volunteer: false };
  const event = await Event.findById(project.linkedEvent?._id || project.linkedEvent);
  if (!event) return { manager: false, volunteer: false };
  return {
    manager: canManageEvent(event, user._id),
    volunteer: await isApprovedEventVolunteer(event._id, user._id),
    event,
  };
};

// POST /api/tasks (Officer or assigned team)
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, priority, dueDate, supplies } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Title and project are required to create a task',
      });
    }

    const targetProject = await Project.findById(project);
    if (!targetProject) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Project not found',
      });
    }

    const access = await getProjectAccess(targetProject, req.user);
    if (!access.manager) {
      return res.status(403).json({ success: false, data: null, message: 'Only the event manager or an officer can create tasks.' });
    }
    if (assignee) {
      const approved = await EventVolunteer.exists({ event: targetProject.linkedEvent, user: assignee, status: 'approved' });
      if (!approved) {
        return res.status(400).json({ success: false, data: null, message: 'Tasks can only be assigned to approved volunteers for this event.' });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      project: targetProject._id,
      assignee: assignee || null,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      supplies: Array.isArray(supplies) ? supplies : [],
      status: 'todo',
    });

    await task.populate('assignee', 'name email role studentId');

    res.status(201).json({
      success: true,
      data: { task },
      message: 'Task created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error creating task',
    });
  }
};

// PATCH /api/tasks/:id
// Volunteers can move tasks assigned to them (status only). Officers can edit all fields.
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(task.project);
    const access = await getProjectAccess(project, req.user);
    if (!access.manager && !access.volunteer) {
      return res.status(403).json({ success: false, data: null, message: 'You do not have access to this event task.' });
    }

    const isOfficer = access.manager;
    const isAssignedVolunteer =
      task.assignee && task.assignee.toString() === req.user._id.toString();

    if (!isOfficer && !isAssignedVolunteer) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Forbidden: You may only update tasks assigned directly to you.',
      });
    }

    // Volunteers are restricted to updating status only
    if (!isOfficer && isAssignedVolunteer) {
      if (req.body.status) {
        const validStatuses = ['todo', 'in_progress', 'done'];
        if (!validStatuses.includes(req.body.status)) {
          return res.status(400).json({
            success: false,
            data: null,
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          });
        }
        task.status = req.body.status;
      }
    } else {
      // Officers have full editing permissions
      const allowedUpdates = ['title', 'description', 'assignee', 'status', 'priority', 'dueDate', 'supplies'];
      if (req.body.assignee) {
        const approved = await EventVolunteer.exists({ event: project.linkedEvent, user: req.body.assignee, status: 'approved' });
        if (!approved) {
          return res.status(400).json({ success: false, data: null, message: 'Tasks can only be assigned to approved volunteers for this event.' });
        }
      }
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          task[field] = req.body[field];
        }
      });
    }

    await task.save();
    await task.populate('assignee', 'name email role studentId');

    res.status(200).json({
      success: true,
      data: { task },
      message: 'Task updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error updating task',
    });
  }
};

// DELETE /api/tasks/:id (Officer only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(task.project);
    const access = await getProjectAccess(project, req.user);
    if (!access.manager) {
      return res.status(403).json({ success: false, data: null, message: 'Only the event manager or an officer can delete tasks.' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Server error deleting task',
    });
  }
};
