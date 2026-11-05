import { describe, it, expect } from 'vitest';
import { TenantAggregate } from '../src';

describe('@simplicion/domain-tenant DDD Invariants', () => {
  it('should create a valid tenant aggregate in draft state', () => {
    const tenant = TenantAggregate.create(
      'tenant-cuet-01',
      'cuet-prep',
      'CUET Prep Academy',
      'usr-01',
      'plan-pro'
    );

    expect(tenant.id).toBe('tenant-cuet-01');
    expect(tenant.slug).toBe('cuet-prep');
    expect(tenant.status).toBe('draft');
    expect(tenant.settings.labels.studyEntry).toBe('Study');
  });

  it('should reject invalid slug characters', () => {
    expect(() => {
      TenantAggregate.create('t-1', 'CUET Prep!', 'Name', 'u-1', 'p-1');
    }).toThrow('Invalid slug format');
  });

  it('should reject reserved system slugs', () => {
    expect(() => {
      TenantAggregate.create('t-1', 'admin', 'Name', 'u-1', 'p-1');
    }).toThrow('The slug "admin" is reserved by the platform.');
  });

  it('should transition to active upon publishing', () => {
    const tenant = TenantAggregate.create('t-1', 'cuet', 'Name', 'u-1', 'p-1');
    tenant.publish();
    expect(tenant.status).toBe('active');
  });

  it('should enforce SaaS plan gating when attaching a custom domain', () => {
    const tenant = TenantAggregate.create('t-1', 'cuet', 'Name', 'u-1', 'p-1');

    // Free tier not eligible
    expect(() => {
      tenant.attachCustomDomain('mycoaching.com', false);
    }).toThrow('Custom domains are not available on the current SaaS plan');

    // Pro tier eligible
    tenant.attachCustomDomain('mycoaching.com', true);
    expect(tenant.customDomain).toBe('mycoaching.com');
  });
});

