'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  Zap,
  CheckCircle2,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Palette,
  FileCheck2,
  Lock,
  Wallet,
  Users,
  Building2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { TeacherOnboardingModal } from './TeacherOnboardingModal';

interface AcademyDirectoryItem {
  id: string;
  name: string;
  slug: string;
  teacherName: string;
  specialty: string;
  color?: string;
  exam: string;
}

export const TeacherLandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [academies, setAcademies] = useState<AcademyDirectoryItem[]>([
    {
      id: 'tenant_cuet_01',
      name: 'Humanities CUET Academy',
      slug: 'humanities-cuet',
      teacherName: 'Dr. Rajesh Varma',
      specialty: 'CUET UG Humanities, History & Political Science',
      exam: 'CUET UG',
      color: '#2563eb',
    },
    {
      id: 'tenant_apex_physics',
      name: 'Apex Physics Institute',
      slug: 'apex-physics',
      teacherName: 'Er. Alok Verma',
      specialty: 'JEE Advanced Mechanics, Electromagnetism & Modern Physics',
      exam: 'JEE / NEET',
      color: '#059669',
    },
    {
      id: 'tenant_rankers_commerce',
      name: 'Rankers Commerce Classes',
      slug: 'rankers-commerce',
      teacherName: 'CA Meenakshi Sundaram',
      specialty: 'Accountancy, Business Studies & Microeconomics',
      exam: 'Commerce & CA',
      color: '#7c3aed',
    },
    {
      id: 'tenant_dronacharya_upsc',
      name: 'Dronacharya IAS Mentorship',
      slug: 'dronacharya-ias',
      teacherName: 'Sanjay Deshmukh (Ex-IRS)',
      specialty: 'General Studies Paper II & Indian Polity',
      exam: 'UPSC Civil Services',
      color: '#dc2626',
    },
  ]);

  useEffect(() => {
    fetch('http://localhost:4000/tenants/search')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tenants && data.tenants.length > 0) {
          setAcademies((prev) => {
            const existingSlugs = new Set(prev.map((a) => a.slug));
            const newTenants = data.tenants.filter((t: any) => !existingSlugs.has(t.slug));
            return [...prev, ...newTenants];
          });
        }
      })
      .catch(() => {
        // Fallback to initial seeds
      });
  }, []);

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
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                Simplicion Academy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Educator Operating System
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">
              Features
            </a>
            <a href="#cbt" className="hover:text-blue-600 transition">
              CBT Mocks
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition">
              Pricing (₹200/mo)
            </a>
            <a href="#directory" className="hover:text-blue-600 transition">
              Live Academies
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Teacher Studio Sign In
            </Link>

            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition flex items-center gap-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Launch Your Academy</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>Instant Self-Serve Onboarding • Zero Approval Gate</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Empowering India&apos;s Best Teachers to Build{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Independent Academies
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Launch your branded online academy in 60 seconds with your custom student portal, live batches, CBT question bank, and instant payouts directly to your account.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Launch Your Academy in 60s</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl text-base font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Explore Demo Studio</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Custom Domain</p>
                <p className="text-[11px] text-slate-500">student.academy.simplicion.com/you</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">95% Net Revenue</p>
                <p className="text-[11px] text-slate-500">Instant direct UPI/Bank payouts</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">NTA CBT Engine</p>
                <p className="text-[11px] text-slate-500">Full exam simulation &amp; timing</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Flat ₹200/Month</p>
                <p className="text-[11px] text-slate-500">Zero upfront fees, cancel anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Academies Directory Search Section */}
      <section id="directory" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Active Educator Network
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Explore Academies Powered by Simplicion
          </h2>
          <p className="text-sm text-slate-600">
            See how top faculty across India deliver specialized test preparation on their own branded portals.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search academies by name, exam (CUET, JEE, NEET, UPSC), or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Academies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAcademies.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {item.exam}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Live"></span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Lead Faculty: <strong className="text-slate-700">{item.teacherName}</strong>
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {item.specialty}
                </p>

                <div className="p-2 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-500 truncate">
                  student.academy.simplicion.com/{item.slug}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <a
                  href={`http://localhost:3001/${item.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 transition flex items-center justify-center gap-1.5"
                >
                  <span>Visit Student Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Complete Educator Toolkit
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Everything You Need to Run Your Digital Institute
            </h2>
            <p className="text-sm text-slate-600">
              Replace fragmented tools, Google Drive links, and Telegram groups with a single unified academy portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No-Code Portal Builder</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Customize your academy colors, logos, promotional banners, course cards, and section ordering with a real-time live preview.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">NTA Standard CBT Testing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conduct computer-based mock tests with negative marking, timers, bilingual Hindi/English questions, and automated instant scorecards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Instant Direct Payouts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All course admission fees automatically disburse 95% straight to your UPI ID or bank account. Request withdrawals anytime with zero lock-in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Forensic Screen Watermarking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Protect your proprietary notes and PDF handouts with dynamic, semi-transparent student phone number watermarks to prevent piracy.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Structured Batches &amp; Units</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Organize your curriculum into progressive units, lecture recordings, revision notes, and targeted practice tests.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Student Roster &amp; Doubts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track enrolled students, manage doubts directly from the portal, and connect with students seamlessly via WhatsApp integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl font-black text-slate-900">
            One Simple Plan For Every Educator
          </h2>
          <p className="text-sm text-slate-600">
            No expensive custom software, no hidden percentages, and no technical headaches.
          </p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-blue-600 shadow-xl p-8 max-w-md mx-auto space-y-6 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Educator Plan
              </span>
              <h3 className="text-xl font-black text-slate-900">Full Academy License</h3>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-slate-900">₹200</span>
              <span className="text-xs text-slate-500 font-medium block">per month</span>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Unlimited student enrollments &amp; batch creation</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Custom Student URL (student.academy.simplicion.com/your-name)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>95% student admission revenue paid directly to you</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Complete NTA-standard CBT Mock testing platform</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Forensic screen watermark note protection</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero manual approval wait — instant access</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="w-full py-4 rounded-xl text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Launch Your Academy Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400">
            Cancel subscription anytime. No long-term lock-in.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-white">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <span className="font-bold">Simplicion Academy</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">The Operating System for India&apos;s Independent Teachers</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition">
              Teacher Studio
            </Link>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Student Portal
            </a>
            <span className="text-slate-600">© 2026 Simplicion</span>
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      <TeacherOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};
