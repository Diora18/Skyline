import { useState, useEffect, useRef } from 'react';
import { Loader2, ShieldCheck, AlertCircle, Sparkles, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import paymentService from '@/services/paymentService';

// Dynamically load Razorpay standard checkout.js script
const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
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

export function RazorpayModal({
  isOpen,
  onClose,
  onSuccess,
  amount = 25,
  currency = 'INR',
  title = 'Skyline SSA Payment',
  description = 'Annual Membership Dues',
  customerName = 'Student Member',
  customerEmail = 'member@skyline.edu',
  customerPhone = '9999999999',
}) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const launchedRef = useRef(false);

  // Calculate INR amount in rupees (e.g., $25 = ₹2,000)
  const amountInRupees = currency === 'USD' || amount <= 100 ? Math.round(amount * 80) : Math.round(amount);

  const launchRazorpayCheckout = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      // 1. Ensure official Razorpay Checkout SDK script is loaded
      const isLoaded = await loadRazorpaySDK();
      if (!isLoaded) {
        throw new Error('Failed to load official Razorpay Checkout SDK. Check your internet connection.');
      }

      // 2. Fetch order metadata from server API
      let orderId = null;
      let keyId = 'rzp_test_1DP5mmOlF5G5ag';

      try {
        const orderRes = await paymentService.createRazorpayOrder({
          amount: amountInRupees,
          currency: 'INR',
          description,
        });

        if (orderRes.data?.keyId) keyId = orderRes.data.keyId;
        // Only pass order_id if it was created on real Razorpay server (starts with "order_")
        if (orderRes.data?.orderId && !orderRes.data.orderId.startsWith('order_rzp_')) {
          orderId = orderRes.data.orderId;
        }
      } catch (apiErr) {
        console.warn('[Razorpay API] Using test checkout fallback:', apiErr.message);
      }

      // 3. Configure official Razorpay Standard Checkout options
      const options = {
        key: keyId,
        amount: amountInRupees * 100, // Amount in paise
        currency: 'INR',
        name: 'Skyline Student Association',
        description: description || title,
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await paymentService.verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_order_id: response.razorpay_order_id || `order_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || '',
            });

            setLoading(false);
            onSuccess({
              paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              orderId: response.razorpay_order_id || `order_${Date.now()}`,
              amount: `₹${amountInRupees}`,
              data: verifyRes.data,
            });
          } catch (verifyErr) {
            setLoading(false);
            setError(verifyErr.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        notes: {
          description,
        },
        theme: {
          color: '#0c2340',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (orderId) {
        options.order_id = orderId;
      }

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (failResponse) {
        setLoading(false);
        setError(failResponse.error?.description || 'Payment was declined or failed.');
      });

      setLoading(false);
      razorpayInstance.open();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Unable to launch Razorpay checkout window.');
    }
  };

  useEffect(() => {
    if (isOpen && !launchedRef.current) {
      launchedRef.current = true;
      launchRazorpayCheckout();
    }
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-blue-900/40 bg-card p-6 text-center space-y-5 shadow-2xl text-card-foreground">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0c2340] text-blue-400 font-extrabold text-xl mx-auto shadow-md">
          RZP
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Sparkles className="size-3.5" />
            <span>Official Razorpay Test Mode</span>
          </div>
          <h3 className="text-2xl font-extrabold text-foreground pt-2">Pay ₹{amountInRupees}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20 text-left">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Button
            type="button"
            onClick={launchRazorpayCheckout}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-[#0c2340] hover:bg-[#07172c] text-white font-bold text-sm shadow-md"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-blue-400" />
                <span>Launching Razorpay Window...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="size-4 text-blue-400" />
                <span>Open Razorpay Payment Popup</span>
              </div>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-2xl text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-semibold pt-1 border-t border-border">
          <ShieldCheck className="size-3.5 text-emerald-600" />
          <span>Powered by Official Razorpay SDK</span>
        </div>
      </div>
    </div>
  );
}
