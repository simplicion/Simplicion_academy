'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  ArrowLeft,
  Lock,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

export interface TeacherOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

export const TeacherOnboardingModal: React.FC<TeacherOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'details' | 'subscription'>('details');
  const [teacherName, setTeacherName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [slug, setSlug] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAcademyNameChange = (val: string) => {
    setAcademyName(val);
    if (!slug || slug === academyName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(autoSlug);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherName || !academyName || !slug) {
      setError('Please provide your name, academy name, and desired URL slug.');
      return;
    }

    setStep('subscription');
  };

  const handlePayAndActivate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Provision the active tenant
      const response = await fetch('http://localhost:4000/tenants/onboard-instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherName,
          email,
          phone,
          academyName,
          slug,
          specialty,
          primaryColor,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to provision teacher academy.');
      }

      // 2. Activate ₹200/month Platform Subscription
      await fetch('http://localhost:4000/pay/180/subscribe-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: data.tenant.id,
          teacherName,
          email,
          paymentMethod: 'upi_auto_mandate',
        }),
      });

      setSuccessData(data);
      if (onSuccess) onSuccess(data);

      if (typeof window !== 'undefined') {
        localStorage.setItem('simplicion_teacher_token', data.token);
        localStorage.setItem('simplicion_active_tenant', JSON.stringify(data.tenant));
      }
    } catch (err: any) {
      setError(err.message || 'Error processing activation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const studentPortalUrl = `http://localhost:3001/${slug}`;
  const displayPortalUrl = `student.academy.simplicion.com/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(studentPortalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colorOptions = [
    { label: 'Royal Blue', hex: '#2563eb' },
    { label: 'Deep Violet', hex: '#7c3aed' },
    { label: 'Emerald Green', hex: '#059669' },
    { label: 'Crimson Red', hex: '#dc2626' },
    { label: 'Warm Amber', hex: '#d97706' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="teacher-onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-lg transition"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wide">
              <Zap className="w-3 h-3 fill-slate-950" />
              Instant Self-Serve • Zero Approval Wait
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {step === 'details' ? 'Launch Your Online Academy in 60s' : 'Activate Platform Subscription'}
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            {step === 'details'
              ? 'Enter your academy details. Zero approval wait — start teaching instantly.'
              : 'Flat ₹200/month for complete Teacher Studio, student portal & automated instant payouts.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Academy Live &amp; Subscription Active!
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Welcome <strong className="text-slate-900">{teacherName}</strong>! Your academy{' '}
                <strong className="text-blue-600">{academyName}</strong> is active and ready for your students.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2.5">
                <div>
                  <span className="text-slate-500 block mb-1">Your Shareable Student Portal Link:</span>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-300">
                    <code className="font-mono text-blue-600 font-bold text-xs truncate">
                      {displayPortalUrl}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 shrink-0 ml-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Subscription Status:</span>
                  <span className="font-semibold text-emerald-700">🟢 Active (₹200/month)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Revenue Split:</span>
                  <span className="font-semibold text-slate-800">95% Teacher / 5% Platform</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="/dashboard"
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 text-center shadow-md transition"
                >
                  Enter Teacher Studio &rarr;
                </a>
                <a
                  href={studentPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>Open Student Portal</span>
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </a>
              </div>
            </div>
          ) : step === 'details' ? (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Academy / Institute Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Physics Institute"
                  value={academyName}
                  onChange={(e) => handleAcademyNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Student Portal URL *
                </label>
                <div className="flex rounded-xl shadow-sm border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="inline-flex items-center px-3 bg-slate-100 text-slate-500 text-xs font-mono border-r border-slate-300 select-none">
                    student.academy.simplicion.com/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="apex-physics"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                      )
                    }
                    className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This is the exact link your students will use to access your courses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Educator Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alok Verma"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="alok@physicsacademy.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Exam Focus
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Target Exam</option>
                    <option value="CUET UG">CUET UG</option>
                    <option value="JEE Main & Advanced">JEE Main &amp; Advanced</option>
                    <option value="NEET UG">NEET UG</option>
                    <option value="Commerce & CA Foundation">Commerce &amp; CA Foundation</option>
                    <option value="UPSC Civil Services">UPSC Civil Services</option>
                    <option value="Class 11 & 12 Board Prep">Class 11 &amp; 12 Board Prep</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Brand Theme Color
                </label>
                <div className="flex gap-2.5 items-center">
                  {colorOptions.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setPrimaryColor(c.hex)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        primaryColor === c.hex
                          ? 'border-slate-900 scale-110 shadow-md ring-2 ring-blue-400'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                  <span className="text-xs text-slate-500 ml-2 font-mono">{primaryColor}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>Continue to Instant Activation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: ₹200/month Subscription Activation */
            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Plan Summary Card */}
              <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-50/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Educator Plan
                    </span>
                    <h4 className="text-lg font-black text-slate-900">
                      Platform Subscription
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">₹200</span>
                    <span className="text-xs text-slate-500 font-medium"> / month</span>
                  </div>
                </div>

                <div className="border-t border-blue-200/60 pt-3 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant activation — zero manual KYC or approval delays</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom student domain (student.academy.simplicion.com/{slug})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>95% student admission revenue paid directly to your account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full CBT Mock Exam engine &amp; dynamic watermark note protection</span>
                  </div>
                </div>
              </div>

              {/* Academy Summary Snapshot */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Academy</span>
                  <span className="font-bold text-slate-800">{academyName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Educator</span>
                  <span className="font-bold text-slate-800">{teacherName}</span>
                </div>
              </div>

              {/* Payment Action */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handlePayAndActivate}
                  className="w-full py-4 px-4 rounded-xl text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Activating Academy...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹200 &amp; Launch Academy Instantly</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Academy Details</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit encrypted checkout • Cancel subscription anytime</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
