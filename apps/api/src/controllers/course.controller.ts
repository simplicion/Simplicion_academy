import { Request, Response } from 'express';
import crypto from 'crypto';
import {
  getPrisma,
  getSupabaseClient,
  ensureLiveClassesSchema,
  SUPABASE_SECRET_KEY,
  SUPABASE_STORAGE_BUCKET,
} from '../lib/supabase';
import { NotificationService } from '../lib/notification-service';
import {
  TEACHER_SUBSCRIPTION_AMOUNT_INR,
  getTeacherSubscription,
} from '../lib/subscription';
import {
  MAX_FEATURED_COURSES,
  computeDiscountPercent,
  getCoursePromotionsMap,
  setCoursePromotion,
  removeCoursePromotion,
} from '../lib/course-promotions';
import { invalidateStorefrontCache } from '../lib/storefront-cache';

// In-memory slow-mode throttle map: `${courseId}:${senderId}` -> lastSentMs
const chatSlowModeTimestamps = new Map<string, number>();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `course-${Date.now()}`;
}

export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

export function normalizeYouTubeUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const id = extractYouTubeVideoId(url);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  return url.trim();
}

export function extractYouTubeEmbedUrl(url?: string | null): string | null {
  const id = extractYouTubeVideoId(url);
  if (id) return `https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0`;
  return url?.trim() || null;
}

export class CourseController {
  /**
   * GET /courses?tenant=<slug>&publishedOnly=true
   */
  static async listCourses(req: Request, res: Response) {
    try {
      const tenantSlug = ((req.query.tenant as string) || 'cuet-humanities').toLowerCase();
      const publishedOnly = req.query.publishedOnly === 'true';
      const prisma = getPrisma();

      if (!prisma) {
        return res.json({ success: true, source: 'memory', courses: [] });
      }

      const courses = await prisma.studioCourse.findMany({
        where: {
          tenantSlug,
          ...(publishedOnly ? { status: 'live', isSetupComplete: true } : {}),
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
      });

      const promotions = await getCoursePromotionsMap(tenantSlug);

      const formatted = courses
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

      const featuredCount = formatted.filter((c) => c.isFeatured).length;

      return res.json({
        success: true,
        source: 'supabase',
        featuredCount,
        maxFeatured: MAX_FEATURED_COURSES,
        courses: formatted,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /courses
   * Step 1: Instant course creation — only Course Name required!
   */
  static async createCourse(req: Request, res: Response) {
    try {
      const tenantSlug = ((req.body.tenantSlug as string) || 'cuet-humanities').toLowerCase();
      const { title, description } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Course name is required.' });
      }

      const prisma = getPrisma();
      if (!prisma) {
        return res.status(503).json({ success: false, error: 'Database unavailable.' });
      }

      const baseSlug = slugify(title);
      const uniqueSlug = `${baseSlug}-${crypto.randomBytes(2).toString('hex')}`;

      const course = await prisma.studioCourse.create({
        data: {
          tenantSlug,
          slug: uniqueSlug,
          title: title.trim(),
          description: description?.trim() || null,
          isSetupComplete: false,
          status: 'draft',
        },
      });

      return res.status(201).json({
        success: true,
        persistedTo: 'supabase',
        course,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /courses/:id/setup
   * Step 2 Setup Pop-up inside Course Dashboard: Price, Max Students, Banner Image -> Publish Live
   */
  static async completeCourseSetup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        priceInr,
        originalPriceInr,
        discountLabel,
        isFeatured,
        maxStudents,
        bannerUrl,
        bannerDataUrl,
        description,
        title,
      } = req.body;
      const incomingBanner = bannerUrl !== undefined ? bannerUrl : bannerDataUrl;

      const prisma = getPrisma();
      if (!prisma) {
        return res.status(503).json({ success: false, error: 'Database unavailable.' });
      }

      const existing = await prisma.studioCourse.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Course not found.' });
      }

      const parsedPrice = Math.max(0, Number(priceInr ?? existing.priceInr) || 0);
      const parsedMax =
        maxStudents === null || maxStudents === '' || maxStudents === undefined
          ? null
          : Math.max(1, Number(maxStudents));

      let resolvedBannerUrl = incomingBanner !== undefined ? incomingBanner : existing.bannerUrl;

      // Upload base64 banner directly to Supabase Storage CDN with immutable cache key (Suggestion #9)
      if (
        typeof incomingBanner === 'string' &&
        incomingBanner.startsWith('data:image/')
      ) {
        try {
          const matches = incomingBanner.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
          if (matches) {
            const contentType = matches[1];
            const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'webp';
            const buffer = Buffer.from(matches[2], 'base64');
            const pathKey = `tenants/${existing.tenantSlug}/courses/${id}/banner_${Date.now()}.${ext}`;
            const supabase = getSupabaseClient();
            const { error: uploadErr } = await supabase.storage
              .from(SUPABASE_STORAGE_BUCKET)
              .upload(pathKey, buffer, { contentType, cacheControl: '31536000', upsert: true });

            if (!uploadErr) {
              const { data: pub } = supabase.storage
                .from(SUPABASE_STORAGE_BUCKET)
                .getPublicUrl(pathKey);
              if (pub?.publicUrl) resolvedBannerUrl = pub.publicUrl;
            }
          }
        } catch {
          // Keep compressed data URL fallback seamlessly if Storage is unreachable
        }
      }

      // Persist course discount (MRP / % off / label) & optional Featured highlight (max 2)
      const allTenantCourses = await prisma.studioCourse.findMany({
        where: { tenantSlug: existing.tenantSlug },
        select: { id: true },
      });
      const promoResult = await setCoursePromotion(
        existing.tenantSlug,
        id,
        parsedPrice,
        {
          ...(originalPriceInr !== undefined
            ? {
                originalPriceInr:
                  originalPriceInr === null || originalPriceInr === ''
                    ? null
                    : Number(originalPriceInr),
              }
            : {}),
          ...(discountLabel !== undefined ? { discountLabel } : {}),
          ...(typeof isFeatured === 'boolean' ? { isFeatured } : {}),
        },
        allTenantCourses.map((c) => c.id)
      );
      if (!promoResult.ok) {
        return res.status(400).json({
          success: false,
          maxFeaturedReached: true,
          maxFeatured: promoResult.maxFeatured,
          error: promoResult.error,
        });
      }

      // Check if teacher has an active ₹250/month Educator Subscription before making course live
      const subscription = await getTeacherSubscription(existing.tenantSlug);
      const canGoLive = subscription.isActive && req.body.publish !== false;

      const updated = await prisma.studioCourse.update({
        where: { id },
        data: {
          ...(title && title.trim() ? { title: title.trim() } : {}),
          ...(description !== undefined ? { description: description?.trim() || null } : {}),
          priceInr: parsedPrice,
          maxStudents: parsedMax,
          bannerUrl: resolvedBannerUrl,
          isSetupComplete: true,
          status: canGoLive ? 'live' : existing.status === 'live' && subscription.isActive ? 'live' : 'draft',
          launchedAt: canGoLive ? existing.launchedAt || new Date() : existing.launchedAt,
        },
      });

      invalidateStorefrontCache(existing.tenantSlug);

      return res.json({
        success: true,
        persistedTo: 'supabase',
        requiresSubscription: !subscription.isActive,
        planAmountInr: TEACHER_SUBSCRIPTION_AMOUNT_INR,
        course: {
          ...updated,
          isFeatured: promoResult.promotion.isFeatured,
          originalPriceInr: promoResult.promotion.originalPriceInr ?? null,
          discountPercent: promoResult.promotion.discountPercent ?? 0,
          discountLabel: promoResult.promotion.discountLabel ?? null,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /courses/:id/publish
   * Strict backend gate: Teacher MUST have an active ₹250/month subscription to publish a course live!
   */
  static async publishCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.studioCourse.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ success: false, error: 'Course not found.' });

      const subscription = await getTeacherSubscription(existing.tenantSlug);
      if (!subscription.isActive) {
        return res.status(402).json({
          success: false,
          requiresSubscription: true,
          planAmountInr: TEACHER_SUBSCRIPTION_AMOUNT_INR,
          subscription,
          error: `An active Educator Subscription (₹${TEACHER_SUBSCRIPTION_AMOUNT_INR}/month) is required to publish courses live for students. Please upgrade your subscription first.`,
        });
      }

      const updated = await prisma.studioCourse.update({
        where: { id },
        data: {
          status: 'live',
          isSetupComplete: true,
          launchedAt: existing.launchedAt || new Date(),
        },
      });

      invalidateStorefrontCache(existing.tenantSlug);

      return res.json({
        success: true,
        message: `"${updated.title}" is now published live on your Student Portal!`,
        course: updated,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /courses/:id/unpublish
   * Moves a live course back to draft (hidden from Student Landing Page)
   */
  static async unpublishCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const updated = await prisma.studioCourse.update({
        where: { id },
        data: { status: 'draft' },
      });

      invalidateStorefrontCache(updated.tenantSlug);

      return res.json({
        success: true,
        message: `"${updated.title}" moved to Draft.`,
        course: updated,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /courses/:id/featured
   * Star / unstar a course for the Featured Highlights section (strictly max 2 per academy)
   */
  static async toggleFeaturedCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.studioCourse.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ success: false, error: 'Course not found.' });

      const currentMap = await getCoursePromotionsMap(existing.tenantSlug);
      const currentlyFeatured = Boolean(currentMap[id]?.isFeatured);
      const desiredFeatured =
        typeof req.body?.isFeatured === 'boolean' ? req.body.isFeatured : !currentlyFeatured;

      const allTenantCourses = await prisma.studioCourse.findMany({
        where: { tenantSlug: existing.tenantSlug },
        select: { id: true },
      });

      const result = await setCoursePromotion(
        existing.tenantSlug,
        id,
        existing.priceInr,
        { isFeatured: desiredFeatured },
        allTenantCourses.map((c) => c.id)
      );

      if (!result.ok) {
        return res.status(400).json({
          success: false,
          maxFeaturedReached: true,
          featuredCount: result.featuredCount,
          maxFeatured: result.maxFeatured,
          error: result.error,
        });
      }

      invalidateStorefrontCache(existing.tenantSlug);

      return res.json({
        success: true,
        courseId: id,
        isFeatured: result.promotion.isFeatured,
        featuredCount: result.featuredCount,
        maxFeatured: result.maxFeatured,
        promotion: result.promotion,
        message: result.promotion.isFeatured
          ? `"${existing.title}" starred in Featured Highlights (${result.featuredCount}/${result.maxFeatured}).`
          : `"${existing.title}" removed from Featured Highlights.`,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /courses/:id
   * Returns Course details + full Course Dashboard analytics metrics
   */
  static async getCourseDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prisma = getPrisma();
      if (!prisma) {
        return res.status(503).json({ success: false, error: 'Database unavailable.' });
      }

      const course = await prisma.studioCourse.findUnique({
        where: { id },
        include: {
          subjects: {
            include: {
              lessons: {
                include: {
                  topics: true,
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
          enrollments: {
            orderBy: { enrolledAt: 'desc' },
          },
          liveSessions: {
            orderBy: { scheduledAt: 'desc' },
          },
          doubts: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!course) {
        return res.status(404).json({ success: false, error: 'Course not found.' });
      }

      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const currentMonthEnrollments = course.enrollments.filter(
        (e) => now - new Date(e.enrolledAt).getTime() <= thirtyDaysMs
      );
      const prevMonthEnrollments = course.enrollments.filter((e) => {
        const diff = now - new Date(e.enrolledAt).getTime();
        return diff > thirtyDaysMs && diff <= thirtyDaysMs * 2;
      });

      const currentCount = currentMonthEnrollments.length;
      const prevCount = prevMonthEnrollments.length;
      const growthRatePercent =
        prevCount > 0
          ? Math.round(((currentCount - prevCount) / prevCount) * 100)
          : currentCount > 0
            ? 100
            : 0;

      const grossRevenue = course.enrollments.reduce((sum, e) => sum + Number(e.amountPaid || 0), 0);
      const netTeacherRevenue = Math.round(grossRevenue * 0.95);

      const totalSubjects = course.subjects.length;
      const totalLessons = course.subjects.reduce((sum, s) => sum + s.lessons.length, 0);
      const totalTopics = course.subjects.reduce(
        (sum, s) => sum + s.lessons.reduce((ls, l) => ls + l.topics.length, 0),
        0
      );

      const openDoubtsCount = course.doubts.filter((d) => d.status === 'open').length;

      // Average course completion rate across enrolled students (Suggestion #5)
      let avgCompletionPercent = 0;
      if (totalTopics > 0 && course.enrollments.length > 0) {
        const completions = await prisma.topicCompletion.count({ where: { courseId: id } });
        avgCompletionPercent = Math.min(
          100,
          Math.round((completions / (totalTopics * course.enrollments.length)) * 100)
        );
      }

      const promotions = await getCoursePromotionsMap(course.tenantSlug);
      const promo = promotions[course.id];
      const originalPriceInr =
        promo?.originalPriceInr && promo.originalPriceInr > course.priceInr
          ? promo.originalPriceInr
          : null;
      const discountPercent = computeDiscountPercent(course.priceInr, originalPriceInr);

      return res.json({
        success: true,
        course: {
          id: course.id,
          tenantSlug: course.tenantSlug,
          slug: course.slug,
          title: course.title,
          description: course.description,
          priceInr: course.priceInr,
          originalPriceInr,
          discountPercent,
          discountLabel: discountPercent > 0 ? promo?.discountLabel || null : null,
          isFeatured: Boolean(promo?.isFeatured),
          maxStudents: course.maxStudents,
          bannerUrl: course.bannerUrl,
          isSetupComplete: course.isSetupComplete,
          status: course.status,
          launchedAt: course.launchedAt,
          chatMuted: course.chatMuted,
          chatSlowMode: course.chatSlowMode,
          createdAt: course.createdAt,
        },
        metrics: {
          enrolledStudents: course.enrollments.length,
          maxStudents: course.maxStudents,
          grossRevenue,
          netTeacherRevenue,
          launchedAt: course.launchedAt,
          growthRatePercent,
          currentMonthEnrollments: currentCount,
          prevMonthEnrollments: prevCount,
          totalSubjects,
          totalLessons,
          totalTopics,
          openDoubtsCount,
          totalDoubtsCount: course.doubts.length,
          avgCompletionPercent,
        },
        liveSessions: course.liveSessions,
        recentEnrollments: course.enrollments.slice(0, 10),
        recentDoubts: course.doubts.slice(0, 5),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /courses/:id
   */
  static async deleteCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.studioCourse.findUnique({ where: { id } });
      await prisma.studioCourse.delete({ where: { id } });
      if (existing) {
        await removeCoursePromotion(existing.tenantSlug, id);
        invalidateStorefrontCache(existing.tenantSlug);
      }
      return res.json({ success: true, deletedId: id });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Subjects -> Lessons -> Topics Content Tree
  // ---------------------------------------------------------------------------

  static async getCurriculum(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const subjects = await prisma.courseSubject.findMany({
        where: { courseId: id },
        include: {
          lessons: {
            include: {
              topics: { orderBy: { order: 'asc' } },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });

      return res.json({ success: true, subjects });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createSubject(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const { title, description } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ success: false, error: 'Subject name is required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const course = await prisma.studioCourse.findUnique({ where: { id: courseId } });
      if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

      const count = await prisma.courseSubject.count({ where: { courseId } });
      const subject = await prisma.courseSubject.create({
        data: {
          courseId,
          tenantSlug: course.tenantSlug,
          title: title.trim(),
          description: description?.trim() || null,
          order: count,
        },
        include: { lessons: { include: { topics: true } } },
      });

      return res.status(201).json({ success: true, subject });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateSubject(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;
      const { title, description } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ success: false, error: 'Subject name is required.' });
      }
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const updated = await prisma.courseSubject.update({
        where: { id: subjectId },
        data: {
          title: title.trim(),
          ...(description !== undefined ? { description: description?.trim() || null } : {}),
        },
        include: { lessons: { include: { topics: true } } },
      });
      return res.json({ success: true, subject: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteSubject(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await prisma.courseSubject.delete({ where: { id: subjectId } });
      return res.json({ success: true, deletedId: subjectId });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async reorderSubjects(req: Request, res: Response) {
    try {
      const { subjectIds } = req.body;
      if (!Array.isArray(subjectIds)) {
        return res.status(400).json({ success: false, error: 'subjectIds array is required.' });
      }
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await prisma.$transaction(
        subjectIds.map((id: string, idx: number) =>
          prisma.courseSubject.update({ where: { id }, data: { order: idx } })
        )
      );
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async createLesson(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;
      const { title } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ success: false, error: 'Lesson name is required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const subject = await prisma.courseSubject.findUnique({ where: { id: subjectId } });
      if (!subject) return res.status(404).json({ success: false, error: 'Subject not found.' });

      const count = await prisma.courseLesson.count({ where: { subjectId } });
      const lesson = await prisma.courseLesson.create({
        data: {
          subjectId,
          courseId: subject.courseId,
          tenantSlug: subject.tenantSlug,
          title: title.trim(),
          order: count,
        },
        include: { topics: true },
      });

      return res.status(201).json({ success: true, lesson });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /lessons/:lessonId/duplicate
   * Clones a lesson AND all its topics (including text notes, YouTube URLs & named doc links)
   */
  static async duplicateLesson(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const original = await prisma.courseLesson.findUnique({
        where: { id: lessonId },
        include: { topics: { orderBy: { order: 'asc' } } },
      });
      if (!original) return res.status(404).json({ success: false, error: 'Lesson not found.' });

      const count = await prisma.courseLesson.count({ where: { subjectId: original.subjectId } });
      const cloned = await prisma.courseLesson.create({
        data: {
          subjectId: original.subjectId,
          courseId: original.courseId,
          tenantSlug: original.tenantSlug,
          title: `${original.title} (Copy)`,
          order: count,
          topics: {
            create: original.topics.map((t, idx) => ({
              courseId: original.courseId,
              tenantSlug: original.tenantSlug,
              title: t.title,
              textContent: t.textContent,
              youtubeUrl: t.youtubeUrl,
              docLinks: t.docLinks ?? [],
              order: idx,
            })),
          },
        },
        include: { topics: { orderBy: { order: 'asc' } } },
      });

      return res.status(201).json({ success: true, lesson: cloned });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateLesson(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      const { title } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ success: false, error: 'Lesson name is required.' });
      }
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const lesson = await prisma.courseLesson.update({
        where: { id: lessonId },
        data: { title: title.trim() },
        include: { topics: { orderBy: { order: 'asc' } } },
      });
      return res.json({ success: true, lesson });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async reorderLessons(req: Request, res: Response) {
    try {
      const { lessonIds } = req.body;
      if (!Array.isArray(lessonIds)) {
        return res.status(400).json({ success: false, error: 'lessonIds array is required.' });
      }
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await prisma.$transaction(
        lessonIds.map((id: string, idx: number) =>
          prisma.courseLesson.update({ where: { id }, data: { order: idx } })
        )
      );
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteLesson(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await prisma.courseLesson.delete({ where: { id: lessonId } });
      return res.json({ success: true, deletedId: lessonId });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async createTopic(req: Request, res: Response) {
    try {
      const { lessonId } = req.params;
      const { title, textContent, youtubeUrl, docLinks } = req.body;
      if (!title?.trim()) {
        return res.status(400).json({ success: false, error: 'Topic title is required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId } });
      if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found.' });

      const count = await prisma.courseTopic.count({ where: { lessonId } });
      const topic = await prisma.courseTopic.create({
        data: {
          lessonId,
          courseId: lesson.courseId,
          tenantSlug: lesson.tenantSlug,
          title: title.trim(),
          textContent: textContent || null,
          youtubeUrl: normalizeYouTubeUrl(youtubeUrl),
          docLinks: Array.isArray(docLinks) ? docLinks : [],
          order: count,
        },
      });

      return res.status(201).json({ success: true, topic });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateTopic(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const { title, textContent, youtubeUrl, docLinks } = req.body;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const topic = await prisma.courseTopic.update({
        where: { id: topicId },
        data: {
          ...(title && title.trim() ? { title: title.trim() } : {}),
          ...(textContent !== undefined ? { textContent: textContent || null } : {}),
          ...(youtubeUrl !== undefined ? { youtubeUrl: normalizeYouTubeUrl(youtubeUrl) } : {}),
          ...(Array.isArray(docLinks) ? { docLinks } : {}),
        },
      });

      return res.json({ success: true, topic });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async duplicateTopic(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const original = await prisma.courseTopic.findUnique({ where: { id: topicId } });
      if (!original) return res.status(404).json({ success: false, error: 'Topic not found.' });

      const count = await prisma.courseTopic.count({ where: { lessonId: original.lessonId } });
      const cloned = await prisma.courseTopic.create({
        data: {
          lessonId: original.lessonId,
          courseId: original.courseId,
          tenantSlug: original.tenantSlug,
          title: `${original.title} (Copy)`,
          textContent: original.textContent,
          youtubeUrl: original.youtubeUrl,
          docLinks: original.docLinks ?? [],
          order: count,
        },
      });
      return res.status(201).json({ success: true, topic: cloned });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async reorderTopics(req: Request, res: Response) {
    try {
      const { topicIds } = req.body;
      if (!Array.isArray(topicIds)) {
        return res.status(400).json({ success: false, error: 'topicIds array is required.' });
      }
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await prisma.$transaction(
        topicIds.map((id: string, idx: number) =>
          prisma.courseTopic.update({ where: { id }, data: { order: idx } })
        )
      );
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteTopic(req: Request, res: Response) {
    try {
      const { topicId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await prisma.courseTopic.delete({ where: { id: topicId } });
      return res.json({ success: true, deletedId: topicId });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Go Live / Schedule YouTube Live Sessions + Auto-Archive
  // ---------------------------------------------------------------------------

  static async createLiveSession(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const {
        title,
        youtubeLiveUrl,
        subjectId,
        subjectTitle,
        lessonId,
        lessonTitle,
        topicId,
        topicTitle,
        attachedDocs = [],
        mode = 'now', // 'now' | 'schedule'
        scheduledAt,
        enableChat,
        chatSlowMode,
      } = req.body;

      if (!youtubeLiveUrl?.trim()) {
        return res.status(400).json({ success: false, error: 'YouTube Live link is required.' });
      }
      const videoId = extractYouTubeVideoId(youtubeLiveUrl);
      if (!videoId) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid YouTube video or live stream URL (youtube.com/watch, youtu.be, or youtube.com/live).',
        });
      }
      const normalizedLiveUrl = `https://www.youtube.com/watch?v=${videoId}`;

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await ensureLiveClassesSchema(prisma);

      const course = await prisma.studioCourse.findUnique({
        where: { id: courseId },
        include: { enrollments: true },
      });
      if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

      // Resolve curriculum titles from Supabase if IDs were provided
      let resolvedSubjectTitle: string | null = subjectTitle?.trim() || null;
      let resolvedLessonTitle: string | null = lessonTitle?.trim() || null;
      let resolvedTopicTitle: string | null = topicTitle?.trim() || null;

      if (subjectId && !resolvedSubjectTitle) {
        const sub = await prisma.courseSubject.findUnique({ where: { id: subjectId }, select: { title: true } });
        resolvedSubjectTitle = sub?.title || null;
      }
      if (lessonId && !resolvedLessonTitle) {
        const les = await prisma.courseLesson.findUnique({ where: { id: lessonId }, select: { title: true } });
        resolvedLessonTitle = les?.title || null;
      }
      if (topicId && !resolvedTopicTitle) {
        const top = await prisma.courseTopic.findUnique({ where: { id: topicId }, select: { title: true } });
        resolvedTopicTitle = top?.title || null;
      }

      const isNow = mode === 'now';
      const scheduleDate = isNow
        ? new Date()
        : scheduledAt
          ? new Date(scheduledAt)
          : new Date();

      const defaultTitle = resolvedTopicTitle
        ? `Live: ${resolvedTopicTitle}`
        : resolvedLessonTitle
          ? `Live: ${resolvedLessonTitle}`
          : resolvedSubjectTitle
            ? `Live: ${resolvedSubjectTitle}`
            : `Live Class — ${course.title}`;

      const session = await prisma.liveSession.create({
        data: {
          courseId,
          tenantSlug: course.tenantSlug,
          subjectId: subjectId || null,
          lessonId: lessonId || null,
          lessonTitle: resolvedLessonTitle,
          title: title?.trim() || defaultTitle,
          youtubeLiveUrl: normalizedLiveUrl,
          attachedDocs: Array.isArray(attachedDocs) ? attachedDocs : [],
          scheduledAt: scheduleDate,
          status: isNow ? 'live' : 'scheduled',
          startedAt: isNow ? new Date() : null,
        },
      });

      // Persist subjectTitle, topicId & topicTitle onto LiveSession row
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "LiveSession" SET "subjectTitle" = $1, "topicId" = $2, "topicTitle" = $3 WHERE "id" = $4`,
          resolvedSubjectTitle,
          topicId || null,
          resolvedTopicTitle,
          session.id
        );
      } catch (metaErr: any) {
        console.warn('[LiveSession] metadata update warning:', metaErr?.message);
      }

      // Apply teacher's Student Live Chat ON/OFF preference set in the Go Live drawer
      if (typeof enableChat === 'boolean' || typeof chatSlowMode === 'boolean') {
        await prisma.studioCourse.update({
          where: { id: courseId },
          data: {
            ...(typeof enableChat === 'boolean' ? { chatMuted: !enableChat } : {}),
            ...(typeof chatSlowMode === 'boolean' ? { chatSlowMode } : {}),
          },
        });
      }

      // Notify all enrolled students via NotificationService (Supabase + optional Webhook)
      if (course.enrollments.length > 0) {
        await NotificationService.notifyMany(
          course.enrollments.map((enr) => ({
            tenantSlug: course.tenantSlug,
            studentId: enr.studentId,
            courseId,
            type: 'live_started',
            title: isNow ? `LIVE NOW: ${session.title}` : `Scheduled Live: ${session.title}`,
            body: isNow
              ? `Your instructor just went live in ${course.title}. Join the live class now.`
              : `Live session scheduled for ${scheduleDate.toLocaleString('en-IN')}.`,
            linkUrl: `/s/${course.tenantSlug}/${enr.studentId}/course/${courseId}`,
          }))
        );
      }

      invalidateStorefrontCache(course.tenantSlug);

      return res.status(201).json({
        success: true,
        session: {
          ...session,
          subjectTitle: resolvedSubjectTitle,
          topicId: topicId || null,
          topicTitle: resolvedTopicTitle,
          joinedCount: 0,
          attendees: [],
        },
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /academy/live-sessions?tenant=<slug>&courseId=<optional>&status=<optional>
   * Returns ALL live classes (live, scheduled, completed) with full course/subject/chapter/topic
   * details, dates, durations, attached docs, and real per-student attendance from Supabase.
   */
  static async listAcademyLiveSessions(req: Request, res: Response) {
    try {
      const tenantSlug = ((req.query.tenant as string) || 'cuet-humanities').toLowerCase();
      const courseIdFilter = (req.query.courseId as string) || '';
      const statusFilter = (req.query.status as string) || '';

      const prisma = getPrisma();
      if (!prisma) {
        return res.json({
          success: true,
          sessions: [],
          courses: [],
          summary: {
            totalSessions: 0,
            liveNowCount: 0,
            scheduledCount: 0,
            endedCount: 0,
            totalStudentJoins: 0,
            uniqueStudentsJoined: 0,
          },
        });
      }

      await ensureLiveClassesSchema(prisma);

      // Run all 4 Supabase queries in parallel (cuts cold query latency by ~4x)
      const [coursesRaw, sessionRows, metaRows, attendanceRows] = await Promise.all([
        prisma.studioCourse.findMany({
          where: {
            tenantSlug,
            ...(courseIdFilter ? { id: courseIdFilter } : {}),
          },
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { enrollments: true } },
            subjects: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                  include: {
                    topics: {
                      orderBy: { order: 'asc' },
                      select: { id: true, title: true, order: true },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.liveSession.findMany({
          where: {
            tenantSlug,
            ...(courseIdFilter ? { courseId: courseIdFilter } : {}),
            ...(statusFilter && ['live', 'scheduled', 'ended'].includes(statusFilter)
              ? { status: statusFilter }
              : {}),
          },
          orderBy: [{ scheduledAt: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.$queryRawUnsafe(
          `SELECT "id", "subjectTitle", "topicId", "topicTitle" FROM "LiveSession" WHERE "tenantSlug" = $1`,
          tenantSlug
        ) as Promise<
          Array<{
            id: string;
            subjectTitle: string | null;
            topicId: string | null;
            topicTitle: string | null;
          }>
        >,
        prisma.$queryRawUnsafe(
          `SELECT "id", "sessionId", "courseId", "studentId", "studentName", "studentEmail", "joinedAt", "lastSeenAt"
           FROM "LiveSessionAttendance"
           WHERE "tenantSlug" = $1
           ORDER BY "joinedAt" DESC`,
          tenantSlug
        ) as Promise<
          Array<{
            id: string;
            sessionId: string;
            courseId: string;
            studentId: string;
            studentName: string;
            studentEmail: string | null;
            joinedAt: Date;
            lastSeenAt: Date;
          }>
        >,
      ]);

      const courseMap = new Map<string, any>();
      const subjectMap = new Map<string, string>();
      const lessonMap = new Map<string, string>();
      const topicMap = new Map<string, string>();

      const courses = coursesRaw.map((c) => {
        courseMap.set(c.id, c);
        c.subjects.forEach((s) => {
          subjectMap.set(s.id, s.title);
          s.lessons.forEach((l) => {
            lessonMap.set(l.id, l.title);
            l.topics.forEach((t) => {
              topicMap.set(t.id, t.title);
            });
          });
        });
        return {
          id: c.id,
          title: c.title,
          slug: c.slug,
          status: c.status,
          bannerUrl: c.bannerUrl,
          chatMuted: c.chatMuted,
          chatSlowMode: c.chatSlowMode,
          enrolledCount: c._count.enrollments,
          subjects: c.subjects.map((s) => ({
            id: s.id,
            title: s.title,
            lessons: s.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              topics: l.topics.map((t) => ({
                id: t.id,
                title: t.title,
              })),
            })),
          })),
        };
      });

      const metaMap = new Map(metaRows.map((m) => [m.id, m]));

      const attendanceBySession = new Map<string, typeof attendanceRows>();
      const uniqueStudentIds = new Set<string>();
      for (const row of attendanceRows) {
        if (courseIdFilter && row.courseId !== courseIdFilter) continue;
        const list = attendanceBySession.get(row.sessionId) || [];
        list.push(row);
        attendanceBySession.set(row.sessionId, list);
        uniqueStudentIds.add(row.studentId);
      }

      const statusOrder: Record<string, number> = { live: 0, scheduled: 1, ended: 2 };

      const sessions = sessionRows
        .map((s) => {
          const course = courseMap.get(s.courseId);
          const meta = metaMap.get(s.id);
          const attendees = (attendanceBySession.get(s.id) || []).map((a) => ({
            id: a.id,
            studentId: a.studentId,
            studentName: a.studentName,
            studentEmail: a.studentEmail,
            joinedAt: a.joinedAt,
            lastSeenAt: a.lastSeenAt,
          }));

          const resolvedSubjectTitle =
            meta?.subjectTitle || (s.subjectId ? subjectMap.get(s.subjectId) || null : null);
          const resolvedLessonTitle =
            s.lessonTitle || (s.lessonId ? lessonMap.get(s.lessonId) || null : null);
          const resolvedTopicId = meta?.topicId || null;
          const resolvedTopicTitle =
            meta?.topicTitle || (resolvedTopicId ? topicMap.get(resolvedTopicId) || null : null);

          let durationMinutes: number | null = null;
          if (s.startedAt) {
            const endTime = s.endedAt ? new Date(s.endedAt).getTime() : s.status === 'live' ? Date.now() : null;
            if (endTime) {
              durationMinutes = Math.max(1, Math.round((endTime - new Date(s.startedAt).getTime()) / 60000));
            }
          }

          return {
            id: s.id,
            courseId: s.courseId,
            courseTitle: course?.title || 'Course',
            courseStatus: course?.status || 'draft',
            courseBannerUrl: course?.bannerUrl || null,
            enrolledCount: course?._count?.enrollments || 0,
            chatMuted: Boolean(course?.chatMuted),
            chatSlowMode: Boolean(course?.chatSlowMode),
            subjectId: s.subjectId,
            subjectTitle: resolvedSubjectTitle,
            lessonId: s.lessonId,
            lessonTitle: resolvedLessonTitle,
            topicId: resolvedTopicId,
            topicTitle: resolvedTopicTitle,
            title: s.title,
            youtubeLiveUrl: s.youtubeLiveUrl,
            attachedDocs: Array.isArray(s.attachedDocs) ? s.attachedDocs : [],
            scheduledAt: s.scheduledAt,
            startedAt: s.startedAt,
            endedAt: s.endedAt,
            createdAt: s.createdAt,
            status: s.status,
            durationMinutes,
            joinedCount: attendees.length,
            attendees,
          };
        })
        .sort((a, b) => {
          const oa = statusOrder[a.status] ?? 3;
          const ob = statusOrder[b.status] ?? 3;
          if (oa !== ob) return oa - ob;
          return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
        });

      const summary = {
        totalSessions: sessions.length,
        liveNowCount: sessions.filter((s) => s.status === 'live').length,
        scheduledCount: sessions.filter((s) => s.status === 'scheduled').length,
        endedCount: sessions.filter((s) => s.status === 'ended').length,
        totalStudentJoins: sessions.reduce((sum, s) => sum + s.joinedCount, 0),
        uniqueStudentsJoined: uniqueStudentIds.size,
      };

      return res.json({
        success: true,
        sessions,
        courses,
        summary,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /live-sessions/:sessionId/join
   * Records real student attendance in Supabase PostgreSQL when a student opens/watches a live class.
   */
  static async recordLiveSessionJoin(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { studentId, studentName, studentEmail } = req.body;

      if (!studentId) {
        return res.status(400).json({ success: false, error: 'studentId is required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      await ensureLiveClassesSchema(prisma);

      const session = await prisma.liveSession.findUnique({ where: { id: sessionId } });
      if (!session) return res.status(404).json({ success: false, error: 'Live session not found.' });

      const attendanceId = `att_${crypto.randomUUID()}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "LiveSessionAttendance"
          ("id", "sessionId", "courseId", "tenantSlug", "studentId", "studentName", "studentEmail", "joinedAt", "lastSeenAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT ("sessionId", "studentId")
         DO UPDATE SET
           "studentName" = EXCLUDED."studentName",
           "studentEmail" = COALESCE(EXCLUDED."studentEmail", "LiveSessionAttendance"."studentEmail"),
           "lastSeenAt" = CURRENT_TIMESTAMP`,
        attendanceId,
        session.id,
        session.courseId,
        session.tenantSlug,
        String(studentId),
        String(studentName || 'Student'),
        studentEmail ? String(studentEmail) : null
      );

      const countRows = (await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS count FROM "LiveSessionAttendance" WHERE "sessionId" = $1`,
        session.id
      )) as Array<{ count: number }>;

      return res.json({
        success: true,
        sessionId: session.id,
        joinedCount: countRows[0]?.count ?? 1,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /live-sessions/:sessionId
   * Deletes a scheduled or past live session (cascading attendance records).
   */
  static async deleteLiveSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.liveSession.findUnique({ where: { id: sessionId } });
      if (!existing) return res.status(404).json({ success: false, error: 'Live session not found.' });

      await prisma.liveSession.delete({ where: { id: sessionId } });
      invalidateStorefrontCache(existing.tenantSlug);

      return res.json({ success: true, deletedId: sessionId });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateLiveSessionStatus(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { status, archiveToLessonId } = req.body; // 'live' | 'ended'
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.liveSession.findUnique({
        where: { id: sessionId },
        include: { course: { include: { enrollments: true } } },
      });
      if (!existing) return res.status(404).json({ success: false, error: 'Live session not found.' });

      const updated = await prisma.liveSession.update({
        where: { id: sessionId },
        data: {
          status,
          ...(status === 'live' ? { startedAt: new Date() } : {}),
          ...(status === 'ended' ? { endedAt: new Date() } : {}),
        },
      });

      // Notify enrolled students when a scheduled session goes live
      if (status === 'live' && existing.status !== 'live' && existing.course.enrollments.length > 0) {
        await NotificationService.notifyMany(
          existing.course.enrollments.map((enr) => ({
            tenantSlug: existing.tenantSlug,
            studentId: enr.studentId,
            courseId: existing.courseId,
            type: 'live_started',
            title: `LIVE NOW: ${existing.title}`,
            body: `Your instructor just started the scheduled live class in ${existing.course.title}.`,
            linkUrl: `/s/${existing.tenantSlug}/${enr.studentId}/course/${existing.courseId}`,
          }))
        );
      }

      // Suggestion #8: Auto-archive ended live session into a Lesson as a recorded Topic!
      let archivedTopic = null;
      const targetLessonId = archiveToLessonId || existing.lessonId;
      if (status === 'ended' && targetLessonId && req.body.saveAsTopic) {
        const count = await prisma.courseTopic.count({ where: { lessonId: targetLessonId } });
        archivedTopic = await prisma.courseTopic.create({
          data: {
            lessonId: targetLessonId,
            courseId: existing.courseId,
            tenantSlug: existing.tenantSlug,
            title: `${existing.title} (Recorded Live)`,
            textContent: `Recorded live class from ${new Date(existing.scheduledAt).toLocaleDateString('en-IN')}.`,
            youtubeUrl: existing.youtubeLiveUrl,
            docLinks: existing.attachedDocs ?? [],
            order: count,
          },
        });
      }

      invalidateStorefrontCache(existing.tenantSlug);

      return res.json({ success: true, session: updated, archivedTopic });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Enrollments (180 Pay Purchase -> Real-Time Teacher Revenue) & Progress
  // ---------------------------------------------------------------------------

  static async enrollStudent(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const { studentId, studentName, studentEmail, amountPaid, paymentId } = req.body;

      if (!studentId) {
        return res.status(401).json({ success: false, error: '180 Identity login required to enroll.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const course = await prisma.studioCourse.findUnique({
        where: { id: courseId },
        include: { _count: { select: { enrollments: true } } },
      });
      if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

      // Enforce seat limit (Suggestion #6)
      const alreadyEnrolled = await prisma.courseEnrollment.findUnique({
        where: { courseId_studentId: { courseId, studentId } },
      });
      if (alreadyEnrolled) {
        return res.json({ success: true, alreadyEnrolled: true, enrollment: alreadyEnrolled });
      }

      if (course.maxStudents && course._count.enrollments >= course.maxStudents) {
        return res.status(409).json({
          success: false,
          seatFull: true,
          error: 'This course has reached its maximum student capacity.',
        });
      }

      const finalAmount = amountPaid !== undefined ? Number(amountPaid) : course.priceInr;
      const resolvedPaymentId = paymentId || `180_pay_${Date.now()}`;
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          courseId,
          tenantSlug: course.tenantSlug,
          studentId,
          studentName: studentName || 'Student',
          studentEmail: studentEmail || null,
          amountPaid: finalAmount,
          paymentId: resolvedPaymentId,
        },
      });

      // Record paid settlement in One80Transaction so Teacher Payouts Ledger (+95% net share) stays synced
      if (finalAmount > 0) {
        const platformFee = Math.round(finalAmount * 0.05);
        const teacherPayout = finalAmount - platformFee;
        try {
          await prisma.one80Transaction.upsert({
            where: { orderId: resolvedPaymentId },
            update: { status: 'paid', paidAt: new Date() },
            create: {
              orderId: resolvedPaymentId,
              tenantSlug: course.tenantSlug,
              offeringId: courseId,
              offeringTitle: course.title,
              amount: finalAmount,
              currency: 'INR',
              teacherPayout,
              platformFee,
              status: 'paid',
              mode: 'live',
              studentName: studentName || 'Student',
              studentEmail: studentEmail || null,
              transactionId: resolvedPaymentId,
              paidAt: new Date(),
            },
          });
        } catch {
          // Non-fatal if duplicate orderId
        }
      }

      await NotificationService.notifyStudent({
        tenantSlug: course.tenantSlug,
        studentId,
        courseId,
        type: 'enrollment',
        title: `Enrolled in ${course.title}`,
        body: `Welcome! Your course access is now active.`,
        linkUrl: `/s/${course.tenantSlug}/${studentId}/course/${courseId}`,
      });

      invalidateStorefrontCache(course.tenantSlug);

      return res.status(201).json({ success: true, enrollment });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /courses/:id/waitlist
   * Smart Seat-Limit Waitlist Overflow -> persists to Supabase Lead table
   */
  static async joinWaitlist(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const { studentName, studentEmail, studentPhone } = req.body;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const course = await prisma.studioCourse.findUnique({ where: { id: courseId } });
      if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

      const lead = await prisma.lead.create({
        data: {
          tenantSlug: course.tenantSlug,
          categorySlug: `waitlist-${course.id}`,
          categoryName: `Waitlist: ${course.title}`,
          phone: studentPhone || studentName || '180-identity-student',
          email: studentEmail || null,
        },
      });

      return res.status(201).json({ success: true, lead });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async listStudentEnrollments(req: Request, res: Response) {
    try {
      const studentId = req.query.studentId as string;
      const tenantSlug = ((req.query.tenant as string) || 'cuet-humanities').toLowerCase();
      const prisma = getPrisma();
      if (!prisma || !studentId) {
        return res.json({ success: true, courseIds: [], enrollments: [] });
      }

      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId, tenantSlug },
        orderBy: { enrolledAt: 'desc' },
      });

      return res.json({
        success: true,
        courseIds: enrollments.map((e) => e.courseId),
        enrollments,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStudentProgress(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const studentId = req.query.studentId as string;
      const prisma = getPrisma();
      if (!prisma || !studentId) return res.json({ success: true, completedTopicIds: [] });

      const rows = await prisma.topicCompletion.findMany({
        where: { courseId, studentId },
      });
      return res.json({ success: true, completedTopicIds: rows.map((r) => r.topicId) });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async toggleTopicCompletion(req: Request, res: Response) {
    try {
      const { id: courseId, topicId } = req.params;
      const { studentId } = req.body;
      if (!studentId) return res.status(400).json({ success: false, error: 'studentId required.' });

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.topicCompletion.findUnique({
        where: { topicId_studentId: { topicId, studentId } },
      });

      if (existing) {
        await prisma.topicCompletion.delete({ where: { id: existing.id } });
        return res.json({ success: true, completed: false });
      }

      await prisma.topicCompletion.create({
        data: { courseId, topicId, studentId },
      });
      return res.json({ success: true, completed: true });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Real-Time Classroom Chat + Moderation Controls (Suggestion #4)
  // ---------------------------------------------------------------------------

  static async listChatMessages(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.json({ success: true, messages: [] });

      const course = await prisma.studioCourse.findUnique({
        where: { id: courseId },
        select: { chatMuted: true, chatSlowMode: true },
      });
      const messages = await prisma.courseChatMessage.findMany({
        where: { courseId },
        orderBy: { createdAt: 'asc' },
        take: 150,
      });

      return res.json({
        success: true,
        chatMuted: course?.chatMuted ?? false,
        chatSlowMode: course?.chatSlowMode ?? false,
        messages,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async postChatMessage(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const {
        senderId,
        senderName,
        senderRole = 'student',
        message,
        liveSessionId,
        isPinned = false,
      } = req.body;

      if (!senderId || !message?.trim()) {
        return res.status(400).json({ success: false, error: 'Sender and message are required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const course = await prisma.studioCourse.findUnique({ where: { id: courseId } });
      if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

      if (course.chatMuted && senderRole !== 'teacher') {
        return res.status(403).json({ success: false, error: 'Chat is temporarily paused by your educator.' });
      }

      // Suggestion #3: Server-side Slow Mode throttling (1 message / 3 seconds per student)
      if (course.chatSlowMode && senderRole !== 'teacher') {
        const key = `${courseId}:${senderId}`;
        const lastSent = chatSlowModeTimestamps.get(key) || 0;
        const now = Date.now();
        if (now - lastSent < 3000) {
          return res.status(429).json({
            success: false,
            error: 'Slow mode is active. Please wait 3 seconds between messages.',
          });
        }
        chatSlowModeTimestamps.set(key, now);
      }

      const pinFlag = senderRole === 'teacher' && Boolean(isPinned);
      if (pinFlag) {
        await prisma.courseChatMessage.updateMany({
          where: { courseId, isPinned: true },
          data: { isPinned: false },
        });
      }

      const created = await prisma.courseChatMessage.create({
        data: {
          courseId,
          liveSessionId: liveSessionId || null,
          tenantSlug: course.tenantSlug,
          senderId,
          senderName: senderName || 'Student',
          senderRole,
          message: message.trim().slice(0, 500),
          isPinned: pinFlag,
        },
      });

      return res.status(201).json({ success: true, message: created });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async togglePinChatMessage(req: Request, res: Response) {
    try {
      const { id: courseId, messageId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.courseChatMessage.findUnique({ where: { id: messageId } });
      if (!existing) return res.status(404).json({ success: false, error: 'Message not found.' });

      const nextPinned = !existing.isPinned;
      if (nextPinned) {
        await prisma.courseChatMessage.updateMany({
          where: { courseId, isPinned: true },
          data: { isPinned: false },
        });
      }

      const updated = await prisma.courseChatMessage.update({
        where: { id: messageId },
        data: { isPinned: nextPinned },
      });

      return res.json({ success: true, message: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateChatSettings(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const { chatMuted, chatSlowMode } = req.body;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const updated = await prisma.studioCourse.update({
        where: { id: courseId },
        data: {
          ...(typeof chatMuted === 'boolean' ? { chatMuted } : {}),
          ...(typeof chatSlowMode === 'boolean' ? { chatSlowMode } : {}),
        },
        select: { id: true, chatMuted: true, chatSlowMode: true },
      });
      return res.json({ success: true, settings: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Contextual Course Doubts + Teacher Reply -> Student Notification + Pin FAQ
  // ---------------------------------------------------------------------------

  static async listDoubts(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const studentId = req.query.studentId as string | undefined;
      const lessonId = req.query.lessonId as string | undefined;
      const prisma = getPrisma();
      if (!prisma) return res.json({ success: true, doubts: [] });

      const doubts = await prisma.courseDoubt.findMany({
        where: {
          courseId,
          ...(lessonId ? { lessonId } : {}),
          ...(studentId
            ? {
                OR: [{ studentId }, { isPinnedFaq: true }],
              }
            : {}),
        },
        orderBy: [{ isPinnedFaq: 'desc' }, { createdAt: 'desc' }],
      });

      return res.json({ success: true, doubts });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createDoubt(req: Request, res: Response) {
    try {
      const { id: courseId } = req.params;
      const {
        subjectId,
        lessonId,
        topicId,
        lessonContextLabel,
        studentId,
        studentName,
        studentEmail,
        question,
      } = req.body;

      if (!studentId || !question?.trim()) {
        return res.status(400).json({ success: false, error: 'Question and student login required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const course = await prisma.studioCourse.findUnique({ where: { id: courseId } });
      if (!course) return res.status(404).json({ success: false, error: 'Course not found.' });

      const doubt = await prisma.courseDoubt.create({
        data: {
          courseId,
          tenantSlug: course.tenantSlug,
          subjectId: subjectId || null,
          lessonId: lessonId || null,
          topicId: topicId || null,
          lessonContextLabel: lessonContextLabel || 'General Course',
          studentId,
          studentName: studentName || 'Student',
          studentEmail: studentEmail || null,
          question: question.trim(),
          status: 'open',
        },
      });

      return res.status(201).json({ success: true, doubt });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async replyToDoubt(req: Request, res: Response) {
    try {
      const { id: courseId, doubtId } = req.params;
      const { reply, isPinnedFaq } = req.body;

      if (!reply?.trim()) {
        return res.status(400).json({ success: false, error: 'Reply text is required.' });
      }

      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const updated = await prisma.courseDoubt.update({
        where: { id: doubtId },
        data: {
          reply: reply.trim(),
          repliedAt: new Date(),
          status: 'answered',
          ...(typeof isPinnedFaq === 'boolean' ? { isPinnedFaq } : {}),
        },
      });

      // Automatically send notification to the student via NotificationService (Supabase + optional Webhook)
      await NotificationService.notifyStudent({
        tenantSlug: updated.tenantSlug,
        studentId: updated.studentId,
        courseId,
        type: 'doubt_reply',
        title: `Your doubt was answered (${updated.lessonContextLabel})`,
        body: updated.reply || '',
        linkUrl: `/s/${updated.tenantSlug}/${updated.studentId}/course/${courseId}${
          updated.topicId ? `?topicId=${updated.topicId}` : ''
        }`,
      });

      return res.json({ success: true, doubt: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async togglePinFaq(req: Request, res: Response) {
    try {
      const { doubtId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const existing = await prisma.courseDoubt.findUnique({ where: { id: doubtId } });
      if (!existing) return res.status(404).json({ success: false, error: 'Doubt not found.' });

      const updated = await prisma.courseDoubt.update({
        where: { id: doubtId },
        data: { isPinnedFaq: !existing.isPinnedFaq },
      });
      return res.json({ success: true, doubt: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Student Notifications
  // ---------------------------------------------------------------------------

  static async listNotifications(req: Request, res: Response) {
    try {
      const studentId = req.query.studentId as string;
      const prisma = getPrisma();
      if (!prisma || !studentId) {
        return res.json({ success: true, unreadCount: 0, notifications: [] });
      }

      const notifications = await prisma.studentNotification.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return res.json({ success: true, unreadCount, notifications });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async markNotificationRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const prisma = getPrisma();
      if (!prisma) return res.status(503).json({ success: false, error: 'Database unavailable.' });

      const updated = await prisma.studentNotification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return res.json({ success: true, notification: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async markAllNotificationsRead(req: Request, res: Response) {
    try {
      const { studentId } = req.body;
      const prisma = getPrisma();
      if (!prisma || !studentId) return res.json({ success: true });

      await prisma.studentNotification.updateMany({
        where: { studentId, isRead: false },
        data: { isRead: true },
      });
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ---------------------------------------------------------------------------
  // Academy-Wide Live Overview, Global Doubts Inbox & Global Student Roster
  // ---------------------------------------------------------------------------

  static async getAcademyOverview(req: Request, res: Response) {
    try {
      const tenantSlug = ((req.query.tenant as string) || 'cuet-humanities').toLowerCase();
      const prisma = getPrisma();
      if (!prisma) {
        return res.json({
          success: true,
          metrics: {
            totalCourses: 0,
            liveCourses: 0,
            totalEnrollments: 0,
            uniqueStudents: 0,
            grossRevenue: 0,
            netTeacherRevenue: 0,
            openDoubts: 0,
            totalDoubts: 0,
            resolutionRate: 100,
          },
          courses: [],
          recentDoubts: [],
        });
      }

      const [courses, enrollments, doubts] = await Promise.all([
        prisma.studioCourse.findMany({
          where: { tenantSlug },
          include: {
            _count: { select: { subjects: true, enrollments: true, doubts: true, tests: true } },
            enrollments: { select: { amountPaid: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.courseEnrollment.findMany({
          where: { tenantSlug },
          orderBy: { enrolledAt: 'desc' },
        }),
        prisma.courseDoubt.findMany({
          where: { tenantSlug },
          include: { course: { select: { id: true, title: true } } },
          orderBy: { createdAt: 'desc' },
          take: 25,
        }),
      ]);

      const grossRevenue = enrollments.reduce((s, e) => s + Number(e.amountPaid || 0), 0);
      const netTeacherRevenue = Math.round(grossRevenue * 0.95);
      const uniqueStudents = new Set(enrollments.map((e) => e.studentId)).size;
      const openDoubts = doubts.filter((d) => d.status === 'open').length;
      const answeredDoubts = doubts.filter((d) => d.status === 'answered').length;
      const resolutionRate =
        doubts.length > 0 ? Math.round((answeredDoubts / doubts.length) * 100) : 100;

      const courseSummaries = courses.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        priceInr: c.priceInr,
        maxStudents: c.maxStudents,
        bannerUrl: c.bannerUrl,
        enrolledCount: c._count.enrollments,
        subjectCount: c._count.subjects,
        testCount: c._count.tests,
        revenue: c.enrollments.reduce((s, e) => s + Number(e.amountPaid || 0), 0),
        launchedAt: c.launchedAt,
      }));

      return res.json({
        success: true,
        metrics: {
          totalCourses: courses.length,
          liveCourses: courses.filter((c) => c.status === 'live').length,
          totalEnrollments: enrollments.length,
          uniqueStudents,
          grossRevenue,
          netTeacherRevenue,
          openDoubts,
          totalDoubts: doubts.length,
          resolutionRate,
        },
        courses: courseSummaries,
        recentDoubts: doubts.slice(0, 6).map((d) => ({
          id: d.id,
          courseId: d.courseId,
          courseTitle: d.course?.title || 'Course',
          studentName: d.studentName,
          studentId: d.studentId,
          lessonContextLabel: d.lessonContextLabel,
          question: d.question,
          reply: d.reply,
          status: d.status,
          createdAt: d.createdAt,
        })),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async listAcademyDoubts(req: Request, res: Response) {
    try {
      const tenantSlug = ((req.query.tenant as string) || 'cuet-humanities').toLowerCase();
      const prisma = getPrisma();
      if (!prisma) return res.json({ success: true, doubts: [] });

      const doubts = await prisma.courseDoubt.findMany({
        where: { tenantSlug },
        include: { course: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return res.json({
        success: true,
        doubts: doubts.map((d) => ({
          ...d,
          courseTitle: d.course?.title || 'Course',
        })),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async listAcademyStudents(req: Request, res: Response) {
    try {
      const tenantSlug = ((req.query.tenant as string) || 'cuet-humanities').toLowerCase();
      const prisma = getPrisma();
      if (!prisma) return res.json({ success: true, enrollments: [] });

      const enrollments = await prisma.courseEnrollment.findMany({
        where: { tenantSlug },
        include: { course: { select: { id: true, title: true, priceInr: true } } },
        orderBy: { enrolledAt: 'desc' },
        take: 200,
      });

      return res.json({
        success: true,
        enrollments: enrollments.map((e) => ({
          id: e.id,
          courseId: e.courseId,
          courseTitle: e.course?.title || 'Course',
          studentId: e.studentId,
          studentName: e.studentName,
          studentEmail: e.studentEmail,
          amountPaid: e.amountPaid,
          paymentId: e.paymentId,
          enrolledAt: e.enrolledAt,
        })),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
