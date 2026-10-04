import api from './api';

export const paymentService = {
  createRazorpayOrder: async (data) => {
    return await api.post('/payments/create-order', data);
  },

  verifyPaymentSignature: async (data) => {
    return await api.post('/payments/verify', data);
  },
};

export default paymentService;
