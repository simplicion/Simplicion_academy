import { describe, it, expect } from 'vitest';
import {
  PrismaTenantRepository,
  PrismaOfferingRepository,
  PrismaOrderRepository,
  PrismaUserRepository,
  PrismaAssessmentRepository,
} from '../src/index';
import { generateSeedData } from '../prisma/seed';
import { OrderAggregate } from '@simplicion/commerce';

describe('Hexagonal Prisma Repositories Implementation', () => {
  const seed = generateSeedData();

  describe('PrismaTenantRepository', () => {
    const tenantRepo = new PrismaTenantRepository([seed.tenant]);

    it('finds tenant by ID', async () => {
      const found = await tenantRepo.findById('tenant_cuet_01');
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Humanities CUET Academy');
      expect(found?.status).toBe('active');
    });

    it('finds tenant by slug', async () => {
      const found = await tenantRepo.findBySlug('cuet-humanities');
      expect(found).not.toBeNull();
      expect(found?.slug).toBe('cuet-humanities');
    });

    it('finds tenant by custom domain', async () => {
      const found = await tenantRepo.findByCustomDomain('cuethumanities.in');
      expect(found).not.toBeNull();
      expect(found?.customDomain).toBe('cuethumanities.in');
    });
  });

  describe('PrismaOfferingRepository', () => {
    const offeringRepo = new PrismaOfferingRepository(seed.offerings);
    const tenantId = 'tenant_cuet_01';

    it('finds offering by ID within tenant context', async () => {
      const found = await offeringRepo.findById(tenantId, 'off_cuet_foundation_2027');
      expect(found).not.toBeNull();
      expect(found?.title).toBe('CUET 2027: Humanities Foundation Batch');
      expect(found?.pricing.salePrice).toBe(4999);
    });

    it('finds offering by slug within tenant context', async () => {
      const found = await offeringRepo.findBySlug(tenantId, 'cuet-2027-humanities-foundation');
      expect(found).not.toBeNull();
      expect(found?.slug).toBe('cuet-2027-humanities-foundation');
    });

    it('finds all active offerings for a tenant', async () => {
      const active = await offeringRepo.findActiveByTenant(tenantId);
      expect(active).toHaveLength(2);
    });
  });

  describe('PrismaOrderRepository', () => {
    const tenantId = 'tenant_cuet_01';
    const order = OrderAggregate.create(
      'ord_test_101',
      tenantId,
      'user_101',
      'off_cuet_foundation_2027',
      4999,
      3,
      'rzp_order_live_984'
    );
    const orderRepo = new PrismaOrderRepository([order]);

    it('finds order by ID within tenant context', async () => {
      const found = await orderRepo.findById(tenantId, 'ord_test_101');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('ord_test_101');
      expect(found?.split.grossAmount).toBe(4999);
    });

    it('finds order by Razorpay gateway order ID', async () => {
      const found = await orderRepo.findByGatewayOrderId('rzp_order_live_984');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('ord_test_101');
    });

    it('finds all orders for a specific user within tenant', async () => {
      const userOrders = await orderRepo.findByUserId(tenantId, 'user_101');
      expect(userOrders).toHaveLength(1);
    });
  });

  describe('PrismaUserRepository', () => {
    const userRepo = new PrismaUserRepository([seed.teacher]);
    const tenantId = 'tenant_cuet_01';

    it('finds user by phone within tenant context', async () => {
      const found = await userRepo.findByPhone(tenantId, '+91 98765 43210');
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Dr. Rajesh Varma');
      expect(found?.role).toBe('teacher');
    });
  });

  describe('PrismaAssessmentRepository', () => {
    const assessRepo = new PrismaAssessmentRepository(seed.questions);
    const tenantId = 'tenant_cuet_01';

    it('retrieves questions by unit for tenant', async () => {
      const questions = await assessRepo.findQuestionsByUnit(tenantId, 'harappan-civilisation');
      expect(questions).toHaveLength(1);
      expect(questions[0].prompt).toContain('water reservoirs');
    });

    it('saves and retrieves student CBT scorecard', async () => {
      await assessRepo.saveScorecard({
        testId: 'mock_test_01',
        studentId: 'std_rahul',
        totalQuestions: 25,
        attempted: 24,
        unattempted: 1,
        correct: 22,
        incorrect: 2,
        totalMarks: 86,
        maxMarks: 100,
        accuracyPercent: 92,
        timeTakenSeconds: 1800,
      });

      const retrieved = await assessRepo.getScorecard('std_rahul', 'mock_test_01');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.totalMarks).toBe(86);
      expect(retrieved?.accuracyPercent).toBe(92);
    });
  });
});

