import api from './api';

export const orderService = {
  createOrder: async (productId, variant, quantity) => {
    return await api.post('/orders', { productId, variant, quantity });
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
    return await api.patch(`/orders/${id}/status`, { status });
  },
};

export default orderService;
