import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AcademyDirectoryView } from '../components/AcademyDirectoryView';
import { fetchAcademiesServer } from '../lib/storefront-loader';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return {
    title: 'Find Your Academy | Learnings Simplicion',
    description:
      'Search and open your academy website on Learnings Simplicion. Enter your academy name to access courses, live classes, notes, and assessments.',
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { tenant?: string };
}) {
  // Redirect legacy ?tenant=<slug> links cleanly to /<slug>
  if (searchParams?.tenant && searchParams.tenant.trim()) {
    redirect(`/${encodeURIComponent(searchParams.tenant.trim().toLowerCase())}`);
  }

  // Direct access to "/" never opens a single academy — show the live Academy Search & Directory
  const academies = await fetchAcademiesServer();

  return <AcademyDirectoryView initialAcademies={academies} />;
}
