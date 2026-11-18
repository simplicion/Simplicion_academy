'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Radio,
  Calendar,
  Clock,
  Users,
  Youtube,
  ExternalLink,
  Search,
  CheckCircle2,
  BookOpen,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MessageSquareOff,
  Play,
  Square,
  Archive,
  Trash2,
  Link as LinkIcon,
  Plus,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { GoLiveDrawer, GoLiveCourseOption } from './GoLiveDrawer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AttendeeItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string | null;
  joinedAt: string;
  lastSeenAt: string;
}

interface LiveSessionDetail {
  id: string;
  courseId: string;
  courseTitle: string;
  courseStatus: string;
  courseBannerUrl?: string | null;
  enrolledCount: number;
  chatMuted: boolean;
  chatSlowMode: boolean;
  subjectId?: string | null;
  subjectTitle?: string | null;
  lessonId?: string | null;
  lessonTitle?: string | null;
  topicId?: string | null;
  topicTitle?: string | null;
  title: string;
  youtubeLiveUrl: string;
  attachedDocs: Array<{ id?: string; label: string; url: string }>;
  scheduledAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  status: 'live' | 'scheduled' | 'ended';
  durationMinutes?: number | null;
  joinedCount: number;
  attendees: AttendeeItem[];
}

interface LiveSummary {
  totalSessions: number;
  liveNowCount: number;
  scheduledCount: number;
  endedCount: number;
  totalStudentJoins: number;
  uniqueStudentsJoined: number;
}

export interface LiveClassesViewProps {
  /** When provided, scopes the page to a single course inside `/batches/[id]/live-classes`. */
  courseId?: string;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTimeOnly(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(mins?: number | null): string {
  if (!mins || mins <= 0) return '—';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export const LiveClassesView: React.FC<LiveClassesViewProps> = ({ courseId }) => {
  const [sessions, setSessions] = useState<LiveSessionDetail[]>([]);
  const [courses, setCourses] = useState<GoLiveCourseOption[]>([]);
  const [summary, setSummary] = useState<LiveSummary>({
    totalSessions: 0,
    liveNowCount: 0,
    scheduledCount: 0,
    endedCount: 0,
    totalStudentJoins: 0,
    uniqueStudentsJoined: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'all' | 'live' | 'scheduled' | 'ended'>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(courseId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAttendees, setExpandedAttendees] = useState<Record<string, boolean>>({});
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [togglingChatCourseId, setTogglingChatCourseId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const resolveTenantSlug = () => {
    let slug = 'cuet-humanities';
    try {
      const saved = localStorage.getItem('simplicion_active_tenant');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.slug) slug = String(parsed.slug).toLowerCase();
      }
    } catch {
      // ignore
    }
    return slug;
  };

  const loadLiveClasses = useCallback(async () => {
    try {
      const slug = resolveTenantSlug();
      const qs = new URLSearchParams({ tenant: slug });
      if (courseId) qs.set('courseId', courseId);

      const res = await fetch(`${API_BASE_URL}/academy/live-sessions?${qs.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSessions(Array.isArray(data.sessions) ? data.sessions : []);
        setCourses(Array.isArray(data.courses) ? data.courses : []);
        if (data.summary) setSummary(data.summary);
      }
    } catch {
      // keep state
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadLiveClasses();
    window.addEventListener('simplicion-course-updated', loadLiveClasses);

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`live-classes-hub-${courseId || 'all'}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'LiveSession' }, () =>
            loadLiveClasses()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'LiveSessionAttendance' },
            () => loadLiveClasses()
          )
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'StudioCourse' }, () =>
            loadLiveClasses()
          )
          .subscribe();
      }
    } catch {
      // Realtime optional fallback
    }

    return () => {
      window.removeEventListener('simplicion-course-updated', loadLiveClasses);
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [courseId, loadLiveClasses]);

  const scopedCourse = courseId ? courses.find((c) => c.id === courseId) : undefined;

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter((s) => {
      if (statusTab !== 'all' && s.status !== statusTab) return false;
      if (!courseId && selectedCourseFilter !== 'all' && s.courseId !== selectedCourseFilter) {
        return false;
      }
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.courseTitle.toLowerCase().includes(q) ||
        (s.subjectTitle || '').toLowerCase().includes(q) ||
        (s.lessonTitle || '').toLowerCase().includes(q) ||
        (s.topicTitle || '').toLowerCase().includes(q)
      );
    });
  }, [sessions, statusTab, selectedCourseFilter, courseId, searchQuery]);

  const handleUpdateStatus = async (
    session: LiveSessionDetail,
    nextStatus: 'live' | 'ended',
    saveAsTopic = false
  ) => {
    setBusySessionId(session.id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/live-sessions/${encodeURIComponent(session.id)}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStatus,
            saveAsTopic,
            archiveToLessonId: session.lessonId || undefined,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast(
          nextStatus === 'live'
            ? `"${session.title}" is now LIVE! Enrolled students notified.`
            : saveAsTopic
              ? 'Live class ended and recording archived to the chapter!'
              : 'Live class marked as ended.'
        );
        window.dispatchEvent(new CustomEvent('simplicion-course-updated'));
        loadLiveClasses();
      }
    } finally {
      setBusySessionId(null);
    }
  };

  const handleToggleStudentChat = async (session: LiveSessionDetail) => {
    setTogglingChatCourseId(session.courseId);
    try {
      const nextMuted = !session.chatMuted;
      const res = await fetch(
        `${API_BASE_URL}/courses/${encodeURIComponent(session.courseId)}/chat-settings`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatMuted: nextMuted }),
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast(
          nextMuted
            ? `Student live chat turned OFF for ${session.courseTitle}.`
            : `Student live chat turned ON for ${session.courseTitle}.`
        );
        loadLiveClasses();
      }
    } finally {
      setTogglingChatCourseId(null);
    }
  };

  const handleDeleteSession = async (session: LiveSessionDetail) => {
    if (!confirm(`Delete live class "${session.title}" from history?`)) return;
    setBusySessionId(session.id);
    try {
      const res = await fetch(
        `${API_BASE_URL}/live-sessions/${encodeURIComponent(session.id)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        showToast('Live class deleted.');
        window.dispatchEvent(new CustomEvent('simplicion-course-updated'));
        loadLiveClasses();
      }
    } finally {
      setBusySessionId(null);
    }
  };

  const toggleAttendees = (sessionId: string) => {
    setExpandedAttendees((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#0f172a] text-white text-xs font-semibold shadow-lg border border-white/10">
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1
              className="text-2xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {courseId ? `Live Classes` : 'Live Classes'}
            </h1>
            {summary.liveNowCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
                {summary.liveNowCount} Live Now
              </span>
            )}
          </div>
          <p className="text-sm text-[#64748b]">
            {courseId
              ? `Go live on YouTube, schedule classes, and review every completed session & student attendance for ${scopedCourse?.title || 'this course'}.`
              : 'Go live for any course, track scheduled & past live classes, view subject/chapter/topic details, and inspect student attendance.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsGoLiveOpen(true)}
          disabled={courses.length === 0}
          data-testid="live-classes-go-live-btn"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors disabled:opacity-50 shrink-0"
        >
          <Radio className="w-4 h-4" />
          <span>Go Live</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Total Live Classes
            </span>
            <div className="p-2 rounded-lg bg-[#eff6ff] text-[#2563eb]">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f172a]">{summary.totalSessions}</p>
          <p className="text-xs text-[#64748b] mt-1">{summary.endedCount} completed sessions</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Live Right Now
            </span>
            <div
              className={`p-2 rounded-lg ${
                summary.liveNowCount > 0
                  ? 'bg-[#fef2f2] text-[#dc2626]'
                  : 'bg-[#f8fafc] text-[#64748b]'
              }`}
            >
              <Youtube className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f172a]">{summary.liveNowCount}</p>
          <p className="text-xs text-[#64748b] mt-1">
            {summary.liveNowCount > 0 ? 'Streaming to students' : 'No active stream'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Scheduled
            </span>
            <div className="p-2 rounded-lg bg-[#eff6ff] text-[#2563eb]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f172a]">{summary.scheduledCount}</p>
          <p className="text-xs text-[#64748b] mt-1">Upcoming planned classes</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Students Joined
            </span>
            <div className="p-2 rounded-lg bg-[#ecfdf5] text-[#059669]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f172a]">{summary.totalStudentJoins}</p>
          <p className="text-xs text-[#64748b] mt-1">
            {summary.uniqueStudentsJoined} unique learner{summary.uniqueStudentsJoined === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: 'all', label: 'All Classes', count: summary.totalSessions },
              { key: 'live', label: 'Live Now', count: summary.liveNowCount },
              { key: 'scheduled', label: 'Scheduled', count: summary.scheduledCount },
              { key: 'ended', label: 'Past / Completed', count: summary.endedCount },
            ] as const
          ).map((tab) => {
            const active = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]'
                    : 'bg-[#f8fafc] text-[#475569] border border-transparent hover:bg-[#f1f5f9]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? 'bg-[#2563eb] text-white' : 'bg-[#e2e8f0] text-[#475569]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Course Selector & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {!courseId && courses.length > 0 && (
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
            >
              <option value="all">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, course, chapter, topic..."
              className="w-full pl-8 pr-3 py-2 text-xs text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
            />
          </div>
        </div>
      </div>

      {/* Live Classes List */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center text-sm text-[#64748b]">
          Loading live classes...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#0f172a]">Create a Course First</h2>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            Live classes belong to a course so enrolled students receive instant notifications and attendance is tracked automatically.
          </p>
          <Link
            href="/batches"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Go to Courses</span>
          </Link>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mx-auto">
            <Radio className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#0f172a]">
            {sessions.length === 0 ? 'No Live Classes Yet' : 'No Matching Live Classes'}
          </h2>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            {sessions.length === 0
              ? 'Click Go Live above to start an instant YouTube Live session or schedule an upcoming class for any course, chapter, or topic.'
              : 'Try adjusting your status filter, course filter, or search query.'}
          </p>
          {sessions.length === 0 && (
            <button
              type="button"
              onClick={() => setIsGoLiveOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Start First Live Class</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isExpanded = Boolean(expandedAttendees[session.id]);
            const isBusy = busySessionId === session.id;
            const isTogglingChat = togglingChatCourseId === session.courseId;

            return (
              <div
                key={session.id}
                className={`bg-white rounded-xl border shadow-sm transition-colors ${
                  session.status === 'live'
                    ? 'border-[#fecaca] ring-1 ring-[#dc2626]/10'
                    : 'border-[#e2e8f0]'
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Top Row: Status + Title + Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {session.status === 'live' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-pulse" />
                            LIVE NOW
                          </span>
                        ) : session.status === 'scheduled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]">
                            <Calendar className="w-3 h-3" />
                            Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}

                        <Link
                          href={`/batches/${session.courseId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f8fafc] hover:bg-[#eff6ff] text-[#334155] hover:text-[#2563eb] border border-[#e2e8f0] transition-colors"
                        >
                          <BookOpen className="w-3 h-3 text-[#2563eb]" />
                          <span>{session.courseTitle}</span>
                        </Link>
                      </div>

                      <h3
                        className="text-base sm:text-lg font-bold text-[#0f172a] leading-snug"
                        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                      >
                        {session.title}
                      </h3>

                      {/* Structured Curriculum Tags: Subject -> Chapter/Lesson -> Topic */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {session.subjectTitle ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#f8fafc] text-[#334155] border border-[#e2e8f0]">
                            <Layers className="w-3 h-3 text-[#64748b]" />
                            <span className="text-[#64748b]">Subject:</span>
                            <strong className="font-semibold text-[#0f172a]">
                              {session.subjectTitle}
                            </strong>
                          </span>
                        ) : null}

                        {session.lessonTitle ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#f8fafc] text-[#334155] border border-[#e2e8f0]">
                            <BookOpen className="w-3 h-3 text-[#64748b]" />
                            <span className="text-[#64748b]">Chapter:</span>
                            <strong className="font-semibold text-[#0f172a]">
                              {session.lessonTitle}
                            </strong>
                          </span>
                        ) : null}

                        {session.topicTitle ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]">
                            <FileText className="w-3 h-3 text-[#2563eb]" />
                            <span>Topic:</span>
                            <strong className="font-semibold">{session.topicTitle}</strong>
                          </span>
                        ) : null}

                        {!session.subjectTitle && !session.lessonTitle && !session.topicTitle && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]">
                            General Course Live Session
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <a
                        href={session.youtubeLiveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1]"
                      >
                        <Youtube className="w-3.5 h-3.5 text-[#dc2626]" />
                        <span>{session.status === 'ended' ? 'Watch Recording' : 'YouTube Link'}</span>
                        <ExternalLink className="w-3 h-3 text-[#94a3b8]" />
                      </a>

                      {session.status !== 'ended' && (
                        <button
                          type="button"
                          disabled={isTogglingChat}
                          onClick={() => handleToggleStudentChat(session)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            session.chatMuted
                              ? 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                              : 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0] hover:bg-[#d1fae5]'
                          }`}
                          title="Toggle whether students can chat with each other during live classes for this course"
                        >
                          {session.chatMuted ? (
                            <MessageSquareOff className="w-3.5 h-3.5" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5" />
                          )}
                          <span>Chat: {session.chatMuted ? 'OFF' : 'ON'}</span>
                        </button>
                      )}

                      {session.status === 'scheduled' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(session, 'live')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Now</span>
                        </button>
                      )}

                      {session.status === 'live' && (
                        <>
                          {session.lessonId && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(session, 'ended', true)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1d4ed8] bg-[#eff6ff] hover:bg-[#dbeafe] border border-[#bfdbfe] disabled:opacity-50"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>End &amp; Save to Chapter</span>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(session, 'ended', false)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] disabled:opacity-50"
                          >
                            <Square className="w-3 h-3 fill-current" />
                            <span>End Class</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDeleteSession(session)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Strip: Date, Start/End Time, Duration, Student Attendance */}
                  <div className="pt-3 border-t border-[#f1f5f9] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#475569]">
                      <Calendar className="w-4 h-4 text-[#94a3b8] shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                          {session.status === 'scheduled' ? 'Scheduled For' : 'Session Date'}
                        </p>
                        <p className="font-semibold text-[#0f172a]">
                          {formatDateTime(session.startedAt || session.scheduledAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#475569]">
                      <Clock className="w-4 h-4 text-[#94a3b8] shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                          Duration &amp; Timing
                        </p>
                        <p className="font-semibold text-[#0f172a]">
                          {session.status === 'ended' && session.endedAt
                            ? `${formatDuration(session.durationMinutes)} (ended ${formatTimeOnly(session.endedAt)})`
                            : session.status === 'live'
                              ? `Live for ${formatDuration(session.durationMinutes || 1)}`
                              : 'Not started yet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#475569]">
                      <Users className="w-4 h-4 text-[#059669] shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                          Students Joined
                        </p>
                        <p className="font-bold text-[#0f172a]">
                          {session.joinedCount}{' '}
                          <span className="font-normal text-[#64748b]">
                            {session.enrolledCount > 0
                              ? `/ ${session.enrolledCount} enrolled`
                              : 'joined'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => toggleAttendees(session.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {isExpanded
                            ? 'Hide Attendance'
                            : `View Attendance (${session.joinedCount})`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Attached Documents */}
                  {session.attachedDocs && session.attachedDocs.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#64748b] inline-flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        Class Docs:
                      </span>
                      {session.attachedDocs.map((doc, idx) => (
                        <a
                          key={doc.id || idx}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] border border-[#dbeafe]"
                        >
                          <span>{doc.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expandable Joined Students Attendance Table */}
                {isExpanded && (
                  <div className="border-t border-[#e2e8f0] bg-[#f8fafc] px-5 py-4 rounded-b-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                        Students Who Joined ({session.joinedCount})
                      </h4>
                      {session.enrolledCount > 0 && (
                        <span className="text-xs text-[#64748b]">
                          Attendance Rate:{' '}
                          <strong className="text-[#0f172a]">
                            {Math.min(
                              100,
                              Math.round((session.joinedCount / session.enrolledCount) * 100)
                            )}
                            %
                          </strong>
                        </span>
                      )}
                    </div>

                    {session.attendees.length === 0 ? (
                      <p className="text-xs text-[#64748b] py-3">
                        No students have joined this live session yet. Attendance updates automatically in real time when enrolled students open this live class.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-[#e2e8f0] bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] uppercase text-[10px] font-semibold">
                            <tr>
                              <th className="py-2.5 px-3.5">Student Name</th>
                              <th className="py-2.5 px-3.5">Email / ID</th>
                              <th className="py-2.5 px-3.5 text-right">Joined At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f5f9]">
                            {session.attendees.map((att) => (
                              <tr key={att.id} className="hover:bg-[#f8fafc]">
                                <td className="py-2.5 px-3.5 font-semibold text-[#0f172a]">
                                  {att.studentName}
                                </td>
                                <td className="py-2.5 px-3.5 text-[#64748b]">
                                  {att.studentEmail || att.studentId}
                                </td>
                                <td className="py-2.5 px-3.5 text-right text-[#475569]">
                                  {formatDateTime(att.joinedAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Go Live Drawer (works both academy-wide with course picker and course-scoped) */}
      <GoLiveDrawer
        isOpen={isGoLiveOpen}
        courseId={courseId}
        courseTitle={scopedCourse?.title}
        subjects={scopedCourse?.subjects || []}
        courses={courses}
        onClose={() => setIsGoLiveOpen(false)}
        onCreated={() => {
          showToast('Live class published! Enrolled students have been notified.');
          window.dispatchEvent(new CustomEvent('simplicion-course-updated'));
          loadLiveClasses();
        }}
      />
    </div>
  );
};
