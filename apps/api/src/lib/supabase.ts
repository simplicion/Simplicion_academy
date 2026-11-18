import path from 'path';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseContext } from '@supabase/server';
import { PrismaClient } from '@prisma/client';

// Load monorepo root .env so Supabase, Prisma, and 180 Suite credentials are always available
dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), quiet: true });
dotenv.config({ quiet: true });

export const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://fzogbyhgufiaywcctjkp.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_fPvXzQwl8w7V0T1Z1jmtNw_YDsTBC_u';

export const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SECRET_KEY.includes('•')
    ? process.env.SUPABASE_SECRET_KEY
    : '';

export const SUPABASE_JWKS_URL =
  process.env.SUPABASE_JWKS_URL || `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`;

export const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || process.env.STORAGE_BUCKET || 'simplicion-academy-assets';

let cachedSupabase: SupabaseClient | null = null;

/**
 * Returns a configured @supabase/supabase-js client (uses secret key if available, else publishable key).
 */
export function getSupabaseClient(): SupabaseClient {
  if (!cachedSupabase) {
    cachedSupabase = createClient(
      SUPABASE_URL,
      SUPABASE_SECRET_KEY || SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return cachedSupabase;
}

/**
 * Creates a @supabase/server context for request-scoped Supabase operations & JWT verification.
 */
export function getSupabaseServerContext() {
  return createSupabaseContext({
    supabaseUrl: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
    ...(SUPABASE_SECRET_KEY ? { secretKey: SUPABASE_SECRET_KEY } : {}),
    jwksUrl: SUPABASE_JWKS_URL,
  } as any);
}

const globalForPrisma = globalThis as unknown as { __simplicionPrisma?: PrismaClient };

export function isSupabaseDbEnabled(): boolean {
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
    return false;
  }
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.'));
}

/**
 * Singleton PrismaClient connected directly to Supabase PostgreSQL.
 */
export function getPrisma(): PrismaClient | null {
  if (!isSupabaseDbEnabled()) {
    return null;
  }
  if (!globalForPrisma.__simplicionPrisma) {
    globalForPrisma.__simplicionPrisma = new PrismaClient({
      log: ['error'],
    });
  }
  return globalForPrisma.__simplicionPrisma;
}

/**
 * Ensures baseline Plans, Reference Tenant, and Supabase Realtime publication are initialized
 * in Supabase PostgreSQL on API startup.
 */
let liveClassesSchemaReady = false;

export async function ensureLiveClassesSchema(prismaClient?: PrismaClient | null): Promise<void> {
  if (liveClassesSchemaReady) return;
  const prisma = prismaClient || getPrisma();
  if (!prisma) return;

  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "LiveSession" ADD COLUMN IF NOT EXISTS "subjectTitle" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "LiveSession" ADD COLUMN IF NOT EXISTS "topicId" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "LiveSession" ADD COLUMN IF NOT EXISTS "topicTitle" TEXT`
    );
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LiveSessionAttendance" (
        "id" TEXT PRIMARY KEY,
        "sessionId" TEXT NOT NULL REFERENCES "LiveSession"("id") ON DELETE CASCADE,
        "courseId" TEXT NOT NULL,
        "tenantSlug" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "studentName" TEXT NOT NULL,
        "studentEmail" TEXT,
        "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "LiveSessionAttendance_sessionId_studentId_key" UNIQUE ("sessionId", "studentId")
      )
    `);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "LiveSessionAttendance_sessionId_idx" ON "LiveSessionAttendance"("sessionId")`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "LiveSessionAttendance_tenantSlug_idx" ON "LiveSessionAttendance"("tenantSlug")`
    );
    liveClassesSchemaReady = true;
  } catch (err: any) {
    console.warn('[Supabase DB] ensureLiveClassesSchema warning:', err?.message);
  }
}

export async function bootstrapSupabaseDatabase(): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    await prisma.plan.upsert({
      where: { slug: 'plan_pro' },
      update: {},
      create: {
        id: 'plan_pro',
        name: 'Pro Academy',
        slug: 'plan_pro',
        maxStudents: 5000,
        storageGb: 100,
        staffSeats: 10,
        customDomain: true,
        transactionFee: 5.0,
      },
    });

    await prisma.plan.upsert({
      where: { slug: 'plan_starter_free' },
      update: {},
      create: {
        id: 'plan_starter_free',
        name: 'Starter Free',
        slug: 'plan_starter_free',
        maxStudents: 250,
        storageGb: 10,
        staffSeats: 2,
        customDomain: false,
        transactionFee: 5.0,
      },
    });

    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: 'cuet-humanities' },
      include: { settings: true },
    });

    if (!existingTenant) {
      await prisma.tenant.create({
        data: {
          id: 'tenant_cuet_01',
          slug: 'cuet-humanities',
          name: 'Learnings Simplicion',
          status: 'active',
          planId: 'plan_pro',
          ownerUserId: 'teacher_owner_01',
          settings: {
            create: {
              branding: {
                tagline: 'Structured online courses, interactive live classes, and direct educator support.',
                primaryColor: '#2563eb',
                accentColor: '#1d4ed8',
                borderRadius: 'md',
                fontFamily: "'Inter', sans-serif",
                headerLayout: 'login-right',
              },
              labels: {
                studyEntry: 'Study',
                unitsHeader: "Let's Study",
                offeringName: 'Course',
              },
              sectionsOrder: ['hero', 'upcoming-slider', 'categories', 'why-us', 'faq'],
              enabledModules: {
                doubtSupport: true,
                mentorship: true,
                whatsappCommunity: true,
                advisoryTools: false,
              },
              contact: {},
              seo: {
                titleTemplate: 'Learnings Simplicion | Online Academy',
                metaDescription:
                  'Structured online courses, interactive live classes, and direct educator support.',
                keywords: ['online courses', 'live classes'],
              },
            },
          },
        },
      });
      console.log('[Supabase DB] Bootstrapped default tenant in Supabase PostgreSQL.');
    }

    // Ensure LiveSession topic columns & LiveSessionAttendance table exist
    await ensureLiveClassesSchema(prisma);

    // Enable Supabase Realtime broadcasts for live storefront, live classes, attendance, chat, doubts & notifications
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
        tbl text;
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
          FOREACH tbl IN ARRAY ARRAY[
            'Tenant',
            'TenantSettings',
            'StudioCourse',
            'CourseEnrollment',
            'LiveSession',
            'LiveSessionAttendance',
            'CourseChatMessage',
            'CourseDoubt',
            'StudentNotification',
            'CourseTest',
            'CourseTestQuestion'
          ]
          LOOP
            IF EXISTS (
              SELECT 1 FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name = tbl
            ) AND NOT EXISTS (
              SELECT 1 FROM pg_publication_tables
              WHERE pubname = 'supabase_realtime' AND tablename = tbl
            ) THEN
              EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
            END IF;
          END LOOP;
        END IF;
      END $$;
    `);

    // Grant read access on public/realtime tables so Supabase browser client & Realtime can subscribe
    await prisma.$executeRawUnsafe(`
      GRANT SELECT ON TABLE
        "Tenant",
        "TenantSettings",
        "StudioCourse",
        "CourseEnrollment",
        "LiveSession",
        "LiveSessionAttendance",
        "CourseChatMessage",
        "CourseDoubt",
        "StudentNotification",
        "CourseTest",
        "CourseTestQuestion"
      TO anon, authenticated;
    `);

    // Ensure RLS SELECT policies & REPLICA IDENTITY FULL exist on all Realtime tables
    // (Mutations remain strictly locked to server-side Express API / service role)
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
        tbl text;
        pol text;
      BEGIN
        FOREACH tbl IN ARRAY ARRAY[
          'Tenant',
          'TenantSettings',
          'StudioCourse',
          'CourseEnrollment',
          'LiveSession',
          'LiveSessionAttendance',
          'CourseChatMessage',
          'CourseDoubt',
          'StudentNotification',
          'CourseTest',
          'CourseTestQuestion'
        ]
        LOOP
          IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
          ) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', tbl);
            pol := 'simplicion_realtime_read_' || lower(tbl);
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies
              WHERE schemaname = 'public' AND tablename = tbl AND policyname = pol
            ) THEN
              EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
                pol,
                tbl
              );
            END IF;
          END IF;
        END LOOP;
      END $$;
    `);

    // Ensure Supabase Storage bucket & CDN policies exist for course banners & academy media
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        '${SUPABASE_STORAGE_BUCKET.replace(/'/g, "''")}',
        '${SUPABASE_STORAGE_BUCKET.replace(/'/g, "''")}',
        true,
        5242880,
        ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif']
      )
      ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 5242880,
        allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif'];
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'simplicion_assets_public_read'
        ) THEN
          CREATE POLICY simplicion_assets_public_read
            ON storage.objects FOR SELECT
            TO anon, authenticated
            USING (bucket_id = '${SUPABASE_STORAGE_BUCKET.replace(/'/g, "''")}');
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'simplicion_assets_tenant_insert'
        ) THEN
          CREATE POLICY simplicion_assets_tenant_insert
            ON storage.objects FOR INSERT
            TO anon, authenticated
            WITH CHECK (
              bucket_id = '${SUPABASE_STORAGE_BUCKET.replace(/'/g, "''")}'
              AND name LIKE 'tenants/%'
            );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'simplicion_assets_tenant_update'
        ) THEN
          CREATE POLICY simplicion_assets_tenant_update
            ON storage.objects FOR UPDATE
            TO anon, authenticated
            USING (
              bucket_id = '${SUPABASE_STORAGE_BUCKET.replace(/'/g, "''")}'
              AND name LIKE 'tenants/%'
            );
        END IF;
      END $$;
    `);

    console.log('[Supabase DB] Connected, RLS + Realtime + Storage CDN initialized.');

    // Auto-migrate any oversized base64 data:image/* banners/logos to Supabase Storage CDN
    await migrateBase64ImagesToStorage(prisma);
  } catch (err: any) {
    console.warn('[Supabase DB] Bootstrap warning:', err?.message || err);
  }
}

async function uploadDataUrlToStorage(pathKey: string, dataUrl: string): Promise<string | null> {
  try {
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!matches) return null;
    const contentType = matches[1];
    const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'webp';
    const buffer = Buffer.from(matches[2], 'base64');
    const supabase = getSupabaseClient();
    const fullPath = `${pathKey}.${ext}`;
    const { error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(fullPath, buffer, { contentType, cacheControl: '31536000', upsert: true });
    if (error) return null;
    const { data: pub } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(fullPath);
    return pub?.publicUrl || null;
  } catch {
    return null;
  }
}

export async function migrateBase64ImagesToStorage(prismaClient?: PrismaClient | null): Promise<void> {
  const prisma = prismaClient || getPrisma();
  if (!prisma) return;
  try {
    const coursesWithBase64 = await prisma.studioCourse.findMany({
      where: { bannerUrl: { startsWith: 'data:image/' } },
      select: { id: true, tenantSlug: true, bannerUrl: true },
    });
    for (const c of coursesWithBase64) {
      if (!c.bannerUrl) continue;
      const cdnUrl = await uploadDataUrlToStorage(
        `tenants/${c.tenantSlug}/courses/${c.id}/banner_${Date.now()}`,
        c.bannerUrl
      );
      if (cdnUrl) {
        await prisma.studioCourse.update({
          where: { id: c.id },
          data: { bannerUrl: cdnUrl },
        });
        console.log(`[Supabase CDN] Migrated base64 banner for course "${c.id}" -> CDN URL`);
      }
    }

    const allSettings = await prisma.tenantSettings.findMany({
      include: { tenant: { select: { slug: true } } },
    });
    for (const s of allSettings) {
      const branding = ((s.branding as Record<string, any>) || {});
      let changed = false;
      const slug = s.tenant?.slug || 'default';

      for (const field of ['logoUrl', 'bannerUrl']) {
        if (typeof branding[field] === 'string' && branding[field].startsWith('data:image/')) {
          const cdnUrl = await uploadDataUrlToStorage(
            `tenants/${slug}/site/${field}_${Date.now()}`,
            branding[field]
          );
          if (cdnUrl) {
            branding[field] = cdnUrl;
            changed = true;
          }
        }
      }

      if (
        typeof branding.websiteContent?.hero?.heroImageUrl === 'string' &&
        branding.websiteContent.hero.heroImageUrl.startsWith('data:image/')
      ) {
        const cdnUrl = await uploadDataUrlToStorage(
          `tenants/${slug}/site/hero_${Date.now()}`,
          branding.websiteContent.hero.heroImageUrl
        );
        if (cdnUrl) {
          branding.websiteContent.hero.heroImageUrl = cdnUrl;
          changed = true;
        }
      }

      if (changed) {
        await prisma.tenantSettings.update({
          where: { id: s.id },
          data: { branding: branding as any },
        });
        console.log(`[Supabase CDN] Migrated base64 site assets for tenant "${slug}" -> CDN URL`);
      }
    }
  } catch (err: any) {
    console.warn('[Supabase CDN] Base64 migration warning (non-fatal):', err?.message);
  }
}
