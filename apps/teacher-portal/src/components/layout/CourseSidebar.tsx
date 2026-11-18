'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  LayoutDashboard,
  BookOpen,
  MessageCircleQuestion,
  ExternalLink,
  Radio,
  Settings,
  ClipboardCheck,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CourseSidebarProps {
  courseId: string;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({ courseId }) => {
  const pathname = usePathname();
  const [courseTitle, setCourseTitle] = useState('Course Workspace');
  const [courseTenantSlug, setCourseTenantSlug] = useState('cuet-humanities');
  const [courseStatus, setCourseStatus] = useState<'draft' | 'live'>('draft');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [openDoubts, setOpenDoubts] = useState(0);
  const [testsCount, setTestsCount] = useState(0);
  const [liveSessionsCount, setLiveSessionsCount] = useState(0);
  const [isLiveNow, setIsLiveNow] = useState(false);

  const loadSidebarState = useCallback(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/tests`).then((r) => r.json()),
    ])
      .then(([data, testsData]) => {
        if (data.success && data.course) {
          setCourseTitle(data.course.title);
          if (data.course.tenantSlug) setCourseTenantSlug(data.course.tenantSlug);
          setCourseStatus(data.course.status === 'live' ? 'live' : 'draft');
          setIsSetupComplete(Boolean(data.course.isSetupComplete));
          setOpenDoubts(data.metrics?.openDoubtsCount || 0);
          const sessions = Array.isArray(data.liveSessions) ? data.liveSessions : [];
          setLiveSessionsCount(sessions.length);
          setIsLiveNow(sessions.some((s: any) => s.status === 'live'));
        }
        if (testsData?.success && Array.isArray(testsData.tests)) {
          setTestsCount(testsData.tests.length);
        }
      })
      .catch(() => {});
  }, [courseId]);

  useEffect(() => {
    loadSidebarState();
    window.addEventListener('simplicion-course-updated', loadSidebarState);

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`course-sidebar-${courseId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseDoubt', filter: `courseId=eq.${courseId}` },
            () => loadSidebarState()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'LiveSession', filter: `courseId=eq.${courseId}` },
            () => loadSidebarState()
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'StudioCourse', filter: `id=eq.${courseId}` },
            () => loadSidebarState()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseTest', filter: `courseId=eq.${courseId}` },
            () => loadSidebarState()
          )
          .subscribe();
      }
    } catch {
      // Realtime optional fallback
    }

    return () => {
      window.removeEventListener('simplicion-course-updated', loadSidebarState);
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [courseId, pathname, loadSidebarState]);

  const navItems = [
    {
      label: 'Course Dashboard',
      href: `/batches/${courseId}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Subjects & Lessons',
      href: `/batches/${courseId}/subjects`,
      icon: BookOpen,
      exact: false,
    },
    {
      label: 'Live Classes',
      href: `/batches/${courseId}/live-classes`,
      icon: Radio,
      exact: false,
      badge: isLiveNow ? 'LIVE' : liveSessionsCount > 0 ? String(liveSessionsCount) : undefined,
      badgeTone: isLiveNow ? ('alert' as const) : ('neutral' as const),
    },
    {
      label: 'Tests',
      href: `/batches/${courseId}/tests`,
      icon: ClipboardCheck,
      exact: false,
      badge: testsCount > 0 ? String(testsCount) : undefined,
      badgeTone: 'neutral' as const,
    },
    {
      label: 'Doubts',
      href: `/batches/${courseId}/doubts`,
      icon: MessageCircleQuestion,
      exact: false,
      badge: openDoubts > 0 ? String(openDoubts) : undefined,
      badgeTone: 'alert' as const,
    },
  ];

  return (
    <aside className="w-64 bg-white text-[#0f172a] flex flex-col h-[100dvh] border-r border-[#e2e8f0] shrink-0">
      {/* Back to Main Academy Sidebar */}
      <div className="h-16 px-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <Link
          href="/batches"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#2563eb] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      {/* Active Course Context Card */}
      <div className="px-4 py-4 mx-3 mt-4 mb-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
            Course Panel
          </span>
          {isLiveNow ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] px-2 py-0.5 rounded-full">
              <Radio className="w-3 h-3 animate-pulse" />
              LIVE
            </span>
          ) : (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                courseStatus === 'live'
                  ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                  : isSetupComplete
                    ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                    : 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]'
              }`}
            >
              {courseStatus === 'live' ? 'Published' : isSetupComplete ? 'Draft' : 'Setup Pending'}
            </span>
          )}
        </div>
        <h2
          className="text-sm font-bold text-[#0f172a] leading-snug line-clamp-2"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          {courseTitle}
        </h2>
      </div>

      {/* Dedicated Course Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                  : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#2563eb]' : 'text-[#64748b]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#2563eb] text-white'
                      : (item as any).badgeTone === 'neutral'
                        ? 'bg-[#f1f5f9] text-[#475569]'
                        : 'bg-[#fef2f2] text-[#dc2626]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Course Setup Settings + View Course on Portal */}
      <div className="p-3 border-t border-[#e2e8f0] space-y-2">
        <Link
          href={`/batches/${courseId}?setup=1`}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#e2e8f0] transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Course Setup Settings</span>
          </span>
        </Link>
        <a
          href={`${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3001'}/${encodeURIComponent(courseTenantSlug)}#live-courses`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors"
        >
          <span>View Course on Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#64748b]" />
        </a>
      </div>
    </aside>
  );
};
