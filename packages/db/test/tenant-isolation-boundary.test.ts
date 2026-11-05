import { describe, it, expect } from 'vitest';
import {
  PrismaOfferingRepository,
  PrismaOrderRepository,
  PrismaAssessmentRepository,
} from '../src/index';
import { generateSeedData } from '../prisma/seed';
import { OrderAggregate } from '@simplicion/commerce';

describe('SAFS-02 Multi-Tenant Query & Mutation Isolation Boundaries', () => {
  const seed = generateSeedData();
  const tenantA = 'tenant_cuet_01'; // Humanities CUET Academy
  const tenantB = 'tenant_apex_02'; // Apex NEET Academy (Alien Tenant)

  it('prohibits reading an offering belonging to Tenant A using Tenant B context', async () => {
    const offeringRepo = new PrismaOfferingRepository(seed.offerings);

    // Tenant A accessing own batch succeeds
    const ownBatch = await offeringRepo.findById(tenantA, 'off_cuet_foundation_2027');
    expect(ownBatch).not.toBeNull();

    // Tenant B attempting to access Tenant A batch MUST throw hard security error
    await expect(
      offeringRepo.findById(tenantB, 'off_cuet_foundation_2027')
    ).rejects.toThrow('Cross-Tenant Security Violation');
  });

  it('prohibits reading an order belonging to Tenant A under Tenant B context', async () => {
    const order = OrderAggregate.create(
      'ord_private_88',
      tenantA,
      'user_101',
      'off_cuet_foundation_2027',
      4999
    );
    const orderRepo = new PrismaOrderRepository([order]);

    // Access under Tenant B context throws security violation
    await expect(
      orderRepo.findById(tenantB, 'ord_private_88')
    ).rejects.toThrow('Cross-Tenant Security Violation');
  });

  it('prohibits deleting an offering across tenant boundaries', async () => {
    const offeringRepo = new PrismaOfferingRepository(seed.offerings);

    // Tenant B attempting to delete Tenant A batch throws security violation
    await expect(
      offeringRepo.delete(tenantB, 'off_cuet_foundation_2027')
    ).rejects.toThrow('Cross-Tenant Security Violation');
  });

  it('prohibits fetching assessment questions across tenant boundaries', async () => {
    const assessRepo = new PrismaAssessmentRepository(seed.questions);

    // Tenant B attempting to inspect Tenant A question throws security violation
    await expect(
      assessRepo.findQuestionById(tenantB, 'q_seed_01')
    ).rejects.toThrow('Cross-Tenant Security Violation');
  });
});

