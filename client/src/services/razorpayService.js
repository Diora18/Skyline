import paymentService from './paymentService';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openOfficialRazorpayCheckout = async ({
  amount = 25,
  currency = 'INR',
  title = 'Skyline SSA Payment',
  description = 'Annual Membership Dues',
  customerName = 'Student Member',
  customerEmail = 'member@skyline.edu',
  onSuccess,
  onClose,
  onError,
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    if (onError) onError(new Error('Razorpay SDK script failed to load. Please check internet connection.'));
    return;
  }

  const amountInRupees = currency === 'USD' || amount <= 100 ? Math.round(amount * 80) : Math.round(amount);
  let orderData = {};

  try {
    const res = await paymentService.createRazorpayOrder({
      amount: amountInRupees,
      currency: 'INR',
      description,
    });
    orderData = res.data || {};
  } catch (e) {
    console.warn('[Razorpay] Backend order initialization warning:', e.message);
  }

  const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
  const amountInPaise = orderData.amount || Math.round(amountInRupees * 100);

  const options = {
    key: keyId,
    amount: amountInPaise,
    currency: 'INR',
    name: 'Skyline SSA',
    description: description || title,
    image: 'https://cdn.razorpay.com/logos/ghsl.png',
    handler: async function (response) {
      const paymentId = response.razorpay_payment_id || `pay_RZP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      try {
        await paymentService.verifyRazorpayPayment({
          razorpay_payment_id: paymentId,
          razorpay_order_id: response.razorpay_order_id || orderData.orderId,
          razorpay_signature: response.razorpay_signature || '',
        });
      } catch (err) {
        console.warn('[Razorpay] Verification warning:', err.message);
      }
      if (onSuccess) {
        onSuccess({
          paymentId,
          orderId: response.razorpay_order_id || orderData.orderId,
          method: 'Razorpay Official Checkout',
        });
      }
    },
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: '9876543210',
    },
    notes: {
      merchant: 'Skyline Student Association',
    },
    theme: {
      color: '#0c2340',
    },
    modal: {
      ondismiss: function () {
        if (onClose) onClose();
      },
    },
  };

  if (orderData.isRealRazorpayOrder && orderData.orderId) {
    options.order_id = orderData.orderId;
  }

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (resp) {
    if (onError) onError(new Error(resp.error?.description || 'Razorpay payment failed.'));
  });

  rzp.open();
};

export default openOfficialRazorpayCheckout;
