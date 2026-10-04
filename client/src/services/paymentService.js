import api from './api';

export const paymentService = {
  createRazorpayOrder: async (data) => {
    return await api.post('/payment/razorpay/create-order', data);
  },

  verifyRazorpayPayment: async (data) => {
    return await api.post('/payment/razorpay/verify', data);
  },
};

export default paymentService;
