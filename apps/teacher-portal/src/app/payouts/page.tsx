'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Send,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '@simplicion/ui';
import { SubscriptionUpgradeModal } from '../../components/subscription/SubscriptionUpgradeModal';

interface PayoutRecord {
  payoutId: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: string;
  payoutMethod: string;
  recipient: string;
  recipientName: string;
  transactionRef: string;
  createdAt: string;
}

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [tenantSlug, setTenantSlug] = useState('cuet-humanities');
  const [balance, setBalance] = useState({
    lifetimeEarnings: 0,
    totalDisbursed: 0,
    availableBalance: 0,
    subscriptionStatus: 'inactive',
    subscriptionFee: '₹250/month',
    subscriptionExpiresAt: null as string | null,
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [amountInput, setAmountInput] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resolveActiveSlug = () => {
    let slug = 'cuet-humanities';
    try {
      const saved = localStorage.getItem('simplicion_active_tenant');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.slug) slug = String(parsed.slug).toLowerCase();
      }
    } catch {
      // ignore
    }
    return slug;
  };

  // Load live payouts & Educator Subscription from 180 Pay API (Supabase-backed)
  const loadPayoutData = async () => {
    try {
      setLoading(true);
      const activeSlug = resolveActiveSlug();
      setTenantSlug(activeSlug);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const [res, subRes] = await Promise.all([
        fetch(`${apiBase}/pay/180/payouts?tenant=${encodeURIComponent(activeSlug)}&tenantId=${encodeURIComponent(activeSlug)}`),
        fetch(`${apiBase}/subscription/status?tenant=${encodeURIComponent(activeSlug)}`),
      ]);
      let liveStatus = 'inactive';
      let liveExpiresAt: string | null = null;
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.success && subData.subscription) {
          liveStatus = subData.subscription.isActive ? 'active' : 'inactive';
          liveExpiresAt = subData.subscription.expiresAt || null;
        }
      }
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const bal = data.balance || data.summary || {};
          setBalance({
            lifetimeEarnings: Number(bal.lifetimeEarnings ?? bal.totalNetEarned ?? 0),
            totalDisbursed: Number(bal.totalDisbursed ?? 0),
            availableBalance: Number(bal.availableBalance ?? 0),
            subscriptionStatus: liveStatus || bal.subscriptionStatus || 'inactive',
            subscriptionFee: '₹250/month',
            subscriptionExpiresAt: liveExpiresAt,
          });
          setPayouts(Array.isArray(data.history) ? data.history : []);
        }
      } else {
        setBalance((prev) => ({
          ...prev,
          subscriptionStatus: liveStatus,
          subscriptionFee: '₹250/month',
          subscriptionExpiresAt: liveExpiresAt,
        }));
      }
    } catch {
      // Keep zero balance on network error — never fabricate mock payouts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayoutData();
    window.addEventListener('simplicion-subscription-updated', loadPayoutData);
    return () => window.removeEventListener('simplicion-subscription-updated', loadPayoutData);
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amountInput);

    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }

    if (withdrawAmt > balance.availableBalance) {
      alert(`Requested amount exceeds your available balance of ₹${balance.availableBalance.toLocaleString('en-IN')}`);
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    const payload = {
      tenantId: tenantSlug,
      amount: withdrawAmt,
      payoutMethod,
      destination:
        payoutMethod === 'upi'
          ? { upiId, recipientName: accountHolder }
          : { accountNumber, ifsc, recipientName: accountHolder },
    };

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiBase}/pay/180/payouts/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.payout) {
        setPayouts((prev) => [data.payout, ...prev]);
        setBalance((prev) => ({
          ...prev,
          totalDisbursed: prev.totalDisbursed + withdrawAmt,
          availableBalance: Math.max(0, prev.availableBalance - withdrawAmt),
        }));
        setSuccessMessage(`Success! ₹${withdrawAmt.toLocaleString('en-IN')} has been disbursed via 180 Pay.`);
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMessage(null);
        }, 1800);
      } else {
        alert(data.error || 'Payout request failed.');
      }
    } catch {
      alert('Unable to connect to 180 Pay settlement server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      {/* SAFS-04 Clean Payouts Header Card */}
      <div className="rounded-xl bg-white p-6 border border-[#e2e8f0] shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-[#1d4ed8] text-xs font-semibold border border-[#dbeafe]">
              <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>180 Pay Settlement Engine</span>
            </span>
            {balance.subscriptionStatus === 'active' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] text-xs font-semibold border border-[#a7f3d0]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Educator Plan: ₹250/mo Active</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fffbeb] hover:bg-[#fef3c7] text-[#b45309] text-xs font-semibold border border-[#fde68a] transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-[#d97706]" />
                <span>Educator Plan Inactive — Upgrade ₹250/mo</span>
              </button>
            )}
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            Earnings &amp; Payouts
          </h1>
          <p className="text-sm text-[#475569] leading-relaxed">
            Student admissions split automatically (95% direct to you, 5% platform fee) into your 180 Pay ledger. Request instant disbursals to your UPI ID or bank account anytime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors disabled:opacity-50"
            onClick={() => {
              setAmountInput(balance.availableBalance.toString());
              setIsModalOpen(true);
            }}
            disabled={balance.availableBalance <= 0}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Request Payout via 180 Pay</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] transition-colors disabled:opacity-50"
            onClick={loadPayoutData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-[#64748b] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Balance</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Unified SAFS-04 Surface & Token Palette) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm min-w-0">
          <div className="flex items-center justify-between text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wider">
            <span className="truncate">Available for Payout</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            ₹ {balance.availableBalance.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center text-xs text-[#059669] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span>Ready for instant transfer</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm min-w-0">
          <div className="flex items-center justify-between text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wider">
            <span className="truncate">Lifetime Net Share (95%)</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            ₹ {balance.lifetimeEarnings.toLocaleString('en-IN')}
          </p>
          <p className="mt-2 text-xs text-[#64748b]">After 5% platform split</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm min-w-0">
          <div className="flex items-center justify-between text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wider">
            <span className="truncate">Total Disbursed</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            ₹ {balance.totalDisbursed.toLocaleString('en-IN')}
          </p>
          <p className="mt-2 text-xs text-[#64748b]">Settled directly via 180 Pay</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm min-w-0">
          <div className="flex items-center justify-between text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wider">
            <span className="truncate">Educator Subscription</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p
              className="text-2xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              ₹250
            </p>
            <span className="text-xs text-[#64748b]">/ month</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            {balance.subscriptionStatus === 'active' ? (
              <>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                  Active
                </span>
                <span className="text-xs text-[#64748b] truncate">
                  {balance.subscriptionExpiresAt
                    ? `Renews ${new Date(balance.subscriptionExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                    : 'Monthly billing'}
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                  Inactive
                </span>
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="text-xs font-semibold text-[#2563eb] hover:underline shrink-0"
                >
                  Activate Now →
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Disbursals History Table */}
      <Card padding="lg" className="border-slate-200">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Disbursal Transactions Ledger</h2>
            <p className="text-xs text-slate-500">Direct payouts executed by 180 Pay to your bank or UPI destination</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {payouts.length} Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Disbursed Amount</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">UTR / 180 Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-xs text-slate-400">
                    Loading live payout ledger...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-xs text-slate-500">
                    No payout disbursals yet. Once students enroll in your paid courses, your 95% net share will appear above for instant withdrawal.
                  </td>
                </tr>
              ) : (
                payouts.map((item) => (
                  <tr key={item.payoutId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.payoutId}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                      ₹ {item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item.payoutMethod}
                        </span>
                        <span className="font-semibold text-slate-800">{item.recipient}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.recipientName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {item.transactionRef}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 180 Suite Infrastructure Details */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Autonomous 180 Infrastructure Active</p>
          <p className="text-blue-800 leading-relaxed">
            User access, role audits, and security are powered by <strong>180 Identity</strong> (<code className="font-mono bg-blue-100 px-1 py-0.5 rounded">180_client_3f69...</code>). Commercial batch payments, monthly Educator Subscriptions (₹250/mo to publish courses live), and automated instant payouts are processed without intermediaries through <strong>180 Pay</strong>.
          </p>
        </div>
      </div>

      {/* Payout Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Payout via 180 Pay"
        size="md"
      >
        <form onSubmit={handleRequestPayout} className="space-y-4">
          {successMessage ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-900">{successMessage}</p>
              <p className="text-xs text-emerald-700">180 Pay IMPS transfer initiated instantly.</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Available Balance</p>
                  <p className="text-lg font-black text-slate-900">
                    ₹ {balance.availableBalance.toLocaleString('en-IN')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold"
                  onClick={() => setAmountInput(balance.availableBalance.toString())}
                >
                  Withdraw All
                </Button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <Input
                  type="number"
                  min="1"
                  max={balance.availableBalance}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Disbursal Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition ${
                      payoutMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Send className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">UPI Instant Transfer</p>
                      <p className="text-[10px] text-slate-500">Fastest (under 30s)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition ${
                      payoutMethod === 'bank'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Bank Account</p>
                      <p className="text-[10px] text-slate-500">IMPS / NEFT</p>
                    </div>
                  </button>
                </div>
              </div>

              {payoutMethod === 'upi' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    UPI ID (VPA)
                  </label>
                  <Input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Number
                    </label>
                    <Input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 50100234567890"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bank IFSC Code
                    </label>
                    <Input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Beneficiary Name
                </label>
                <Input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting to 180 Pay...</span>
                    </span>
                  ) : (
                    <span>Disburse ₹{parseFloat(amountInput || '0').toLocaleString('en-IN')} via 180 Pay</span>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>

      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        tenantSlug="cuet-humanities"
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgraded={() => {
          setIsUpgradeModalOpen(false);
          loadPayoutData();
        }}
      />
    </div>
  );
}

