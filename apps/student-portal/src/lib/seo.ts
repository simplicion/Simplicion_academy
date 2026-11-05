/**
 * Simplicion Academy SEO & Discoverability Engine
 * Conforms to PRD Section 6.12 (FR-SEO) & Schema.org Standards
 */

export interface OrganizationSchemaData {
  name: string;
  url: string;
  logoUrl?: string;
  tagline?: string;
  contactNumber?: string;
}

export interface CourseSchemaData {
  title: string;
  description: string;
  courseUrl: string;
  mrp: number;
  salePrice: number;
  currency?: string;
  language?: string;
  instructorName?: string;
  instituteName: string;
  startDate?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Generates Schema.org 'Organization' JSON-LD
 */
export function buildOrganizationSchema(data: OrganizationSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: data.name,
    url: data.url,
    logo: data.logoUrl || `${data.url}/logo.png`,
    description: data.tagline,
    ...(data.contactNumber && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: data.contactNumber,
        contactType: 'admissions',
      },
    }),
  };
}

/**
 * Generates Schema.org 'Course' JSON-LD for rich snippets in Google Search
 */
export function buildCourseSchema(data: CourseSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.title,
    description: data.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: data.instituteName,
    },
    inLanguage: data.language || 'en',
    offers: {
      '@type': 'Offer',
      price: data.salePrice,
      priceCurrency: data.currency || 'INR',
      availability: 'https://schema.org/InStock',
      url: data.courseUrl,
      validFrom: data.startDate || new Date().toISOString(),
    },
    ...(data.instructorName && {
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        instructor: {
          '@type': 'Person',
          name: data.instructorName,
        },
      },
    }),
  };
}

/**
 * Generates Schema.org 'FAQPage' JSON-LD for rich FAQ search results
 */
export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates Schema.org 'BreadcrumbList' JSON-LD
 */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

