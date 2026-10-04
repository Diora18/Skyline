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
};

export default eventService;
