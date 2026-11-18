'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { CourseSidebar } from './CourseSidebar';
import { ImpersonationBanner } from './ImpersonationBanner';
import { FastApiProvider } from '../providers/FastApiProvider';

export const StudioShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer automatically on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <>
        <FastApiProvider />
        <div className="min-h-screen bg-white text-[#0f172a] animate-page-enter">
          {children}
        </div>
      </>
    );
  }

  // Detect dedicated course workspace route: /batches/<courseId>...
  const courseMatch = pathname?.match(/^\/batches\/([^/]+)/);
  const activeCourseId = courseMatch ? courseMatch[1] : null;

  return (
    <>
      <FastApiProvider />
      <ImpersonationBanner />
      <div className="flex min-h-screen w-full min-w-0 bg-[#f8fafc] text-[#0f172a] items-start">
        {/* Desktop Docked Sidebar (lg+) — pinned to viewport while main workspace scrolls */}
        <div className="hidden lg:block shrink-0 sticky top-0 h-[100dvh] self-start z-30">
          {activeCourseId ? <CourseSidebar courseId={activeCourseId} /> : <Sidebar />}
        </div>

        {/* Mobile / Tablet Slide-Over Sidebar Drawer (<lg) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden !mt-0">
            <div
              className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-[2px] animate-backdrop-fade"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 flex h-full animate-drawer-left shadow-2xl">
              {activeCourseId ? <CourseSidebar courseId={activeCourseId} /> : <Sidebar />}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="absolute top-3.5 right-3 p-1.5 rounded-lg bg-[#f1f5f9] text-[#475569] hover:text-[#0f172a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Sticky Mobile / Tablet Top Header (<lg) */}
          <header className="lg:hidden sticky top-0 z-30 h-14 px-4 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                data-testid="mobile-menu-toggle"
                className="p-2 -ml-1.5 rounded-lg text-[#334155] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
              >
                <Menu className="w-4 h-4" />
              </button>
              <img
                src="/logo-black.svg"
                alt="Learnings Simplicion"
                className="w-6 h-6 object-contain shrink-0"
              />
              <span
                className="text-sm font-bold text-[#0f172a] truncate"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                {activeCourseId ? 'Course Workspace' : 'Learnings Simplicion'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              Studio
            </span>
          </header>

          <main
            key={pathname}
            className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 animate-page-enter"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
};
