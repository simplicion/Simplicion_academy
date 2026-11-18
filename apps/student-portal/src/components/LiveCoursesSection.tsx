'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Radio,
  ArrowRight,
  Lock,
  CheckCircle2,
  Clock,
  GraduationCap,
  Star,
  Tag,
} from 'lucide-react';

export interface LiveStudioCourse {
  id: string;
  tenantSlug: string;
  slug: string;
  title: string;
  description?: string | null;
  priceInr: number;
  originalPriceInr?: number | null;
  discountPercent?: number;
  discountLabel?: string | null;
  isFeatured?: boolean;
  maxStudents?: number | null;
  bannerUrl?: string | null;
  isSetupComplete: boolean;
  status: string;
  launchedAt?: string | null;
  enrolledCount: number;
  subjectCount: number;
  isLiveNow: boolean;
  activeLiveSession?: {
    id: string;
    title: string;
    youtubeLiveUrl: string;
  } | null;
}

export interface LiveCoursesSectionProps {
  badgeText?: string;
  heading?: string;
  subtitle?: string;
  courses: LiveStudioCourse[];
  enrolledCourseIds: string[];
  isLoggedIn: boolean;
  studentId?: string;
  tenantSlug: string;
  waitlistedIds?: string[];
  onBuyOrEnroll: (course: LiveStudioCourse) => void;
  onJoinWaitlist?: (course: LiveStudioCourse) => void;
}

export const LiveCoursesSection: React.FC<LiveCoursesSectionProps> = ({
  badgeText = 'Featured Programs',
  heading = 'Explore Our Courses',
  subtitle = 'Enroll securely for instant access to organized subjects, live sessions, study documents, live classroom chat, and assessments.',
  courses,
  enrolledCourseIds,
  isLoggedIn,
  studentId,
  tenantSlug,
  waitlistedIds = [],
  onBuyOrEnroll,
  onJoinWaitlist,
}) => {
  const featuredCourses = courses.filter((c) => Boolean(c.isFeatured)).slice(0, 2);
  const featuredIds = new Set(featuredCourses.map((c) => c.id));
  const regularCourses = courses.filter((c) => !featuredIds.has(c.id));

  const renderCourseCard = (course: LiveStudioCourse, highlight = false) => {
    const isEnrolled = isLoggedIn && enrolledCourseIds.includes(course.id);
    const isFull =
      Boolean(course.maxStudents) &&
      course.enrolledCount >= Number(course.maxStudents) &&
      !isEnrolled;
    const isWaitlisted = waitlistedIds.includes(course.id);
    const seatsLeft = course.maxStudents
      ? Math.max(0, course.maxStudents - course.enrolledCount)
      : null;
    const hasDiscount =
      Boolean(course.originalPriceInr && course.originalPriceInr > course.priceInr) &&
      Boolean(course.discountPercent && course.discountPercent > 0);

    const classroomHref = `/s/${encodeURIComponent(
      course.tenantSlug || tenantSlug
    )}/${encodeURIComponent(studentId || 'student')}/course/${encodeURIComponent(course.id)}`;

    return (
      <div
        key={course.id}
        data-testid={`live-course-card-${course.id}`}
        className={`group bg-white rounded-xl border shadow-sm card-interactive overflow-hidden flex flex-col ${
          highlight
            ? 'border-[#fde68a] ring-1 ring-[#fde68a]/70'
            : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
        }`}
      >
        {/* Course Banner */}
        <div
          className={`relative w-full bg-[#f1f5f9] border-b border-[#e2e8f0] overflow-hidden ${
            highlight ? 'h-48 sm:h-52' : 'h-44'
          }`}
        >
          {course.bannerUrl ? (
            <img
              src={course.bannerUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#eff6ff] text-[#2563eb] gap-2">
              <BookOpen className="w-9 h-9 opacity-80" />
              <span className="text-xs font-semibold tracking-wide uppercase text-[#1d4ed8]">
                {course.subjectCount} {course.subjectCount === 1 ? 'Subject' : 'Subjects'}
              </span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {highlight && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fffbeb] border border-[#f59e0b] text-[#b45309] text-[11px] font-bold shadow-sm">
                  <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                  <span>Featured</span>
                </span>
              )}
              {course.isLiveNow ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dc2626] text-white text-[11px] font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>LIVE NOW</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-[#e2e8f0] text-[#0f172a] text-[11px] font-semibold shadow-sm">
                  <BookOpen className="w-3 h-3 text-[#2563eb]" />
                  <span>
                    {course.subjectCount} {course.subjectCount === 1 ? 'Subject' : 'Subjects'}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {hasDiscount && (
                <span
                  data-testid={`course-discount-badge-${course.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#059669] text-white text-[11px] font-bold shadow-sm"
                >
                  <Tag className="w-3 h-3" />
                  <span>{course.discountPercent}% OFF</span>
                </span>
              )}

              {isEnrolled ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-[11px] font-bold shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Enrolled</span>
                </span>
              ) : isFull ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fffbeb] border border-[#fde68a] text-[#b45309] text-[11px] font-bold shadow-sm">
                  <Clock className="w-3 h-3" />
                  <span>Batch Full</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            {hasDiscount && course.discountLabel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe] text-[10px] font-bold uppercase tracking-wider">
                {course.discountLabel}
              </span>
            )}

            <h3
              className={`font-bold text-[#0f172a] leading-snug line-clamp-2 ${
                highlight ? 'text-lg' : 'text-base'
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {course.title}
            </h3>

            {course.description && (
              <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            )}

            {course.isLiveNow && course.activeLiveSession && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs text-[#b91c1c] font-medium">
                <Radio className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Live: {course.activeLiveSession.title}</span>
              </div>
            )}

            {/* Meta Row */}
            <div className="flex items-center justify-between text-xs text-[#64748b] pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#64748b]" />
                {course.maxStudents ? (
                  <span>
                    {course.enrolledCount} / {course.maxStudents} seats
                  </span>
                ) : (
                  <span>{course.enrolledCount} enrolled</span>
                )}
              </span>
              {seatsLeft !== null && seatsLeft > 0 && seatsLeft <= 10 && !isEnrolled && (
                <span className="text-[11px] font-semibold text-[#d97706]">
                  Only {seatsLeft} left
                </span>
              )}
            </div>
          </div>

          {/* Footer Price (with Discount MRP) + Action */}
          <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-medium text-[#64748b] block">Course Fee</span>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span
                  className="text-lg font-bold text-[#0f172a]"
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                >
                  {course.priceInr > 0
                    ? `₹${course.priceInr.toLocaleString('en-IN')}`
                    : 'Free'}
                </span>
                {hasDiscount && course.originalPriceInr && (
                  <span className="text-xs font-medium text-[#94a3b8] line-through">
                    ₹{Number(course.originalPriceInr).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="text-[10px] font-bold text-[#059669]">
                  Save ₹
                  {(Number(course.originalPriceInr) - Number(course.priceInr)).toLocaleString(
                    'en-IN'
                  )}{' '}
                  ({course.discountPercent}% OFF)
                </span>
              )}
            </div>

            {isEnrolled ? (
              <Link
                href={classroomHref}
                data-testid={`open-classroom-${course.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
              >
                <span>Open Classroom</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : isFull ? (
              <button
                type="button"
                disabled={isWaitlisted}
                onClick={() => onJoinWaitlist?.(course)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#fde68a] bg-[#fffbeb] text-[#b45309] text-xs font-semibold hover:bg-[#fef3c7] disabled:opacity-60 transition-colors shrink-0"
              >
                <span>{isWaitlisted ? 'On Waitlist' : 'Join Waitlist'}</span>
              </button>
            ) : (
              <button
                type="button"
                data-testid={`buy-course-${course.id}`}
                onClick={() => onBuyOrEnroll(course)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-white text-xs font-semibold shadow-sm hover:opacity-95 transition shrink-0"
                style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
              >
                {!isLoggedIn && <Lock className="w-3.5 h-3.5" />}
                <span>
                  {!isLoggedIn
                    ? course.priceInr > 0
                      ? 'Login to Buy'
                      : 'Login to Enroll'
                    : course.priceInr > 0
                      ? 'Buy Course'
                      : 'Enroll Free'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="live-courses"
      data-testid="live-courses-section"
      className="py-16 bg-[#f8fafc] border-b border-[#e2e8f0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            {badgeText && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: 'var(--brand-primary-soft, #eff6ff)',
                  borderColor: 'var(--brand-primary-border, #dbeafe)',
                  color: 'var(--brand-primary, #2563eb)',
                }}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{badgeText}</span>
              </div>
            )}
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {heading}
            </h2>
            {subtitle && <p className="text-sm text-[#475569] max-w-2xl">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold text-[#64748b] bg-white border border-[#e2e8f0] px-3 py-1.5 rounded-lg self-start sm:self-auto">
            {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Available
          </span>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center space-y-2">
            <BookOpen
              className="w-8 h-8 mx-auto opacity-80"
              style={{ color: 'var(--brand-primary, #2563eb)' }}
            />
            <p className="text-sm font-bold text-[#0f172a]">New Courses Launching Soon</p>
            <p className="text-xs text-[#64748b] max-w-md mx-auto">
              Courses published from the Educator Studio appear here automatically in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Highlights Spotlight (Max 2 Starred Courses) */}
            {featuredCourses.length > 0 && (
              <div data-testid="featured-highlights-block" className="space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                    <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                    <span>Featured Highlights</span>
                  </span>
                  <span className="text-xs text-[#64748b]">Top recommended courses</span>
                </div>
                <div
                  className={`grid grid-cols-1 gap-6 ${
                    featuredCourses.length === 1 ? 'md:grid-cols-2' : 'md:grid-cols-2'
                  }`}
                >
                  {featuredCourses.map((course) => renderCourseCard(course, true))}
                </div>
              </div>
            )}

            {/* All Other Published Courses */}
            {regularCourses.length > 0 && (
              <div className="space-y-3.5">
                {featuredCourses.length > 0 && (
                  <h3 className="text-sm font-bold text-[#334155]">More Courses</h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularCourses.map((course) => renderCourseCard(course, false))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
