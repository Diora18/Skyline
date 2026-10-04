const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Event = require('../models/Event');
const { canManageEvent } = require('../middleware/roleCheck');
const { isValidObjectId, isValidDate } = require('../utils/validation');

// POST /api/tasks (Officer or manager of the project's linked event)
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, priority, dueDate, supplies } = req.body;

    if (!title || !project || String(title).trim().length > 160 ||
        (description && String(description).length > 3000) ||
        !isValidObjectId(project) ||
        (assignee && !isValidObjectId(assignee)) ||
        !['low', 'medium', 'high'].includes(priority || 'medium') ||
        (dueDate && !isValidDate(dueDate)) ||
        (supplies !== undefined && (!Array.isArray(supplies) || supplies.some((item) => typeof item !== 'string' || item.length > 160)))) {
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

    const isOfficer = req.user.role === 'officer';
    let eventManager = false;
    if (!isOfficer && targetProject.linkedEvent) {
      const event = await Event.findById(targetProject.linkedEvent);
      eventManager = canManageEvent(event, req.user._id);
    }

    if (!isOfficer && !eventManager) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Only Officers or managers of the project’s linked event may create tasks.',
      });
    }

    if (eventManager && !assignee) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Event managers must assign each project task to a Volunteer.',
      });
    }

    if (eventManager) {
      const volunteer = await User.findOne({ _id: assignee, role: 'volunteer' }).select('_id');
      if (!volunteer) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Project tasks may only be assigned to users with the Volunteer role.',
        });
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
// Assigned users can change status only. Officers can edit all fields.
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

    const isOfficer = req.user.role === 'officer';
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
