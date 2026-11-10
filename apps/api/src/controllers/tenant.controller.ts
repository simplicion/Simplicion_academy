import { Request, Response } from 'express';
import { TenantAggregate } from '@simplicion/tenant';
import { One80IdentityService } from '../security/one80-identity.service';

// In-memory tenant registry populated with reference institutes
const tenantStore = new Map<string, any>();

// Seed default reference academies for instant discovery
const defaultAcademies = [
  {
    id: 'tenant_cuet_01',
    slug: 'cuet-humanities',
    name: 'Humanities CUET Academy',
    ownerUserId: 'teacher_rajesh_01',
    teacherName: 'Rajesh Sharma',
    specialty: 'CUET UG Humanities & Social Sciences',
    status: 'active',
    tagline: 'Humanities walon, tum kisi se kam nahi!',
    primaryColor: '#2563eb',
    exam: 'CUET',
  },
  {
    id: 'tenant_apex_physics',
    slug: 'apex-physics',
    name: 'Apex Physics Institute',
    ownerUserId: 'teacher_alok_02',
    teacherName: 'Er. Alok Verma',
    specialty: 'JEE Advanced & NEET Physics',
    status: 'active',
    tagline: 'Concept clarity to top 100 rank',
    primaryColor: '#7c3aed',
    exam: 'JEE / NEET',
  },
  {
    id: 'tenant_rankers_commerce',
    slug: 'rankers-commerce',
    name: 'Rankers Commerce Classes',
    ownerUserId: 'teacher_meenakshi_03',
    teacherName: 'CA Meenakshi Sundaram',
    specialty: 'Accountancy, BST & Economics',
    status: 'active',
    tagline: 'Chartered journey starts here',
    primaryColor: '#059669',
    exam: 'Commerce & CA',
  },
  {
    id: 'tenant_chanakya_ias',
    slug: 'chanakya-ias',
    name: 'Chanakya Civil Services Hub',
    ownerUserId: 'teacher_pradeep_04',
    teacherName: 'Dr. Pradeep Mishra',
    specialty: 'UPSC CSE GS Papers & Answer Writing',
    status: 'active',
    tagline: 'Mentoring future civil servants',
    primaryColor: '#b45309',
    exam: 'UPSC',
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
      const tenant = req.tenant;
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'No active tenant identified on this hostname.',
        });
      }

      // Check if present in tenant store
      const record = tenantStore.get(tenant.slug);
      if (record) {
        return res.json({
          success: true,
          data: record.aggregate.toJSON(),
        });
      }

      // Fallback instance
      const tenantAggregate = TenantAggregate.createInstantSelfServe(
        tenant.id,
        tenant.slug,
        tenant.slug === 'cuet' ? 'Humanities CUET Academy' : `${tenant.slug.toUpperCase()} Academy`,
        'usr-owner-1',
        'plan_pro'
      );

      return res.json({
        success: true,
        data: tenantAggregate.toJSON(),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
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

      // Save to store
      tenantStore.set(cleanSlug, {
        aggregate: tenant,
        teacherName,
        specialty: specialty || 'General Academics',
        exam: specialty || 'All Competitive Exams',
      });

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
        message: 'Teacher account & Academy portal created instantly! Welcome to Teacher Studio.',
        tenant: tenant.toJSON(),
        token,
        redirectUrl: `http://localhost:3002/?tenantId=${tenantId}&slug=${cleanSlug}&teacher=${encodeURIComponent(teacherName)}`,
        studentPortalUrl: `http://localhost:3001/?tenant=${cleanSlug}`,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /tenants/search
   * Live search query for student portal discovery
   */
  static async searchTenants(req: Request, res: Response) {
    try {
      const q = (req.query.q as string || '').toLowerCase().trim();

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
            studentPortalUrl: `http://localhost:3001/?tenant=${json.slug}`,
          });
        }
      });

      return res.json({
        success: true,
        count: results.length,
        academies: results,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
