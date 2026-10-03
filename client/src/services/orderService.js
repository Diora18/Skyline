import api from './api';

export const orderService = {
  createOrder: async (items) => {
    return await api.post('/orders', { items });
  },

  getMyOrders: async () => {
    return await api.get('/orders/my');
  },

  getAllOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/orders?${query}` : '/orders';
    return await api.get(endpoint);
  },

  updateOrderStatus: async (id, status) => {
    return await api.put(`/orders/${id}/status`, { status });
  },
};

export default orderService;
