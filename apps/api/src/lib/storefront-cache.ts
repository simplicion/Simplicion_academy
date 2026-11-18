import { getPrisma } from './supabase';
import {
  MAX_FEATURED_COURSES,
  computeDiscountPercent,
  getCoursePromotionsMap,
} from './course-promotions';

const CACHE_TTL_MS = 30_000;
const STALE_TTL_MS = 10 * 60_000;

const DEFAULT_OFFLINE_MESSAGE =
  'This academy portal is temporarily unavailable while the educator updates courses and study material. Please check back soon!';

interface CachedEntry {
  expiresAt: number;
  staleUntil: number;
  payload: any;
}

const storefrontCache = new Map<string, CachedEntry>();
const storefrontInflight = new Map<string, Promise<any>>();

export function invalidateStorefrontCache(tenantSlug?: string): void {
  if (!tenantSlug) {
    storefrontCache.clear();
    return;
  }
  const normalized = tenantSlug.toLowerCase();
  storefrontCache.delete(normalized);
  // Also clear default alias if applicable
  if (normalized === 'cuet-humanities' || normalized === 'cuet') {
    storefrontCache.delete('cuet-humanities');
    storefrontCache.delete('cuet');
  }
  // Clear all entries when default tenant updates so alias slugs always stay fresh
  storefrontCache.clear();
}

async function computeStorefrontPayload(normalizedSlug: string): Promise<any> {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      success: true,
      source: 'memory',
      siteConfig: null,
      courses: [],
      featuredCount: 0,
      maxFeatured: MAX_FEATURED_COURSES,
    };
  }

  const dbTenant = await prisma.tenant.findUnique({
    where: { slug: normalizedSlug },
    include: { settings: true },
  });

  if (!dbTenant) {
    return {
      success: false,
      notFound: true,
      slug: normalizedSlug,
      source: 'supabase',
      siteConfig: null,
      courses: [],
      featuredCount: 0,
      maxFeatured: MAX_FEATURED_COURSES,
    };
  }

  const resolvedCourseSlug = dbTenant.slug;

  const [courses, promotions] = await Promise.all([
    prisma.studioCourse.findMany({
      where: {
        tenantSlug: resolvedCourseSlug,
        status: 'live',
        isSetupComplete: true,
      },
      include: {
        _count: {
          select: {
            subjects: true,
            enrollments: true,
            doubts: true,
          },
        },
        liveSessions: {
          where: { status: { in: ['live', 'scheduled'] } },
          orderBy: { scheduledAt: 'asc' },
          take: 3,
        },
        enrollments: {
          select: { amountPaid: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    getCoursePromotionsMap(resolvedCourseSlug),
  ]);

  const enabledModules = ((dbTenant?.settings?.enabledModules as Record<string, any>) || {});
  const portalLive = enabledModules.portalLive !== false;
  const portalOfflineMessage =
    typeof enabledModules.portalOfflineMessage === 'string' &&
    enabledModules.portalOfflineMessage.trim()
      ? enabledModules.portalOfflineMessage.trim()
      : DEFAULT_OFFLINE_MESSAGE;

  const siteConfig = {
    id: dbTenant.id,
    slug: dbTenant.slug,
    name: dbTenant.name,
    status: dbTenant.status,
    planId: dbTenant.planId,
    ownerUserId: dbTenant.ownerUserId,
    portalLive,
    portalOfflineMessage,
    settings: dbTenant.settings || {},
  };

  const formattedCourses = courses
    .map((c) => {
      const totalRevenue = c.enrollments.reduce((sum, e) => sum + Number(e.amountPaid || 0), 0);
      const activeLive = c.liveSessions.find((s) => s.status === 'live') || null;
      const promo = promotions[c.id];
      const originalPriceInr =
        promo?.originalPriceInr && promo.originalPriceInr > c.priceInr
          ? promo.originalPriceInr
          : null;
      const discountPercent = computeDiscountPercent(c.priceInr, originalPriceInr);
      return {
        id: c.id,
        tenantSlug: c.tenantSlug,
        slug: c.slug,
        title: c.title,
        description: c.description,
        priceInr: c.priceInr,
        originalPriceInr,
        discountPercent,
        discountLabel: discountPercent > 0 ? promo?.discountLabel || null : null,
        isFeatured: Boolean(promo?.isFeatured),
        maxStudents: c.maxStudents,
        bannerUrl: c.bannerUrl,
        isSetupComplete: c.isSetupComplete,
        status: c.status,
        launchedAt: c.launchedAt,
        createdAt: c.createdAt,
        enrolledCount: c._count.enrollments,
        subjectCount: c._count.subjects,
        doubtCount: c._count.doubts,
        totalRevenue,
        isLiveNow: Boolean(activeLive),
        activeLiveSession: activeLive,
        upcomingSessions: c.liveSessions,
      };
    })
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

  const payload = {
    success: true,
    source: 'supabase',
    siteConfig,
    courses: formattedCourses,
    featuredCount: formattedCourses.filter((c) => c.isFeatured).length,
    maxFeatured: MAX_FEATURED_COURSES,
  };

  const ts = Date.now();
  storefrontCache.set(normalizedSlug, {
    expiresAt: ts + CACHE_TTL_MS,
    staleUntil: ts + STALE_TTL_MS,
    payload,
  });

  return payload;
}

function getOrRunStorefrontQuery(normalizedSlug: string): Promise<any> {
  const existing = storefrontInflight.get(normalizedSlug);
  if (existing) return existing;
  const promise = computeStorefrontPayload(normalizedSlug).finally(() => {
    storefrontInflight.delete(normalizedSlug);
  });
  storefrontInflight.set(normalizedSlug, promise);
  return promise;
}

export async function getCachedStorefrontData(rawSlug = 'cuet-humanities'): Promise<{
  cacheStatus: 'HIT' | 'STALE' | 'MISS';
  payload: any;
}> {
  const normalizedSlug = rawSlug === 'cuet' ? 'cuet-humanities' : rawSlug.toLowerCase();
  const now = Date.now();
  const cached = storefrontCache.get(normalizedSlug);

  if (cached && cached.expiresAt > now) {
    return { cacheStatus: 'HIT', payload: cached.payload };
  }

  // Stale-While-Revalidate: return cached payload in < 1ms and refresh silently in background!
  if (cached && cached.staleUntil > now) {
    getOrRunStorefrontQuery(normalizedSlug).catch(() => {});
    return { cacheStatus: 'STALE', payload: cached.payload };
  }

  const payload = await getOrRunStorefrontQuery(normalizedSlug);
  return { cacheStatus: 'MISS', payload };
}
