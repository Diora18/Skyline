import api from './api';

export const eventService = {
  getEvents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/events?${query}` : '/events';
    return await api.get(endpoint);
  },

  getEventById: async (id) => {
    return await api.get(`/events/${id}`);
  },

  createEvent: async (eventData) => {
    return await api.post('/events', eventData);
  },

  updateEvent: async (id, eventData) => {
    return await api.patch(`/events/${id}`, eventData);
  },

  deleteEvent: async (id) => {
    return await api.delete(`/events/${id}`);
  },

  manageManagers: async (id, action, userId) => {
    return await api.patch(`/events/${id}/managers`, { action, userId });
  },

  applyToVolunteer: async (eventId, responsibilities = []) => {
    return await api.post(`/events/${eventId}/volunteers`, { responsibilities });
  },

  getVolunteerApplications: async (eventId) => {
    return await api.get(`/events/${eventId}/volunteers`);
  },

  getMyVolunteerAssignments: async () => {
    return await api.get('/events/volunteers/my');
  },

  updateVolunteerApplication: async (eventId, userId, status, responsibilities) => {
    return await api.patch(`/events/${eventId}/volunteers/${userId}`, { status, responsibilities });
  },

  withdrawVolunteerApplication: async (eventId) => {
    return await api.delete(`/events/${eventId}/volunteers`);
  },
};

export default eventService;
