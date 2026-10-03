import api from './api';

export const memberService = {
  getMembers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/members?${query}` : '/members';
    return await api.get(endpoint);
  },

  getMemberById: async (id) => {
    return await api.get(`/members/${id}`);
  },

  payDues: async () => {
    return await api.post('/members/pay-dues');
  },

  updateRole: async (id, role) => {
    return await api.put(`/members/${id}/role`, { role });
  },

  sendReminder: async (id) => {
    return await api.post(`/members/${id}/send-reminder`);
  },
};

export default memberService;
