import { Request, Response } from 'express';
import { TenantAggregate } from '@simplicion/tenant';

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

      // In production, loaded from database via repository.
      // For demonstration and reference testing, initialized with reference data:
      const tenantAggregate = TenantAggregate.create(
        tenant.id,
        tenant.slug,
        tenant.slug === 'cuet' ? 'Humanities CUET Academy' : `${tenant.slug.toUpperCase()} Academy`,
        'usr-owner-1',
        'plan-pro',
        tenant.slug === 'cuet'
          ? {
              branding: {
                tagline: 'Humanities walon, tum kisi se kam nahi',
                primaryColor: '#1e3a8a',
                accentColor: '#f59e0b',
                borderRadius: 'lg',
                fontFamily: 'Noto Sans Devanagari',
                headerLayout: 'login-left',
              },
              labels: {
                studyEntry: 'Study',
                unitsHeader: "Let's Study",
                offeringName: 'Batch',
              },
            }
          : undefined
      );

      return res.json({
        success: true,
        data: tenantAggregate.toJSON(),
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

