import { describe, it, expect } from 'vitest';
import {
  buildOrganizationSchema,
  buildCourseSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from '../src/lib/seo';

describe('Phase 2: SEO Engine & Schema.org Structured Data', () => {
  it('should generate valid Schema.org EducationalOrganization structured data', () => {
    const orgSchema = buildOrganizationSchema({
      name: 'Humanities CUET Academy',
      url: 'https://cuet.simplicion.com',
      tagline: 'Humanities walon, tum kisi se kam nahi',
      contactNumber: '+91 98765 43210',
    });

    expect(orgSchema['@context']).toBe('https://schema.org');
    expect(orgSchema['@type']).toBe('EducationalOrganization');
    expect(orgSchema.name).toBe('Humanities CUET Academy');
    expect(orgSchema.description).toBe('Humanities walon, tum kisi se kam nahi');
    expect(orgSchema.contactPoint?.telephone).toBe('+91 98765 43210');
  });

  it('should generate valid Schema.org Course structured data with pricing offers', () => {
    const courseSchema = buildCourseSchema({
      title: 'CUET UG Foundation Batch 2027',
      description: 'Comprehensive preparation for CUET UG with live classes.',
      courseUrl: 'https://cuet.simplicion.com/o/cuet-ug-foundation-2027',
      mrp: 8000,
      salePrice: 4000,
      currency: 'INR',
      language: 'hi, en',
      instituteName: 'Humanities CUET Academy',
      instructorName: 'Faculty of Humanities',
    });

    expect(courseSchema['@context']).toBe('https://schema.org');
    expect(courseSchema['@type']).toBe('Course');
    expect(courseSchema.name).toBe('CUET UG Foundation Batch 2027');
    expect(courseSchema.offers.price).toBe(4000);
    expect(courseSchema.offers.priceCurrency).toBe('INR');
    expect(courseSchema.provider.name).toBe('Humanities CUET Academy');
  });

  it('should generate valid Schema.org FAQPage structured data for rich snippets', () => {
    const faqSchema = buildFaqSchema([
      {
        question: 'Is the teaching bilingual?',
        answer: 'Yes, both English and Hindi are used.',
      },
      {
        question: 'When do mocks take place?',
        answer: 'Every Sunday at 10 AM.',
      },
    ]);

    expect(faqSchema['@context']).toBe('https://schema.org');
    expect(faqSchema['@type']).toBe('FAQPage');
    expect(faqSchema.mainEntity.length).toBe(2);
    expect(faqSchema.mainEntity[0].name).toBe('Is the teaching bilingual?');
    expect(faqSchema.mainEntity[0].acceptedAnswer.text).toBe('Yes, both English and Hindi are used.');
  });

  it('should generate valid Schema.org BreadcrumbList structured data', () => {
    const breadcrumbs = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://cuet.simplicion.com' },
      { name: 'Batches', url: 'https://cuet.simplicion.com/#offerings' },
      { name: 'Foundation 2027', url: 'https://cuet.simplicion.com/o/foundation-2027' },
    ]);

    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement.length).toBe(3);
    expect(breadcrumbs.itemListElement[0].position).toBe(1);
    expect(breadcrumbs.itemListElement[2].name).toBe('Foundation 2027');
  });
});

