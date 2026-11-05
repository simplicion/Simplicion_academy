import { describe, it, expect } from 'vitest';
import { loadReferenceTenant } from '../src/lib/tenant-data';

describe('Phase 2: Storefront & Reference Tenant Verification', () => {
  it('should load reference tenant conforming to PRD Section 9', () => {
    const { tenant, categories, offerings, faqs, whyUs } = loadReferenceTenant();

    // Verification of Section 9 requirements
    expect(tenant.name).toBe('Humanities CUET Academy');
    expect(tenant.settings.branding.tagline).toBe('Humanities walon, tum kisi se kam nahi');
    expect(tenant.settings.branding.headerLayout).toBe('login-left'); // Login on left
    expect(tenant.settings.labels.studyEntry).toBe('Study');
    expect(tenant.settings.labels.unitsHeader).toBe("Let's Study");
    expect(tenant.settings.labels.offeringName).toBe('Batch');

    expect(categories.length).toBe(8);
    expect(offerings.length).toBe(2);
    expect(faqs.length).toBe(4);
    expect(whyUs.length).toBe(4);
  });

  it('should verify Foundation Batch pricing: MRP 8000, Sale 4000 (50% OFF)', () => {
    const { offerings } = loadReferenceTenant();
    const foundation = offerings.find((o) => o.slug === 'cuet-ug-foundation-2027');

    expect(foundation).toBeDefined();
    const json = foundation!.toJSON();
    expect(json.pricing.mrp).toBe(8000);
    expect(json.pricing.salePrice).toBe(4000);
    expect(json.discountPercent).toBe(50);
    expect(json.units.length).toBe(7); // English, Pol Sci, History, Geography, Legal, Sociology, GAT
  });

  it('should verify Crash Course is free for Foundation enrollees', () => {
    const { offerings } = loadReferenceTenant();
    const crashCourse = offerings.find((o) => o.slug === 'cuet-ug-crash-course-2027');

    expect(crashCourse).toBeDefined();
    const json = crashCourse!.toJSON();
    expect(json.isFree).toBe(true);
    expect(json.pricing.salePrice).toBe(0);
  });

  it('should verify Category Explorer separates active vs coming soon categories', () => {
    const { categories } = loadReferenceTenant();
    const active = categories.filter((c) => c.isActive);
    const comingSoon = categories.filter((c) => !c.isActive);

    expect(active.length).toBe(1); // CUET UG is active
    expect(active[0].slug).toBe('cuet');
    expect(comingSoon.length).toBe(7); // Class 12, Class 11, etc.
  });
});

