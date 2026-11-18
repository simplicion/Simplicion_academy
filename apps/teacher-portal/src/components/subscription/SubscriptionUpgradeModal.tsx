'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface TeacherSubscriptionInfo {
  status: 'active' | 'inactive' | 'expired';
  isActive: boolean;
  planAmountInr: number;
  interval: 'monthly';
  startedAt: string | null;
  expiresAt: string | null;
  subscriptionId: string | null;
  provider: string;
  paymentMethod?: string | null;
}

export interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  tenantSlug?: string;
  courseTitle?: string;
  reason?: string;
  onClose: () => void;
  onUpgraded: (subscription: TeacherSubscriptionInfo) => void | Promise<void>;
}

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  tenantSlug = 'cuet-humanities',
  courseTitle,
  reason,
  onClose,
  onUpgraded,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/pay/180/subscribe-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          tenantId: tenantSlug,
          paymentMethod,
          upiId: paymentMethod === 'upi' ? upiId.trim() || undefined : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not activate educator subscription.');
      }

      setActivated(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('simplicion-subscription-updated'));
      }

      const sub: TeacherSubscriptionInfo = data.subscription || {
        status: 'active',
        isActive: true,
        planAmountInr: 250,
        interval: 'monthly',
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionId: data.transactionId || null,
        provider: '180_pay',
        paymentMethod,
      };

      setTimeout(async () => {
        await onUpgraded(sub);
        setActivated(false);
      }, 650);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      data-testid="subscription-upgrade-modal"
      onClick={() => !isSubmitting && onClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/55 backdrop-blur-[2px] !mt-0"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] flex flex-col border border-[#e2e8f0] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-start justify-between gap-4 bg-[#f8fafc] shrink-0">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]">
              <Sparkles className="w-3 h-3 text-[#2563eb]" />
              <span>Educator Subscription Required</span>
            </span>
            <h2
              className="text-lg sm:text-xl font-bold text-[#0f172a] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Upgrade to Publish Courses Live
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              {reason ||
                (courseTitle
                  ? `Activate your ₹250/month Educator Plan to publish "${courseTitle}" live on your Student Portal.`
                  : 'You can build courses, lessons, and tests freely in Draft mode. Activate your monthly Educator Plan to publish courses live to students.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close upgrade modal"
            className="p-1.5 rounded-lg text-[#64748b] hover:bg-white hover:text-[#0f172a] border border-transparent hover:border-[#e2e8f0] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {activated ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3
              className="text-lg font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Educator Subscription Activated!
            </h3>
            <p className="text-xs text-[#475569]">
              ₹250/month plan is now active via 180 Pay. Publishing your course live...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="p-6 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs font-medium text-[#b91c1c]">
                {error}
              </div>
            )}

            {/* Plan Pricing Card */}
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#e2e8f0]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
                    Educator Pro Plan
                  </p>
                  <p className="text-sm font-bold text-[#0f172a] mt-0.5">
                    Publish Unlimited Courses Live
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className="text-2xl font-extrabold text-[#0f172a]"
                    style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                  >
                    ₹250
                  </span>
                  <span className="text-xs text-[#64748b] block">/ month</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-[#334155]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                  <span>Publish unlimited courses live on your branded Student Portal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                  <span>Keep 95% of every student enrollment paid directly via 180 Pay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                  <span>Live YouTube classes, real-time doubts, CBT tests &amp; custom website</span>
                </li>
              </ul>
            </div>

            {/* Payment Method */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-[#334155]">
                Choose Payment Method (180 Pay)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#2563eb] bg-[#eff6ff] text-[#1e3a8a]'
                      : 'border-[#e2e8f0] hover:bg-[#f8fafc] text-[#334155]'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#2563eb] shrink-0" />
                  <div>
                    <p className="text-xs font-bold">UPI Instant</p>
                    <p className="text-[11px] text-[#64748b]">GPay, PhonePe, Paytm</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#2563eb] bg-[#eff6ff] text-[#1e3a8a]'
                      : 'border-[#e2e8f0] hover:bg-[#f8fafc] text-[#334155]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#2563eb] shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Card / NetBanking</p>
                    <p className="text-[11px] text-[#64748b]">Visa, RuPay, Master</p>
                  </div>
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    UPI ID (Optional for 180 Pay Quick Checkout)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. educator@okhdfcbank"
                    className="w-full px-3.5 py-2 text-xs text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-[#475569] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] transition-colors"
              >
                Keep in Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="confirm-subscribe-250-btn"
                className="w-full sm:w-auto flex-1 py-2.5 px-5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing ₹250 via 180 Pay...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹250/mo &amp; Activate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748b] pt-1">
              <Lock className="w-3 h-3 text-[#64748b]" />
              <span>Secured by 180 Pay • 30-day access • Cancel anytime</span>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
