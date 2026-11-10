import { describe, it, expect } from 'vitest';
import { One80PayController } from '../src/controllers/one80-pay.controller';
import { One80IdentityService } from '../src/security/one80-identity.service';
import crypto from 'crypto';

describe('180 Pay Payment & Automated Split Settlement Engine', () => {
  const tenant = { id: 'tenant_cuet_01', slug: 'cuet-humanities' };

  it('creates an order with automated 95% teacher and 5% platform split', async () => {
    const grossAmount = 10000; // INR
    const req: any = {
      tenant,
      body: {
        offeringId: 'off_cuet_foundation_2027',
        grossAmount,
        studentName: 'Sneha Patel',
        studentPhone: '+919876543210',
      },
    };

    let jsonBody: any = null;
    const res: any = {
      json: (b: any) => {
        jsonBody = b;
      },
    };

    await One80PayController.createOrder(req, res);

    expect(jsonBody.success).toBe(true);
    expect(jsonBody.orderId).toContain('180_ord_');
    expect(jsonBody.amount).toBe(10000);
    expect(jsonBody.splits.teacherPayout).toBe(9500); // 95%
    expect(jsonBody.splits.platformFee).toBe(500); // 5%
    expect(jsonBody.clientId).toBe(One80IdentityService.CLIENT_ID);
  });

  it('verifies and processes incoming 180 Pay payment webhook', async () => {
    const orderId = `180_ord_test_${Date.now()}`;
    const webhookPayload = {
      event: 'payment.success',
      data: {
        orderId,
        transactionId: '180_txn_999201',
        amount: 4999,
      },
    };

    const rawBody = JSON.stringify(webhookPayload);
    const validSignature = crypto
      .createHmac('sha256', One80IdentityService.WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const req: any = {
      headers: {
        'x-180-signature': validSignature,
      },
      body: webhookPayload,
    };

    let jsonBody: any = null;
    const res: any = {
      json: (b: any) => {
        jsonBody = b;
      },
      status: () => ({ json: (b: any) => { jsonBody = b; } }),
    };

    await One80PayController.handleWebhook(req, res);

    expect(jsonBody.success).toBe(true);
    expect(jsonBody.receivedEvent).toBe('payment.success');
  });

  it('rejects 180 Pay webhooks with missing or forged signature', async () => {
    const req: any = {
      headers: {
        'x-180-signature': 'forged_fake_sig',
      },
      body: { event: 'payment.success' },
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

    await One80PayController.handleWebhook(req, res);

    expect(statusCode).toBe(400);
    expect(jsonBody.error).toContain('Invalid 180 Pay webhook signature');
  });
});
