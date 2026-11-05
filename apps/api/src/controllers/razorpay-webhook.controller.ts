import { Request, Response } from 'express';
import crypto from 'crypto';
import { OrderAggregate } from '@simplicion/commerce';

export interface RazorpayWebhookEvent {
  event: 'payment.captured' | 'transfer.processed' | 'payment.failed';
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number; // in paise (e.g. 499900 = ₹ 4,999)
        currency: string;
        status: string;
        contact?: string;
        notes?: Record<string, string>;
      };
    };
    transfer?: {
      entity: {
        id: string;
        amount: number;
        status: string;
        recipient: string;
      };
    };
  };
}

export class RazorpayWebhookController {
  private static DEFAULT_SECRET = 'whsec_simplicion_live_2026';
  private static processedEvents = new Set<string>();

  /**
   * Verifies Razorpay HMAC SHA256 Signature
   */
  public static verifySignature(rawBody: string, signature: string, secret?: string): boolean {
    const key = secret || RazorpayWebhookController.DEFAULT_SECRET;
    const expected = crypto.createHmac('sha256', key).update(rawBody).digest('hex');
    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  /**
   * POST /webhooks/razorpay
   * Handles payment.captured and transfer.processed with zero business logic in controller
   */
  public static async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        return res.status(401).json({
          success: false,
          error: 'Missing X-Razorpay-Signature header',
        });
      }

      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const isValid = RazorpayWebhookController.verifySignature(rawBody, signature);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Razorpay webhook signature.',
        });
      }

      const eventData: RazorpayWebhookEvent = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const eventKey = `${eventData.event}_${eventData.payload.payment?.entity.id || eventData.payload.transfer?.entity.id}`;

      // Idempotency check: Skip if already processed
      if (RazorpayWebhookController.processedEvents.has(eventKey)) {
        return res.status(200).json({
          success: true,
          message: 'Webhook event already processed (idempotent skipped).',
          eventId: eventKey,
        });
      }

      RazorpayWebhookController.processedEvents.add(eventKey);

      // Delegate event to domain use cases
      if (eventData.event === 'payment.captured') {
        const payment = eventData.payload.payment!.entity;
        const grossInr = payment.amount / 100;
        const platformFeeInr = Math.round(grossInr * 0.03); // 3% fee
        const teacherPayoutInr = grossInr - platformFeeInr;

        return res.status(200).json({
          success: true,
          event: 'payment.captured',
          orderId: payment.order_id,
          paymentId: payment.id,
          grossInr,
          platformFeeInr,
          teacherPayoutInr,
          accessGranted: true,
        });
      }

      if (eventData.event === 'transfer.processed') {
        const transfer = eventData.payload.transfer!.entity;
        return res.status(200).json({
          success: true,
          event: 'transfer.processed',
          transferId: transfer.id,
          status: 'settled',
        });
      }

      return res.status(200).json({ success: true, event: eventData.event });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
