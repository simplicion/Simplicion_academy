'use client';

import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { DEFAULT_WEBSITE_CONTENT, HeroHighlightItem } from '../lib/site-content';

export interface HeroSectionProps {
  badgeText?: string;
  title: string;
  tagline: string;
  description?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  heroImageUrl?: string;
  highlights?: HeroHighlightItem[];
  onExploreClick: () => void;
  onFreeDemoClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  badgeText = DEFAULT_WEBSITE_CONTENT.hero.badgeText,
  title,
  tagline,
  description = DEFAULT_WEBSITE_CONTENT.hero.description,
  primaryCtaText = DEFAULT_WEBSITE_CONTENT.hero.primaryCtaText,
  secondaryCtaText = DEFAULT_WEBSITE_CONTENT.hero.secondaryCtaText,
  heroImageUrl = DEFAULT_WEBSITE_CONTENT.hero.heroImageUrl,
  highlights = DEFAULT_WEBSITE_CONTENT.hero.highlights,
  onExploreClick,
}) => {
  return (
    <section className="relative overflow-hidden py-14 lg:py-20 bg-white border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-6 space-y-5 text-left">
            {badgeText && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: 'var(--brand-primary-soft, #eff6ff)',
                  borderColor: 'var(--brand-primary-border, #dbeafe)',
                  color: 'var(--brand-primary, #2563eb)',
                }}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{badgeText}</span>
              </div>
            )}

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0f172a] leading-[1.15]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {title}
            </h1>

            {tagline && (
              <p
                className="text-base sm:text-lg font-semibold leading-snug"
                style={{ color: 'var(--brand-primary, #2563eb)' }}
              >
                {tagline}
              </p>
            )}

            {description && (
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl">
                {description}
              </p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onExploreClick}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-95 hover:shadow-md transition"
                style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {secondaryCtaText && secondaryCtaText.trim().toLowerCase() !== 'take practice test' && (
                <button
                  type="button"
                  onClick={onExploreClick}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-[#0f172a] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] transition-colors"
                >
                  <BookOpen
                    className="w-4 h-4"
                    style={{ color: 'var(--brand-primary, #2563eb)' }}
                  />
                  <span>{secondaryCtaText}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Replaceable Visual Column */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-[#e2e8f0] bg-[#f8fafc] shadow-sm">
              <img
                src={heroImageUrl || '/images/hero-academy.svg'}
                alt={title}
                className="w-full h-auto max-h-[380px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Editable Key Highlights Ribbon */}
        {highlights && highlights.length > 0 && (
          <div className="mt-14 pt-8 border-t border-[#e2e8f0] grid grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] card-interactive"
              >
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{
                    backgroundColor: 'var(--brand-primary-soft, #eff6ff)',
                    color: 'var(--brand-primary, #2563eb)',
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0f172a] truncate">{item.title}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
