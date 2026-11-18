import { Request, Response } from 'express';
import { getPrisma } from '../lib/supabase';

const inMemoryLeads: Array<{
  id: string;
  tenantSlug: string;
  categorySlug: string;
  categoryName: string;
  phone: string;
  email?: string;
  createdAt: string;
}> = [];

export class LeadController {
  /**
   * POST /leads
   * Persists "Notify Me on Launch" leads directly into Supabase PostgreSQL
   */
  static async createLead(req: Request, res: Response) {
    try {
      const tenantSlug = (req.body.tenantSlug as string) || req.tenant?.slug || 'cuet-humanities';
      const { categorySlug, categoryName, phone, email } = req.body;

      const cleanPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
      if (cleanPhone.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid 10-digit WhatsApp/mobile number.',
        });
      }

      const prisma = getPrisma();
      if (prisma) {
        try {
          const lead = await prisma.lead.create({
            data: {
              tenantSlug,
              categorySlug: categorySlug || 'general',
              categoryName: categoryName || 'Upcoming Batch',
              phone: cleanPhone,
              email: email || null,
            },
          });

          return res.status(201).json({
            success: true,
            persistedTo: 'supabase',
            lead,
          });
        } catch (dbErr: any) {
          console.warn('[Supabase DB] Lead create fallback:', dbErr?.message);
        }
      }

      const fallbackLead = {
        id: `lead_${Date.now()}`,
        tenantSlug,
        categorySlug: categorySlug || 'general',
        categoryName: categoryName || 'Upcoming Batch',
        phone: cleanPhone,
        email: email || undefined,
        createdAt: new Date().toISOString(),
      };
      inMemoryLeads.unshift(fallbackLead);

      return res.status(201).json({
        success: true,
        persistedTo: 'memory',
        lead: fallbackLead,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /leads
   * Lists captured waitlist leads from Supabase PostgreSQL
   */
  static async listLeads(req: Request, res: Response) {
    try {
      const tenantSlug = (req.query.tenant as string) || req.tenant?.slug || 'cuet-humanities';
      const prisma = getPrisma();

      if (prisma) {
        try {
          const leads = await prisma.lead.findMany({
            where: { tenantSlug },
            orderBy: { createdAt: 'desc' },
            take: 100,
          });
          return res.json({ success: true, source: 'supabase', count: leads.length, leads });
        } catch (dbErr: any) {
          console.warn('[Supabase DB] Lead list fallback:', dbErr?.message);
        }
      }

      return res.json({
        success: true,
        source: 'memory',
        count: inMemoryLeads.length,
        leads: inMemoryLeads,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
