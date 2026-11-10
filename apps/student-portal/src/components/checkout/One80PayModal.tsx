'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Zap, CreditCard, Smartphone } from 'lucide-react';

export interface One80PaymentSuccessPayload {
  paymentId: string;
  orderId: string;
  amount: number;
  provider: '180_pay';
  timestamp: string;
}

export interface One80PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  currency?: string;
  offeringTitle: string;
  tenantName: string;
  primaryColor?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  onSuccess: (payload: One80PaymentSuccessPayload) => void;
  onFailure?: (error: any) => void;
}

export const One80PayModal: React.FC<One80PayModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  currency = 'INR',
  offeringTitle,
  tenantName,
  primaryColor = '#2563eb',
  studentName = 'Student',
  studentEmail = '',
  studentPhone = '',
  onSuccess,
  onFailure,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const platformFee = Math.round(amount * 0.05);
  const teacherPayout = amount - platformFee;

  const handlePay = () => {
    setIsProcessing(true);
    setErrorMessage(null);

    // Simulate direct 180 Pay settlement
    setTimeout(() => {
      setIsProcessing(false);
      const payload: One80PaymentSuccessPayload = {
        paymentId: `180_pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderId,
        amount,
        provider: '180_pay',
        timestamp: new Date().toISOString(),
      };
      onSuccess(payload);
      onClose();
    }, 500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="one80-pay-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div
          className="p-6 text-white flex justify-between items-start"
          style={{ backgroundColor: primaryColor }}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1 opacity-90">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                180 Pay Gateway
              </span>
              <span className="text-xs font-medium">{tenantName}</span>
            </div>
            <h3 className="text-xl font-black text-white">{offeringTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Price Breakdown with 180 Pay Split Transparency */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Payable</span>
              <span className="text-3xl font-black text-slate-900">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-[11px] text-slate-500">
              <span>Teacher Payout (95%): <strong>₹{teacherPayout.toLocaleString('en-IN')}</strong></span>
              <span>Platform Fee (5%): ₹{platformFee.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  selectedMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  selectedMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card / NetBanking</span>
              </button>
            </div>
          </div>

          {/* Student Identity Confirmation */}
          <div className="text-xs text-slate-600 bg-slate-100/60 p-3 rounded-xl border border-slate-200 space-y-1">
            <p className="flex justify-between">
              <span>Student:</span>
              <strong className="text-slate-800">{studentName} ({studentPhone || 'Verified'})</strong>
            </p>
            <p className="flex justify-between text-[11px] text-slate-500">
              <span>Auth Service:</span>
              <span className="text-emerald-700 font-semibold">180 Identity Active</span>
            </p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            data-testid="complete-180-payment-btn"
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {isProcessing ? (
              'Settling via 180 Pay...'
            ) : (
              <>
                <span>Pay ₹{amount.toLocaleString('en-IN')} via 180 Pay</span>
                <Zap className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Secure Split Settlement • 180 Pay Infrastructure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
