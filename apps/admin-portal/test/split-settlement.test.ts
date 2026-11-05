import { describe, it, expect } from 'vitest';

export function computeSplitSettlement(grossAmountInr: number, feePercent: number) {
  if (grossAmountInr < 0) throw new Error('Gross amount cannot be negative');
  if (feePercent < 0 || feePercent > 100) throw new Error('Fee percent must be between 0 and 100');

  const platformFee = Math.round((grossAmountInr * feePercent) / 100);
  const teacherPayout = grossAmountInr - platformFee;

  return {
    grossAmount: grossAmountInr,
    platformFeePercent: feePercent,
    platformFee,
    teacherPayout,
  };
}

describe('Razorpay Route Split Settlement Calculations', () => {
  it('computes exact 3.0% platform fee on Pro plan course sale', () => {
    // CUET Humanities Foundation Batch at ₹ 4,999
    const settlement = computeSplitSettlement(4999, 3.0);

    expect(settlement.grossAmount).toBe(4999);
    expect(settlement.platformFee).toBe(150); // Math.round(149.97) = 150
    expect(settlement.teacherPayout).toBe(4849);
    expect(settlement.platformFee + settlement.teacherPayout).toBe(4999);
  });

  it('computes exact 5.0% platform fee on Starter plan course sale', () => {
    // Crash course at ₹ 1,999
    const settlement = computeSplitSettlement(1999, 5.0);

    expect(settlement.grossAmount).toBe(1999);
    expect(settlement.platformFee).toBe(100); // Math.round(99.95) = 100
    expect(settlement.teacherPayout).toBe(1899);
    expect(settlement.platformFee + settlement.teacherPayout).toBe(1999);
  });

  it('handles zero-rupee free trial enrollments without fee deduction', () => {
    const settlement = computeSplitSettlement(0, 3.0);

    expect(settlement.grossAmount).toBe(0);
    expect(settlement.platformFee).toBe(0);
    expect(settlement.teacherPayout).toBe(0);
  });

  it('preserves accounting ledger conservation law: platformFee + teacherPayout === grossAmount', () => {
    const testAmounts = [999, 1499, 2999, 4999, 9999, 12000, 24999];
    const testRates = [1.5, 3.0, 5.0];

    testAmounts.forEach((amount) => {
      testRates.forEach((rate) => {
        const res = computeSplitSettlement(amount, rate);
        expect(res.platformFee + res.teacherPayout).toBe(amount);
      });
    });
  });
});

