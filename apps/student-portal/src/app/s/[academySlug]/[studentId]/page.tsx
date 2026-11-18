'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Radio,
  ArrowRight,
  Lock,
  Bell,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { PortalUnavailableView } from '../../../../components/PortalUnavailableView';
import { openOne80IdentityBottomSheet } from '../../../../lib/one80-sdk';
import {
  applyBrandColorTokens,
  DEFAULT_ACADEMY_PROFILE,
  mergeAcademyProfile,
  AcademyProfileData,
} from '../../../../lib/site-content';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StudentAcademyPortalPage() {
  const params = useParams();
  const academySlug = ((params?.academySlug as string) || 'cuet-humanities').toLowerCase();
  const routeStudentId = (params?.studentId as string) || '';

  const [student, setStudent] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<AcademyProfileData>(DEFAULT_ACADEMY_PROFILE);
  const [portalLive, setPortalLive] = useState(true);
  const [portalOfflineMessage, setPortalOfflineMessage] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  const effectiveStudentId = student?.id || routeStudentId;

  const loadPortal = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cfgRes, coursesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/site-config?tenant=${encodeURIComponent(academySlug)}`),
        fetch(`${API_BASE_URL}/courses?tenant=${encodeURIComponent(academySlug)}&publishedOnly=true`),
      ]);
      const [cfgData, coursesData] = await Promise.all([cfgRes.json(), coursesRes.json()]);

      if (cfgData?.success && cfgData.data) {
        const branding = cfgData.data.settings?.branding || {};
        const contact = cfgData.data.settings?.contact || {};
        if (branding.primaryColor) applyBrandColorTokens(branding.primaryColor);
        setProfile(mergeAcademyProfile(cfgData.data.name, cfgData.data.slug, branding, contact));
        setPortalLive(cfgData.data.portalLive !== false);
        if (typeof cfgData.data.portalOfflineMessage === 'string') {
          setPortalOfflineMessage(cfgData.data.portalOfflineMessage);
        }
      }
      if (coursesData?.success && Array.isArray(coursesData.courses)) {
        setCourses(coursesData.courses);
      }

      if (effectiveStudentId && student) {
        const [enrRes, notifRes] = await Promise.all([
          fetch(
            `${API_BASE_URL}/student/enrollments?studentId=${encodeURIComponent(effectiveStudentId)}&tenant=${encodeURIComponent(academySlug)}`
          ),
          fetch(`${API_BASE_URL}/notifications?studentId=${encodeURIComponent(effectiveStudentId)}`),
        ]);
        const [enrData, notifData] = await Promise.all([enrRes.json(), notifRes.json()]);
        if (enrData?.success && Array.isArray(enrData.courseIds)) {
          setEnrolledCourseIds(enrData.courseIds);
        }
        if (notifData?.success && typeof notifData.unreadCount === 'number') {
          setUnreadNotifications(notifData.unreadCount);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [academySlug, effectiveStudentId, student]);

  useEffect(() => {
    loadPortal();

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`student-hub-portal-${academySlug}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'TenantSettings' }, () =>
            loadPortal()
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
  }, [loadPortal, academySlug]);

  const handleLogin = async () => {
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

  if (!portalLive) {
    return (
      <PortalUnavailableView
        academyName={profile.academyName}
        logoUrl={profile.logoUrl}
        message={portalOfflineMessage}
        supportEmail={profile.supportEmail}
        supportPhone={profile.supportPhone}
        whatsappNumber={profile.whatsappNumber}
        onRetry={loadPortal}
      />
    );
  }

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
              Sign In to Your Student Portal
            </h1>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Sign in with 180 Identity to access your enrolled courses, live classes, tests, and educator doubt replies.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogin}
            style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white hover:opacity-95 shadow-sm transition"
          >
            Login with 180 Identity
          </button>
          <Link
            href={`/${encodeURIComponent(academySlug)}`}
            className="block text-xs font-semibold text-[#64748b] hover:text-[#0f172a]"
          >
            ← Back to Academy Home
          </Link>
        </div>
      </div>
    );
  }

  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));
  const exploreCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id));

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-14">
      {profile.bannerUrl && (
        <div className="w-full h-36 sm:h-48 overflow-hidden border-b border-[#e2e8f0] bg-white">
          <img
            src={profile.bannerUrl}
            alt={profile.academyName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Welcome & Academy Identity Card */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={profile.academyName}
                className="w-12 h-12 rounded-xl object-cover border border-[#e2e8f0] shrink-0"
              />
            ) : (
              <img
                src="/logo-black.svg"
                alt={profile.academyName}
                className="w-11 h-11 object-contain shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#64748b] truncate">
                {profile.academyName}
                {profile.tagline ? ` • ${profile.tagline}` : ' • Student Portal'}
              </p>
              <h1
                className="text-xl sm:text-2xl font-bold text-[#0f172a] truncate"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                Welcome back, {student?.name || 'Student'}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/notifications"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
            >
              <Bell className="w-4 h-4 text-[#2563eb]" />
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#dc2626] text-white text-[10px] font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Link>
            <Link
              href={`/${encodeURIComponent(academySlug)}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-95"
              style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
            >
              <span>Browse Academy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Enrolled Courses */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              My Enrolled Courses ({enrolledCourses.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-10 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
              Loading your courses...
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="p-10 bg-white rounded-xl border border-[#e2e8f0] text-center space-y-3">
              <BookOpen className="w-8 h-8 text-[#2563eb] mx-auto" />
              <p className="text-sm font-bold text-[#0f172a]">No enrolled courses yet</p>
              <p className="text-xs text-[#64748b] max-w-md mx-auto">
                Enroll in a published course below or from the Academy Landing Page to unlock classrooms, live classes, and assessments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/s/${encodeURIComponent(academySlug)}/${encodeURIComponent(effectiveStudentId)}/course/${encodeURIComponent(course.id)}`}
                  className="group bg-white rounded-xl border border-[#e2e8f0] hover:border-[#2563eb] shadow-sm card-interactive overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-36 bg-[#f1f5f9] border-b border-[#e2e8f0] relative overflow-hidden">
                      {course.bannerUrl ? (
                        <img
                          src={course.bannerUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#eff6ff]">
                          <BookOpen className="w-8 h-8 text-[#2563eb]/50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {course.isLiveNow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dc2626] text-white">
                            <Radio className="w-3 h-3 animate-pulse" />
                            LIVE NOW
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                            <CheckCircle2 className="w-3 h-3" />
                            Enrolled
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 space-y-1.5">
                      <h3 className="text-base font-bold text-[#0f172a] group-hover:text-[#2563eb] line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#64748b]">
                        {course.subjectCount} Subjects
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-between text-xs font-semibold text-[#2563eb]">
                    <span>Enter Classroom</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Explore More Courses */}
        {exploreCourses.length > 0 && (
          <section className="space-y-4">
            <h2
              className="text-lg font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              More Courses from {profile.academyName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exploreCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/s/${encodeURIComponent(academySlug)}/${encodeURIComponent(effectiveStudentId)}/course/${encodeURIComponent(course.id)}`}
                  className="bg-white rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-sm card-interactive p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[#0f172a] line-clamp-1">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-[#64748b] line-clamp-2">{course.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
                    <span className="text-sm font-bold text-[#0f172a]">
                      {course.priceInr > 0
                        ? `₹${Number(course.priceInr).toLocaleString('en-IN')}`
                        : 'Free'}
                    </span>
                    <span className="text-xs font-semibold text-[#2563eb] inline-flex items-center gap-1">
                      <span>View &amp; Enroll</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Academy Support Strip */}
        {(profile.supportEmail || profile.supportPhone) && (
          <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569]">
            <span className="font-semibold text-[#0f172a]">Need help? Contact {profile.academyName}</span>
            <div className="flex flex-wrap items-center gap-4">
              {profile.supportEmail && (
                <a href={`mailto:${profile.supportEmail}`} className="inline-flex items-center gap-1.5 hover:text-[#2563eb]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile.supportEmail}</span>
                </a>
              )}
              {profile.supportPhone && (
                <a href={`tel:${profile.supportPhone}`} className="inline-flex items-center gap-1.5 hover:text-[#2563eb]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{profile.supportPhone}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
