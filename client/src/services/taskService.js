import api from './api';

export const taskService = {
  getTasksByProject: async (projectId) => {
    return await api.get(`/projects/${projectId}`);
  },

  createTask: async (taskData) => {
    return await api.post('/tasks', taskData);
  },

  updateTask: async (id, taskData) => {
    return await api.patch(`/tasks/${id}`, taskData);
  },

  deleteTask: async (id) => {
    return await api.delete(`/tasks/${id}`);
  },
};

export default taskService;
