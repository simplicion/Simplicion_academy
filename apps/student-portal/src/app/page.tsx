'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadReferenceTenant } from '../lib/tenant-data';
import { HeroSection } from '../components/HeroSection';
import { OfferingsSlider } from '../components/OfferingsSlider';
import { CategoryExplorer } from '../components/CategoryExplorer';
import { WhyUsSection } from '../components/WhyUsSection';
import { FaqSection } from '../components/FaqSection';
import { MainPlatformLanding } from '../components/platform/MainPlatformLanding';
import { ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant');

  // If no tenant is selected, render the Main Platform Landing & Search Discovery Hub
  if (!tenantSlug) {
    return <MainPlatformLanding />;
  }

  // If a specific tenant is specified, render that teacher's branded academy storefront
  const { tenant, categories, offerings, faqs, whyUs } = loadReferenceTenant();
  const settings = tenant.settings;

  const scrollToOfferings = () => {
    const el = document.getElementById('offerings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCategories = () => {
    const el = document.getElementById('categories');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Interpret dynamic section ordering configured by the teacher in Tenant Studio
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return (
          <HeroSection
            key="hero"
            title={tenant.name}
            tagline={settings.branding.tagline}
            onExploreClick={scrollToOfferings}
            onFreeDemoClick={scrollToCategories}
          />
        );
      case 'upcoming-slider':
        return <OfferingsSlider key="upcoming-slider" offerings={offerings} />;
      case 'categories':
        return <CategoryExplorer key="categories" categories={categories} />;
      case 'why-us':
        return <WhyUsSection key="why-us" features={whyUs} />;
      case 'faq':
        return <FaqSection key="faq" faqs={faqs} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Return to Platform Network Navigation */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Simplicion Platform Network</span>
          </a>
          <span className="text-slate-600">•</span>
          <span>Viewing Active Tenant: <code className="text-white font-mono">{tenantSlug}</code></span>
        </div>
        <a
          href={`http://localhost:3002/?slug=${tenantSlug}`}
          target="_blank"
          rel="noreferrer"
          className="text-amber-400 hover:underline font-medium"
        >
          Teacher Control Studio →
        </a>
      </div>

      {settings.sectionsOrder.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}
