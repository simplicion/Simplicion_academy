'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqData } from '../lib/tenant-data';
import { buildFaqSchema } from '../lib/seo';
import { DEFAULT_WEBSITE_CONTENT } from '../lib/site-content';

export interface FaqSectionProps {
  badgeText?: string;
  heading?: string;
  subtitle?: string;
  faqs: FaqData[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  badgeText = DEFAULT_WEBSITE_CONTENT.faqs.badgeText,
  heading = DEFAULT_WEBSITE_CONTENT.faqs.heading,
  subtitle = DEFAULT_WEBSITE_CONTENT.faqs.subtitle,
  faqs,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = buildFaqSchema(faqs);

  return (
    <section className="py-16 bg-white border-b border-[#e2e8f0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          {badgeText && (
            <div
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--brand-primary, #2563eb)' }}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{badgeText}</span>
            </div>
          )}
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {heading}
          </h2>
          {subtitle && <p className="text-sm text-[#475569]">{subtitle}</p>}
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#f8fafc] transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-[#0f172a]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748b] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={isOpen ? { color: 'var(--brand-primary, #2563eb)' } : undefined}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#475569] border-t border-[#f1f5f9] pt-3 leading-relaxed animate-accordion-open">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
