import { Request, Response } from 'express';
import { OfferingAggregate } from '@simplicion/catalog';

export class CatalogController {
  /**
   * GET /offerings
   * Returns offerings filtered by tenant
   */
  static async getOfferings(req: Request, res: Response) {
    try {
      const tenant = req.tenant;
      if (!tenant) {
        return res.status(404).json({ success: false, error: 'Tenant context required.' });
      }

      // Seed reference offerings if CUET tenant (PRD Section 9)
      const foundationOffering = OfferingAggregate.create(
        'off-cuet-01',
        tenant.id,
        'cat-cuet',
        'CUET UG Foundation Batch 2027',
        'cuet-ug-foundation-2027',
        'batch',
        'Comprehensive bilingual preparation for CUET UG with full syllabus coverage and CBT mocks.',
        {
          mrp: 8000,
          salePrice: 4000,
          currency: 'INR',
        },
        'bilingual'
      );
      foundationOffering.addFeature('video', 'Daily Interactive Live & Recorded Classes');
      foundationOffering.addFeature('file-text', 'Chapter-wise Notes & Mindmaps');
      foundationOffering.addFeature('award', 'Sunday Full-Length CBT Mock Tests');
      foundationOffering.addUnit('English', 'english');
      foundationOffering.addUnit('Political Science', 'pol-science');
      foundationOffering.addUnit('History', 'history');
      foundationOffering.addUnit('General Aptitude Test (GAT)', 'gat');
      foundationOffering.publish();

      const crashCourseOffering = OfferingAggregate.create(
        'off-cuet-02',
        tenant.id,
        'cat-cuet',
        'CUET UG Crash Course 2027',
        'cuet-ug-crash-course-2027',
        'course',
        'High-intensity revision batch with fast-track syllabus booster.',
        {
          mrp: 3500,
          salePrice: 0, // Free for Foundation via Entitlement
          currency: 'INR',
        },
        'bilingual'
      );
      crashCourseOffering.publish();

      return res.json({
        success: true,
        data: [foundationOffering.toJSON(), crashCourseOffering.toJSON()],
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

