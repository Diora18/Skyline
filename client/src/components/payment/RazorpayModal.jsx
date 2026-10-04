import { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import paymentService from '@/services/paymentService';

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
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [upiId, setUpiId] = useState('harshil@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState(customerName || 'Harshil Patel');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  const [processing, setProcessing] = useState(false);
  const [testModeSuccess, setTestModeSuccess] = useState(true);
  const [error, setError] = useState('');

  // Calculate INR display amount ($25 = ₹2,000 in demo conversion rate if currency is USD)
  const formattedINR = currency === 'USD' || amount <= 100 ? `₹${Math.round(amount * 80)}` : `₹${amount}`;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // 1. Create Razorpay order
      const orderRes = await paymentService.createRazorpayOrder({
        amount: amount * 80,
        currency: 'INR',
        description,
      });

      const orderId = orderRes.data?.orderId || `order_${Date.now()}`;

      // Simulate 1.2s Razorpay bank handshake
      await new Promise((resolve) => setTimeout(resolve, 1400));

      if (!testModeSuccess) {
        throw new Error('Payment was declined by the bank (Test Failure Mode active).');
      }

      const paymentId = `pay_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

      // 2. Verify payment
      const verifyRes = await paymentService.verifyRazorpayPayment({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        paymentMethod: activeTab,
      });

      setProcessing(false);
      onSuccess({
        paymentId,
        orderId,
        method: activeTab,
        amount: formattedINR,
        data: verifyRes.data,
      });
    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Razorpay payment processing failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-900/40 bg-card shadow-2xl text-card-foreground">
        
        {/* Razorpay Brand Header Bar */}
        <div className="bg-[#0c2340] px-6 py-5 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md">
              <span className="font-extrabold text-lg tracking-tighter">RZP</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight leading-none text-white">Razorpay</h3>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 border border-blue-400/30">
                  Demo Mode
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1 font-medium truncate max-w-[200px]">
                {title}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-white leading-none">{formattedINR}</div>
            <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">({amount} USD equivalent)</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="absolute top-3 right-3 p-1.5 rounded-full text-blue-200/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Payment Methods Nav Tabs */}
        <div className="grid grid-cols-4 border-b border-border bg-muted/40 text-xs font-bold text-muted-foreground">
          <button
            type="button"
            onClick={() => setActiveTab('upi')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              activeTab === 'upi'
                ? 'border-blue-600 text-blue-600 bg-background font-bold'
                : 'border-transparent hover:text-foreground'
            }`}
          >
            <QrCode className="size-4" />
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              activeTab === 'card'
                ? 'border-blue-600 text-blue-600 bg-background font-bold'
                : 'border-transparent hover:text-foreground'
            }`}
          >
            <CreditCard className="size-4" />
            <span>Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('netbanking')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              activeTab === 'netbanking'
                ? 'border-blue-600 text-blue-600 bg-background font-bold'
                : 'border-transparent hover:text-foreground'
            }`}
          >
            <Building2 className="size-4" />
            <span>Netbanking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
              activeTab === 'wallet'
                ? 'border-blue-600 text-blue-600 bg-background font-bold'
                : 'border-transparent hover:text-foreground'
            }`}
          >
            <Wallet className="size-4" />
            <span>Wallets</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handlePayNow} className="p-6 space-y-5">
          
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-3.5 text-xs font-semibold text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: UPI / QR CODE */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-border bg-muted/20 text-center space-y-2">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-border">
                  {/* Razorpay QR Code Mock */}
                  <div className="size-36 bg-gradient-to-br from-blue-950 to-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-2 relative overflow-hidden">
                    <QrCode className="size-20 text-blue-400" />
                    <span className="text-[10px] font-mono mt-1 text-blue-200">skyline.ssa@razorpay</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Scan with Google Pay, PhonePe, Paytm or BHIM</p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Or enter UPI VPA ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. harshil@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT / DEBIT CARD */}
          {activeTab === 'card' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="4111 1111 1111 1111"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    CVV Code
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Harshil Patel"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 3: NETBANKING */}
          {activeTab === 'netbanking' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Popular Bank
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                      selectedBank === bank
                        ? 'border-blue-600 bg-blue-600/10 text-blue-600'
                        : 'border-border bg-background hover:border-blue-300'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WALLETS */}
          {activeTab === 'wallet' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Mobile Wallet
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {['Paytm', 'PhonePe Wallet', 'Amazon Pay', 'MobiKwik'].map((wallet) => (
                  <button
                    key={wallet}
                    type="button"
                    onClick={() => setSelectedWallet(wallet)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                      selectedWallet === wallet
                        ? 'border-blue-600 bg-blue-600/10 text-blue-600'
                        : 'border-border bg-background hover:border-blue-300'
                    }`}
                  >
                    {wallet}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Test Mode Simulator Toggle */}
          <div className="rounded-2xl bg-muted/60 p-3 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Demo Result:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTestModeSuccess(true)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  testModeSuccess ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ✓ Success
              </button>
              <button
                type="button"
                onClick={() => setTestModeSuccess(false)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  !testModeSuccess ? 'bg-destructive text-destructive-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ✕ Decline
              </button>
            </div>
          </div>

          {/* Razorpay Action Button */}
          <Button
            type="submit"
            disabled={processing}
            className="w-full h-12 rounded-2xl bg-[#0c2340] hover:bg-[#07172c] text-white font-bold text-base shadow-lg shadow-blue-950/20"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-blue-400" />
                <span>Processing Razorpay Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock className="size-4 text-blue-400" />
                <span>Pay {formattedINR} via Razorpay</span>
              </div>
            )}
          </Button>

          {/* Security Footer */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>256-bit SSL Encrypted • Powered by Razorpay</span>
          </div>
        </form>

      </div>
    </div>
  );
}
