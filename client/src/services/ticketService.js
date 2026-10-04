import api from './api';

export const ticketService = {
  purchaseTicket: async (eventId) => {
    return await api.post('/tickets', { eventId });
  },

  getMyTickets: async () => {
    return await api.get('/tickets/my');
  },

  getEventTickets: async (eventId) => {
    return await api.get(`/tickets/event/${eventId}`);
  },

  scanTicket: async (ticketCode, eventId) => {
    return await api.post('/tickets/scan', { ticketCode, eventId });
  },
};

export default ticketService;
