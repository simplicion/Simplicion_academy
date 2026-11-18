import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/lib/supabase', () => ({
  getPrisma: () => null,
}));

import {
  TEACHER_SUBSCRIPTION_AMOUNT_INR,
  getTeacherSubscription,
  activateTeacherSubscription,
  deactivateTeacherSubscription,
} from '../src/lib/subscription';
import { One80PayController } from '../src/controllers/one80-pay.controller';

describe('Educator Subscription Gate (₹250/month) for Course Publishing', () => {
  const tenantSlug = 'test-subscription-academy';

  beforeEach(async () => {
    await deactivateTeacherSubscription(tenantSlug);
  });

  it('sets the monthly educator subscription plan strictly to ₹250 INR', async () => {
    expect(TEACHER_SUBSCRIPTION_AMOUNT_INR).toBe(250);

    const status = await getTeacherSubscription(tenantSlug);
    expect(status.isActive).toBe(false);
    expect(status.status).toBe('inactive');
    expect(status.planAmountInr).toBe(250);
    expect(status.interval).toBe('monthly');
  });

  it('activates a 30-day ₹250/month subscription via 180 Pay subscribeTeacher endpoint', async () => {
    const req: any = {
      tenant: { slug: tenantSlug },
      body: {
        tenantSlug,
        teacherName: 'Prof. Ananya Roy',
        email: 'ananya@academy.in',
        paymentMethod: 'upi',
      },
    };

    let statusCode = 200;
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
      json: (b: any) => {
        jsonBody = b;
      },
    };

    await One80PayController.subscribeTeacher(req, res);

    expect(statusCode).toBe(201);
    expect(jsonBody.success).toBe(true);
    expect(jsonBody.subscription.isActive).toBe(true);
    expect(jsonBody.subscription.status).toBe('active');
    expect(jsonBody.subscription.planAmountInr).toBe(250);

    const fetched = await getTeacherSubscription(tenantSlug);
    expect(fetched.isActive).toBe(true);
    expect(fetched.planAmountInr).toBe(250);
    expect(fetched.expiresAt).toBeTruthy();
  });

  it('returns inactive after deactivation so course publishing is blocked until renewed', async () => {
    await activateTeacherSubscription(tenantSlug, {
      subscriptionId: 'sub_test_250',
      paymentMethod: 'upi',
    });
    expect((await getTeacherSubscription(tenantSlug)).isActive).toBe(true);

    await deactivateTeacherSubscription(tenantSlug);
    const after = await getTeacherSubscription(tenantSlug);
    expect(after.isActive).toBe(false);
    expect(after.status).toBe('inactive');
    expect(after.planAmountInr).toBe(250);
  });
});
