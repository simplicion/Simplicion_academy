import { getPrisma } from './supabase';

export const MAX_FEATURED_COURSES = 2;

export interface CoursePromotionMeta {
  isFeatured: boolean;
  featuredAt?: string | null;
  originalPriceInr?: number | null;
  discountPercent?: number;
  discountLabel?: string | null;
}

const memoryPromotions = new Map<string, Record<string, CoursePromotionMeta>>();

export function computeDiscountPercent(priceInr: number, originalPriceInr?: number | null): number {
  const mrp = Number(originalPriceInr || 0);
  const sale = Math.max(0, Number(priceInr || 0));
  if (mrp <= 0 || mrp <= sale) return 0;
  return Math.min(100, Math.round(((mrp - sale) / mrp) * 100));
}

async function findTenantWithSettings(tenantSlug: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const normalized = tenantSlug.toLowerCase();
  return (
    (await prisma.tenant.findUnique({
      where: { slug: normalized },
      include: { settings: true },
    })) ||
    (await prisma.tenant.findUnique({
      where: { slug: 'cuet-humanities' },
      include: { settings: true },
    }))
  );
}

export async function getCoursePromotionsMap(
  tenantSlug = 'cuet-humanities'
): Promise<Record<string, CoursePromotionMeta>> {
  const normalized = tenantSlug.toLowerCase();
  const prisma = getPrisma();
  if (prisma) {
    try {
      const tenant = await findTenantWithSettings(normalized);
      const modules = (tenant?.settings?.enabledModules as Record<string, any>) || {};
      if (modules.coursePromotions && typeof modules.coursePromotions === 'object') {
        return { ...(modules.coursePromotions as Record<string, CoursePromotionMeta>) };
      }
      return {};
    } catch {
      // fallback to memory
    }
  }
  return { ...(memoryPromotions.get(normalized) || {}) };
}

async function saveCoursePromotionsMap(
  tenantSlug: string,
  map: Record<string, CoursePromotionMeta>
): Promise<void> {
  const normalized = tenantSlug.toLowerCase();
  memoryPromotions.set(normalized, map);

  const prisma = getPrisma();
  if (prisma) {
    try {
      const tenant = await findTenantWithSettings(normalized);
      if (tenant?.settings) {
        const currentModules = (tenant.settings.enabledModules as Record<string, any>) || {};
        await prisma.tenantSettings.update({
          where: { tenantId: tenant.id },
          data: {
            enabledModules: {
              ...currentModules,
              coursePromotions: map as any,
            },
          },
        });
      }
    } catch (err: any) {
      console.warn('[CoursePromotions] Supabase persist warning:', err?.message);
    }
  }
}

export async function setCoursePromotion(
  tenantSlug: string,
  courseId: string,
  priceInr: number,
  updates: {
    isFeatured?: boolean;
    originalPriceInr?: number | null;
    discountLabel?: string | null;
  },
  validCourseIds?: string[]
): Promise<{
  ok: boolean;
  error?: string;
  featuredCount: number;
  maxFeatured: number;
  promotion: CoursePromotionMeta;
}> {
  const map = await getCoursePromotionsMap(tenantSlug);

  // Prune any stale/deleted course IDs if validCourseIds is provided
  if (Array.isArray(validCourseIds)) {
    const validSet = new Set(validCourseIds);
    for (const key of Object.keys(map)) {
      if (!validSet.has(key)) {
        delete map[key];
      }
    }
  }

  const existing: CoursePromotionMeta = map[courseId] || {
    isFeatured: false,
    originalPriceInr: null,
    discountPercent: 0,
    discountLabel: null,
  };

  // Enforce strict maximum of 2 featured courses per academy
  if (updates.isFeatured === true && !existing.isFeatured) {
    const currentFeaturedIds = Object.entries(map)
      .filter(([id, meta]) => id !== courseId && Boolean(meta?.isFeatured))
      .map(([id]) => id);

    if (currentFeaturedIds.length >= MAX_FEATURED_COURSES) {
      return {
        ok: false,
        error: `You can feature a maximum of ${MAX_FEATURED_COURSES} courses at a time. Unstar one featured course first.`,
        featuredCount: currentFeaturedIds.length,
        maxFeatured: MAX_FEATURED_COURSES,
        promotion: existing,
      };
    }
  }

  const nextOriginalPrice =
    updates.originalPriceInr !== undefined
      ? updates.originalPriceInr && Number(updates.originalPriceInr) > priceInr
        ? Math.round(Number(updates.originalPriceInr))
        : null
      : existing.originalPriceInr ?? null;

  const nextDiscountPercent = computeDiscountPercent(priceInr, nextOriginalPrice);
  const nextIsFeatured =
    typeof updates.isFeatured === 'boolean' ? updates.isFeatured : Boolean(existing.isFeatured);
  const nextDiscountLabel =
    updates.discountLabel !== undefined
      ? updates.discountLabel?.trim() || null
      : existing.discountLabel ?? null;

  const nextPromo: CoursePromotionMeta = {
    isFeatured: nextIsFeatured,
    featuredAt: nextIsFeatured ? existing.featuredAt || new Date().toISOString() : null,
    originalPriceInr: nextOriginalPrice,
    discountPercent: nextDiscountPercent,
    discountLabel: nextDiscountPercent > 0 ? nextDiscountLabel : null,
  };

  map[courseId] = nextPromo;
  await saveCoursePromotionsMap(tenantSlug, map);

  const featuredCount = Object.values(map).filter((m) => Boolean(m?.isFeatured)).length;
  return {
    ok: true,
    featuredCount,
    maxFeatured: MAX_FEATURED_COURSES,
    promotion: nextPromo,
  };
}

export async function removeCoursePromotion(tenantSlug: string, courseId: string): Promise<void> {
  const map = await getCoursePromotionsMap(tenantSlug);
  if (map[courseId]) {
    delete map[courseId];
    await saveCoursePromotionsMap(tenantSlug, map);
  }
}
