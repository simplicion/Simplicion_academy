import { describe, it, expect } from 'vitest';

export interface ImpersonationTokenPayload {
  sessionId: string;
  adminId: string;
  tenantId: string;
  justification: string;
  ticketId?: string;
  issuedAt: number;
  expiresAt: number;
}

export function createAuditedImpersonationSession(
  adminId: string,
  tenantId: string,
  justification: string,
  ticketId?: string
): ImpersonationTokenPayload {
  if (!adminId || !adminId.trim()) {
    throw new Error('Admin identity is required for audited impersonation.');
  }
  if (!tenantId || !tenantId.trim()) {
    throw new Error('Target tenant ID is required.');
  }
  if (!justification || justification.trim().length < 10) {
    throw new Error('SAFS-02 Violation: Justification must be at least 10 characters explaining the support reason.');
  }

  const now = Date.now();
  const ttlMs = 15 * 60 * 1000; // 15 minutes TTL

  return {
    sessionId: `imp_${now}`,
    adminId: adminId.trim(),
    tenantId: tenantId.trim(),
    justification: justification.trim(),
    ticketId: ticketId?.trim(),
    issuedAt: now,
    expiresAt: now + ttlMs,
  };
}

describe('SAFS-02 Audited Impersonation Security Protocol', () => {
  it('creates an audited session with 15-minute expiration when valid reason is provided', () => {
    const session = createAuditedImpersonationSession(
      'admin_master_01',
      'tenant_cuet',
      'Investigating student CBT mock score discrepancy on Unit 1 test',
      'SUP-9988'
    );

    expect(session.sessionId).toContain('imp_');
    expect(session.adminId).toBe('admin_master_01');
    expect(session.tenantId).toBe('tenant_cuet');
    expect(session.justification).toBe('Investigating student CBT mock score discrepancy on Unit 1 test');
    expect(session.ticketId).toBe('SUP-9988');
    expect(session.expiresAt - session.issuedAt).toBe(15 * 60 * 1000);
  });

  it('rejects impersonation requests without mandatory justification', () => {
    expect(() => {
      createAuditedImpersonationSession('admin_master_01', 'tenant_cuet', '');
    }).toThrow('SAFS-02 Violation: Justification must be at least 10 characters');

    expect(() => {
      createAuditedImpersonationSession('admin_master_01', 'tenant_cuet', 'Too short');
    }).toThrow('SAFS-02 Violation: Justification must be at least 10 characters');
  });

  it('rejects impersonation if admin identity or tenant is missing', () => {
    expect(() => {
      createAuditedImpersonationSession('', 'tenant_cuet', 'Valid explanation for debugging issue');
    }).toThrow('Admin identity is required');

    expect(() => {
      createAuditedImpersonationSession('admin_master_01', '', 'Valid explanation for debugging issue');
    }).toThrow('Target tenant ID is required');
  });
});

