import api from './api';

export const expenseService = {
  submitExpense: async (data) => {
    return await api.post('/expenses', data);
  },

  getMyExpenses: async () => {
    return await api.get('/expenses/my');
  },

  getAllExpenses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/expenses?${query}` : '/expenses';
    return await api.get(endpoint);
  },

  reviewExpense: async (id, status, reviewNotes) => {
    return await api.put(`/expenses/${id}/review`, { status, reviewNotes });
  },

  reimburseExpense: async (id) => {
    return await api.put(`/expenses/${id}/reimburse`);
  },
};

export default expenseService;
