import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { RazorpayWebhookController } from '../src/controllers/razorpay-webhook.controller';

function createMockReqRes(body: any, headers: Record<string, string> = {}) {
  let statusCode = 200;
  let responseData: any = null;

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = data;
      return res;
    },
  };

  const req: any = {
    body,
    headers,
  };

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getResponseData: () => responseData,
  };
}

describe('Razorpay Route Split Payment Webhook Controller', () => {
  const webhookSecret = 'whsec_simplicion_live_2026';

  function signPayload(payloadStr: string): string {
    return crypto.createHmac('sha256', webhookSecret).update(payloadStr).digest('hex');
  }

  it('verifies valid HMAC SHA256 signature and grants batch access with 3% fee split', async () => {
    const eventPayload = {
      event: 'payment.captured' as const,
      payload: {
        payment: {
          entity: {
            id: 'pay_rzp_live_98124',
            order_id: 'order_cuet_live_101',
            amount: 499900, // ₹ 4,999 in paise
            currency: 'INR',
            status: 'captured',
            contact: '+919876543210',
          },
        },
      },
    };

    const payloadStr = JSON.stringify(eventPayload);
    const signature = signPayload(payloadStr);

    const { req, res, getStatusCode, getResponseData } = createMockReqRes(eventPayload, {
      'x-razorpay-signature': signature,
    });

    await RazorpayWebhookController.handleWebhook(req, res);

    expect(getStatusCode()).toBe(200);
    const data = getResponseData();
    expect(data.success).toBe(true);
    expect(data.event).toBe('payment.captured');
    expect(data.grossInr).toBe(4999);
    expect(data.platformFeeInr).toBe(150); // 3% of 4999 = 150
    expect(data.teacherPayoutInr).toBe(4849);
    expect(data.accessGranted).toBe(true);
  });

  it('rejects forged webhook request with invalid signature (HTTP 401)', async () => {
    const fakePayload = {
      event: 'payment.captured' as const,
      payload: {
        payment: {
          entity: {
            id: 'pay_fake_01',
            order_id: 'order_fake_01',
            amount: 99900,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    };

    const { req, res, getStatusCode, getResponseData } = createMockReqRes(fakePayload, {
      'x-razorpay-signature': 'bad_forged_hex_signature_abcdef1234567890',
    });

    await RazorpayWebhookController.handleWebhook(req, res);

    expect(getStatusCode()).toBe(401);
    const data = getResponseData();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid Razorpay webhook signature');
  });

  it('rejects requests missing the X-Razorpay-Signature header (HTTP 401)', async () => {
    const payload = { event: 'payment.captured' as const, payload: {} };

    const { req, res, getStatusCode, getResponseData } = createMockReqRes(payload, {});

    await RazorpayWebhookController.handleWebhook(req, res);

    expect(getStatusCode()).toBe(401);
    const data = getResponseData();
    expect(data.error).toContain('Missing X-Razorpay-Signature header');
  });

  it('handles duplicate webhook delivery idempotently without double-processing', async () => {
    const payload = {
      event: 'payment.captured' as const,
      payload: {
        payment: {
          entity: {
            id: 'pay_duplicate_test_888',
            order_id: 'order_duplicate_test_888',
            amount: 199900,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    };
    const payloadStr = JSON.stringify(payload);
    const signature = signPayload(payloadStr);

    // First delivery
    const mock1 = createMockReqRes(payload, { 'x-razorpay-signature': signature });
    await RazorpayWebhookController.handleWebhook(mock1.req, mock1.res);
    expect(mock1.getStatusCode()).toBe(200);
    expect(mock1.getResponseData().accessGranted).toBe(true);

    // Second delivery (replay)
    const mock2 = createMockReqRes(payload, { 'x-razorpay-signature': signature });
    await RazorpayWebhookController.handleWebhook(mock2.req, mock2.res);
    expect(mock2.getStatusCode()).toBe(200);
    expect(mock2.getResponseData().message).toContain('idempotent skipped');
  });
});
