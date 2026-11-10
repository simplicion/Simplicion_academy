import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadReferenceTenant } from '../../../lib/tenant-data';
import { buildCourseSchema, buildBreadcrumbSchema } from '../../../lib/seo';
import { OfferingDetail } from '../../../components/OfferingDetail';

interface PageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const { tenant, offerings } = loadReferenceTenant();
  const offering = offerings.find((o) => o.slug === params.slug);

  if (!offering) {
    return {
      title: 'Batch Not Found | ' + tenant.name,
    };
  }

  const json = offering.toJSON();
  const title = `${json.title} | ${tenant.name} - 50% OFF Admission`;
  const description = `${json.description} Enrol now for complete CUET UG 2027 preparation, Sunday CBT mocks, and bilingual notes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://cuet.simplicion.com/o/${json.slug}`,
    },
  };
}

export default function OfferingPage({ params }: PageProps) {
  const { tenant, offerings } = loadReferenceTenant();
  const offering = offerings.find((o) => o.slug === params.slug);

  if (!offering) {
    notFound();
  }

  const json = offering.toJSON();

  // Schema.org Course Structured Data
  const courseSchema = buildCourseSchema({
    title: json.title,
    description: json.description,
    courseUrl: `https://cuet.simplicion.com/o/${json.slug}`,
    mrp: json.pricing.mrp,
    salePrice: json.pricing.salePrice,
    currency: 'INR',
    language: 'hi, en',
    instructorName: 'Faculty of Humanities',
    instituteName: tenant.name,
  });

  const breadcrumbs = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://cuet.simplicion.com' },
    { name: 'Batches', url: 'https://cuet.simplicion.com/#offerings' },
    { name: json.title, url: `https://cuet.simplicion.com/o/${json.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <OfferingDetail
        offering={json}
        tenantName={tenant.name}
        whatsappNumber={tenant.settings.contact.whatsappNumber}
      />
    </>
  );
}

