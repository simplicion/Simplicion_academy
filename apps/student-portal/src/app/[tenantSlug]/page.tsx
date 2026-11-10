'use client';

import React, { useState, useEffect } from 'react';
import { loadReferenceTenant } from '../../lib/tenant-data';
import { HeroSection } from '../../components/HeroSection';
import { OfferingsSlider } from '../../components/OfferingsSlider';
import { CategoryExplorer } from '../../components/CategoryExplorer';
import { WhyUsSection } from '../../components/WhyUsSection';
import { FaqSection } from '../../components/FaqSection';

interface TenantPageProps {
  params: { tenantSlug: string };
}

export default function TenantStorefrontPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;
  const { tenant: refTenant, categories, offerings, faqs, whyUs } = loadReferenceTenant();

  const [tenantName, setTenantName] = useState(
    tenantSlug === 'humanities-cuet'
      ? refTenant.name
      : tenantSlug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + ' Academy'
  );
  const [tagline, setTagline] = useState(
    tenantSlug === 'humanities-cuet'
      ? refTenant.settings.branding.tagline
      : 'Specialized Interactive Online Coaching & CBT Mock Tests'
  );

  useEffect(() => {
    // If not reference tenant, try fetching metadata from backend
    if (tenantSlug !== 'humanities-cuet') {
      fetch(`http://localhost:4000/tenants/search?q=${encodeURIComponent(tenantSlug)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.tenants && data.tenants.length > 0) {
            const found = data.tenants.find((t: any) => t.slug === tenantSlug) || data.tenants[0];
            if (found) {
              setTenantName(found.name);
              if (found.tagline) setTagline(found.tagline);
            }
          }
        })
        .catch(() => {
          // Graceful fallback to formatted slug
        });
    }
  }, [tenantSlug]);

  const scrollToOfferings = () => {
    const el = document.getElementById('offerings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCategories = () => {
    const el = document.getElementById('categories');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return (
          <HeroSection
            key="hero"
            title={tenantName}
            tagline={tagline}
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
      {refTenant.settings.sectionsOrder.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}
