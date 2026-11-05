import { describe, it, expect } from 'vitest';
import { TenantAggregate } from '@simplicion/tenant';

describe('Platform Super Admin: Tenant Governance & Lifecycle', () => {
  it('creates an institute in draft state and transitions to active upon approval', () => {
    const tenant = TenantAggregate.create(
      'tenant_apex_neet',
      'apex-neet',
      'Apex NEET & Medical Academy',
      'teacher_apex_01',
      'plan_pro'
    );

    expect(tenant.status).toBe('draft');

    // Admin approves onboarding
    tenant.publish();
    expect(tenant.status).toBe('active');
  });

  it('suspends an active tenant when an administrative violation occurs', () => {
    const tenant = TenantAggregate.create(
      'tenant_test',
      'test-academy',
      'Test Academy',
      'teacher_02',
      'plan_starter'
    );
    tenant.publish();
    expect(tenant.status).toBe('active');

    // Admin suspends with mandatory reason
    tenant.suspend('DMCA violation report confirmed');
    expect(tenant.status).toBe('suspended');

    // Suspended tenant cannot be published without resolution
    expect(() => tenant.publish()).toThrow('Suspended tenant cannot be published.');
  });

  it('enforces plan eligibility before attaching custom domain', () => {
    const starterTenant = TenantAggregate.create(
      'tenant_starter',
      'starter-institute',
      'Starter Institute',
      'teacher_03',
      'plan_starter'
    );

    // Starter plan is NOT eligible for custom domain
    expect(() => {
      starterTenant.attachCustomDomain('starteredu.in', false);
    }).toThrow('Custom domains are not available on the current SaaS plan.');

    // Pro plan IS eligible for custom domain
    const proTenant = TenantAggregate.create(
      'tenant_pro',
      'pro-institute',
      'Pro Institute',
      'teacher_04',
      'plan_pro'
    );

    proTenant.attachCustomDomain('cuethumanities.in', true);
    expect(proTenant.customDomain).toBe('cuethumanities.in');
  });
});

