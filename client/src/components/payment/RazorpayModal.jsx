import { useEffect } from 'react';
import { openOfficialRazorpayCheckout } from '@/services/razorpayService';

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
  useEffect(() => {
    if (!isOpen) return;

    openOfficialRazorpayCheckout({
      amount,
      currency,
      title,
      description,
      customerName,
      customerEmail,
      onSuccess: (details) => {
        if (onSuccess) onSuccess(details);
      },
      onClose: () => {
        if (onClose) onClose();
      },
    });
  }, [isOpen]);

  // Remove all custom UI elements from website; purely trigger official Razorpay test modal
  return null;
}
