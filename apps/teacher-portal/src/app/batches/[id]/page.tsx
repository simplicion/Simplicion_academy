'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  IndianRupee,
  Calendar,
  TrendingUp,
  Radio,
  Settings,
  BookOpen,
  MessageCircleQuestion,
  CheckCircle2,
  Play,
  Square,
  ExternalLink,
  Archive,
  Copy,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Globe,
  EyeOff,
  Lock,
  Sparkles,
  RefreshCw,
  Star,
  Tag,
  MessageSquare,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { CourseSetupModal } from '../../../components/course/CourseSetupModal';
import { GoLiveDrawer } from '../../../components/course/GoLiveDrawer';
import {
  SubscriptionUpgradeModal,
  TeacherSubscriptionInfo,
} from '../../../components/subscription/SubscriptionUpgradeModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CourseDashboardPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [recentDoubts, setRecentDoubts] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [showEndedSessions, setShowEndedSessions] = useState(false);
  const [showAllEnrollments, setShowAllEnrollments] = useState(false);
  const [subscription, setSubscription] = useState<TeacherSubscriptionInfo | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isTogglingStar, setIsTogglingStar] = useState(false);
  const [isTogglingChat, setIsTogglingChat] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [autoPublishAfterUpgrade, setAutoPublishAfterUpgrade] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadDashboard = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const [dashRes, currRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}`),
        fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/curriculum`),
      ]);
      const dashData = await dashRes.json();
      const currData = await currRes.json();

      if (dashData.success) {
        setCourse(dashData.course);
        setMetrics(dashData.metrics);
        setLiveSessions(dashData.liveSessions || []);
        setRecentEnrollments(dashData.recentEnrollments || []);
        setRecentDoubts(dashData.recentDoubts || []);
        // Automatically prompt Step 2 Setup Pop-up if course setup is not yet completed!
        if (!dashData.course.isSetupComplete) {
          setIsSetupOpen(true);
        }

        const activeTenant = dashData.course.tenantSlug || 'cuet-humanities';
        fetch(`${API_BASE_URL}/subscription/status?tenant=${encodeURIComponent(activeTenant)}`)
          .then((r) => r.json())
          .then((subData) => {
            if (subData?.success && subData.subscription) {
              setSubscription(subData.subscription);
            }
          })
          .catch(() => {});
      }
      if (currData.success) {
        setSubjects(currData.subjects || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadDashboard();
    window.addEventListener('simplicion-subscription-updated', loadDashboard);

    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('setup') === '1') {
        setIsSetupOpen(true);
      }
    }

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`course-dashboard-${courseId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseEnrollment', filter: `courseId=eq.${courseId}` },
            () => loadDashboard()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'LiveSession', filter: `courseId=eq.${courseId}` },
            () => loadDashboard()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseDoubt', filter: `courseId=eq.${courseId}` },
            () => loadDashboard()
          )
          .subscribe();
      }
    } catch {
      // Realtime optional fallback
    }

    return () => {
      window.removeEventListener('simplicion-subscription-updated', loadDashboard);
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [courseId, loadDashboard]);

  const handleCopyJoinLink = () => {
    const url = `http://localhost:3001/s/${encodeURIComponent(course?.tenantSlug || 'cuet-humanities')}/student/course/${encodeURIComponent(courseId)}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    showToast('Student classroom join link copied to clipboard.');
  };

  const handlePublishCourse = async () => {
    if (!courseId || isPublishing) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.status === 402 || data.requiresSubscription) {
        if (data.subscription) setSubscription(data.subscription);
        setUpgradeReason(
          data.error ||
            'An active ₹250/month Educator Subscription is required to publish courses live to students.'
        );
        setAutoPublishAfterUpgrade(true);
        setIsUpgradeModalOpen(true);
        return;
      }

      if (!res.ok || !data.success) {
        showToast(data.error || 'Could not publish course.');
        return;
      }

      setCourse(data.course);
      if (data.subscription) setSubscription(data.subscription);
      window.dispatchEvent(new Event('simplicion-course-updated'));
      await loadDashboard();
      showToast('Course published live on your Student Portal!');
    } catch {
      showToast('Network error while publishing course.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleStudentLiveChat = async () => {
    if (!courseId || !course || isTogglingChat) return;
    const nextMuted = !course.chatMuted;
    setIsTogglingChat(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/chat-settings`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatMuted: nextMuted }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setCourse((prev: any) => (prev ? { ...prev, chatMuted: nextMuted } : prev));
        showToast(
          nextMuted
            ? 'Student live chat turned OFF for this course.'
            : 'Student live chat turned ON — students can now chat during live classes.'
        );
      }
    } finally {
      setIsTogglingChat(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!courseId || !course || isTogglingStar) return;
    setIsTogglingStar(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !course.isFeatured }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Maximum 2 courses can be starred as Featured at a time.');
        return;
      }
      setCourse((prev: any) => (prev ? { ...prev, isFeatured: data.isFeatured } : prev));
      showToast(
        data.isFeatured
          ? `Course starred in Featured Highlights (${data.featuredCount}/2).`
          : 'Course removed from Featured Highlights.'
      );
    } finally {
      setIsTogglingStar(false);
    }
  };

  const handleUnpublishCourse = async () => {
    if (!courseId || isPublishing) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/unpublish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCourse(data.course);
        window.dispatchEvent(new Event('simplicion-course-updated'));
        await loadDashboard();
        showToast('Course moved back to Draft mode (hidden from students).');
      }
    } catch {
      // ignore
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateLiveStatus = async (
    sessionId: string,
    status: 'live' | 'ended',
    saveAsTopic = false
  ) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/live-sessions/${encodeURIComponent(sessionId)}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, saveAsTopic }),
        }
      );
      const data = await res.json();
      if (data.success) {
        await loadDashboard();
        showToast(
          status === 'live'
            ? 'Live session started!'
            : saveAsTopic
              ? 'Live ended and recording archived into Lesson.'
              : 'Live session ended.'
        );
      }
    } catch {
      // ignore
    }
  };

  if (isLoading || !course) {
    return (
      <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
        Loading course dashboard...
      </div>
    );
  }

  const launchedLabel = course.launchedAt
    ? new Date(course.launchedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not Launched';

  const activeDurationLabel = course.launchedAt
    ? (() => {
        const days = Math.max(
          0,
          Math.floor((Date.now() - new Date(course.launchedAt).getTime()) / (24 * 60 * 60 * 1000))
        );
        return days === 0 ? 'Launched today' : `Active for ${days} ${days === 1 ? 'day' : 'days'}`;
      })()
    : 'Draft course';

  return (
    <div className="space-y-6 w-full min-w-0 pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Course Header Banner Card (SAFS-04) */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          {course.bannerUrl ? (
            <img
              src={course.bannerUrl}
              alt={course.title}
              className="w-24 h-16 rounded-lg object-cover border border-[#e2e8f0] shrink-0"
            />
          ) : (
            <div className="w-24 h-16 rounded-lg bg-[#eff6ff] border border-[#dbeafe] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-[#2563eb]" />
            </div>
          )}

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  course.status === 'live'
                    ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                    : course.isSetupComplete
                      ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                      : 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]'
                }`}
              >
                {course.status === 'live'
                  ? 'Live on Student Portal'
                  : course.isSetupComplete
                    ? 'Draft — Not Published'
                    : 'Setup Incomplete'}
              </span>
              <span className="text-xs font-semibold text-[#2563eb] inline-flex items-center gap-1.5">
                <span>
                  {course.priceInr > 0 ? `₹${course.priceInr.toLocaleString('en-IN')} / student` : 'Free Course'}
                </span>
                {course.originalPriceInr && course.originalPriceInr > course.priceInr ? (
                  <span className="line-through text-[#94a3b8] font-normal">
                    ₹{Number(course.originalPriceInr).toLocaleString('en-IN')}
                  </span>
                ) : null}
                {course.discountPercent && course.discountPercent > 0 ? (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                    <Tag className="w-2.5 h-2.5" />
                    {course.discountPercent}% OFF
                  </span>
                ) : null}
              </span>
            </div>
            <h1
              className="text-xl sm:text-2xl font-bold text-[#0f172a] truncate"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {course.title}
            </h1>
            {course.description && (
              <p className="text-xs text-[#64748b] line-clamp-1">{course.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleFeatured}
            disabled={isTogglingStar}
            data-testid="course-dashboard-star-btn"
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-60 ${
              course.isFeatured
                ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a] hover:bg-[#fef3c7]'
                : 'bg-white text-[#334155] border-[#cbd5e1] hover:bg-[#f8fafc]'
            }`}
            title={
              course.isFeatured
                ? 'Starred in Featured Highlights (click to remove)'
                : 'Star in Featured Highlights (Max 2)'
            }
          >
            <Star
              className={`w-3.5 h-3.5 ${
                course.isFeatured ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-[#64748b]'
              }`}
            />
            <span>{course.isFeatured ? 'Featured' : 'Feature'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSetupOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Course Setup</span>
          </button>

          {course.status !== 'live' ? (
            <button
              type="button"
              onClick={handlePublishCourse}
              disabled={isPublishing}
              data-testid="publish-course-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] shadow-sm transition-colors disabled:opacity-60"
            >
              {isPublishing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : subscription && !subscription.isActive ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              <span>{isPublishing ? 'Checking Plan...' : 'Publish Course'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUnpublishCourse}
              disabled={isPublishing}
              data-testid="unpublish-course-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#475569] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] transition-colors disabled:opacity-60"
            >
              <EyeOff className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Unpublish</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsGoLiveOpen(true)}
            data-testid="course-go-live-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors"
          >
            <Radio className="w-4 h-4" />
            <span>Go Live</span>
          </button>
        </div>
      </div>

      {/* Draft & Educator Subscription Notice Banner */}
      {course.status !== 'live' && (
        <div
          data-testid="course-draft-subscription-banner"
          className="rounded-xl bg-[#fffbeb] border border-[#fde68a] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#fde68a] text-[#d97706] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-[#92400e]">
                {subscription?.isActive
                  ? 'This course is currently in Draft mode'
                  : 'Upgrade to ₹250/month Educator Plan to publish this course live'}
              </p>
              <p className="text-xs text-[#b45309] leading-relaxed">
                {subscription?.isActive
                  ? 'Your Educator Plan is active. Click Publish Course whenever you are ready for students to view and enroll.'
                  : 'You can add subjects, lessons, topics, and tests freely in Draft mode. An active ₹250/month subscription is required to make the course live for students.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublishCourse}
            disabled={isPublishing}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors shrink-0 disabled:opacity-60"
          >
            {subscription?.isActive ? (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>Publish Live Now</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Upgrade (₹250/mo) &amp; Publish</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 4 Core Course Metrics Cards (Responsive 1 -> 2 -> 4 cols so dates & numbers never clip on laptops) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm card-interactive">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            <span>Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-xl sm:text-2xl font-bold text-[#0f172a] mt-3 tabular-nums"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {metrics?.enrolledStudents ?? 0}
            {metrics?.maxStudents ? (
              <span className="text-sm font-medium text-[#64748b]"> / {metrics.maxStudents}</span>
            ) : null}
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {metrics?.maxStudents
              ? `${Math.min(100, Math.round(((metrics.enrolledStudents || 0) / metrics.maxStudents) * 100))}% seat capacity filled`
              : 'Unlimited enrollment seats'}
          </p>
          {metrics?.maxStudents ? (
            <div className="w-full h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden mt-2">
              <div
                className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((metrics.enrolledStudents || 0) / metrics.maxStudents) * 100))}%`,
                }}
              />
            </div>
          ) : null}
          <p className="text-[11px] font-medium text-[#2563eb] mt-2">
            Avg. Completion: {metrics?.avgCompletionPercent ?? 0}%
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm card-interactive">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            <span>Course Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-xl sm:text-2xl font-bold text-[#0f172a] mt-3 tabular-nums"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            ₹ {(metrics?.grossRevenue ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#059669] font-medium mt-1">
            Net Share (95%): ₹{(metrics?.netTeacherRevenue ?? 0).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm card-interactive">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            <span>Launched Date</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-xl sm:text-2xl font-bold text-[#0f172a] mt-3 whitespace-nowrap"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {launchedLabel}
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {metrics?.totalSubjects ?? 0} Subjects • {metrics?.totalLessons ?? 0} Lessons •{' '}
            {metrics?.totalTopics ?? 0} Topics
          </p>
          <p className="text-[11px] font-medium text-[#2563eb] mt-1.5">{activeDurationLabel}</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm card-interactive">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            <span>Monthly Growth</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-xl sm:text-2xl font-bold text-[#059669] mt-3 tabular-nums"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {(metrics?.growthRatePercent ?? 0) >= 0 ? '+' : ''}
            {metrics?.growthRatePercent ?? 0}%
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {metrics?.currentMonthEnrollments ?? 0} this month vs {metrics?.prevMonthEnrollments ?? 0} last month
          </p>
        </div>
      </div>

      {/* Live Sessions + Quick Course Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live & Scheduled Classes (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3.5">
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">Live &amp; Scheduled Classes</h2>
                <p className="text-xs text-[#64748b]">
                  Manage YouTube Live streams and control whether students can chat during live sessions.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={!course.chatMuted}
                  disabled={isTogglingChat}
                  onClick={handleToggleStudentLiveChat}
                  data-testid="live-session-chat-switch"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-60 ${
                    !course.chatMuted
                      ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0] hover:bg-[#d1fae5]'
                      : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                  }`}
                  title="Toggle whether students can chat with each other during live classes"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Student Chat: {!course.chatMuted ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGoLiveOpen(true)}
                  className="text-xs font-semibold text-[#2563eb] hover:underline"
                >
                  + New Live Session
                </button>

                <Link
                  href={`/batches/${courseId}/live-classes`}
                  className="text-xs font-semibold text-[#475569] hover:text-[#2563eb] transition-colors"
                >
                  View All History →
                </Link>
              </div>
            </div>

            {liveSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748b]">
                No live classes yet. Click <strong>Go Live</strong> above to stream or schedule a YouTube Live session.
              </div>
            ) : (
              <div className="space-y-3">
                {liveSessions
                  .filter((s) => s.status !== 'ended')
                  .map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {session.status === 'live' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dc2626] text-white">
                              <Radio className="w-3 h-3 animate-pulse" />
                              LIVE NOW
                            </span>
                          )}
                          {session.status === 'scheduled' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eff6ff] text-[#1d4ed8]">
                              Scheduled
                            </span>
                          )}
                          {session.lessonTitle && (
                            <span className="text-[11px] text-[#64748b] truncate">
                              Lesson: {session.lessonTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#0f172a] truncate">{session.title}</p>
                        <p className="text-[11px] text-[#64748b]">
                          {new Date(session.scheduledAt).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyJoinLink}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] inline-flex items-center gap-1"
                          title="Copy student join link"
                        >
                          <Copy className="w-3 h-3 text-[#64748b]" />
                          <span>Copy Join Link</span>
                        </button>

                        <a
                          href={session.youtubeLiveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white border border-[#cbd5e1] inline-flex items-center gap-1"
                        >
                          <span>YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {session.status === 'scheduled' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateLiveStatus(session.id, 'live')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] inline-flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Start Live</span>
                          </button>
                        )}

                        {session.status === 'live' && (
                          <>
                            {session.lessonId && (
                              <button
                                type="button"
                                onClick={() => handleUpdateLiveStatus(session.id, 'ended', true)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] inline-flex items-center gap-1"
                                title="End live and save recording into the lesson as a topic"
                              >
                                <Archive className="w-3 h-3" />
                                <span>End &amp; Save to Lesson</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUpdateLiveStatus(session.id, 'ended', false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] inline-flex items-center gap-1"
                            >
                              <Square className="w-3 h-3" />
                              <span>End</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Collapsible Past / Ended Sessions */}
                {liveSessions.some((s) => s.status === 'ended') && (
                  <div className="pt-2 border-t border-[#f1f5f9]">
                    <button
                      type="button"
                      onClick={() => setShowEndedSessions((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#0f172a]"
                    >
                      {showEndedSessions ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        Past Live Sessions ({liveSessions.filter((s) => s.status === 'ended').length})
                      </span>
                    </button>

                    {showEndedSessions && (
                      <div className="mt-2.5 space-y-2">
                        {liveSessions
                          .filter((s) => s.status === 'ended')
                          .map((session) => (
                            <div
                              key={session.id}
                              className="px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc]/70 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-[#334155] truncate">
                                  {session.title}
                                </p>
                                <p className="text-[11px] text-[#94a3b8]">
                                  Ended • {new Date(session.scheduledAt).toLocaleString('en-IN')}
                                </p>
                              </div>
                              <a
                                href={session.youtubeLiveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#475569] bg-white border border-[#e2e8f0] inline-flex items-center gap-1 shrink-0"
                              >
                                <span>Recording</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Recent Enrollments (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#0f172a]">Course Modules</h3>
            <Link
              href={`/batches/${courseId}/subjects`}
              className="flex items-center justify-between p-3 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] border border-[#e2e8f0] transition"
            >
              <span className="text-xs font-semibold text-[#0f172a] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2563eb]" />
                Subjects &amp; Lessons ({metrics?.totalSubjects ?? 0})
              </span>
              <span className="text-xs font-semibold text-[#2563eb]">Manage →</span>
            </Link>
            <Link
              href={`/batches/${courseId}/live-classes`}
              className="flex items-center justify-between p-3 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] border border-[#e2e8f0] transition"
            >
              <span className="text-xs font-semibold text-[#0f172a] flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#2563eb]" />
                Live Classes ({liveSessions.length})
              </span>
              <span className="text-xs font-semibold text-[#2563eb]">View All →</span>
            </Link>
            <Link
              href={`/batches/${courseId}/tests`}
              className="flex items-center justify-between p-3 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] border border-[#e2e8f0] transition"
            >
              <span className="text-xs font-semibold text-[#0f172a] flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#2563eb]" />
                Course Tests &amp; Quizzes
              </span>
              <span className="text-xs font-semibold text-[#2563eb]">Create →</span>
            </Link>
            <Link
              href={`/batches/${courseId}/doubts`}
              className="flex items-center justify-between p-3 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] border border-[#e2e8f0] transition"
            >
              <span className="text-xs font-semibold text-[#0f172a] flex items-center gap-2">
                <MessageCircleQuestion className="w-4 h-4 text-[#2563eb]" />
                Open Doubts ({metrics?.openDoubtsCount ?? 0})
              </span>
              <span className="text-xs font-semibold text-[#2563eb]">Reply →</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0f172a]">
                Recent Enrollments ({recentEnrollments.length})
              </h3>
              {recentEnrollments.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllEnrollments((v) => !v)}
                  className="text-[11px] font-semibold text-[#2563eb] hover:underline"
                >
                  {showAllEnrollments ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>
            {recentEnrollments.length === 0 ? (
              <p className="text-xs text-[#64748b]">No student enrollments yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(showAllEnrollments ? recentEnrollments : recentEnrollments.slice(0, 5)).map((enr) => (
                  <div
                    key={enr.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-[#f1f5f9] last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0f172a] truncate">{enr.studentName}</p>
                      <p className="text-[11px] text-[#64748b] truncate">
                        {new Date(enr.enrolledAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <span className="font-semibold text-[#047857] shrink-0">
                      ₹{Number(enr.amountPaid || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Doubts Snapshot */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0f172a]">
                Pending Doubts ({metrics?.openDoubtsCount ?? 0})
              </h3>
              <Link
                href={`/batches/${courseId}/doubts`}
                className="text-[11px] font-semibold text-[#2563eb] hover:underline"
              >
                Open Inbox →
              </Link>
            </div>
            {recentDoubts.filter((d) => d.status === 'open').length === 0 ? (
              <p className="text-xs text-[#64748b]">All course doubts are resolved.</p>
            ) : (
              <div className="space-y-2">
                {recentDoubts
                  .filter((d) => d.status === 'open')
                  .slice(0, 3)
                  .map((d) => (
                    <Link
                      key={d.id}
                      href={`/batches/${courseId}/doubts`}
                      className="block p-2.5 rounded-lg bg-[#fffbeb]/70 hover:bg-[#fef3c7]/70 border border-[#fde68a] transition space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-[#92400e] truncate">{d.studentName}</span>
                        <span className="text-[10px] text-[#b45309] truncate max-w-[120px]">
                          {d.lessonContextLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#0f172a] line-clamp-2">{d.question}</p>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 2 Course Setup Pop-up */}
      <CourseSetupModal
        isOpen={isSetupOpen}
        course={course}
        onClose={() => setIsSetupOpen(false)}
        onCompleted={(updated, meta) => {
          setCourse(updated);
          setIsSetupOpen(false);
          window.dispatchEvent(new Event('simplicion-course-updated'));
          loadDashboard();
          if (meta?.requiresSubscription) {
            showToast('Course setup saved in Draft. Activate ₹250/mo plan to publish live.');
            setUpgradeReason(
              meta.message ||
                'Your course setup is saved in Draft! Activate your ₹250/month Educator Plan to publish it live for students.'
            );
            setAutoPublishAfterUpgrade(true);
            setIsUpgradeModalOpen(true);
          } else {
            showToast('Course setup saved and published live to Student Portal!');
          }
        }}
      />

      {/* Educator Subscription Upgrade Modal (₹250/month via 180 Pay) */}
      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        tenantSlug={course.tenantSlug || 'cuet-humanities'}
        courseTitle={course.title}
        reason={upgradeReason}
        onClose={() => {
          setIsUpgradeModalOpen(false);
          setAutoPublishAfterUpgrade(false);
        }}
        onUpgraded={async (sub) => {
          setSubscription(sub);
          setIsUpgradeModalOpen(false);
          if (autoPublishAfterUpgrade) {
            setAutoPublishAfterUpgrade(false);
            try {
              const pubRes = await fetch(
                `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/publish`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' } }
              );
              const pubData = await pubRes.json();
              if (pubRes.ok && pubData.success) {
                setCourse(pubData.course);
                window.dispatchEvent(new Event('simplicion-course-updated'));
                await loadDashboard();
                showToast('₹250/month Educator Plan activated & course published live!');
                return;
              }
            } catch {
              // ignore
            }
          }
          await loadDashboard();
          showToast('₹250/month Educator Plan activated!');
        }}
      />

      {/* Go Live / Schedule Side Drawer */}
      <GoLiveDrawer
        isOpen={isGoLiveOpen}
        courseId={courseId}
        courseTitle={course.title}
        subjects={subjects}
        onClose={() => setIsGoLiveOpen(false)}
        onCreated={() => {
          loadDashboard();
          showToast('Live class published! Enrolled students have been notified.');
        }}
      />
    </div>
  );
}
