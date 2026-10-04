import api from './api';

export const teamService = {
  getTeamMembers: async () => {
    return await api.get('/team');
  },

  addTeamMember: async (data) => {
    return await api.post('/team', data);
  },

  updateTeamMember: async (id, data) => {
    return await api.put(`/team/${id}`, data);
  },

  deleteTeamMember: async (id) => {
    return await api.delete(`/team/${id}`);
  },
};

export default teamService;
