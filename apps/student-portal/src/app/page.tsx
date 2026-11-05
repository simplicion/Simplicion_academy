'use client';

import React from 'react';
import { loadReferenceTenant } from '../lib/tenant-data';
import { HeroSection } from '../components/HeroSection';
import { OfferingsSlider } from '../components/OfferingsSlider';
import { CategoryExplorer } from '../components/CategoryExplorer';
import { WhyUsSection } from '../components/WhyUsSection';
import { FaqSection } from '../components/FaqSection';

export default function HomePage() {
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
      {settings.sectionsOrder.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}

