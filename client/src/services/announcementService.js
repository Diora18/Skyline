import api from './api';

export const announcementService = {
  getAnnouncements: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/announcements?${query}` : '/announcements';
    return await api.get(endpoint);
  },

  createAnnouncement: async (data) => {
    return await api.post('/announcements', data);
  },

  deleteAnnouncement: async (id) => {
    return await api.delete(`/announcements/${id}`);
  },
};

export default announcementService;
