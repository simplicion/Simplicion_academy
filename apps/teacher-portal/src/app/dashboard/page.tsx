'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  IndianRupee,
  BookOpen,
  MessageCircleQuestion,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TeacherDashboardPage() {
  const [academyName, setAcademyName] = useState('Learnings Simplicion');
  const [metrics, setMetrics] = useState({
    totalCourses: 0,
    liveCourses: 0,
    totalEnrollments: 0,
    uniqueStudents: 0,
    grossRevenue: 0,
    netTeacherRevenue: 0,
    openDoubts: 0,
    totalDoubts: 0,
    resolutionRate: 100,
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [recentDoubts, setRecentDoubts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOverview = useCallback(async (slug: string) => {
    try {
      const [ovRes, cfgRes] = await Promise.all([
        fetch(`${API_BASE_URL}/academy/overview?tenant=${encodeURIComponent(slug)}`),
        fetch(`${API_BASE_URL}/site-config?tenant=${encodeURIComponent(slug)}`),
      ]);
      const [ovData, cfgData] = await Promise.all([ovRes.json(), cfgRes.json()]);
      if (ovData.success) {
        if (ovData.metrics) setMetrics(ovData.metrics);
        setCourses(ovData.courses || []);
        setRecentDoubts(ovData.recentDoubts || []);
      }
      if (cfgData?.success && cfgData.data?.name) {
        setAcademyName(cfgData.data.name);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let slug = 'cuet-humanities';
    const stored = localStorage.getItem('simplicion_active_tenant');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.slug) slug = parsed.slug;
      } catch {
        // ignore
      }
    }
    loadOverview(slug);

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel('academy-overview-live')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'StudioCourse' }, () =>
            loadOverview(slug)
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'CourseEnrollment' }, () =>
            loadOverview(slug)
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'CourseDoubt' }, () =>
            loadOverview(slug)
          )
          .subscribe();
      }
    } catch {
      // optional
    }

    return () => {
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [loadOverview]);

  return (
    <div className="space-y-6 w-full min-w-0 pb-10">

      {/* Clean SAFS-04 Overview Banner */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6">
        <h1
          className="text-xl sm:text-2xl font-bold text-[#0f172a]"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          {academyName}
        </h1>
        <p className="text-xs text-[#64748b] mt-1">
          Manage courses, customize your public website &amp; brand color, and respond to students in real time.
        </p>
      </div>

      {/* Live 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            <span>Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-[#0f172a] mt-3"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {metrics.uniqueStudents.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {metrics.totalEnrollments} total course enrollment{metrics.totalEnrollments === 1 ? '' : 's'}
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            <span>Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-[#0f172a] mt-3"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            ₹ {metrics.grossRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#059669] font-medium mt-1">
            95% Net Share: ₹{metrics.netTeacherRevenue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            <span>Published Courses</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-[#0f172a] mt-3"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {metrics.liveCourses} Live
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {metrics.totalCourses} total course{metrics.totalCourses === 1 ? '' : 's'} in studio
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            <span>Doubt Resolution</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
              <MessageCircleQuestion className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-[#059669] mt-3"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {metrics.resolutionRate}%
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {metrics.openDoubts} open doubt{metrics.openDoubts === 1 ? '' : 's'} awaiting reply
          </p>
        </div>
      </div>

      {/* Main Split: Live Courses Table + Recent Doubts Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">Your Academy Courses</h2>
              <p className="text-xs text-[#64748b]">
                Click any course to open its dedicated dashboard, subjects, tests, live classes &amp; doubts
              </p>
            </div>
            <Link
              href="/batches"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#e2e8f0]"
            >
              <span>All Courses</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-10 text-center text-xs text-[#64748b]">Loading live courses...</div>
            ) : courses.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm font-semibold text-[#0f172a]">No courses created yet</p>
                <p className="text-xs text-[#64748b]">
                  Create your first course in 5 seconds and publish it directly to your student website.
                </p>
                <Link
                  href="/batches"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Course</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Enrolled</th>
                      <th className="py-3 px-4">Revenue</th>
                      <th className="py-3 px-4 text-right">Workspace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-[#f8fafc] transition">
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/batches/${c.id}`}
                            className="font-bold text-[#0f172a] hover:text-[#2563eb] block"
                          >
                            {c.title}
                          </Link>
                          <span className="text-[11px] text-[#64748b]">
                            {c.subjectCount} Subjects • {c.testCount} Tests •{' '}
                            {c.status === 'live' ? 'Live' : 'Setup Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#334155]">
                          {c.priceInr > 0 ? `₹${c.priceInr.toLocaleString('en-IN')}` : 'Free'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#0f172a]">
                          {c.enrolledCount}
                          {c.maxStudents ? ` / ${c.maxStudents}` : ''}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#059669]">
                          ₹{Number(c.revenue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/batches/${c.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe]"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Live Student Doubts Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">Recent Student Doubts</h2>
              <p className="text-xs text-[#64748b]">Across all courses</p>
            </div>
            <Link
              href="/batches"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#e2e8f0]"
            >
              <span>By Course</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentDoubts.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-[#e2e8f0] text-center text-xs text-[#64748b]">
                No doubts submitted yet. When students raise doubts in any course classroom, they appear here in real time.
              </div>
            ) : (
              recentDoubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0f172a] truncate">
                      {doubt.studentName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        doubt.status === 'answered'
                          ? 'bg-[#ecfdf5] text-[#047857]'
                          : 'bg-[#fffbeb] text-[#b45309]'
                      }`}
                    >
                      {doubt.status === 'answered' ? 'Answered' : 'Open'}
                    </span>
                  </div>
                  <p className="text-xs text-[#334155] line-clamp-2">&ldquo;{doubt.question}&rdquo;</p>
                  <div className="pt-1.5 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b]">
                    <span className="truncate max-w-[170px]">{doubt.courseTitle}</span>
                    <Link
                      href={`/batches/${doubt.courseId}/doubts`}
                      className="text-[#2563eb] font-semibold hover:underline shrink-0"
                    >
                      Reply →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
