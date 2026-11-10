import { describe, it, expect } from 'vitest';
import { One80IdentityService } from '../src/security/one80-identity.service';
import crypto from 'crypto';

describe('180 Identity Authentication Infrastructure', () => {
  it('correctly binds configured 180 credentials', () => {
    expect(One80IdentityService.CLIENT_ID).toBe('180_client_3f697aec4c406a407979d708780106f0');
    expect(One80IdentityService.CLIENT_SECRET).toBe(
      '180_secret_50e7b13eb02eb99f90cbc8a276ca1fbe9d42b13ac8c485d4823089776b2f7ad9'
    );
    expect(One80IdentityService.WEBHOOK_SECRET).toBe(
      'whsec_ba609675e3da1dcf164914fcfc410f53e8deab8e9756884d'
    );
  });

  it('issues and verifies a 180 Identity session token with cryptographic integrity', () => {
    const token = One80IdentityService.issueToken({
      userId: 'tch_test_180',
      tenantId: 'tenant_maths_01',
      role: 'teacher',
      name: 'Ramanujan Sir',
      email: 'ramanujan@maths.org',
    });

    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3);

    const payload = One80IdentityService.verifyToken(token);
    expect(payload.sub).toBe('tch_test_180');
    expect(payload.tenantId).toBe('tenant_maths_01');
    expect(payload.role).toBe('teacher');
    expect(payload.issuer).toBe('180_identity');
    expect(payload.name).toBe('Ramanujan Sir');
  });

  it('verifies valid 180 webhook signature using HMAC SHA256 and rejects forged payloads', () => {
    const payload = JSON.stringify({
      event: 'user.authenticated',
      userId: 'usr_student_01',
      timestamp: Date.now(),
    });

    const validSignature = crypto
      .createHmac('sha256', One80IdentityService.WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    const isValid = One80IdentityService.verifyWebhookSignature(payload, validSignature);
    expect(isValid).toBe(true);

    const isForged = One80IdentityService.verifyWebhookSignature(payload, 'forged_fake_signature_abc123');
    expect(isForged).toBe(false);
  });
});

