import { Request, Response } from 'express';
import { TenantAggregate } from '@simplicion/tenant';
import { One80IdentityService } from '../security/one80-identity.service';
import {
  getPrisma,
  getSupabaseClient,
  SUPABASE_SECRET_KEY,
  SUPABASE_STORAGE_BUCKET,
} from '../lib/supabase';
import { invalidateStorefrontCache } from '../lib/storefront-cache';

async function maybeUploadImage(
  slug: string,
  slot: string,
  value?: string | null
): Promise<string | null | undefined> {
  if (value === undefined) return undefined;
  if (!value) return '';
  if (!value.startsWith('data:image/')) {
    return value;
  }
  try {
    const matches = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!matches) return value;
    const contentType = matches[1];
    const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'webp';
    const buffer = Buffer.from(matches[2], 'base64');
    const pathKey = `tenants/${slug}/site/${slot}_${Date.now()}.${ext}`;
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(pathKey, buffer, { contentType, cacheControl: '31536000', upsert: true });
    if (!error) {
      const { data: pub } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(pathKey);
      if (pub?.publicUrl) return pub.publicUrl;
    }
  } catch {
    // Keep compressed data URL fallback
  }
  return value;
}

const DEFAULT_OFFLINE_MESSAGE =
  'This academy portal is temporarily unavailable while the educator updates courses and study material. Please check back soon!';

// In-memory portal visibility fallback (for unit tests / offline mode)
const memoryPortalVisibility = new Map<string, { portalLive: boolean; portalOfflineMessage: string }>();

// In-memory tenant registry populated with reference institutes
const tenantStore = new Map<string, any>();

// Minimal in-memory tenant fallback for offline unit tests only
const defaultAcademies = [
  {
    id: 'tenant_cuet_01',
    slug: 'cuet-humanities',
    name: 'Learnings Simplicion',
    ownerUserId: 'teacher_owner_01',
    teacherName: 'Educator',
    specialty: 'Online Academy',
    status: 'active',
    tagline: 'Structured online courses and live classes',
    primaryColor: '#2563eb',
    exam: 'Online Academy',
  },
];

defaultAcademies.forEach((a) => {
  const tenant = TenantAggregate.createInstantSelfServe(
    a.id,
    a.slug,
    a.name,
    a.ownerUserId,
    'plan_starter_free',
    {
      branding: {
        tagline: a.tagline,
        primaryColor: a.primaryColor,
        accentColor: '#3b82f6',
        borderRadius: 'md',
        fontFamily: 'Inter',
        headerLayout: 'login-right',
      },
      seo: {
        titleTemplate: `${a.name} | Online Classes & Test Series`,
        metaDescription: `Join ${a.name} for structured courses and interactive CBT assessments.`,
        keywords: [a.exam.toLowerCase(), 'test series', a.name.toLowerCase()],
      },
    }
  );
  tenantStore.set(a.slug, {
    aggregate: tenant,
    teacherName: a.teacherName,
    specialty: a.specialty,
    exam: a.exam,
  });
});

export class TenantController {
  /**
   * GET /site-config
   * Fetches public branding, layout tokens, and SEO for the active tenant
   */
  static async getSiteConfig(req: Request, res: Response) {
    try {
      const requestedSlug = (req.query.tenant as string) || req.tenant?.slug || 'cuet-humanities';
      const normalizedSlug = requestedSlug === 'cuet' ? 'cuet-humanities' : requestedSlug;

      // 1. Read live configuration from Supabase PostgreSQL if available
      const prisma = getPrisma();
      if (prisma) {
        try {
          const dbTenant =
            (await prisma.tenant.findUnique({
              where: { slug: normalizedSlug },
              include: { settings: true },
            })) ||
            (await prisma.tenant.findUnique({
              where: { slug: 'cuet-humanities' },
              include: { settings: true },
            }));

          if (dbTenant) {
            const enabledModules = ((dbTenant.settings?.enabledModules as Record<string, any>) || {});
            const portalLive = enabledModules.portalLive !== false;
            const portalOfflineMessage =
              typeof enabledModules.portalOfflineMessage === 'string' &&
              enabledModules.portalOfflineMessage.trim()
                ? enabledModules.portalOfflineMessage.trim()
                : DEFAULT_OFFLINE_MESSAGE;

            return res.json({
              success: true,
              source: 'supabase',
              data: {
                id: dbTenant.id,
                slug: dbTenant.slug,
                name: dbTenant.name,
                status: dbTenant.status,
                planId: dbTenant.planId,
                ownerUserId: dbTenant.ownerUserId,
                portalLive,
                portalOfflineMessage,
                settings: dbTenant.settings || {},
              },
            });
          }
        } catch (dbErr: any) {
          console.warn('[Supabase DB] getSiteConfig fallback to memory:', dbErr?.message);
        }
      }

      // 2. Check in-memory store (used in unit tests / offline mode)
      const record = tenantStore.get(normalizedSlug) || tenantStore.get('cuet-humanities');
      if (record) {
        const vis = memoryPortalVisibility.get(normalizedSlug) || {
          portalLive: true,
          portalOfflineMessage: DEFAULT_OFFLINE_MESSAGE,
        };
        return res.json({
          success: true,
          source: 'memory',
          data: {
            ...record.aggregate.toJSON(),
            portalLive: vis.portalLive,
            portalOfflineMessage: vis.portalOfflineMessage,
          },
        });
      }

      const tenant = req.tenant;
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'No active tenant identified on this hostname.',
        });
      }

      const tenantAggregate = TenantAggregate.createInstantSelfServe(
        tenant.id,
        tenant.slug,
        `${tenant.slug.toUpperCase()} Academy`,
        'usr-owner-1',
        'plan_pro'
      );

      return res.json({
        success: true,
        source: 'memory',
        data: tenantAggregate.toJSON(),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * PUT /site-config
   * Persists Visual Portal Builder edits (Brand Name, Hero Tagline, Color Theme, Font)
   * directly into Supabase PostgreSQL (triggering Supabase Realtime updates to Student Portal).
   */
  static async updateSiteConfig(req: Request, res: Response) {
    try {
      const requestedSlug =
        (req.body.slug as string) || (req.query.tenant as string) || req.tenant?.slug || 'cuet-humanities';
      const normalizedSlug = requestedSlug === 'cuet' ? 'cuet-humanities' : requestedSlug;

      const {
        instituteName,
        tagline,
        primaryColor,
        secondaryColor,
        fontFamily,
        logoUrl,
        bannerUrl,
        websiteContent,
        contact,
        profile,
        portalLive,
        portalOfflineMessage,
      } = req.body;

      const resolvedLogoUrl = await maybeUploadImage(normalizedSlug, 'logo', logoUrl);
      const resolvedBannerUrl = await maybeUploadImage(normalizedSlug, 'banner', bannerUrl);

      let resolvedWebsiteContent = websiteContent;
      if (websiteContent && typeof websiteContent === 'object') {
        resolvedWebsiteContent = { ...websiteContent };
        if (websiteContent.hero?.heroImageUrl) {
          resolvedWebsiteContent.hero = {
            ...websiteContent.hero,
            heroImageUrl:
              (await maybeUploadImage(normalizedSlug, 'hero', websiteContent.hero.heroImageUrl)) ||
              websiteContent.hero.heroImageUrl,
          };
        }
        if (websiteContent.showcase?.imageUrl) {
          resolvedWebsiteContent.showcase = {
            ...websiteContent.showcase,
            imageUrl:
              (await maybeUploadImage(normalizedSlug, 'showcase', websiteContent.showcase.imageUrl)) ||
              websiteContent.showcase.imageUrl,
          };
        }
      }

      const incomingContact = contact || profile;

      // 1. Update in-memory store for immediate consistency
      const record = tenantStore.get(normalizedSlug) || tenantStore.get('cuet-humanities');
      if (record) {
        const aggregate = record.aggregate;
        if (typeof instituteName === 'string' && instituteName.trim()) {
          (aggregate as any).props.name = instituteName.trim();
        }
        aggregate.updateBranding({
          ...(typeof tagline === 'string' ? { tagline: tagline.trim() } : {}),
          ...(typeof primaryColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(primaryColor)
            ? { primaryColor }
            : {}),
          ...(typeof secondaryColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(secondaryColor)
            ? { accentColor: secondaryColor }
            : {}),
          ...(typeof fontFamily === 'string' && fontFamily.trim() ? { fontFamily: fontFamily.trim() } : {}),
        });
      }

      // 2. Persist permanently to Supabase PostgreSQL
      const prisma = getPrisma();
      if (prisma) {
        try {
          const dbTenant =
            (await prisma.tenant.findUnique({
              where: { slug: normalizedSlug },
              include: { settings: true },
            })) ||
            (await prisma.tenant.findUnique({
              where: { slug: 'cuet-humanities' },
              include: { settings: true },
            }));

          if (dbTenant) {
            const currentBranding = ((dbTenant.settings?.branding as Record<string, any>) || {});
            const currentContact = ((dbTenant.settings?.contact as Record<string, any>) || {});
            const currentModules = ((dbTenant.settings?.enabledModules as Record<string, any>) || {});

            const mergedModules = {
              ...currentModules,
              ...(typeof portalLive === 'boolean' ? { portalLive } : {}),
              ...(typeof portalOfflineMessage === 'string'
                ? { portalOfflineMessage: portalOfflineMessage.trim() }
                : {}),
            };

            const mergedBranding = {
              ...currentBranding,
              ...(typeof tagline === 'string' ? { tagline: tagline.trim() } : {}),
              ...(typeof primaryColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(primaryColor)
                ? { primaryColor, accentColor: primaryColor }
                : {}),
              ...(typeof secondaryColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(secondaryColor)
                ? { accentColor: secondaryColor }
                : {}),
              ...(typeof fontFamily === 'string' && fontFamily.trim()
                ? { fontFamily: fontFamily.trim() }
                : {}),
              ...(resolvedLogoUrl !== undefined ? { logoUrl: resolvedLogoUrl } : {}),
              ...(resolvedBannerUrl !== undefined ? { bannerUrl: resolvedBannerUrl } : {}),
              ...(resolvedWebsiteContent !== undefined
                ? { websiteContent: resolvedWebsiteContent }
                : {}),
            };

            const mergedContact =
              incomingContact && typeof incomingContact === 'object'
                ? { ...currentContact, ...incomingContact }
                : currentContact;

            const updated = await prisma.tenant.update({
              where: { id: dbTenant.id },
              data: {
                ...(typeof instituteName === 'string' && instituteName.trim()
                  ? { name: instituteName.trim() }
                  : {}),
                settings: {
                  update: {
                    branding: mergedBranding,
                    contact: mergedContact,
                    enabledModules: mergedModules,
                  },
                },
              },
              include: { settings: true },
            });

            const resolvedPortalLive = mergedModules.portalLive !== false;
            const resolvedOfflineMsg =
              typeof mergedModules.portalOfflineMessage === 'string' &&
              mergedModules.portalOfflineMessage.trim()
                ? mergedModules.portalOfflineMessage.trim()
                : DEFAULT_OFFLINE_MESSAGE;

            invalidateStorefrontCache(updated.slug);

            return res.json({
              success: true,
              persistedTo: 'supabase',
              message: 'Storefront settings saved to Supabase & published live.',
              data: {
                id: updated.id,
                slug: updated.slug,
                name: updated.name,
                status: updated.status,
                planId: updated.planId,
                ownerUserId: updated.ownerUserId,
                portalLive: resolvedPortalLive,
                portalOfflineMessage: resolvedOfflineMsg,
                settings: updated.settings || {},
              },
            });
          }
        } catch (dbErr: any) {
          console.warn('[Supabase DB] updateSiteConfig fallback to memory:', dbErr?.message);
        }
      }

      if (!record) {
        return res.status(404).json({ success: false, error: 'Tenant not found.' });
      }

      return res.json({
        success: true,
        persistedTo: 'memory',
        message: 'Storefront branding published live.',
        data: record.aggregate.toJSON(),
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * PATCH /site-config/portal-status
   * One-click toggle to set the academy's Student Portal Live (online) or Offline (unlive/paused)
   * with an optional friendly message for visiting students.
   */
  static async updatePortalStatus(req: Request, res: Response) {
    try {
      const requestedSlug =
        (req.body.slug as string) ||
        (req.body.tenantSlug as string) ||
        (req.query.tenant as string) ||
        req.tenant?.slug ||
        'cuet-humanities';
      const normalizedSlug = requestedSlug === 'cuet' ? 'cuet-humanities' : requestedSlug.toLowerCase();

      if (typeof req.body.portalLive !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'portalLive (boolean) is required.',
        });
      }

      const portalLive = req.body.portalLive;
      const incomingMsg =
        typeof req.body.portalOfflineMessage === 'string'
          ? req.body.portalOfflineMessage.trim()
          : undefined;

      const prevMem = memoryPortalVisibility.get(normalizedSlug);
      const resolvedOfflineMsg =
        incomingMsg !== undefined
          ? incomingMsg || DEFAULT_OFFLINE_MESSAGE
          : prevMem?.portalOfflineMessage || DEFAULT_OFFLINE_MESSAGE;

      memoryPortalVisibility.set(normalizedSlug, {
        portalLive,
        portalOfflineMessage: resolvedOfflineMsg,
      });

      const prisma = getPrisma();
      if (prisma) {
        const dbTenant =
          (await prisma.tenant.findUnique({
            where: { slug: normalizedSlug },
            include: { settings: true },
          })) ||
          (await prisma.tenant.findUnique({
            where: { slug: 'cuet-humanities' },
            include: { settings: true },
          }));

        if (dbTenant?.settings) {
          const currentModules = ((dbTenant.settings.enabledModules as Record<string, any>) || {});
          const finalMsg =
            incomingMsg !== undefined
              ? incomingMsg || DEFAULT_OFFLINE_MESSAGE
              : typeof currentModules.portalOfflineMessage === 'string' &&
                  currentModules.portalOfflineMessage.trim()
                ? currentModules.portalOfflineMessage.trim()
                : DEFAULT_OFFLINE_MESSAGE;

          await prisma.tenantSettings.update({
            where: { tenantId: dbTenant.id },
            data: {
              enabledModules: {
                ...currentModules,
                portalLive,
                portalOfflineMessage: finalMsg,
              },
            },
          });

          invalidateStorefrontCache(dbTenant.slug);

          return res.json({
            success: true,
            persistedTo: 'supabase',
            portalLive,
            portalOfflineMessage: finalMsg,
            message: portalLive
              ? 'Student Portal is now LIVE for students.'
              : 'Student Portal is now OFFLINE. Visiting students will see a friendly unavailable notice.',
          });
        }
      }

      return res.json({
        success: true,
        persistedTo: 'memory',
        portalLive,
        portalOfflineMessage: resolvedOfflineMsg,
        message: portalLive
          ? 'Student Portal is now LIVE for students.'
          : 'Student Portal is now OFFLINE.',
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /tenants/onboard-instant
   * Instant, zero-approval teacher account & academy portal creation
   */
  static async onboardInstant(req: Request, res: Response) {
    try {
      const { teacherName, email, phone, academyName, slug, specialty, primaryColor } = req.body;

      if (!teacherName || !academyName || !slug) {
        return res.status(400).json({
          success: false,
          error: 'Teacher name, academy name, and desired slug/subdomain are required.',
        });
      }

      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
      if (tenantStore.has(cleanSlug)) {
        return res.status(409).json({
          success: false,
          error: `Subdomain "${cleanSlug}" is already taken. Please choose another.`,
        });
      }

      const tenantId = `tenant_${cleanSlug.replace(/-/g, '_')}_${Date.now()}`;
      const teacherId = `tch_${Date.now()}`;

      // Create immediately in active state (zero manual approval wait)
      const tenant = TenantAggregate.createInstantSelfServe(
        tenantId,
        cleanSlug,
        academyName,
        teacherId,
        'plan_pro',
        {
          branding: {
            tagline: specialty ? `Premier institute for ${specialty}` : 'Excellence in learning and test prep',
            primaryColor: primaryColor || '#2563eb',
            accentColor: '#3b82f6',
            borderRadius: 'md',
            fontFamily: 'Inter',
            headerLayout: 'login-right',
          },
          contact: {
            supportEmail: email,
            supportPhone: phone,
            whatsappNumber: phone,
          },
        }
      );

      // Save to in-memory store
      tenantStore.set(cleanSlug, {
        aggregate: tenant,
        teacherName,
        specialty: specialty || 'General Academics',
        exam: specialty || 'All Competitive Exams',
      });

      // Persist newly created academy to Supabase PostgreSQL
      const prisma = getPrisma();
      if (prisma) {
        try {
          await prisma.tenant.upsert({
            where: { slug: cleanSlug },
            update: { name: academyName },
            create: {
              id: tenantId,
              slug: cleanSlug,
              name: academyName,
              status: 'active',
              planId: 'plan_pro',
              ownerUserId: teacherId,
              settings: {
                create: {
                  branding: {
                    tagline: specialty ? `Premier institute for ${specialty}` : 'Excellence in learning and test prep',
                    primaryColor: primaryColor || '#2563eb',
                    accentColor: '#1d4ed8',
                    borderRadius: 'md',
                    fontFamily: "'Inter', sans-serif",
                    headerLayout: 'login-right',
                  },
                  labels: {
                    studyEntry: 'Study',
                    unitsHeader: "Let's Study",
                    offeringName: 'Batch',
                  },
                  sectionsOrder: ['hero', 'upcoming-slider', 'categories', 'why-us', 'faq'],
                  enabledModules: {
                    doubtSupport: true,
                    mentorship: true,
                    whatsappCommunity: true,
                    advisoryTools: false,
                  },
                  contact: {
                    supportEmail: email || undefined,
                    supportPhone: phone || undefined,
                    whatsappNumber: phone || undefined,
                  },
                  seo: {
                    titleTemplate: `${academyName} | Online Classes & Test Series`,
                    metaDescription: `Join ${academyName} on learnings.simplicion.com/${cleanSlug}`,
                    keywords: [cleanSlug, academyName.toLowerCase()],
                  },
                },
              },
            },
          });
        } catch (dbErr: any) {
          console.warn('[Supabase DB] onboardInstant persist skipped:', dbErr?.message);
        }
      }

      // Generate 180 Identity Token for instant authenticated Teacher Studio access
      const token = One80IdentityService.issueToken({
        userId: teacherId,
        tenantId,
        role: 'teacher',
        name: teacherName,
        email,
        phone,
      });

      return res.status(201).json({
        success: true,
        persistedTo: prisma ? 'supabase' : 'memory',
        message: 'Teacher account & Academy portal created instantly! Welcome to Teacher Studio.',
        tenant: tenant.toJSON(),
        token,
        academyUrl: `learnings.simplicion.com/${cleanSlug}`,
        studentPortalUrlPattern: `learnings.simplicion.com/s/${cleanSlug}/<student-id>`,
        redirectUrl: `http://localhost:3002/?tenantId=${tenantId}&slug=${cleanSlug}&teacher=${encodeURIComponent(teacherName)}`,
        studentPortalUrl: `http://localhost:3001/?tenant=${cleanSlug}`,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /tenants/search
   * Live search query backed by Supabase PostgreSQL (zero hardcoded mock academies)
   */
  static async searchTenants(req: Request, res: Response) {
    try {
      const q = ((req.query.q as string) || '').toLowerCase().trim();
      const prisma = getPrisma();

      if (prisma) {
        try {
          const [rows, courseCounts] = await Promise.all([
            prisma.tenant.findMany({
              include: { settings: true },
              orderBy: { createdAt: 'desc' },
            }),
            prisma.studioCourse.groupBy({
              by: ['tenantSlug'],
              where: { status: 'live', isSetupComplete: true },
              _count: { id: true },
            }),
          ]);

          const countMap = new Map(
            courseCounts.map((c) => [c.tenantSlug.toLowerCase(), c._count.id])
          );

          const results = rows
            .map((row) => {
              const branding = ((row.settings?.branding as Record<string, any>) || {});
              const contact = ((row.settings?.contact as Record<string, any>) || {});
              const enabledModules = ((row.settings?.enabledModules as Record<string, any>) || {});
              const teacherName = contact.educatorName || '';
              const specialty = branding.tagline || contact.category || '';
              const exam = contact.category || 'Online Academy';
              const portalLive = enabledModules.portalLive !== false;
              return {
                id: row.id,
                slug: row.slug,
                name: row.name,
                tagline: branding.tagline || '',
                logoUrl: branding.logoUrl || '',
                bannerUrl: branding.bannerUrl || '',
                primaryColor: branding.primaryColor || '#2563eb',
                portalLive,
                publishedCoursesCount: countMap.get(row.slug.toLowerCase()) || 0,
                teacherName,
                specialty,
                exam,
                studentPortalUrl: `http://localhost:3001/${row.slug}`,
              };
            })
            .filter((item) => {
              if (!q) return true;
              return (
                item.name.toLowerCase().includes(q) ||
                item.slug.toLowerCase().includes(q) ||
                item.teacherName.toLowerCase().includes(q) ||
                item.specialty.toLowerCase().includes(q) ||
                item.exam.toLowerCase().includes(q)
              );
            });

          return res.json({
            success: true,
            source: 'supabase',
            count: results.length,
            academies: results,
          });
        } catch (dbErr: any) {
          console.warn('[Supabase DB] searchTenants fallback:', dbErr?.message);
        }
      }

      const results: any[] = [];
      tenantStore.forEach((value, slug) => {
        const json = value.aggregate.toJSON();
        const matchesQuery =
          !q ||
          json.name.toLowerCase().includes(q) ||
          slug.includes(q) ||
          value.teacherName?.toLowerCase().includes(q) ||
          value.specialty?.toLowerCase().includes(q) ||
          value.exam?.toLowerCase().includes(q);

        if (matchesQuery) {
          results.push({
            id: json.id,
            slug: json.slug,
            name: json.name,
            tagline: json.settings.branding.tagline,
            primaryColor: json.settings.branding.primaryColor,
            teacherName: value.teacherName,
            specialty: value.specialty,
            exam: value.exam,
            studentPortalUrl: `http://localhost:3001/${json.slug}`,
          });
        }
      });

      return res.json({
        success: true,
        source: 'memory',
        count: results.length,
        academies: results,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
