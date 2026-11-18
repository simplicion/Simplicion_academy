'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { HeroSection } from './HeroSection';
import { ShowcaseSection } from './ShowcaseSection';
import { WhyUsSection } from './WhyUsSection';
import { FaqSection } from './FaqSection';
import { LiveCoursesSection, LiveStudioCourse } from './LiveCoursesSection';
import { PortalUnavailableView } from './PortalUnavailableView';
import { StorefrontSkeleton } from './StorefrontSkeleton';
import { One80PayModal, One80PaymentSuccessPayload } from './checkout/One80PayModal';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { openOne80IdentityBottomSheet } from '../lib/one80-sdk';
import { InitialStorefrontPayload } from '../lib/storefront-loader';
import {
  DEFAULT_WEBSITE_CONTENT,
  DEFAULT_ACADEMY_PROFILE,
  WebsiteSectionContent,
  AcademyProfileData,
  mergeWebsiteContent,
  mergeAcademyProfile,
  applyBrandColorTokens,
} from '../lib/site-content';
import { CheckCircle2, X, ArrowRight } from 'lucide-react';

interface One80AuthUser {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  provider?: '180_identity';
  token?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function preloadImagesWithBudget(urls: Array<string | undefined | null>, maxWaitMs = 350): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const valid = urls.filter((u): u is string => typeof u === 'string' && u.length > 0);
  if (valid.length === 0) return Promise.resolve();

  const loaders = valid.map(
    (src) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      })
  );

  return Promise.race([
    Promise.all(loaders).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs)),
  ]);
}

function buildBrandInlineVars(hex: string): React.CSSProperties {
  const clean = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#2563eb';
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  return {
    ['--brand-primary' as any]: clean,
    ['--brand-accent' as any]: clean,
    ['--brand-primary-soft' as any]: `rgba(${r}, ${g}, ${b}, 0.08)`,
    ['--brand-primary-border' as any]: `rgba(${r}, ${g}, ${b}, 0.22)`,
  };
}

export const AcademyLandingView: React.FC<{
  forcedSlug?: string;
  initialData?: InitialStorefrontPayload | null;
}> = ({ forcedSlug, initialData }) => {
  const initialBranding = initialData?.siteConfig?.settings?.branding || {};
  const initialContact = initialData?.siteConfig?.settings?.contact || {};
  const hasServerPayload = Boolean(initialData?.siteConfig);

  const [tenantSlug, setTenantSlug] = useState(
    (initialData?.slug || forcedSlug || 'cuet-humanities').toLowerCase()
  );
  const [brandColor, setBrandColor] = useState(initialBranding.primaryColor || '#2563eb');
  const [siteContent, setSiteContent] = useState<WebsiteSectionContent>(
    hasServerPayload ? mergeWebsiteContent(initialBranding.websiteContent) : DEFAULT_WEBSITE_CONTENT
  );
  const [academyProfile, setAcademyProfile] = useState<AcademyProfileData>(
    hasServerPayload && initialData?.siteConfig
      ? mergeAcademyProfile(
          initialData.siteConfig.name,
          initialData.siteConfig.slug,
          initialBranding,
          initialContact
        )
      : DEFAULT_ACADEMY_PROFILE
  );
  const [portalLive, setPortalLive] = useState(
    hasServerPayload ? initialData?.siteConfig?.portalLive !== false : true
  );
  const [portalOfflineMessage, setPortalOfflineMessage] = useState(
    initialData?.siteConfig?.portalOfflineMessage || ''
  );
  const [isStorefrontReady, setIsStorefrontReady] = useState(hasServerPayload);

  const [currentUser, setCurrentUser] = useState<One80AuthUser | null>(null);
  const [liveCourses, setLiveCourses] = useState<LiveStudioCourse[]>(initialData?.courses || []);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [waitlistedIds, setWaitlistedIds] = useState<string[]>([]);
  const [selectedStudioCourse, setSelectedStudioCourse] = useState<LiveStudioCourse | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [bannerClassroomHref, setBannerClassroomHref] = useState<string | null>(null);

  const loadLiveCourses = useCallback(async (slug: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/courses?tenant=${encodeURIComponent(slug)}&publishedOnly=true`
      );
      const json = await res.json();
      if (json?.success && Array.isArray(json.courses)) {
        setLiveCourses(json.courses);
      }
    } catch {
      // ignore
    }
  }, []);

  const loadStudentCourseEnrollments = useCallback(async (studentId: string, slug: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/student/enrollments?studentId=${encodeURIComponent(studentId)}&tenant=${encodeURIComponent(slug)}`
      );
      const json = await res.json();
      if (json?.success && Array.isArray(json.courseIds)) {
        setEnrolledCourseIds(json.courseIds);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistStudioCourseEnrollment = useCallback(
    async (
      courseId: string,
      courseTitle: string,
      amountPaid: number,
      user: One80AuthUser,
      slug: string,
      paymentId?: string
    ) => {
      const studentId = user.id || `180_usr_${Date.now()}`;
      try {
        const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            studentName: user.name || 'Student',
            studentEmail: user.email || '',
            amountPaid,
            paymentId,
          }),
        });
        const json = await res.json();
        if (!res.ok && !json.alreadyEnrolled) {
          setBannerMessage(json.error || 'Could not complete enrollment.');
          setBannerClassroomHref(null);
          return false;
        }
      } catch {
        // fallback
      }

      setEnrolledCourseIds((prev) => Array.from(new Set([...prev, courseId])));
      setBannerMessage(
        paymentId
          ? `Enrolled in "${courseTitle}" via 180 Pay (Ref: ${paymentId}).`
          : `Enrolled in "${courseTitle}". Your classroom is ready.`
      );
      setBannerClassroomHref(
        `/s/${encodeURIComponent(slug)}/${encodeURIComponent(studentId)}/course/${encodeURIComponent(courseId)}`
      );
      window.dispatchEvent(new Event('simplicion-notifications-updated'));
      loadLiveCourses(slug);
      return true;
    },
    [loadLiveCourses]
  );

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    const slug = (forcedSlug || currentParams.get('tenant') || 'cuet-humanities').toLowerCase();
    setTenantSlug(slug);

    const syncState = () => {
      const savedUser = localStorage.getItem('simplicion_student');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as One80AuthUser;
          setCurrentUser(parsed);
          if (parsed?.id) {
            loadStudentCourseEnrollments(parsed.id, slug);
          }
        } catch {
          setCurrentUser(null);
          setEnrolledCourseIds([]);
        }
      } else {
        setCurrentUser(null);
        setEnrolledCourseIds([]);
      }
    };

    syncState();

    // Immediately broadcast SSR storefront payload to Header & Footer with zero extra latency
    if (initialData?.siteConfig) {
      const b = initialData.siteConfig.settings?.branding || {};
      if (b.primaryColor) applyBrandColorTokens(b.primaryColor);
      (window as any).__SIMPLICION_STOREFRONT__ = initialData.siteConfig;
      window.dispatchEvent(
        new CustomEvent('simplicion-storefront-hydrated', { detail: initialData.siteConfig })
      );
    }

    const loadCombinedStorefront = async (withImagePreload = false) => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/public/storefront?tenant=${encodeURIComponent(slug)}`
        );
        const json = await res.json();
        if (json?.success) {
          if (json.siteConfig) {
            const branding = json.siteConfig.settings?.branding || {};
            const contact = json.siteConfig.settings?.contact || {};
            const mergedContent = mergeWebsiteContent(branding.websiteContent);
            const mergedProfile = mergeAcademyProfile(
              json.siteConfig.name,
              json.siteConfig.slug,
              branding,
              contact
            );

            if (withImagePreload) {
              await preloadImagesWithBudget([
                mergedProfile.logoUrl,
                mergedProfile.bannerUrl,
                mergedContent.hero.heroImageUrl,
                ...(Array.isArray(json.courses)
                  ? json.courses.slice(0, 2).map((c: any) => c.bannerUrl)
                  : []),
              ]);
            }

            if (branding.primaryColor) {
              setBrandColor(branding.primaryColor);
              applyBrandColorTokens(branding.primaryColor);
            }
            setSiteContent(mergedContent);
            setAcademyProfile(mergedProfile);
            setPortalLive(json.siteConfig.portalLive !== false);
            if (typeof json.siteConfig.portalOfflineMessage === 'string') {
              setPortalOfflineMessage(json.siteConfig.portalOfflineMessage);
            }

            (window as any).__SIMPLICION_STOREFRONT__ = json.siteConfig;
            window.dispatchEvent(
              new CustomEvent('simplicion-storefront-hydrated', { detail: json.siteConfig })
            );
          }

          if (Array.isArray(json.courses)) {
            setLiveCourses(json.courses);
          }
        }
      } catch {
        // Fallback cleanly
      } finally {
        setIsStorefrontReady(true);
      }
    };

    if (!hasServerPayload) {
      loadCombinedStorefront(true);
    }

    let realtimeChannel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        realtimeChannel = supabase
          .channel(`landing-live-sync-${slug}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Tenant' }, () =>
            loadCombinedStorefront(false)
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'TenantSettings' },
            () => loadCombinedStorefront(false)
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'StudioCourse' }, () =>
            loadCombinedStorefront(false)
          )
          .on('postgres_changes', { event: '*', schema: 'public', table: 'LiveSession' }, () =>
            loadCombinedStorefront(false)
          )
          .subscribe();
      }
    } catch {
      // optional
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const offeringId = params.get('offering_id');
      const orderId = params.get('order_id');
      const savedUserRaw = localStorage.getItem('simplicion_student');
      const pendingStudioRaw = sessionStorage.getItem('simplicion_pending_studio_course');

      if (pendingStudioRaw && savedUserRaw) {
        try {
          const pending = JSON.parse(pendingStudioRaw) as {
            id: string;
            title: string;
            priceInr: number;
            tenantSlug?: string;
          };
          const parsedUser = JSON.parse(savedUserRaw) as One80AuthUser;
          if (!offeringId || offeringId === pending.id) {
            persistStudioCourseEnrollment(
              pending.id,
              pending.title,
              pending.priceInr,
              parsedUser,
              pending.tenantSlug || slug,
              orderId || `180_pay_${Date.now()}`
            );
            sessionStorage.removeItem('simplicion_pending_studio_course');
          }
        } catch {
          // ignore
        }
      }

      params.delete('payment');
      params.delete('order_id');
      params.delete('offering_id');
      const cleanSearch = params.toString();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${window.location.hash}`
      );
    }

    window.addEventListener('simplicion-auth-changed', syncState);
    return () => {
      window.removeEventListener('simplicion-auth-changed', syncState);
      if (realtimeChannel) {
        try {
          createSupabaseClient().removeChannel(realtimeChannel);
        } catch {
          // ignore
        }
      }
    };
  }, [forcedSlug, loadLiveCourses, loadStudentCourseEnrollments, persistStudioCourseEnrollment]);

  const authenticateWith180Identity = async (): Promise<One80AuthUser | null> => {
    const saved = localStorage.getItem('simplicion_student');
    if (saved) {
      try {
        return JSON.parse(saved) as One80AuthUser;
      } catch {
        // continue
      }
    }

    return new Promise((resolve) => {
      openOne80IdentityBottomSheet({
        onSuccess: async (res) => {
          let payload: One80AuthUser = {
            id: res.user?.id || res.user?.sub || `180_usr_${Date.now()}`,
            name: res.user?.name || res.user?.email?.split('@')[0] || 'Student',
            email: res.user?.email || '',
            phone: res.user?.phone || '',
            provider: '180_identity',
            token: res.token || res.accessToken,
          };

          if (res.code) {
            try {
              const callbackRes = await fetch(`${API_BASE_URL}/auth/180/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code: res.code,
                  redirectUri: `${window.location.origin}/`,
                }),
              });
              const data = await callbackRes.json();
              if (callbackRes.ok && data.success && data.user) {
                payload = {
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email || '',
                  phone: data.user.phone || '',
                  provider: '180_identity',
                  token: data.token,
                };
              }
            } catch {
              // ignore
            }
          }

          localStorage.setItem('simplicion_student', JSON.stringify(payload));
          if (payload.token) localStorage.setItem('180_identity_token', payload.token);
          setCurrentUser(payload);
          window.dispatchEvent(new Event('simplicion-auth-changed'));
          resolve(payload);
        },
        onCancel: () => resolve(null),
        onError: () => resolve(null),
      });
    });
  };

  const handleStudioCourseBuyOrEnroll = async (course: LiveStudioCourse) => {
    const user = await authenticateWith180Identity();
    if (!user) return;

    if (course.priceInr <= 0) {
      await persistStudioCourseEnrollment(
        course.id,
        course.title,
        0,
        user,
        course.tenantSlug || tenantSlug
      );
      return;
    }

    setSelectedStudioCourse(course);
    sessionStorage.setItem(
      'simplicion_pending_studio_course',
      JSON.stringify({
        id: course.id,
        title: course.title,
        priceInr: course.priceInr,
        tenantSlug: course.tenantSlug || tenantSlug,
      })
    );
    setIsPayOpen(true);
  };

  const handleJoinWaitlist = async (course: LiveStudioCourse) => {
    const user = await authenticateWith180Identity();
    if (!user) return;
    try {
      await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(course.id)}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: user.name,
          studentEmail: user.email || '',
          studentPhone: user.phone || user.id || '',
        }),
      });
    } catch {
      // non-fatal
    }
    setWaitlistedIds((prev) => Array.from(new Set([...prev, course.id])));
    setBannerMessage(
      `Added ${user.name} to the waitlist for "${course.title}". You will be notified if a seat opens.`
    );
    setBannerClassroomHref(null);
  };

  const handlePaymentSuccess = async (payload: One80PaymentSuccessPayload) => {
    setIsPayOpen(false);
    sessionStorage.removeItem('simplicion_pending_studio_course');

    if (selectedStudioCourse && currentUser) {
      await persistStudioCourseEnrollment(
        selectedStudioCourse.id,
        selectedStudioCourse.title,
        selectedStudioCourse.priceInr,
        currentUser,
        selectedStudioCourse.tenantSlug || tenantSlug,
        payload.paymentId
      );
      setSelectedStudioCourse(null);
    }
  };

  const scrollToCourses = () => {
    const liveEl = document.getElementById('live-courses');
    if (liveEl) liveEl.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isStorefrontReady) {
    return <StorefrontSkeleton />;
  }

  if (!portalLive) {
    return (
      <PortalUnavailableView
        academyName={academyProfile.academyName}
        logoUrl={academyProfile.logoUrl}
        message={portalOfflineMessage}
        supportEmail={academyProfile.supportEmail}
        supportPhone={academyProfile.supportPhone}
        whatsappNumber={academyProfile.whatsappNumber}
      />
    );
  }

  return (
    <div id="top" className="flex flex-col" style={buildBrandInlineVars(brandColor)}>
      {bannerMessage && (
        <div className="bg-[#10b981] text-white px-4 py-3 text-xs sm:text-sm font-semibold flex flex-wrap items-center justify-center gap-3 shadow-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{bannerMessage}</span>
          {bannerClassroomHref && (
            <Link
              href={bannerClassroomHref}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white text-[#047857] hover:bg-[#ecfdf5] text-xs font-bold transition-colors"
            >
              <span>Open Classroom</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setBannerMessage(null);
              setBannerClassroomHref(null);
            }}
            aria-label="Dismiss"
            className="p-1 hover:bg-emerald-700 rounded-full transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {academyProfile.bannerUrl && (
        <div className="w-full h-44 sm:h-56 overflow-hidden border-b border-[#e2e8f0] bg-[#f8fafc]">
          <img
            src={academyProfile.bannerUrl}
            alt={academyProfile.academyName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {siteContent.hero.visible && (
        <HeroSection
          badgeText={siteContent.hero.badgeText}
          title={siteContent.hero.headline}
          tagline={siteContent.hero.tagline}
          description={siteContent.hero.description}
          primaryCtaText={siteContent.hero.primaryCtaText}
          secondaryCtaText={siteContent.hero.secondaryCtaText}
          heroImageUrl={siteContent.hero.heroImageUrl}
          highlights={siteContent.hero.highlights}
          onExploreClick={scrollToCourses}
        />
      )}

      {siteContent.courses.visible && (
        <LiveCoursesSection
          badgeText={siteContent.courses.badgeText}
          heading={siteContent.courses.heading}
          subtitle={siteContent.courses.subtitle}
          courses={liveCourses}
          enrolledCourseIds={enrolledCourseIds}
          isLoggedIn={Boolean(currentUser)}
          studentId={currentUser?.id}
          tenantSlug={tenantSlug}
          waitlistedIds={waitlistedIds}
          onBuyOrEnroll={handleStudioCourseBuyOrEnroll}
          onJoinWaitlist={handleJoinWaitlist}
        />
      )}

      {siteContent.showcase.visible && (
        <ShowcaseSection
          badgeText={siteContent.showcase.badgeText}
          heading={siteContent.showcase.heading}
          description={siteContent.showcase.description}
          imageUrl={siteContent.showcase.imageUrl}
          bullets={siteContent.showcase.bullets}
        />
      )}

      {siteContent.whyUs.visible && (
        <WhyUsSection
          heading={siteContent.whyUs.heading}
          subtitle={siteContent.whyUs.subtitle}
          features={siteContent.whyUs.features}
        />
      )}

      {siteContent.faqs.visible && (
        <FaqSection
          badgeText={siteContent.faqs.badgeText}
          heading={siteContent.faqs.heading}
          subtitle={siteContent.faqs.subtitle}
          faqs={siteContent.faqs.items}
        />
      )}

      {selectedStudioCourse && (
        <One80PayModal
          isOpen={isPayOpen}
          onClose={() => setIsPayOpen(false)}
          offeringId={selectedStudioCourse.id}
          orderId={`180_ord_${selectedStudioCourse.id}_${Date.now()}`}
          amount={selectedStudioCourse.priceInr}
          offeringTitle={selectedStudioCourse.title}
          tenantName={academyProfile.academyName}
          primaryColor={brandColor}
          studentName={currentUser?.name || 'Student'}
          studentEmail={currentUser?.email || ''}
          studentPhone={currentUser?.phone || ''}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
