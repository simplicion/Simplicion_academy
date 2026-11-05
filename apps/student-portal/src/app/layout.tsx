import React from 'react';
import type { Metadata } from 'next';
import { loadReferenceTenant } from '../lib/tenant-data';
import { generateThemeStyleString } from '@simplicion/ui';
import { buildOrganizationSchema } from '../lib/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import './globals.css';

export function generateMetadata(): Metadata {
  const { tenant } = loadReferenceTenant();
  const settings = tenant.settings;

  return {
    title: settings.seo.titleTemplate,
    description: settings.seo.metaDescription,
    keywords: settings.seo.keywords,
    openGraph: {
      title: settings.seo.titleTemplate,
      description: settings.seo.metaDescription,
      siteName: tenant.name,
      locale: 'en_IN',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant } = loadReferenceTenant();
  const settings = tenant.settings;

  const themeStyle = generateThemeStyleString({
    primaryColor: settings.branding.primaryColor,
    accentColor: settings.branding.accentColor,
    borderRadius: settings.branding.borderRadius,
    fontFamily: settings.branding.fontFamily as any,
  });

  const orgSchema = buildOrganizationSchema({
    name: tenant.name,
    url: 'https://cuet.simplicion.com',
    tagline: settings.branding.tagline,
    contactNumber: settings.contact.supportPhone,
  });

  return (
    <html lang="en" style={{ cssText: themeStyle } as any}>
      <head>
        {/* Schema.org EducationalOrganization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-brand antialiased">
        <Header
          tenantName={tenant.name}
          tagline={settings.branding.tagline}
          headerLayout={settings.branding.headerLayout}
          studyLabel={settings.labels.studyEntry}
        />
        <main className="flex-1">{children}</main>
        <Footer
          tenantName={tenant.name}
          tagline={settings.branding.tagline}
          whatsappNumber={settings.contact.whatsappNumber}
          supportPhone={settings.contact.supportPhone}
        />
      </body>
    </html>
  );
}

