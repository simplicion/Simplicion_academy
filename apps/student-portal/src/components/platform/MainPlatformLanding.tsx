'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, ShieldCheck, Zap, BookOpen, GraduationCap, Users } from 'lucide-react';
import { TeacherOnboardingModal } from './TeacherOnboardingModal';

export interface AcademyItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  primaryColor: string;
  teacherName?: string;
  specialty?: string;
  exam?: string;
  studentPortalUrl: string;
}

const initialAcademies: AcademyItem[] = [
  {
    id: 'tenant_cuet_01',
    slug: 'cuet-humanities',
    name: 'Humanities CUET Academy',
    teacherName: 'Prof. Rajesh Sharma',
    specialty: 'CUET UG Humanities & Social Sciences',
    tagline: 'Humanities walon, tum kisi se kam nahi!',
    primaryColor: '#2563eb',
    exam: 'CUET UG',
    studentPortalUrl: 'http://localhost:3001/?tenant=cuet-humanities',
  },
  {
    id: 'tenant_apex_physics',
    slug: 'apex-physics',
    name: 'Apex Physics Institute',
    teacherName: 'Er. Alok Verma (Ex-IITD)',
    specialty: 'JEE Advanced & NEET Physics',
    tagline: 'Concept clarity to top 100 rank',
    primaryColor: '#7c3aed',
    exam: 'JEE / NEET',
    studentPortalUrl: 'http://localhost:3001/?tenant=apex-physics',
  },
  {
    id: 'tenant_rankers_commerce',
    slug: 'rankers-commerce',
    name: 'Rankers Commerce Classes',
    teacherName: 'CA Meenakshi Sundaram',
    specialty: 'Accountancy, BST & Economics',
    tagline: 'Chartered journey starts here',
    primaryColor: '#059669',
    exam: 'Commerce & CA',
    studentPortalUrl: 'http://localhost:3001/?tenant=rankers-commerce',
  },
  {
    id: 'tenant_chanakya_ias',
    slug: 'chanakya-ias',
    name: 'Chanakya Civil Services Hub',
    teacherName: 'Dr. Pradeep Mishra',
    specialty: 'UPSC CSE GS Papers & Answer Writing',
    tagline: 'Mentoring future civil servants',
    primaryColor: '#b45309',
    exam: 'UPSC CSE',
    studentPortalUrl: 'http://localhost:3001/?tenant=chanakya-ias',
  },
];

export const MainPlatformLanding: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [academies, setAcademies] = useState<AcademyItem[]>(initialAcademies);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Fetch live academies from API search endpoint if available
  useEffect(() => {
    fetch('http://localhost:4000/tenants/search')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.academies && data.academies.length > 0) {
          setAcademies(data.academies);
        }
      })
      .catch(() => {
        // Fallback to local reference institutes
      });
  }, []);

  const filteredAcademies = academies.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.slug.toLowerCase().includes(q) ||
      a.teacherName?.toLowerCase().includes(q) ||
      a.specialty?.toLowerCase().includes(q) ||
      a.exam?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <TeacherOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSuccess={(newTenantData) => {
          // Append new academy to current list
          setAcademies((prev) => [
            {
              id: newTenantData.tenant.id,
              slug: newTenantData.tenant.slug,
              name: newTenantData.tenant.name,
              tagline: newTenantData.tenant.settings.branding.tagline,
              primaryColor: newTenantData.tenant.settings.branding.primaryColor,
              teacherName: newTenantData.tenant.ownerUserId,
              specialty: 'Newly Launched',
              exam: 'Self-Serve',
              studentPortalUrl: newTenantData.studentPortalUrl,
            },
            ...prev,
          ]);
        }}
      />

      {/* Main Platform Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Simplicion <span className="text-blue-600">Academy</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Multi-Tenant Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="http://localhost:3002"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition hidden md:block"
            >
              Teacher Studio
            </a>
            <a
              href="http://localhost:3003"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition hidden md:block"
            >
              Super Admin
            </a>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              data-testid="teach-on-simplicion-btn"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-blue-500/20 active:scale-95 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Teacher Account</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Search Header */}
      <section className="bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-slate-50 py-16 sm:py-24 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-emerald-600" />
            <span>Instant Self-Serve Onboarding • Zero Approval Gate</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Empowering India's Best Teachers to Build{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Independent Academies
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Discover premier specialized learning portals or launch your own branded academy in 60 seconds with integrated <strong>180 Identity</strong> and <strong>180 Pay</strong>.
          </p>

          {/* Live Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center shadow-lg rounded-2xl bg-white border-2 border-slate-200/80 focus-within:border-blue-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Search academies by name, exam (CUET, JEE, NEET, UPSC), or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="academy-search-input"
                className="w-full px-4 py-4 text-sm sm:text-base text-slate-900 rounded-2xl focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mr-4 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
              <span className="font-semibold">Quick Filters:</span>
              {['CUET', 'JEE / NEET', 'Commerce & CA', 'UPSC'].map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => setSearchQuery(exam)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full transition"
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Academies Explorer Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Featured Academy Portals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {filteredAcademies.length} active coaching academies on the network
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>+ Add Your Academy</span>
          </button>
        </div>

        {filteredAcademies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No academies match your search</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try searching for "CUET", "Physics", or "Commerce", or create this academy yourself!
            </p>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-700 transition"
            >
              Start This Academy Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="academies-grid">
            {filteredAcademies.map((academy) => (
              <div
                key={academy.id}
                data-testid={`academy-card-${academy.slug}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                <div className="p-6">
                  {/* Card Header Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md text-white shadow-sm"
                      style={{ backgroundColor: academy.primaryColor }}
                    >
                      {academy.exam || 'Competitive'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      /{academy.slug}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {academy.name}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{academy.teacherName || 'Academy Faculty'}</span>
                  </p>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{academy.tagline}"
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <a
                    href={`http://localhost:3002/?tenantId=${academy.id}&slug=${academy.slug}&name=${encodeURIComponent(academy.name)}`}
                    className="font-medium text-slate-600 hover:text-slate-900 py-1 px-2.5 rounded-lg hover:bg-slate-200/60 transition"
                  >
                    Teacher Studio
                  </a>
                  <a
                    href={`http://localhost:3001/?tenant=${academy.slug}`}
                    className="font-bold text-white px-3.5 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
                    style={{ backgroundColor: academy.primaryColor }}
                  >
                    <span>Visit Student Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Platform Architecture & 180 Suite Footer Info */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-400">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <span>Simplicion Academy Architecture</span>
              </div>
              <p className="leading-relaxed">
                Full-featured Domain-Driven Design (DDD) multi-tenant learning ecosystem. Teachers have 100% white-label ownership of their portal, student roster, and test banks.
              </p>
            </div>

            <div>
              <span className="text-white font-bold text-sm mb-2 block">
                Integrated 180 Infrastructure
              </span>
              <ul className="space-y-1.5">
                <li>• <strong>180 Identity:</strong> Zero-approval teacher onboarding & single sign-on</li>
                <li>• <strong>180 Pay:</strong> 95% automated teacher split settlements</li>
                <li>• <strong>HMAC SHA256:</strong> Cryptographic webhook fulfillment</li>
              </ul>
            </div>

            <div>
              <span className="text-white font-bold text-sm mb-2 block">
                Platform Portals
              </span>
              <ul className="space-y-1.5 font-mono">
                <li>• Student Discovery: :3001</li>
                <li>• Teacher Studio: :3002</li>
                <li>• Super Admin Governance: :3003</li>
                <li>• Delivery API: :4000</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
            <p>© 2026 Simplicion Academy. Conforming to SAFS-00 through SAFS-06 Standards.</p>
            <div className="flex items-center gap-4">
              <span>Client ID: 180_client_3f69...</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">180 Pay Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
