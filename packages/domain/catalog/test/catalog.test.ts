import { describe, it, expect } from 'vitest';
import { OfferingAggregate } from '../src';

describe('@simplicion/domain-catalog DDD Invariants', () => {
  it('should auto-compute discount percentage accurately', () => {
    const offering = OfferingAggregate.create(
      'off-01',
      'tenant-01',
      'cat-01',
      'Foundation Batch 2027',
      'foundation-2027',
      'batch',
      'Full syllabus',
      {
        mrp: 8000,
        salePrice: 4000,
        currency: 'INR',
      }
    );

    expect(offering.discountPercent).toBe(50); // 50% OFF
    expect(offering.isFree).toBe(false);
  });

  it('should reject pricing where sale price exceeds MRP', () => {
    expect(() => {
      OfferingAggregate.create(
        'off-02',
        'tenant-01',
        'cat-01',
        'Crash Course',
        'crash-course',
        'course',
        'Fast track',
        {
          mrp: 3000,
          salePrice: 4500, // Invalid!
          currency: 'INR',
        }
      );
    }).toThrow('cannot exceed MRP');
  });

  it('should correctly attach units and features', () => {
    const offering = OfferingAggregate.create(
      'off-03',
      'tenant-01',
      'cat-01',
      'History Masterclass',
      'history-masterclass',
      'course',
      'Comprehensive history lectures',
      { mrp: 2000, salePrice: 1000, currency: 'INR' }
    );

    offering.addUnit('Ancient India', 'ancient-india');
    offering.addUnit('Medieval India', 'medieval-india');
    offering.addFeature('video', 'HD Video Classes');

    expect(offering.units.length).toBe(2);
    expect(offering.features.length).toBe(1);
    expect(offering.units[0].name).toBe('Ancient India');
  });
});

