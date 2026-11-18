'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Globe,
  UserCheck,
  X,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Authenticated180User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  token?: string;
}

export interface TeacherOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUser?: Authenticated180User | null;
  onSuccess?: (data: any) => void;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const TeacherOnboardingModal: React.FC<TeacherOnboardingModalProps> = ({
  isOpen,
  onClose,
  initialUser,
  onSuccess,
}) => {
  const [teacherName, setTeacherName] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<'academy' | 'student' | null>(null);

  useEffect(() => {
    if (isOpen && initialUser?.name && !teacherName) {
      setTeacherName(initialUser.name);
    }
  }, [isOpen, initialUser, teacherName]);

  if (!isOpen) return null;

  const cleanSlug = slug || 'your-academy';
  const academyDisplayUrl = `learnings.simplicion.com/${cleanSlug}`;
  const studentPortalDisplayUrl = `learnings.simplicion.com/s/${cleanSlug}/<student-id>`;
  const localAcademyUrl = `${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3001'}/${cleanSlug}`;

  const handleAcademyNameChange = (val: string) => {
    setAcademyName(val);
    if (!slugManuallyEdited) {
      setSlug(toSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const handleCreateAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = teacherName.trim();
    const trimmedAcademy = academyName.trim();
    const finalSlug = toSlug(slug || trimmedAcademy);

    if (!trimmedName || !trimmedAcademy || !finalSlug) {
      setError('Please enter your name and your academy name to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tenants/onboard-instant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherName: trimmedName,
          academyName: trimmedAcademy,
          slug: finalSlug,
          email: initialUser?.email || '',
          phone: initialUser?.phone || '',
          primaryColor: '#2563eb',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not create your academy workspace.');
      }

      setSlug(finalSlug);
      setSuccessData(data);

      if (typeof window !== 'undefined') {
        localStorage.setItem('simplicion_teacher_token', initialUser?.token || data.token || '');
        localStorage.setItem('simplicion_active_tenant', JSON.stringify(data.tenant));
      }

      if (onSuccess) onSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while creating your academy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: 'academy' | 'student') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="teacher-onboarding-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px] !mt-0"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] flex flex-col overflow-hidden border border-slate-200">
        {/* Clean, Minimal Executive Header */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Account Verified via 180 Identity</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {successData ? 'Your Academy is Ready' : 'Set Up Your Academy'}
            </h2>
            <p className="text-xs text-slate-500">
              {successData
                ? 'Your workspace is provisioned and persisted. Share your links with students.'
                : 'Just two quick details to reserve your academy and student portal URLs.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successData ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{academyName}</p>
                  <p className="text-xs text-slate-600 truncate">Educator: {teacherName}</p>
                </div>
              </div>

              {/* Clean Live Links Card */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Academy Website
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`https://${academyDisplayUrl}`, 'academy')}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {copiedKey === 'academy' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xs font-semibold text-slate-900 truncate">
                    {academyDisplayUrl}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      Student Portal Route
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`https://${studentPortalDisplayUrl}`, 'student')}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {copiedKey === 'student' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xs font-semibold text-blue-700 truncate">
                    {studentPortalDisplayUrl}
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                <a
                  href="/dashboard"
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 text-center shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <span>Open Teacher Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={localAcademyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>View Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateAcademy} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Field 1: Your Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="onboarding-educator-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Your Name
                </label>
                <input
                  id="onboarding-educator-name"
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Enter your full name"
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* Field 2: Academy Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="onboarding-academy-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Academy Name
                </label>
                <input
                  id="onboarding-academy-name"
                  type="text"
                  required
                  value={academyName}
                  onChange={(e) => handleAcademyNameChange(e.target.value)}
                  placeholder="Enter your academy name"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              {/* Live URL Structure Preview (learnings.simplicion.com/<academyname> & /s/<academyname>/<student-id>) */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-4 space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="onboarding-slug"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Academy URL
                  </label>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-900 transition">
                    <span className="px-3 py-2 text-xs font-mono text-slate-500 bg-slate-100 border-r border-slate-200 select-none shrink-0">
                      learnings.simplicion.com/
                    </span>
                    <input
                      id="onboarding-slug"
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="apex-physics"
                      className="flex-1 min-w-0 px-2.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Student Portal URL
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 truncate">
                    <span className="text-slate-400">learnings.simplicion.com/s/</span>
                    <span className="font-semibold text-blue-700">{cleanSlug}</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-emerald-700 font-semibold">&lt;student-id&gt;</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
              >
                <span>{isLoading ? 'Creating Your Academy...' : 'Create Academy'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
