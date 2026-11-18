import React from 'react';
import type { Metadata } from 'next';
import { AcademyLandingView } from '../../components/AcademyLandingView';
import { AcademyDirectoryView } from '../../components/AcademyDirectoryView';
import { fetchAcademiesServer, fetchStorefrontServer } from '../../lib/storefront-loader';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { academySlug: string };
}): Promise<Metadata> {
  const slug = (params?.academySlug || '').toLowerCase();
  const data = await fetchStorefrontServer(slug);
  if (!data?.siteConfig) {
    return {
      title: 'Academy Not Found | Learnings Simplicion',
      description: 'Search and find your academy on Learnings Simplicion.',
    };
  }

  const name = data.siteConfig.name || 'Learnings Simplicion';
  const tagline =
    data.siteConfig.settings?.branding?.tagline ||
    'Structured online courses, live interactive classes, study notes, and assessments.';
  const logoUrl = data.siteConfig.settings?.branding?.logoUrl;

  return {
    title: `${name} | ${tagline}`,
    description: tagline,
    ...(logoUrl ? { icons: { icon: logoUrl } } : {}),
  };
}

export default async function AcademySlugLandingPage({
  params,
}: {
  params: { academySlug: string };
}) {
  const academySlug = (params?.academySlug || '').toLowerCase();
  const initialData = await fetchStorefrontServer(academySlug);

  // If no academy matches this slug, show the live Academy Directory with search
  if (!initialData?.siteConfig) {
    const academies = await fetchAcademiesServer();
    return <AcademyDirectoryView initialAcademies={academies} notFoundSlug={academySlug} />;
  }

  const branding = initialData.siteConfig.settings?.branding || {};
  const preloadImages = [
    branding.logoUrl,
    branding.bannerUrl,
    branding.websiteContent?.hero?.heroImageUrl,
  ].filter((u): u is string => typeof u === 'string' && u.startsWith('http'));

  return (
    <>
      {preloadImages.map((href) => (
        <link key={href} rel="preload" as="image" href={href} />
      ))}
      <AcademyLandingView forcedSlug={academySlug} initialData={initialData} />
    </>
  );
}
