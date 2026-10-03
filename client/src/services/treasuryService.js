import api from './api';

export const treasuryService = {
  getSummary: async () => {
    return await api.get('/treasury/summary');
  },

  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/treasury/transactions?${query}` : '/treasury/transactions';
    return await api.get(endpoint);
  },

  createManualTransaction: async (data) => {
    return await api.post('/treasury/transactions', data);
  },
};

export default treasuryService;
