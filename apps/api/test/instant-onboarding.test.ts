import { describe, it, expect } from 'vitest';
import { TenantController } from '../src/controllers/tenant.controller';
import { One80IdentityService } from '../src/security/one80-identity.service';

describe('Instant Self-Serve Teacher Onboarding (Zero-Approval Gate)', () => {
  it('instantly provisions an active tenant without admin approval delay', async () => {
    const slug = `maths-mastery-${Date.now()}`;
    const req: any = {
      body: {
        teacherName: 'Dr. Anand Kumar',
        email: 'anand@super30.org',
        phone: '+919876543210',
        academyName: 'Super 30 Mathematics Academy',
        slug,
        specialty: 'JEE Advanced Mathematics',
        primaryColor: '#2563eb',
      },
    };

    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (b: any) => {
            jsonBody = b;
          },
        };
      },
    };

    await TenantController.onboardInstant(req, res);

    expect(statusCode).toBe(201);
    expect(jsonBody.success).toBe(true);
    expect(jsonBody.tenant).toBeDefined();
    expect(jsonBody.tenant.status).toBe('active'); // Must be active immediately!
    expect(jsonBody.tenant.name).toBe('Super 30 Mathematics Academy');
    expect(jsonBody.redirectUrl).toContain('http://localhost:3002');
    expect(jsonBody.token).toBeDefined();

    // Verify token issued by 180 Identity
    const verifiedToken = One80IdentityService.verifyToken(jsonBody.token);
    expect(verifiedToken.role).toBe('teacher');
    expect(verifiedToken.issuer).toBe('180_identity');
    expect(verifiedToken.name).toBe('Dr. Anand Kumar');
  });

  it('rejects duplicate subdomain requests with HTTP 409 conflict', async () => {
    const req: any = {
      body: {
        teacherName: 'Duplicate Instructor',
        email: 'dup@academy.com',
        academyName: 'Humanities Clone',
        slug: 'cuet-humanities', // already seeded!
      },
    };

    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: (b: any) => { jsonBody = b; } };
      },
    };

    await TenantController.onboardInstant(req, res);
    expect(statusCode).toBe(409);
    expect(jsonBody.error).toContain('already taken');
  });

  it('rejects onboarding request when required fields are missing', async () => {
    const req: any = {
      body: {
        teacherName: '',
        academyName: 'Missing Name',
      },
    };

    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: (b: any) => { jsonBody = b; } };
      },
    };

    await TenantController.onboardInstant(req, res);
    expect(statusCode).toBe(400);
    expect(jsonBody.error).toContain('required');
  });
});
