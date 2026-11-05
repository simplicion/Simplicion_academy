import { describe, it, expect } from 'vitest';
import { enforceTenantScope } from '../src';

describe('@simplicion/db Multi-Tenant Security & Isolation', () => {
  it('should automatically inject tenantId into queries without tenantId', () => {
    const query = { title: 'CUET Foundation' };
    const scoped = enforceTenantScope(query, { tenantId: 'tenant-cuet' });

    expect(scoped.tenantId).toBe('tenant-cuet');
    expect(scoped.title).toBe('CUET Foundation');
  });

  it('should allow queries matching the active tenantId', () => {
    const query = { tenantId: 'tenant-cuet', title: 'CUET Foundation' };
    const scoped = enforceTenantScope(query, { tenantId: 'tenant-cuet' });

    expect(scoped.tenantId).toBe('tenant-cuet');
  });

  it('should throw fatal security error on cross-tenant access attempts', () => {
    // Malicious attempt: User in tenant-cuet attempts to read tenant-jee records
    const crossTenantPayload = { tenantId: 'tenant-jee', id: 'off-secret-123' };

    expect(() => {
      enforceTenantScope(crossTenantPayload, { tenantId: 'tenant-cuet' });
    }).toThrow('Cross-Tenant Security Violation');
  });
});

