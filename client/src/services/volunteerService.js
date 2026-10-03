import api from './api';

export const volunteerService = {
  applyForEvent: async (eventId) => api.post(`/events/${eventId}/volunteers`, {}),
  getEventApplications: async (eventId) => api.get(`/events/${eventId}/volunteers`),
  getMyApplications: async () => api.get('/members/me/volunteering'),
  updateApplication: async (eventId, applicationId, updates) =>
    api.patch(`/events/${eventId}/volunteers/${applicationId}`, updates),
};

export default volunteerService;
