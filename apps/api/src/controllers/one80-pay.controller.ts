import { Request, Response } from 'express';
import { One80IdentityService } from '../security/one80-identity.service';
import { OrderAggregate } from '@simplicion/commerce';

// In-memory demo store for 180 Pay orders
const one80Orders = new Map<string, any>();

export class One80PayController {
  /**
   * POST /pay/180/create-order
   * Creates an order with automated 95/5 teacher/platform split powered by 180 Pay
   */
  static async createOrder(req: Request, res: Response) {
    try {
      const tenant = req.tenant;
      if (!tenant) {
        return res.status(404).json({ success: false, error: 'Tenant context required.' });
      }

      const { offeringId, grossAmount, studentName, studentPhone, studentEmail } = req.body;

      if (!offeringId) {
        return res.status(400).json({ success: false, error: 'Offering ID is required.' });
      }
      if (!grossAmount || typeof grossAmount !== 'number' || grossAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid gross amount is required.' });
      }

      // Compute standard 95% Teacher / 5% Simplicion Platform Split
      const platformFee = Math.round(grossAmount * 0.05);
      const teacherPayout = grossAmount - platformFee;

      const orderId = `180_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const orderPayload = {
        orderId,
        tenantId: tenant.id,
        offeringId,
        amount: grossAmount,
        currency: 'INR',
        status: 'created',
        splits: {
          teacherPayout,
          platformFee,
        },
        student: {
          name: studentName || 'Student',
          phone: studentPhone || '',
          email: studentEmail || '',
        },
        clientId: One80IdentityService.CLIENT_ID,
        createdAt: new Date().toISOString(),
      };

      one80Orders.set(orderId, orderPayload);

      return res.json({
        success: true,
        orderId,
        amount: grossAmount,
        currency: 'INR',
        splits: {
          teacherPayout,
          platformFee,
        },
        clientId: One80IdentityService.CLIENT_ID,
        provider: '180_pay',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /webhooks/180-pay
   * Ingests and cryptographically verifies 180 Pay settlement webhooks using 180_WEBHOOK_SECRET
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-180-signature'] as string;
      if (!signature) {
        return res.status(400).json({ success: false, error: 'Missing x-180-signature header.' });
      }

      const rawPayload = JSON.stringify(req.body);
      const isValid = One80IdentityService.verifyWebhookSignature(rawPayload, signature);

      if (!isValid) {
        return res.status(400).json({ success: false, error: 'Invalid 180 Pay webhook signature.' });
      }

      const event = req.body;
      const orderId = event.data?.orderId || event.orderId;

      if (orderId && one80Orders.has(orderId)) {
        const order = one80Orders.get(orderId);
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        order.transactionId = event.data?.transactionId || `180_txn_${Date.now()}`;
        one80Orders.set(orderId, order);
      }

      return res.json({
        success: true,
        message: '180 Pay webhook processed successfully.',
        receivedEvent: event.event || 'payment.success',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
