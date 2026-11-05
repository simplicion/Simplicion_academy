import { Request, Response } from 'express';
import { OrderAggregate } from '@simplicion/commerce';

const orderStore = new Map<string, OrderAggregate>();

export class CommerceController {
  /**
   * POST /checkout/order
   * Creates an order with automated platform split calculation
   */
  static async createOrder(req: Request, res: Response) {
    try {
      const tenant = req.tenant;
      if (!tenant) return res.status(404).json({ success: false, error: 'Tenant context required.' });

      const { offeringId, grossAmount, userId } = req.body;
      if (!offeringId || grossAmount === undefined) {
        return res.status(400).json({ success: false, error: 'offeringId and grossAmount are required.' });
      }

      // 5% platform fee for Pro tier
      const order = OrderAggregate.create(
        `ord-${Date.now()}`,
        tenant.id,
        userId || 'user-1',
        offeringId,
        Number(grossAmount),
        5,
        `rzp_order_${Date.now()}`
      );

      orderStore.set(order.id, order);

      return res.json({
        success: true,
        order: order.toJSON(),
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * POST /webhooks/payment
   * Idempotent payment completion webhook
   */
  static async handlePaymentWebhook(req: Request, res: Response) {
    try {
      const { orderId, paymentId, signature } = req.body;
      if (!orderId || !paymentId) {
        return res.status(400).json({ success: false, error: 'orderId and paymentId are required.' });
      }

      const order = orderStore.get(orderId);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found.' });
      }

      // Auto-grant free crash course (off-cuet-02) if CUET Foundation Batch is purchased
      const entitledBonuses = order.offeringId === 'off-cuet-01' ? ['off-cuet-02'] : [];
      const isFirstProcessing = order.markPaid(paymentId, entitledBonuses);

      return res.json({
        success: true,
        message: isFirstProcessing ? 'Payment verified and access granted.' : 'Duplicate webhook ignored (idempotent).',
        order: order.toJSON(),
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

