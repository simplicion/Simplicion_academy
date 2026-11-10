'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherName || !academyName || !slug) {
      setError('Please provide your name, academy name, and desired slug.');
      return;
    }

    setIsLoading(true);
    try {
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

      setSuccessData(data);
      if (onSuccess) onSuccess(data);

      // Save active session
      if (typeof window !== 'undefined') {
        localStorage.setItem('simplicion_teacher_token', data.token);
        localStorage.setItem('simplicion_active_tenant', JSON.stringify(data.tenant));
      }
    } catch (err: any) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              Instant Zero-Approval Access
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Launch Your Online Academy in 60s
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Create your account to immediately unlock your Teacher Studio, customize your portal, and launch live batches.
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
                Academy Live & Ready!
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Congratulations <strong className="text-slate-900">{teacherName}</strong>! Your academy{' '}
                <strong className="text-blue-600">{academyName}</strong> is auto-provisioned in active status with authenticated 180 Identity.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Portal:</span>
                  <a
                    href={successData.studentPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-blue-600 hover:underline font-bold"
                  >
                    {slug}.simplicion.com
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authentication:</span>
                  <span className="font-semibold text-emerald-700">180 Identity Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approval Status:</span>
                  <span className="font-semibold text-emerald-700">🟢 Active & Approved</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={successData.redirectUrl}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25 transition flex items-center justify-center gap-2 text-sm"
                >
                  <span>Open Teacher Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name (Instructor / Director) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Rajesh Sharma"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@academy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academy / Coaching Institute Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Humanities CUET Academy"
                    value={academyName}
                    onChange={(e) => handleAcademyNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subdomain slug preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Your Student Portal Subdomain *
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="text"
                    required
                    placeholder="myacademy"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none"
                  />
                  <span className="bg-slate-100 text-slate-500 px-3 py-2 text-xs font-mono border-l border-slate-200 flex items-center">
                    .simplicion.com
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Your students will access courses at: <code className="text-blue-600 font-semibold">{slug || 'myacademy'}.simplicion.com</code>
                </p>
              </div>

              {/* Specialty & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exam Specialty / Subjects
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CUET UG, NEET, JEE, UPSC"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand Color Accent
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {colorOptions.map((c) => (
                      <button
                        type="button"
                        key={c.hex}
                        onClick={() => setPrimaryColor(c.hex)}
                        title={c.label}
                        className={`w-7 h-7 rounded-full border-2 transition ${
                          primaryColor === c.hex ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>No verification queue • Zero approval wait time</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span>Authenticated via 180 Identity • Direct 180 Pay settlement</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                data-testid="create-teacher-account-btn"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  'Provisioning Your Academy...'
                ) : (
                  <>
                    <span>Create Academy & Enter Studio</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
