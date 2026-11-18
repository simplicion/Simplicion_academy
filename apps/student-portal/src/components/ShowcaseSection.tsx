'use client';

import React from 'react';
import { CheckCircle2, Layers } from 'lucide-react';
import { DEFAULT_WEBSITE_CONTENT } from '../lib/site-content';

export interface ShowcaseSectionProps {
  badgeText?: string;
  heading?: string;
  description?: string;
  imageUrl?: string;
  bullets?: string[];
}

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({
  badgeText = DEFAULT_WEBSITE_CONTENT.showcase.badgeText,
  heading = DEFAULT_WEBSITE_CONTENT.showcase.heading,
  description = DEFAULT_WEBSITE_CONTENT.showcase.description,
  imageUrl = DEFAULT_WEBSITE_CONTENT.showcase.imageUrl,
  bullets = DEFAULT_WEBSITE_CONTENT.showcase.bullets,
}) => {
  return (
    <section className="py-16 bg-white border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Replaceable Feature Image */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden border border-[#e2e8f0] bg-[#f8fafc] shadow-sm">
              <img
                src={imageUrl || '/images/showcase-classroom.svg'}
                alt={heading}
                className="w-full h-auto max-h-[380px] object-cover"
              />
            </div>
          </div>

          {/* Editable Text & Bullet Checklist */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            {badgeText && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: 'var(--brand-primary-soft, #eff6ff)',
                  borderColor: 'var(--brand-primary-border, #dbeafe)',
                  color: 'var(--brand-primary, #2563eb)',
                }}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{badgeText}</span>
              </div>
            )}

            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {heading}
            </h2>

            {description && (
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{description}</p>
            )}

            {bullets && bullets.length > 0 && (
              <ul className="space-y-3 pt-1">
                {bullets.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-[#334155]">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: 'var(--brand-primary, #2563eb)' }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
