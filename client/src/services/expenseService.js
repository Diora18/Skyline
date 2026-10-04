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

  reviewExpense: async (id, action, rejectionReason) => {
    return await api.patch(`/expenses/${id}/review`, { action, rejectionReason });
  },

  reimburseExpense: async (id) => {
    return await api.patch(`/expenses/${id}/reimburse`, {});
  },
};

export default expenseService;
