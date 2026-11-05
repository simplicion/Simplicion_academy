import { describe, it, expect } from 'vitest';
import { OrderAggregate } from '../src';

describe('@simplicion/domain-commerce Split Settlement & Idempotency', () => {
  it('should calculate platform fee and teacher net payout accurately', () => {
    // ₹4000 course with 5% platform fee
    const split = OrderAggregate.calculateSplit(4000, 5);

    expect(split.grossAmount).toBe(4000);
    expect(split.platformFeePercent).toBe(5);
    expect(split.platformFeeAmount).toBe(200); // 5% of 4000
    expect(split.teacherPayoutAmount).toBe(3800); // 4000 - 200
  });

  it('should be idempotent and ignore duplicate payment webhooks', () => {
    const order = OrderAggregate.create('ord-01', 'tenant-01', 'user-01', 'off-01', 4000, 5);
    expect(order.status).toBe('pending');

    // First webhook delivery
    const firstDelivery = order.markPaid('pay_12345', ['bonus-crash-course']);
    expect(firstDelivery).toBe(true);
    expect(order.status).toBe('paid');
    expect(order.grantedOfferingIds).toContain('bonus-crash-course');

    // Duplicate webhook delivery
    const secondDelivery = order.markPaid('pay_12345', ['bonus-crash-course']);
    expect(secondDelivery).toBe(false); // Idempotent! Did not process twice
    expect(order.status).toBe('paid');
  });
});

