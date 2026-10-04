import paymentService from '@/services/paymentService';

export interface ProcessPaymentOptions {
  paymentType: 'membership' | 'merch' | 'ticket';
  itemId?: string;
  variant?: { size?: string; color?: string };
  quantity?: number;
  user?: any;
  onStart?: () => void;
  onSuccess?: (response: any) => void;
  onError?: (errorMessage: string) => void;
  onDismiss?: () => void;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const processRazorpayPayment = async ({
  paymentType,
  itemId,
  variant,
  quantity = 1,
  user,
  onStart,
  onSuccess,
  onError,
  onDismiss,
}: ProcessPaymentOptions) => {
  if (onStart) onStart();

  try {
    // 1. Create order on server (server validates amount)
    const res = await paymentService.createRazorpayOrder({
      paymentType,
      itemId,
      variant,
      quantity,
    });

    const orderData = res.data;

    // If order creation fell back to test mode (placeholder API keys or server test mode),
    // skip passing fallback order ID to Razorpay's live iframe (which rejects unrecorded order IDs with "Oops! Something went wrong. Payment Failed").
    if (orderData.isSimulation) {
      console.warn('[Razorpay] Test mode active (placeholder keys). Verifying payment directly.');
      const verifyRes = await paymentService.verifyPaymentSignature({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'simulated_signature',
        paymentType,
        itemId,
        variant,
        quantity,
      });

      if (onSuccess) onSuccess(verifyRes);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded || typeof (window as any).Razorpay === 'undefined') {
      throw new Error('Razorpay Checkout could not be loaded. No payment was made.');
    }

    // 2. Open official Razorpay Checkout Modal for real Razorpay orders
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Skyline Student Association',
      description: orderData.description || 'Skyline SSA Payment',
      order_id: orderData.orderId,
      prefill: {
        name: user?.name || orderData.userPrefill?.name || '',
        email: user?.email || orderData.userPrefill?.email || '',
        contact: user?.phone || orderData.userPrefill?.phone || '',
      },
      theme: {
        color: '#4f46e5',
      },
      handler: async function (response: any) {
        try {
          // 3. Verify Razorpay Payment Signature on server
          const verifyRes = await paymentService.verifyPaymentSignature({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentType,
            itemId,
            variant,
            quantity,
          });

          if (onSuccess) onSuccess(verifyRes);
        } catch (verifyErr: any) {
          if (onError) onError(verifyErr.message || 'Payment signature verification failed.');
        }
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      if (onError) onError(response.error?.description || 'Razorpay payment failed.');
    });
    rzp.open();
  } catch (err: any) {
    if (onError) onError(err.message || 'Unable to initiate Razorpay payment checkout.');
  }
};
