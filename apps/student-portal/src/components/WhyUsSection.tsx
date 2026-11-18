'use client';

import React from 'react';
import { Award, Monitor, HelpCircle, Compass } from 'lucide-react';
import { DEFAULT_WEBSITE_CONTENT } from '../lib/site-content';

export interface WhyUsSectionProps {
  heading?: string;
  subtitle?: string;
  features: Array<{ title: string; description: string; icon?: string }>;
}

const ICONS = [Award, Monitor, HelpCircle, Compass];

export const WhyUsSection: React.FC<WhyUsSectionProps> = ({
  heading = DEFAULT_WEBSITE_CONTENT.whyUs.heading,
  subtitle = DEFAULT_WEBSITE_CONTENT.whyUs.subtitle,
  features,
}) => {
  return (
    <section className="py-16 bg-[#f8fafc] border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {heading}
          </h2>
          {subtitle && <p className="text-sm text-[#475569]">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, idx) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] p-6 shadow-sm card-interactive space-y-3"
              >
                <div
                  className="p-2.5 w-fit rounded-xl border"
                  style={{
                    backgroundColor: 'var(--brand-primary-soft, #eff6ff)',
                    borderColor: 'var(--brand-primary-border, #dbeafe)',
                    color: 'var(--brand-primary, #2563eb)',
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3
                  className="text-base font-bold text-[#0f172a]"
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                >
                  {feat.title}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
