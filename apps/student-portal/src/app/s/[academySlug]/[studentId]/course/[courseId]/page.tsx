'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Radio,
  BookOpen,
  FileText,
  ExternalLink,
  MessageSquare,
  MessageCircleQuestion,
  Send,
  CheckCircle2,
  Circle,
  Lock,
  Pin,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Timer,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ClipboardCheck,
  Award,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { applyBrandColorTokens } from '../../../../../../lib/site-content';
import { openOne80IdentityBottomSheet } from '../../../../../../lib/one80-sdk';
import {
  One80PayModal,
  One80PaymentSuccessPayload,
} from '../../../../../../components/checkout/One80PayModal';
import { PortalUnavailableView } from '../../../../../../components/PortalUnavailableView';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function toEmbedUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const m = url.match(
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  if (m?.[1]) return `https://www.youtube-nocookie.com/embed/${m[1]}?modestbranding=1&rel=0`;
  return null;
}

function formatCountdown(scheduledAt: string, nowMs: number): string {
  const diffMs = new Date(scheduledAt).getTime() - nowMs;
  if (diffMs <= 0) return 'Starting soon';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `Starts in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) return `Starts in ${hrs}h ${remMins}m`;
  const days = Math.floor(hrs / 24);
  return `Starts in ${days}d ${hrs % 24}h`;
}

export default function StudentCourseClassroomPage() {
  const params = useParams();
  const academySlug = (params?.academySlug as string) || 'cuet-humanities';
  const routeStudentId = (params?.studentId as string) || '';
  const courseId = params?.courseId as string;

  const [student, setStudent] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [portalLive, setPortalLive] = useState(true);
  const [portalMeta, setPortalMeta] = useState<{
    academyName: string;
    logoUrl?: string;
    primaryColor?: string;
    message?: string;
    supportEmail?: string;
    supportPhone?: string;
    whatsappNumber?: string;
  }>({ academyName: 'Learnings Simplicion', primaryColor: '#2563eb' });
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);

  const [course, setCourse] = useState<any | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [courseTests, setCourseTests] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [activeMode, setActiveMode] = useState<'topic' | 'live'>('topic');
  const [activeTopic, setActiveTopic] = useState<any | null>(null);
  const [activeTopicContext, setActiveTopicContext] = useState<{
    subjectId?: string;
    lessonId?: string;
    label: string;
  }>({ label: 'General Course' });
  const [activeLiveSession, setActiveLiveSession] = useState<any | null>(null);

  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [rightTab, setRightTab] = useState<'chat' | 'doubts'>('chat');
  const [curriculumSearch, setCurriculumSearch] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  // Live Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatMuted, setChatMuted] = useState(false);
  const [chatSlowMode, setChatSlowMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatBroadcastRef = useRef<any>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Doubts state
  const [doubts, setDoubts] = useState<any[]>([]);
  const [doubtInput, setDoubtInput] = useState('');
  const [isSendingDoubt, setIsSendingDoubt] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Enforce strict 180 Identity login gate
  useEffect(() => {
    const syncAuth = () => {
      const saved = localStorage.getItem('simplicion_student');
      if (saved) {
        try {
          setStudent(JSON.parse(saved));
        } catch {
          setStudent(null);
        }
      } else {
        setStudent(null);
      }
      setAuthChecked(true);
    };

    syncAuth();
    window.addEventListener('simplicion-auth-changed', syncAuth);
    return () => window.removeEventListener('simplicion-auth-changed', syncAuth);
  }, []);

  // Live portal visibility check (respects Educator Live / Unlive Student Portal toggle)
  useEffect(() => {
    const checkPortalStatus = () => {
      fetch(`${API_BASE_URL}/site-config?tenant=${encodeURIComponent(academySlug)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json?.success && json.data) {
            setPortalLive(json.data.portalLive !== false);
            const branding = json.data.settings?.branding || {};
            const contact = json.data.settings?.contact || {};
            if (branding.primaryColor) applyBrandColorTokens(branding.primaryColor);
            setPortalMeta({
              academyName: json.data.name || 'Learnings Simplicion',
              logoUrl: branding.logoUrl || '',
              primaryColor: branding.primaryColor || '#2563eb',
              message: json.data.portalOfflineMessage || '',
              supportEmail: contact.supportEmail || '',
              supportPhone: contact.supportPhone || '',
              whatsappNumber: contact.whatsappNumber || '',
            });
          }
        })
        .catch(() => {});
    };

    checkPortalStatus();

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`classroom-portal-status-${academySlug}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'TenantSettings' }, () =>
            checkPortalStatus()
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
  }, [academySlug]);

  const effectiveStudentId = student?.id || routeStudentId;

  const loadClassroom = useCallback(async () => {
    if (!courseId || !student) return;
    try {
      const [dashRes, enrRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}`),
        fetch(
          `${API_BASE_URL}/student/enrollments?studentId=${encodeURIComponent(effectiveStudentId)}&tenant=${encodeURIComponent(academySlug)}`
        ),
      ]);
      const [dashData, enrData] = await Promise.all([dashRes.json(), enrRes.json()]);

      if (dashData.success) {
        setCourse(dashData.course);
        const sessions = dashData.liveSessions || [];
        setLiveSessions(sessions);
        const liveNow = sessions.find((s: any) => s.status === 'live');
        if (liveNow && !activeLiveSession) {
          setActiveLiveSession(liveNow);
          setActiveMode('live');
        }
      }

      const enrolledList: string[] = Array.isArray(enrData?.courseIds) ? enrData.courseIds : [];
      const enrolled = enrolledList.includes(courseId);
      setIsEnrolled(enrolled);
      setEnrollmentChecked(true);

      if (!enrolled) {
        return;
      }

      const [currRes, chatRes, doubtsRes, progRes, testsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/curriculum`),
        fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/chat`),
        fetch(
          `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/doubts?studentId=${encodeURIComponent(effectiveStudentId)}`
        ),
        fetch(
          `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/progress?studentId=${encodeURIComponent(effectiveStudentId)}`
        ),
        fetch(
          `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/tests?studentId=${encodeURIComponent(effectiveStudentId)}&publishedOnly=true`
        ),
      ]);

      const [currData, chatData, doubtsData, progData, testsData] = await Promise.all([
        currRes.json(),
        chatRes.json(),
        doubtsRes.json(),
        progRes.json(),
        testsRes.json(),
      ]);

      if (currData.success) {
        const subList = currData.subjects || [];
        setSubjects(subList);

        // Preselect topic from ?topicId= or first available topic
        const urlTopicId = new URLSearchParams(window.location.search).get('topicId');
        let matchedTopic: any = null;
        let matchedContext = { label: 'General Course' } as any;

        for (const sub of subList) {
          for (const les of sub.lessons || []) {
            for (const top of les.topics || []) {
              if (!matchedTopic || (urlTopicId && top.id === urlTopicId)) {
                matchedTopic = top;
                matchedContext = {
                  subjectId: sub.id,
                  lessonId: les.id,
                  label: `${sub.title} → ${les.title} → ${top.title}`,
                };
                if (urlTopicId && top.id === urlTopicId) break;
              }
            }
          }
        }

        if (matchedTopic && !activeTopic) {
          setActiveTopic(matchedTopic);
          setActiveTopicContext(matchedContext);
          if (matchedContext.subjectId) {
            setExpandedSubjects((prev) => ({ ...prev, [matchedContext.subjectId]: true }));
          }
          if (matchedContext.lessonId) {
            setExpandedLessons((prev) => ({ ...prev, [matchedContext.lessonId]: true }));
          }
          if (urlTopicId) {
            setActiveMode('topic');
            setRightTab('doubts');
          }
        } else if (subList.length > 0 && Object.keys(expandedSubjects).length === 0) {
          setExpandedSubjects({ [subList[0].id]: true });
          if (subList[0].lessons?.[0]?.id) {
            setExpandedLessons({ [subList[0].lessons[0].id]: true });
          }
        }
      }

      if (chatData.success) {
        setChatMessages(chatData.messages || []);
        setChatMuted(Boolean(chatData.chatMuted));
        setChatSlowMode(Boolean(chatData.chatSlowMode));
      }
      if (doubtsData.success) {
        setDoubts(doubtsData.doubts || []);
      }
      if (progData.success) {
        setCompletedTopicIds(progData.completedTopicIds || []);
      }
      if (testsData?.success && Array.isArray(testsData.tests)) {
        setCourseTests(testsData.tests);
      }
    } catch {
      setEnrollmentChecked(true);
    }
  }, [courseId, student, effectiveStudentId, academySlug]);

  useEffect(() => {
    loadClassroom();
  }, [loadClassroom]);

  // Automatically record real live class attendance in Supabase whenever an enrolled student joins a live session
  useEffect(() => {
    if (!isEnrolled || !student || activeMode !== 'live' || !activeLiveSession?.id) return;
    fetch(`${API_BASE_URL}/live-sessions/${encodeURIComponent(activeLiveSession.id)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: effectiveStudentId,
        studentName: student.name || 'Student',
        studentEmail: student.email || null,
      }),
    }).catch(() => {});
  }, [isEnrolled, student, effectiveStudentId, activeMode, activeLiveSession?.id]);

  // Supabase Realtime Broadcast + Postgres Changes for Live Chat, Moderation, Doubt Replies & Live Status
  useEffect(() => {
    if (!courseId || !student || !isEnrolled) return;
    let channel: any = null;
    let broadcastChannel: any = null;

    const refreshChat = () => {
      fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/chat`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setChatMessages(d.messages || []);
            setChatMuted(Boolean(d.chatMuted));
            setChatSlowMode(Boolean(d.chatSlowMode));
          }
        })
        .catch(() => {});
    };

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();

        // Sub-100ms Realtime Broadcast channel for scalable live classroom chat (Suggestion #3)
        broadcastChannel = supabase
          .channel(`course-live-chat-${courseId}`, {
            config: { broadcast: { self: false } },
          })
          .on('broadcast', { event: 'chat_message' }, ({ payload }: any) => {
            if (payload?.id) {
              setChatMessages((prev) =>
                prev.some((m) => m.id === payload.id) ? prev : [...prev, payload]
              );
            }
          })
          .subscribe();
        chatBroadcastRef.current = broadcastChannel;

        channel = supabase
          .channel(`classroom-${courseId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseChatMessage', filter: `courseId=eq.${courseId}` },
            () => refreshChat()
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'StudioCourse', filter: `id=eq.${courseId}` },
            () => refreshChat()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseDoubt', filter: `courseId=eq.${courseId}` },
            () => {
              fetch(
                `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/doubts?studentId=${encodeURIComponent(effectiveStudentId)}`
              )
                .then((r) => r.json())
                .then((d) => {
                  if (d.success) setDoubts(d.doubts || []);
                })
                .catch(() => {});
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'LiveSession', filter: `courseId=eq.${courseId}` },
            () => loadClassroom()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseTest', filter: `courseId=eq.${courseId}` },
            () => loadClassroom()
          )
          .subscribe();
      }
    } catch {
      // ignore
    }

    return () => {
      chatBroadcastRef.current = null;
      if (broadcastChannel) {
        try {
          createSupabaseClient().removeChannel(broadcastChannel);
        } catch {
          // ignore
        }
      }
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [courseId, student, isEnrolled, effectiveStudentId, loadClassroom]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const handleLoginWith180 = async () => {
    await openOne80IdentityBottomSheet({
      onSuccess: (res) => {
        const payload = {
          id: res.user?.id || res.user?.sub || routeStudentId || `180_usr_${Date.now()}`,
          name: res.user?.name || res.user?.email?.split('@')[0] || 'Student',
          email: res.user?.email || '',
          phone: res.user?.phone || '',
          provider: '180_identity',
          token: res.token || res.accessToken,
        };
        localStorage.setItem('simplicion_student', JSON.stringify(payload));
        setStudent(payload);
        window.dispatchEvent(new Event('simplicion-auth-changed'));
      },
    });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !student) return;
    const text = chatInput.trim();
    setChatInput('');

    const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: effectiveStudentId,
        senderName: student.name || 'Student',
        senderRole: 'student',
        message: text,
        liveSessionId: activeMode === 'live' ? activeLiveSession?.id : null,
      }),
    });
    const data = await res.json();
    if (data.success && data.message) {
      setChatMessages((prev) =>
        prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
      );
      if (chatBroadcastRef.current) {
        chatBroadcastRef.current
          .send({ type: 'broadcast', event: 'chat_message', payload: data.message })
          .catch(() => {});
      }
    } else if (data.error) {
      showToast(data.error);
    }
  };

  const handleRaiseDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput.trim() || !student) return;
    setIsSendingDoubt(true);
    try {
      const contextLabel =
        activeMode === 'live' && activeLiveSession
          ? `Live Class: ${activeLiveSession.title}`
          : activeTopicContext.label;

      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/doubts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: activeTopicContext.subjectId || null,
          lessonId: activeTopicContext.lessonId || null,
          topicId: activeMode === 'topic' ? activeTopic?.id || null : null,
          lessonContextLabel: contextLabel,
          studentId: effectiveStudentId,
          studentName: student.name || 'Student',
          studentEmail: student.email || '',
          question: doubtInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.doubt) {
        setDoubts((prev) => [data.doubt, ...prev]);
        setDoubtInput('');
        showToast('Doubt sent to your educator! You will be notified once answered.');
      }
    } finally {
      setIsSendingDoubt(false);
    }
  };

  const handleToggleTopicComplete = async (topicId: string) => {
    const res = await fetch(
      `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/topics/${encodeURIComponent(topicId)}/complete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: effectiveStudentId }),
      }
    );
    const data = await res.json();
    if (data.success) {
      setCompletedTopicIds((prev) =>
        data.completed ? Array.from(new Set([...prev, topicId])) : prev.filter((id) => id !== topicId)
      );
    }
  };

  const completeClassroomEnrollment = async (paymentId?: string) => {
    if (!course || !student) return;
    const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: effectiveStudentId,
        studentName: student.name || 'Student',
        studentEmail: student.email || '',
        amountPaid: course.priceInr || 0,
        paymentId,
      }),
    });
    const data = await res.json();
    if (res.ok || data.alreadyEnrolled) {
      setIsEnrolled(true);
      window.dispatchEvent(new Event('simplicion-notifications-updated'));
      await loadClassroom();
      showToast(`Enrolled in "${course.title}"! Welcome to class.`);
    } else if (data.error) {
      showToast(data.error);
    }
  };

  const handleClassroomBuyOrEnroll = async () => {
    if (!course) return;
    if ((course.priceInr || 0) <= 0) {
      await completeClassroomEnrollment();
      return;
    }
    setIsPayOpen(true);
  };

  const handleClassroomPaymentSuccess = async (payload: One80PaymentSuccessPayload) => {
    setIsPayOpen(false);
    await completeClassroomEnrollment(payload.paymentId);
  };

  const flatTopicSequence = useMemo(() => {
    const seq: Array<{
      topic: any;
      subjectId: string;
      lessonId: string;
      label: string;
    }> = [];
    for (const sub of subjects) {
      for (const les of sub.lessons || []) {
        for (const top of les.topics || []) {
          seq.push({
            topic: top,
            subjectId: sub.id,
            lessonId: les.id,
            label: `${sub.title} → ${les.title} → ${top.title}`,
          });
        }
      }
    }
    return seq;
  }, [subjects]);

  if (!portalLive) {
    return (
      <PortalUnavailableView
        academyName={portalMeta.academyName}
        logoUrl={portalMeta.logoUrl}
        message={portalMeta.message}
        supportEmail={portalMeta.supportEmail}
        supportPhone={portalMeta.supportPhone}
        whatsappNumber={portalMeta.whatsappNumber}
      />
    );
  }

  // Mandatory 180 Identity Login Gate
  if (authChecked && !student) {
    return (
      <div className="min-h-[75vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1
              className="text-xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Sign In to Access Course Classroom
            </h1>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Only logged-in students can watch live classes, access study notes, join live chat, and raise doubts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoginWith180}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition"
          >
            Login with 180 Identity
          </button>
          <Link href="/" className="block text-xs font-semibold text-[#64748b] hover:text-[#0f172a]">
            ← Back to Academy Home
          </Link>
        </div>
      </div>
    );
  }

  // Mandatory Active Enrollment Gate (Unenrolled students purchase via 180 Pay first)
  if (student && enrollmentChecked && !isEnrolled) {
    return (
      <div className="min-h-[75vh] bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          {course?.bannerUrl && (
            <img
              src={course.bannerUrl}
              alt={course.title}
              className="w-full h-44 object-cover border-b border-[#e2e8f0]"
            />
          )}
          <div className="p-7 text-center space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mx-auto">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h1
                className="text-xl font-bold text-[#0f172a]"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                {course?.title || 'Enroll to Unlock Classroom'}
              </h1>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Complete enrollment via 180 Pay to unlock live classes, study notes, document links, live chat, and direct doubt resolution.
              </p>
            </div>

            <div className="py-3 px-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between text-xs">
              <span className="text-[#64748b] font-semibold">Course Fee</span>
              <div className="flex items-center gap-2">
                {course?.originalPriceInr && course.originalPriceInr > (course.priceInr || 0) && (
                  <span className="text-xs line-through text-[#94a3b8]">
                    ₹{Number(course.originalPriceInr).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-lg font-bold text-[#0f172a]">
                  {course?.priceInr > 0
                    ? `₹${Number(course.priceInr).toLocaleString('en-IN')}`
                    : 'Free'}
                </span>
                {course?.discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                    {course.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClassroomBuyOrEnroll}
              data-testid="classroom-unlock-buy-btn"
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition"
            >
              {course?.priceInr > 0
                ? `Buy Course (₹${Number(course.priceInr).toLocaleString('en-IN')}) via 180 Pay`
                : 'Enroll Free & Enter Classroom'}
            </button>

            <Link href="/" className="block text-xs font-semibold text-[#64748b] hover:text-[#0f172a]">
              ← Back to All Courses
            </Link>
          </div>
        </div>

        {course && (
          <One80PayModal
            isOpen={isPayOpen}
            onClose={() => setIsPayOpen(false)}
            offeringId={course.id}
            orderId={`180_ord_${course.id}_${Date.now()}`}
            amount={course.priceInr || 0}
            offeringTitle={course.title}
            tenantName={portalMeta.academyName}
            primaryColor={portalMeta.primaryColor || '#2563eb'}
            studentName={student.name || 'Student'}
            studentEmail={student.email || ''}
            studentPhone={student.phone || ''}
            onSuccess={handleClassroomPaymentSuccess}
          />
        )}
      </div>
    );
  }

  const activeTopicIndex = activeTopic
    ? flatTopicSequence.findIndex((item) => item.topic.id === activeTopic.id)
    : -1;
  const prevTopicItem = activeTopicIndex > 0 ? flatTopicSequence[activeTopicIndex - 1] : null;
  const nextTopicItem =
    activeTopicIndex >= 0 && activeTopicIndex < flatTopicSequence.length - 1
      ? flatTopicSequence[activeTopicIndex + 1]
      : null;

  const selectTopicFromSequence = (item: {
    topic: any;
    subjectId: string;
    lessonId: string;
    label: string;
  }) => {
    setActiveTopic(item.topic);
    setActiveTopicContext({
      subjectId: item.subjectId,
      lessonId: item.lessonId,
      label: item.label,
    });
    setExpandedSubjects((prev) => ({ ...prev, [item.subjectId]: true }));
    setExpandedLessons((prev) => ({ ...prev, [item.lessonId]: true }));
    setActiveMode('topic');
  };

  const totalTopicsCount = flatTopicSequence.length;
  const progressPercent =
    totalTopicsCount > 0 ? Math.round((completedTopicIds.length / totalTopicsCount) * 100) : 0;

  const buildTestHref = (testId: string) =>
    `/test?courseTestId=${encodeURIComponent(testId)}&courseId=${encodeURIComponent(
      courseId
    )}&academySlug=${encodeURIComponent(academySlug)}&studentId=${encodeURIComponent(
      effectiveStudentId
    )}`;

  const courseWideTests = courseTests.filter((t) => t.scope === 'course');
  const activeLessonOrSubjectTests = courseTests.filter(
    (t) =>
      (activeTopicContext.lessonId && t.lessonId === activeTopicContext.lessonId) ||
      (activeTopicContext.subjectId &&
        t.scope === 'subject' &&
        t.subjectId === activeTopicContext.subjectId)
  );

  const liveNowSessions = liveSessions.filter((s) => s.status === 'live');
  const scheduledSessions = liveSessions.filter((s) => s.status === 'scheduled');

  const currentVideoEmbed =
    activeMode === 'live'
      ? toEmbedUrl(activeLiveSession?.youtubeLiveUrl)
      : toEmbedUrl(activeTopic?.youtubeUrl);

  const currentDocs: Array<{ id?: string; label: string; url: string }> =
    activeMode === 'live'
      ? Array.isArray(activeLiveSession?.attachedDocs)
        ? activeLiveSession.attachedDocs
        : []
      : Array.isArray(activeTopic?.docLinks)
        ? activeTopic.docLinks
        : [];

  const pinnedLessonFaqs = doubts.filter(
    (d) =>
      d.isPinnedFaq &&
      d.reply &&
      (!activeTopicContext.lessonId || !d.lessonId || d.lessonId === activeTopicContext.lessonId)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          {toast}
        </div>
      )}

      {/* Top Classroom Bar */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {portalMeta.logoUrl ? (
              <img
                src={portalMeta.logoUrl}
                alt={portalMeta.academyName}
                className="w-10 h-10 rounded-xl object-cover border border-[#e2e8f0] shrink-0"
              />
            ) : (
              <img
                src="/logo-black.svg"
                alt={portalMeta.academyName}
                className="w-9 h-9 object-contain shrink-0"
              />
            )}
            <div className="space-y-0.5 min-w-0">
              <Link
                href={`/s/${encodeURIComponent(academySlug)}/${encodeURIComponent(effectiveStudentId)}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[var(--brand-primary,#2563eb)]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{portalMeta.academyName} • My Courses</span>
              </Link>
              <h1
                className="text-lg sm:text-xl font-bold text-[#0f172a] truncate"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                {course?.title || 'Course Classroom'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-[#64748b] block">
                Course Progress ({progressPercent}%)
              </span>
              <div className="w-32 h-2 rounded-full bg-[#e2e8f0] overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: 'var(--brand-primary, #2563eb)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Now Banner if Teacher is Live */}
      {liveNowSessions.length > 0 && (
        <div className="bg-[#fef2f2] border-b border-[#fecaca]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#991b1b]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dc2626] text-white font-bold">
                <Radio className="w-3 h-3 animate-pulse" />
                LIVE NOW
              </span>
              <span className="font-semibold">{liveNowSessions[0].title}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveLiveSession(liveNowSessions[0]);
                setActiveMode('live');
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#dc2626] hover:bg-[#b91c1c]"
            >
              Watch Live Stream
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Responsive Classroom Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left on Desktop / Second on Mobile: Collapsible Subjects -> Lessons -> Topics Navigator (3 cols) */}
        <div className="order-2 lg:order-1 lg:col-span-3 bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Course Curriculum
            </h2>
            <span className="text-[11px] font-semibold text-[#64748b]">
              {completedTopicIds.length}/{totalTopicsCount}
            </span>
          </div>

          {subjects.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={curriculumSearch}
                onChange={(e) => setCurriculumSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:bg-white focus:border-[#2563eb]"
              />
              {curriculumSearch && (
                <button
                  type="button"
                  onClick={() => setCurriculumSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {liveNowSessions.length > 0 && (
            <div className="space-y-1.5">
              {liveNowSessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveLiveSession(s);
                    setActiveMode('live');
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center gap-2 transition ${
                    activeMode === 'live' && activeLiveSession?.id === s.id
                      ? 'bg-[#fef2f2] border-[#dc2626] text-[#991b1b] font-bold'
                      : 'bg-white border-[#fecaca] text-[#991b1b] hover:bg-[#fef2f2]'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
            </div>
          )}

          {scheduledSessions.length > 0 && (
            <div className="space-y-1.5 pb-2 border-b border-[#f1f5f9]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                Upcoming Live
              </span>
              {scheduledSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-1"
                >
                  <p className="font-semibold text-[#0f172a] truncate">{s.title}</p>
                  <p className="text-[11px] text-[#64748b] flex items-center gap-1">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate">{new Date(s.scheduledAt).toLocaleString('en-IN')}</span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded">
                    <Timer className="w-2.5 h-2.5" />
                    <span>{formatCountdown(s.scheduledAt, nowMs)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {courseWideTests.length > 0 && (
            <div className="space-y-1.5 pb-2 border-b border-[#f1f5f9]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                Course Tests
              </span>
              {courseWideTests.map((t) => (
                <Link
                  key={t.id}
                  href={buildTestHref(t.id)}
                  className="w-full p-2.5 rounded-lg bg-[#eff6ff] hover:bg-[#dbeafe] border border-[#bfdbfe] text-xs flex items-center justify-between gap-2 transition"
                >
                  <span className="flex items-center gap-1.5 font-semibold text-[#1d4ed8] min-w-0">
                    <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#2563eb] shrink-0">
                    {t.studentLatestAttempt
                      ? `${t.studentLatestAttempt.percentageScore}%`
                      : `${t.questionCount} Qs`}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {subjects.length === 0 ? (
            <p className="text-xs text-[#64748b]">
              Your educator hasn&apos;t added subjects yet.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-0.5">
              {subjects.map((sub) => {
                const q = curriculumSearch.trim().toLowerCase();
                const allSubTopics = (sub.lessons || []).flatMap((l: any) => l.topics || []);
                const doneInSub = allSubTopics.filter((t: any) =>
                  completedTopicIds.includes(t.id)
                ).length;

                const matchingLessons = (sub.lessons || [])
                  .map((les: any) => {
                    if (!q) return les;
                    const matchLes =
                      les.title.toLowerCase().includes(q) || sub.title.toLowerCase().includes(q);
                    const matchTops = (les.topics || []).filter((t: any) =>
                      t.title.toLowerCase().includes(q)
                    );
                    if (matchLes) return les;
                    if (matchTops.length > 0) return { ...les, topics: matchTops };
                    return null;
                  })
                  .filter(Boolean);

                if (q && matchingLessons.length === 0) return null;

                const isSubExpanded = Boolean(q) || Boolean(expandedSubjects[sub.id]);

                return (
                  <div
                    key={sub.id}
                    className="rounded-lg border border-[#e2e8f0] overflow-hidden bg-white"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSubjects((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }))
                      }
                      className="w-full px-3 py-2.5 bg-[#f8fafc] hover:bg-[#f1f5f9] flex items-center justify-between gap-2 text-left transition"
                    >
                      <span className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5 min-w-0">
                        {isSubExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                        )}
                        <BookOpen className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                        <span className="truncate">{sub.title}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-[#64748b] shrink-0">
                        {doneInSub}/{allSubTopics.length}
                      </span>
                    </button>

                    {isSubExpanded && (
                      <div className="p-2 space-y-1.5 border-t border-[#e2e8f0]">
                        {matchingLessons.map((les: any) => {
                          const lesTopics = les.topics || [];
                          const doneInLes = lesTopics.filter((t: any) =>
                            completedTopicIds.includes(t.id)
                          ).length;
                          const isLesExpanded = Boolean(q) || Boolean(expandedLessons[les.id]);

                          return (
                            <div key={les.id} className="space-y-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedLessons((prev) => ({
                                    ...prev,
                                    [les.id]: !prev[les.id],
                                  }))
                                }
                                className="w-full px-2 py-1.5 rounded-md hover:bg-[#f8fafc] flex items-center justify-between gap-2 text-left"
                              >
                                <span className="text-[11px] font-semibold text-[#334155] flex items-center gap-1.5 min-w-0">
                                  {isLesExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-[#94a3b8] shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-[#94a3b8] shrink-0" />
                                  )}
                                  <span className="truncate">{les.title}</span>
                                </span>
                                <span className="text-[10px] text-[#94a3b8] shrink-0">
                                  {doneInLes}/{lesTopics.length}
                                </span>
                              </button>

                              {isLesExpanded && (
                                <div className="pl-3 space-y-0.5">
                                  {lesTopics.map((top: any) => {
                                    const isSelected =
                                      activeMode === 'topic' && activeTopic?.id === top.id;
                                    const done = completedTopicIds.includes(top.id);
                                    return (
                                      <button
                                        key={top.id}
                                        type="button"
                                        onClick={() => {
                                          setActiveTopic(top);
                                          setActiveTopicContext({
                                            subjectId: sub.id,
                                            lessonId: les.id,
                                            label: `${sub.title} → ${les.title} → ${top.title}`,
                                          });
                                          setActiveMode('topic');
                                        }}
                                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 transition ${
                                          isSelected
                                            ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                                            : 'text-[#334155] hover:bg-[#f8fafc]'
                                        }`}
                                      >
                                        {done ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                                        ) : (
                                          <Circle className="w-3.5 h-3.5 text-[#cbd5e1] shrink-0" />
                                        )}
                                        <span className="truncate">{top.title}</span>
                                      </button>
                                    );
                                  })}

                                  {courseTests
                                    .filter((t) => t.scope === 'lesson' && t.lessonId === les.id)
                                    .map((t) => (
                                      <Link
                                        key={t.id}
                                        href={buildTestHref(t.id)}
                                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 bg-[#eff6ff]/70 hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#dbeafe] transition mt-1"
                                      >
                                        <span className="flex items-center gap-1.5 font-semibold min-w-0">
                                          <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                                          <span className="truncate">{t.title}</span>
                                        </span>
                                        <span className="text-[10px] font-bold shrink-0">
                                          {t.studentLatestAttempt
                                            ? `${t.studentLatestAttempt.percentageScore}%`
                                            : 'Test'}
                                        </span>
                                      </Link>
                                    ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {courseTests
                          .filter((t) => t.scope === 'subject' && t.subjectId === sub.id)
                          .map((t) => (
                            <Link
                              key={t.id}
                              href={buildTestHref(t.id)}
                              className="w-full px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] transition mt-1"
                            >
                              <span className="flex items-center gap-1.5 font-semibold min-w-0">
                                <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{t.title}</span>
                              </span>
                              <span className="text-[10px] font-bold shrink-0">
                                {t.studentLatestAttempt
                                  ? `${t.studentLatestAttempt.percentageScore}%`
                                  : `Subject Test`}
                              </span>
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Center on Desktop / First on Mobile: Video Player, Text Notes, Named Docs & Pinned FAQs (5 cols) */}
        <div className="order-1 lg:order-2 lg:col-span-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-4 sm:p-5 space-y-5">
          <div className="flex items-start justify-between gap-3 border-b border-[#f1f5f9] pb-4">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-semibold text-[#2563eb]">
                {activeMode === 'live' ? 'Live Class Stream' : activeTopicContext.label}
              </span>
              <h2 className="text-lg font-bold text-[#0f172a]">
                {activeMode === 'live'
                  ? activeLiveSession?.title
                  : activeTopic?.title || 'Select a topic from the left menu'}
              </h2>
            </div>

            {activeMode === 'topic' && activeTopic && (
              <button
                type="button"
                onClick={() => handleToggleTopicComplete(activeTopic.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 inline-flex items-center gap-1.5 transition ${
                  completedTopicIds.includes(activeTopic.id)
                    ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#047857]'
                    : 'bg-white border-[#cbd5e1] text-[#334155] hover:bg-[#f8fafc]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {completedTopicIds.includes(activeTopic.id) ? 'Completed' : 'Mark Complete'}
                </span>
              </button>
            )}
          </div>

          {currentVideoEmbed && (
            <div className="rounded-xl overflow-hidden border border-[#e2e8f0] aspect-video bg-black">
              <iframe
                src={currentVideoEmbed}
                title="Course video player"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {activeMode === 'topic' && activeTopic?.textContent && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Lesson Notes</span>
              </h3>
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-sm text-[#1e293b] whitespace-pre-wrap leading-relaxed">
                {activeTopic.textContent}
              </div>
            </div>
          )}

          {currentDocs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Attached Documents &amp; Notes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentDocs.map((doc, idx) => (
                  <a
                    key={doc.id || idx}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-lg border border-[#e2e8f0] hover:border-[#2563eb] bg-[#f8fafc] hover:bg-[#eff6ff]/40 transition flex items-center justify-between gap-2 text-xs font-semibold text-[#0f172a]"
                  >
                    <span className="truncate">{doc.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Pinned Lesson FAQs (Suggestion #7: Educator-promoted Q&As visible directly in Lesson View) */}
          {pinnedLessonFaqs.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Pinned Lesson FAQs ({pinnedLessonFaqs.length})</span>
              </h3>
              <div className="space-y-2">
                {pinnedLessonFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] space-y-1.5 text-xs"
                  >
                    <p className="font-bold text-[#0f172a]">Q: {faq.question}</p>
                    <p className="text-[#334155] leading-relaxed">
                      <span className="font-semibold text-[#047857]">Answer: </span>
                      {faq.reply}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMode === 'topic' && activeLessonOrSubjectTests.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Assessments for This Lesson &amp; Subject</span>
              </h3>
              <div className="space-y-2">
                {activeLessonOrSubjectTests.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-[#dbeafe] bg-[#eff6ff]/60 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#1d4ed8] border border-[#bfdbfe]">
                          {t.scope === 'lesson' ? 'Lesson Test' : 'Whole Subject Test'}
                        </span>
                        {t.studentLatestAttempt && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#047857]">
                            <Award className="w-3 h-3" />
                            Last Score: {t.studentLatestAttempt.percentageScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#0f172a] truncate">{t.title}</p>
                      <p className="text-[11px] text-[#64748b]">
                        {t.questionCount} Questions • {t.durationMinutes} mins
                      </p>
                    </div>
                    <Link
                      href={buildTestHref(t.id)}
                      data-testid={`take-course-test-${t.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-95 shrink-0 transition"
                      style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
                    >
                      <span>{t.studentLatestAttempt ? 'Retake Test' : 'Start Test'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMode === 'topic' && (prevTopicItem || nextTopicItem) && (
            <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between gap-3">
              {prevTopicItem ? (
                <button
                  type="button"
                  onClick={() => selectTopicFromSequence(prevTopicItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] max-w-[48%]"
                >
                  <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{prevTopicItem.topic.title}</span>
                </button>
              ) : (
                <div />
              )}

              {nextTopicItem && (
                <button
                  type="button"
                  onClick={() => selectTopicFromSequence(nextTopicItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm max-w-[48%]"
                >
                  <span className="truncate">Next: {nextTopicItem.topic.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Live Chat + Contextual Doubts Panel (4 cols) */}
        <div className="order-3 lg:col-span-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm flex flex-col h-[480px] lg:h-[620px] overflow-hidden">
          <div className="grid grid-cols-2 border-b border-[#e2e8f0] bg-[#f8fafc] p-1.5 gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setRightTab('chat')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                rightTab === 'chat'
                  ? 'bg-white text-[#2563eb] shadow-xs border border-[#e2e8f0]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setRightTab('doubts')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                rightTab === 'doubts'
                  ? 'bg-white text-[#2563eb] shadow-xs border border-[#e2e8f0]'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <MessageCircleQuestion className="w-3.5 h-3.5" />
              <span>Ask a Doubt ({doubts.length})</span>
            </button>
          </div>

          {rightTab === 'chat' ? (
            <>
              {chatMessages.some((m) => m.isPinned) && (
                <div className="px-3.5 py-2.5 bg-[#eff6ff] border-b border-[#dbeafe] flex items-start gap-2 text-xs text-[#1e3a8a] shrink-0">
                  <Pin className="w-3.5 h-3.5 text-[#2563eb] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-[#2563eb] block">
                      Pinned Announcement
                    </span>
                    <p className="font-medium break-words">
                      {chatMessages.find((m) => m.isPinned)?.message}
                    </p>
                  </div>
                </div>
              )}

              {chatSlowMode && !chatMuted && (
                <div className="px-3.5 py-1.5 bg-[#fffbeb] border-b border-[#fde68a] flex items-center gap-1.5 text-[11px] font-medium text-[#b45309] shrink-0">
                  <Timer className="w-3 h-3 shrink-0" />
                  <span>Slow mode is active (1 message every 3 seconds)</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {chatMuted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] text-[#64748b] flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#0f172a]">
                        Student Live Chat is Turned Off
                      </p>
                      <p className="text-[11px] text-[#64748b] leading-relaxed">
                        Your educator has disabled peer chat for this live session. You can still send questions directly in Ask a Doubt.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRightTab('doubts')}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-95 transition"
                      style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
                    >
                      Go to Ask a Doubt
                    </button>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <p className="text-xs text-[#94a3b8] text-center py-8">
                    Start chatting live with classmates in this course!
                  </p>
                ) : (
                  chatMessages.map((msg) => {
                    const isMine = msg.senderId === effectiveStudentId;
                    return (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl text-xs space-y-0.5 ${
                          msg.senderRole === 'teacher'
                            ? 'bg-[#eff6ff] border border-[#bfdbfe]'
                            : isMine
                              ? 'bg-[#f1f5f9] ml-6'
                              : 'bg-[#f8fafc] border border-[#e2e8f0] mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#0f172a]">{msg.senderName}</span>
                          <span className="text-[10px] text-[#94a3b8]">
                            {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[#334155] break-words">{msg.message}</p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {!chatMuted && (
                <form
                  onSubmit={handleSendChat}
                  className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Write a live message..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2 rounded-lg text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {doubts.length === 0 ? (
                  <p className="text-xs text-[#94a3b8] text-center py-8">
                    Have a question about this lesson? Ask below — your teacher&apos;s reply appears right here and in Notifications.
                  </p>
                ) : (
                  doubts.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-[#2563eb] truncate">
                          {d.lessonContextLabel}
                        </span>
                        {d.isPinnedFaq && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#1d4ed8] bg-[#eff6ff] px-1.5 py-0.5 rounded">
                            <Pin className="w-2.5 h-2.5" /> FAQ
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-[#0f172a]">{d.question}</p>
                      {d.reply ? (
                        <div className="p-2.5 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46]">
                          <span className="text-[10px] font-bold uppercase block mb-0.5">
                            Educator Reply
                          </span>
                          <p>{d.reply}</p>
                        </div>
                      ) : (
                        <span className="inline-block text-[11px] text-[#b45309] font-medium">
                          Awaiting educator reply...
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleRaiseDoubt}
                className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] space-y-2 shrink-0"
              >
                <textarea
                  rows={2}
                  value={doubtInput}
                  onChange={(e) => setDoubtInput(e.target.value)}
                  placeholder="Raise a doubt for this lesson..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb] resize-none"
                />
                <button
                  type="submit"
                  disabled={isSendingDoubt || !doubtInput.trim()}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {isSendingDoubt ? 'Submitting Doubt...' : 'Submit Doubt to Educator'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

