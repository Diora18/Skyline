const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
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
      .populate('linkedEvent', 'title startDate venue');

    if (!project) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Project not found',
      });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email role studentId')
      .sort({ createdAt: 1 });

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        project: {
          ...project.toObject(),
          tasks,
          totalTasks,
          doneTasks,
          progress,
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
