'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Palette,
  FileCheck2,
  Lock,
  Wallet,
  BookOpen,
} from 'lucide-react';
import { TeacherOnboardingModal, Authenticated180User } from './TeacherOnboardingModal';
import { openOne80IdentityBottomSheet } from '../../lib/one80-sdk';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AcademyDirectoryItem {
  id: string;
  name: string;
  slug: string;
  teacherName: string;
  specialty: string;
  exam: string;
}

const CORE_FEATURES = [
  {
    icon: Palette,
    title: 'Branded Academy Storefront',
    description:
      'Launch a clean, SAFS-04 compliant one-page academy storefront at learnings.simplicion.com/academyname.',
  },
  {
    icon: FileCheck2,
    title: 'NTA-Standard CBT Engine',
    description:
      'Run bilingual timed mock tests with full question palettes, negative marking, and instant scorecards.',
  },
  {
    icon: Lock,
    title: 'Protected Study Material',
    description:
      'Share organized class notes, documents, and reference links securely inside each enrolled course.',
  },
  {
    icon: Wallet,
    title: '95% Direct Payouts via 180 Pay',
    description:
      'Transparent automated split settlements straight to your UPI or bank account with zero hidden fees.',
  },
  {
    icon: ShieldCheck,
    title: 'Unified 180 Identity Access',
    description:
      'Frictionless one-tap login for educators and students powered by 180 Sovereign Identity.',
  },
  {
    icon: BookOpen,
    title: 'Dedicated Student Portals',
    description:
      'Every student gets a clean portal link at learnings.simplicion.com/s/academy/student-id.',
  },
];

export const TeacherLandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [authUser, setAuthUser] = useState<Authenticated180User | null>(null);
  const [isOpeningAuth, setIsOpeningAuth] = useState(false);

  const [academies, setAcademies] = useState<AcademyDirectoryItem[]>([]);
  const [loadingAcademies, setLoadingAcademies] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/tenants/search`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.academies || data.tenants || [];
        if (data.success && Array.isArray(list)) {
          setAcademies(list);
        }
      })
      .catch(() => {
        setAcademies([]);
      })
      .finally(() => setLoadingAcademies(false));
  }, []);

  /**
   * Launches the official 180 Identity hosted bottom sheet (produced entirely by 180 Core SDK).
   * Immediately after account creation / sign-in, displays the clean 2-field Academy Setup form.
   */
  const launch180IdentityFlow = async (intent: 'login' | 'signup') => {
    setIsOpeningAuth(true);
    try {
      await openOne80IdentityBottomSheet({
        onSuccess: async (res) => {
          setIsOpeningAuth(false);
          let resolvedUser: Authenticated180User = {
            id: res.user?.id || res.user?.sub,
            name: res.user?.name || '',
            email: res.user?.email || '',
            phone: res.user?.phone || '',
            token: res.token || res.accessToken,
          };

          if (res.code) {
            try {
              const callbackRes = await fetch(`${API_BASE_URL}/auth/180/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code: res.code,
                  redirectUri: `${window.location.origin}/`,
                }),
              });
              const data = await callbackRes.json();
              if (callbackRes.ok && data.success && data.user) {
                resolvedUser = {
                  id: data.user.id,
                  name: data.user.name || resolvedUser.name,
                  email: data.user.email || resolvedUser.email,
                  phone: data.user.phone || resolvedUser.phone,
                  token: data.token || resolvedUser.token,
                };
              }
            } catch {
              // Keep details returned by 180 Identity SDK
            }
          }

          setAuthUser(resolvedUser);
          if (resolvedUser.token) {
            localStorage.setItem('simplicion_teacher_token', resolvedUser.token);
          }

          if (intent === 'login' && localStorage.getItem('simplicion_active_tenant')) {
            window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/dashboard`;
            return;
          }

          // Immediately display the minimal Academy Setup form right after 180 Identity auth
          setIsOnboardingOpen(true);
        },
        onError: () => setIsOpeningAuth(false),
        onCancel: () => setIsOpeningAuth(false),
      });
    } catch {
      setIsOpeningAuth(false);
    }
  };

  const filteredAcademies = academies.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.teacherName.toLowerCase().includes(q) ||
      a.specialty.toLowerCase().includes(q) ||
      a.exam.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="min-h-screen bg-white text-[#0f172a] flex flex-col selection:bg-[#2563eb] selection:text-white"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* SAFS-04 Clean Header: Official Logo + Learnings Simplicion + Login Button Only (Zero Nav Links) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-black.svg"
              alt="Learnings Simplicion"
              className="w-8 h-8 object-contain"
            />
            <span
              className="text-base sm:text-lg font-bold tracking-tight text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Learnings Simplicion
            </span>
          </div>

          <button
            type="button"
            onClick={() => launch180IdentityFlow('login')}
            disabled={isOpeningAuth}
            data-testid="teacher-header-login-btn"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors shadow-sm disabled:opacity-60"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero Section (SAFS-04 Clarity, Hierarchy, Tokenized Palette) */}
      <section className="py-20 lg:py-28 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff6ff] border border-[#dbeafe] text-[#1d4ed8] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
            <span>Instant Self-Serve Academy Infrastructure</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0f172a] leading-[1.15]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            Empowering India&apos;s Educators to Build{' '}
            <span className="text-[#2563eb]">Independent Academies</span>
          </h1>

          <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Launch your branded online academy in 60 seconds with your own web address, dedicated
            student portals, NTA-pattern CBT tests, and direct payouts.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => launch180IdentityFlow('signup')}
              disabled={isOpeningAuth}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>Launch Your Academy</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => launch180IdentityFlow('login')}
              disabled={isOpeningAuth}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-[#0f172a] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] transition-colors"
            >
              Sign In to Studio
            </button>
          </div>

          {/* SAFS-04 Trust Strip */}
          <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm card-interactive space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0f172a]">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Academy URL</span>
              </div>
              <p className="text-xs font-mono text-[#64748b] truncate">
                learnings.simplicion.com/academy
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm card-interactive space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0f172a]">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>95% Net Revenue</span>
              </div>
              <p className="text-xs text-[#64748b]">Direct UPI &amp; bank splits via 180 Pay</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm card-interactive space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0f172a]">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>NTA CBT Engine</span>
              </div>
              <p className="text-xs text-[#64748b]">Bilingual mocks &amp; instant scorecards</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm card-interactive space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0f172a]">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Flat ₹250 / Month</span>
              </div>
              <p className="text-xs text-[#64748b]">Build free, subscribe to publish live</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Academies Directory */}
      <section className="py-16 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
              Active Educator Network
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Academies on Learnings Simplicion
            </h2>
            <p className="text-sm text-[#475569]">
              Search active educator portals running on learnings.simplicion.com.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by academy, exam (CUET, JEE, NEET, UPSC), or educator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] placeholder:text-[#94a3b8] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition"
              />
            </div>
          </div>

          {loadingAcademies ? (
            <div className="text-center py-10 text-sm text-[#64748b]">
              Loading live academies...
            </div>
          ) : filteredAcademies.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] space-y-2">
              <p className="text-sm font-semibold text-[#0f172a]">
                {searchQuery.trim() ? 'No matching academies found' : 'No academies published yet'}
              </p>
              <p className="text-xs text-[#64748b]">
                Launch your academy portal in seconds using the Get Started button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAcademies.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm hover:border-[#2563eb] card-interactive flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8]">
                        {item.exam || 'Online Academy'}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full bg-[#10b981]"
                        title="Active"
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-[#0f172a] text-base leading-snug">
                        {item.name}
                      </h3>
                      {item.teacherName && (
                        <p className="text-xs text-[#64748b] mt-0.5">{item.teacherName}</p>
                      )}
                    </div>

                    {item.specialty && (
                      <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                        {item.specialty}
                      </p>
                    )}

                    <div className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[11px] font-mono text-[#475569] truncate">
                      learnings.simplicion.com/{item.slug}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#f1f5f9]">
                    <a
                      href={`${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3001'}/${item.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#2563eb] hover:text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Capabilities Section (Unified SAFS-04 Primary Icon System) */}
      <section className="py-16 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
              Built on SAFS Standards
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Everything Needed to Run Your Academy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm space-y-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#0f172a]">{feat.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section (Single Clean Tokenized Card) */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
              Transparent Pricing
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              One Simple Plan for Every Educator
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8 max-w-md mx-auto space-y-6 text-left">
            <div className="flex items-baseline justify-between pb-5 border-b border-[#f1f5f9]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2563eb]">
                  Educator License
                </span>
                <h3 className="text-lg font-bold text-[#0f172a] mt-0.5">Full Academy Suite</h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-[#0f172a]">₹250</span>
                <span className="text-xs text-[#64748b] block">/ month</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-[#334155]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>Dedicated URL: learnings.simplicion.com/academyname</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>Student portals: learnings.simplicion.com/s/academy/student-id</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>95% student fee revenue settled directly via 180 Pay</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span>Unlimited batches, CBT mocks, and watermarked notes</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => launch180IdentityFlow('signup')}
              disabled={isOpeningAuth}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>Get Started with 180 Identity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Clean Minimal Footer matching Header (Official Logo + Learnings Simplicion, Zero Cluttered Links) */}
      <footer className="mt-auto bg-white border-t border-[#e2e8f0] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-black.svg"
              alt="Learnings Simplicion"
              className="w-7 h-7 object-contain"
            />
            <span
              className="text-sm font-bold tracking-tight text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Learnings Simplicion
            </span>
          </div>

          <p className="text-xs text-[#64748b]">
            © {new Date().getFullYear()} Simplicion Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Clean 2-Field Academy Setup Form — Shown immediately after 180 Identity bottom sheet */}
      <TeacherOnboardingModal
        isOpen={isOnboardingOpen}
        initialUser={authUser}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};
