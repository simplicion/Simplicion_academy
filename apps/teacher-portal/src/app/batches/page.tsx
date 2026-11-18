'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Users,
  IndianRupee,
  BookOpen,
  ArrowRight,
  Trash2,
  Radio,
  X,
  Lock,
  Globe,
  Sparkles,
  CheckCircle2,
  Star,
  Tag,
} from 'lucide-react';
import {
  SubscriptionUpgradeModal,
  TeacherSubscriptionInfo,
} from '../../components/subscription/SubscriptionUpgradeModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface StudioCourseSummary {
  id: string;
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
  enrolledCount: number;
  subjectCount: number;
  doubtCount: number;
  totalRevenue: number;
  isLiveNow: boolean;
}

export default function CoursesManagerPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<StudioCourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<TeacherSubscriptionInfo | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<{ id: string; title: string } | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [starringId, setStarringId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, subRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses?tenant=cuet-humanities`),
        fetch(`${API_BASE_URL}/subscription/status?tenant=cuet-humanities`),
      ]);
      const data = await coursesRes.json();
      const subData = await subRes.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
      }
      if (subData?.success && subData.subscription) {
        setSubscription(subData.subscription);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    window.addEventListener('simplicion-subscription-updated', loadCourses);
    return () => window.removeEventListener('simplicion-subscription-updated', loadCourses);
  }, []);

  const handleQuickPublish = async (e: React.MouseEvent, course: StudioCourseSummary) => {
    e.preventDefault();
    e.stopPropagation();
    if (publishingId) return;
    setPublishingId(course.id);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(course.id)}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.status === 402 || data.requiresSubscription) {
        if (data.subscription) setSubscription(data.subscription);
        setPendingCourse({ id: course.id, title: course.title });
        setUpgradeReason(
          data.error ||
            'An active ₹250/month Educator Subscription is required to publish courses live to students.'
        );
        setIsUpgradeModalOpen(true);
        return;
      }
      if (res.ok && data.success) {
        await loadCourses();
        showToast(`"${course.title}" is now live on your Student Portal!`);
      }
    } catch {
      // ignore
    } finally {
      setPublishingId(null);
    }
  };

  /**
   * Step 1: Frictionless Instant Create (Course Name Only) -> Redirect directly into Course Dashboard
   * where the Step 2 Setup Pop-up asks for price, seat limit & banner image!
   */
  const handleInstantCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newCourseName.trim()) {
      setError('Please enter a course name.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug: 'cuet-humanities',
          title: newCourseName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.course?.id) {
        throw new Error(data.error || 'Could not create course.');
      }

      setIsCreateOpen(false);
      setNewCourseName('');
      router.push(`/batches/${data.course.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create course.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleFeatured = async (e: React.MouseEvent, course: StudioCourseSummary) => {
    e.preventDefault();
    e.stopPropagation();
    if (starringId) return;
    setStarringId(course.id);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(course.id)}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !course.isFeatured }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Maximum 2 courses can be starred as Featured at a time.');
        return;
      }
      await loadCourses();
      showToast(
        data.isFeatured
          ? `"${course.title}" starred in Featured Highlights (${data.featuredCount}/2).`
          : `"${course.title}" removed from Featured Highlights.`
      );
    } catch {
      // ignore
    } finally {
      setStarringId(null);
    }
  };

  const handleDeleteCourse = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this course and all its subjects, lessons, and topics?')) return;
    try {
      await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}`, {
        method: 'DELETE',
      });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch {
      // ignore
    }
  };

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full min-w-0">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl bg-white p-6 border border-[#e2e8f0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            Courses &amp; Batches
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Create a course in one step and click any course card to open its dedicated workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsCreateOpen(true);
          }}
          data-testid="new-course-btn"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      </div>

      {/* Subscription Banner when Educator Plan is Inactive */}
      {subscription && !subscription.isActive && (
        <div className="rounded-xl bg-[#fffbeb] border border-[#fde68a] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#fde68a] text-[#d97706] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#92400e]">
                Educator Subscription Inactive — Courses Stay in Draft
              </p>
              <p className="text-xs text-[#b45309]">
                Build unlimited courses, lessons, and tests for free. Activate the ₹250/month Educator Plan whenever you are ready to publish courses live to students.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPendingCourse(null);
              setUpgradeReason(undefined);
              setIsUpgradeModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Upgrade — ₹250/mo</span>
          </button>
        </div>
      )}

      {/* Search & Featured Highlights Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          />
        </div>
        <div className="flex items-center gap-3">
          <span
            data-testid="featured-count-pill"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]"
          >
            <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
            <span>
              Featured Highlights: {courses.filter((c) => c.isFeatured).length} / 2
            </span>
          </span>
          <span className="text-xs font-medium text-[#64748b]">
            {filtered.length} {filtered.length === 1 ? 'Course' : 'Courses'}
          </span>
        </div>
      </div>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
          Loading courses from Supabase...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-14 bg-white rounded-xl border border-[#e2e8f0] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#0f172a]">Create Your First Course</h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              Enter your course name to open its dedicated dashboard, subjects, lessons, live classes, and doubts workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/batches/${course.id}`}
              className="group bg-white rounded-xl border border-[#e2e8f0] shadow-sm hover:border-[#2563eb] card-interactive overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="h-36 bg-[#f1f5f9] border-b border-[#e2e8f0] relative overflow-hidden">
                  {course.bannerUrl ? (
                    <img
                      src={course.bannerUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#eff6ff]">
                      <BookOpen className="w-8 h-8 text-[#2563eb]/40" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[70%]">
                    {course.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#b45309] border border-[#fde68a] shadow-sm">
                        <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                        <span>Featured</span>
                      </span>
                    )}
                    {course.isLiveNow ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dc2626] text-white shadow-sm">
                        <Radio className="w-3 h-3 animate-pulse" />
                        LIVE NOW
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shadow-sm ${
                          course.status === 'live'
                            ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                            : course.isSetupComplete
                              ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                              : 'bg-white text-[#475569] border border-[#e2e8f0]'
                        }`}
                      >
                        {course.status === 'live'
                          ? 'Published'
                          : course.isSetupComplete
                            ? 'Draft'
                            : 'Setup Pending'}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={starringId === course.id}
                      onClick={(e) => handleToggleFeatured(e, course)}
                      data-testid={`star-course-${course.id}`}
                      title={
                        course.isFeatured
                          ? 'Remove from Featured Highlights'
                          : 'Star in Featured Highlights (Max 2)'
                      }
                      className={`p-1.5 rounded-lg border shadow-xs transition ${
                        course.isFeatured
                          ? 'bg-[#fffbeb] border-[#f59e0b] text-[#f59e0b]'
                          : 'bg-white/95 border-[#e2e8f0] text-[#64748b] hover:text-[#f59e0b] hover:border-[#fde68a]'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${course.isFeatured ? 'fill-[#f59e0b]' : ''}`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteCourse(e, course.id)}
                      title="Delete course"
                      className="p-1.5 rounded-lg bg-white/95 text-[#64748b] hover:text-[#dc2626] border border-[#e2e8f0] opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3
                      className="text-base font-bold text-[#0f172a] group-hover:text-[#2563eb] transition-colors line-clamp-1"
                      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                    >
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-[#64748b] line-clamp-2 mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f1f5f9] text-xs">
                    <div>
                      <span className="text-[11px] text-[#64748b] block">Price</span>
                      <div className="flex flex-wrap items-baseline gap-1">
                        <span className="font-bold text-[#0f172a]">
                          {course.priceInr > 0 ? `₹${course.priceInr.toLocaleString('en-IN')}` : 'Free'}
                        </span>
                        {course.originalPriceInr && course.originalPriceInr > course.priceInr ? (
                          <span className="text-[10px] line-through text-[#94a3b8]">
                            ₹{course.originalPriceInr.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                      </div>
                      {course.discountPercent && course.discountPercent > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#047857] bg-[#ecfdf5] px-1.5 py-0.5 rounded mt-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          {course.discountPercent}% OFF
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748b] block">Students</span>
                      <span className="font-bold text-[#0f172a] inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#2563eb]" />
                        {course.enrolledCount}
                        {course.maxStudents ? `/${course.maxStudents}` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#64748b] block">Revenue</span>
                      <span className="font-bold text-[#047857] inline-flex items-center">
                        <IndianRupee className="w-3 h-3" />
                        {course.totalRevenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-between gap-2 text-xs font-semibold text-[#2563eb]">
                <span className="truncate">Open Workspace ({course.subjectCount} Subjects)</span>
                <div className="flex items-center gap-2 shrink-0">
                  {course.status !== 'live' && (
                    <button
                      type="button"
                      onClick={(e) => handleQuickPublish(e, course)}
                      disabled={publishingId === course.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#059669] hover:bg-[#047857] transition-colors disabled:opacity-60"
                    >
                      {subscription && !subscription.isActive ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      <span>{publishingId === course.id ? '...' : 'Publish'}</span>
                    </button>
                  )}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Step 1: Minimal Instant Create Modal (Course Name Only) */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="instant-create-course-modal"
          onClick={() => setIsCreateOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/55 backdrop-blur-[2px] !mt-0"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90dvh] flex flex-col border border-[#e2e8f0] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <h3
                  className="text-lg font-bold text-[#0f172a]"
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                >
                  Create New Course
                </h3>
                <p className="text-xs text-[#64748b]">
                  Enter a name to launch your dedicated course workspace instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInstantCreate} className="p-6 space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs text-[#b91c1c]">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="instant-course-name"
                  className="block text-xs font-semibold text-[#334155]"
                >
                  Course Name *
                </label>
                <input
                  id="instant-course-name"
                  type="text"
                  required
                  autoFocus
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. CUET 2027 Humanities Complete Batch"
                  className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-[#334155] bg-white border border-[#cbd5e1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  data-testid="submit-instant-course-btn"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  <span>{isCreating ? 'Creating...' : 'Create & Open Dashboard'}</span>
                  {!isCreating && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Educator Subscription Upgrade Modal (₹250/month) */}
      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        tenantSlug="cuet-humanities"
        courseTitle={pendingCourse?.title}
        reason={upgradeReason}
        onClose={() => {
          setIsUpgradeModalOpen(false);
          setPendingCourse(null);
        }}
        onUpgraded={async (sub) => {
          setSubscription(sub);
          setIsUpgradeModalOpen(false);
          if (pendingCourse) {
            const target = pendingCourse;
            setPendingCourse(null);
            try {
              const res = await fetch(
                `${API_BASE_URL}/courses/${encodeURIComponent(target.id)}/publish`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' } }
              );
              const data = await res.json();
              if (res.ok && data.success) {
                await loadCourses();
                showToast(`₹250/mo plan activated & "${target.title}" published live!`);
                return;
              }
            } catch {
              // ignore
            }
          }
          await loadCourses();
          showToast('₹250/month Educator Plan activated! You can now publish courses live.');
        }}
      />
    </div>
  );
}
