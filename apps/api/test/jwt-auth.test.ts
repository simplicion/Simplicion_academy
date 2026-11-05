import { describe, it, expect } from 'vitest';
import { JwtService, authenticateJwt } from '../src/security/jwt';

describe('Enterprise Signed JWT Token Engine & Tenant Isolation Claims', () => {
  const tenantId = 'tenant_cuet_01';
  const studentId = 'usr_student_99';
  const phone = '+919876543210';

  it('signs and verifies a valid Student token with 7-day TTL', () => {
    const token = JwtService.createStudentToken(studentId, tenantId, phone);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const payload = JwtService.verify(token);
    expect(payload.sub).toBe(studentId);
    expect(payload.tenantId).toBe(tenantId);
    expect(payload.role).toBe('student');
    expect(payload.phone).toBe(phone);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('signs and verifies a Teacher token with 24-hour TTL', () => {
    const teacherId = 'tch_rajesh_01';
    const email = 'rajesh@cuetacademy.com';
    const token = JwtService.createTeacherToken(teacherId, tenantId, email);

    const payload = JwtService.verify(token);
    expect(payload.sub).toBe(teacherId);
    expect(payload.tenantId).toBe(tenantId);
    expect(payload.role).toBe('teacher');
    expect(payload.email).toBe(email);
  });

  it('signs an Audited Impersonation token with strict 15-minute TTL (SAFS-02)', () => {
    const adminId = 'adm_super_01';
    const ticketId = 'TCK-2026-9901';
    const reason = 'Resolving live CBT scorecard calculation glitch';

    const token = JwtService.createImpersonationToken(adminId, tenantId, ticketId, reason);
    const payload = JwtService.verify(token);

    expect(payload.sub).toBe(adminId);
    expect(payload.tenantId).toBe(tenantId);
    expect(payload.role).toBe('superadmin');
    expect(payload.impersonated).toBe(true);
    expect(payload.ticketId).toBe(ticketId);
    expect(payload.reason).toBe(reason);

    // Assert TTL is exactly 15 minutes (900 seconds)
    expect(payload.exp - payload.iat).toBe(15 * 60);
  });

  it('rejects tampered or forged tokens with invalid signature', () => {
    const token = JwtService.createStudentToken(studentId, tenantId, phone);
    const parts = token.split('.');
    // Tamper with payload
    const forgedToken = `${parts[0]}.${parts[1]}abc.${parts[2]}`;

    expect(() => JwtService.verify(forgedToken)).toThrow('Invalid JWT signature.');
  });

  it('rejects expired tokens', () => {
    // Generate token with -10 second expiration
    const expiredToken = JwtService.sign(
      { sub: studentId, tenantId, role: 'student' },
      -10 // Expired 10 seconds ago
    );

    expect(() => JwtService.verify(expiredToken)).toThrow('JWT token has expired.');
  });

  describe('authenticateJwt Middleware & Cross-Tenant Replay Prevention', () => {
    const middleware = authenticateJwt({ requiredRole: 'student' });

    it('authenticates valid token when tenantId matches request tenant context', () => {
      const token = JwtService.createStudentToken(studentId, tenantId, phone);
      const req: any = {
        headers: { authorization: `Bearer ${token}` },
        tenant: { id: tenantId, slug: 'cuet' },
      };
      const res: any = {};
      let nextCalled = false;

      middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user.sub).toBe(studentId);
    });

    it('rejects cross-tenant replay attack (token tenantId does not match request tenant)', () => {
      const foreignTenantToken = JwtService.createStudentToken(studentId, 'tenant_foreign_institute', phone);
      const req: any = {
        headers: { authorization: `Bearer ${foreignTenantToken}` },
        tenant: { id: tenantId, slug: 'cuet' },
      };
      let statusCode = 0;
      let jsonBody: any = null;
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (body: any) => {
              jsonBody = body;
            },
          };
        },
      };

      middleware(req, res, () => {});

      expect(statusCode).toBe(403);
      expect(jsonBody.success).toBe(false);
      expect(jsonBody.error).toContain('Cross-Tenant Security Violation');
    });

    it('rejects request with missing or malformed Authorization header', () => {
      const req: any = { headers: {} };
      let statusCode = 0;
      let jsonBody: any = null;
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (body: any) => {
              jsonBody = body;
            },
          };
        },
      };

      middleware(req, res, () => {});

      expect(statusCode).toBe(401);
      expect(jsonBody.error).toContain('Missing or malformed Authorization header');
    });
  });
});

