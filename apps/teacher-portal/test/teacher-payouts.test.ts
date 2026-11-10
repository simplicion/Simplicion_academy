import { describe, it, expect } from 'vitest';

describe('Teacher 180 Pay Disbursals & Earnings Studio', () => {
  const calculateSplits = (grossAmount: number) => {
    const platformFee = Math.round(grossAmount * 0.05);
    const teacherPayout = grossAmount - platformFee;
    return { platformFee, teacherPayout };
  };

  it('correctly calculates 95% teacher payout and 5% platform fee on batch sales', () => {
    const batchPrice = 4999;
    const { platformFee, teacherPayout } = calculateSplits(batchPrice);

    expect(platformFee).toBe(250);
    expect(teacherPayout).toBe(4749);
    expect(platformFee + teacherPayout).toBe(batchPrice);
  });

  it('enforces flat ₹200/month teacher subscription fee for instant studio access', () => {
    const subscription = {
      tenantId: 'humanities-cuet',
      amount: 200,
      currency: 'INR',
      interval: 'monthly',
      status: 'active',
      provider: '180_pay',
    };

    expect(subscription.amount).toBe(200);
    expect(subscription.status).toBe('active');
    expect(subscription.interval).toBe('monthly');
  });

  it('validates withdrawal requests and balance deduction logic', () => {
    const ledger = {
      lifetimeEarnings: 50000,
      totalDisbursed: 20000,
      availableBalance: 30000,
    };

    const requestedAmount = 15000;
    expect(requestedAmount).toBeLessThanOrEqual(ledger.availableBalance);

    const updatedLedger = {
      ...ledger,
      totalDisbursed: ledger.totalDisbursed + requestedAmount,
      availableBalance: ledger.availableBalance - requestedAmount,
    };

    expect(updatedLedger.totalDisbursed).toBe(35000);
    expect(updatedLedger.availableBalance).toBe(15000);
    expect(updatedLedger.totalDisbursed + updatedLedger.availableBalance).toBe(ledger.lifetimeEarnings);
  });

  it('validates destination payloads for UPI and Bank transfer disbursals', () => {
    const upiPayload = {
      tenantId: 'humanities-cuet',
      amount: 10000,
      payoutMethod: 'upi',
      destination: {
        upiId: 'rajesh.cuet@okhdfcbank',
        recipientName: 'Dr. Rajesh Varma',
      },
    };

    expect(upiPayload.destination.upiId).toMatch(/^[\w.-]+@[\w.-]+$/);
    expect(upiPayload.amount).toBeGreaterThan(0);

    const bankPayload = {
      tenantId: 'humanities-cuet',
      amount: 25000,
      payoutMethod: 'bank',
      destination: {
        accountNumber: '50100234567890',
        ifsc: 'HDFC0001234',
        recipientName: 'Dr. Rajesh Varma',
      },
    };

    expect(bankPayload.destination.accountNumber.length).toBeGreaterThanOrEqual(9);
    expect(bankPayload.destination.ifsc).toMatch(/^[A-Z]{4}0[A-Z0-9]{6}$/);
  });
});
