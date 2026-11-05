'use client';

import React from 'react';
import { Button, Badge } from '@simplicion/ui';
import { Sparkles, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  tagline: string;
  onExploreClick: () => void;
  onFreeDemoClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  tagline,
  onExploreClick,
  onFreeDemoClick,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Highlight Badge */}
        <div className="inline-flex items-center mb-6">
          <Badge variant="primary" size="md" className="gap-1.5 py-1 px-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Targeting St. Stephen&apos;s, Hindu, SRCC &amp; Miranda House</span>
          </Badge>
        </div>

        {/* Institute Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          {title}
        </h1>

        {/* Memorable Tagline */}
        <p className="mt-4 text-xl sm:text-2xl font-semibold text-[var(--brand-primary,#2563eb)] max-w-2xl mx-auto">
          &ldquo;{tagline}&rdquo;
        </p>

        {/* Description */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Daily bilingual interactive live classes, chapter-wise notes, solved PYQs, and authentic
          NTA-pattern CBT mocks crafted for serious CUET UG Humanities aspirants.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={onExploreClick} className="w-full sm:w-auto shadow-md">
            <span>Explore Upcoming Batches</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onFreeDemoClick || onExploreClick}
            className="w-full sm:w-auto"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            <span>Free Sample Notes &amp; Mocks</span>
          </Button>
        </div>

        {/* Key Highlights Ribbon */}
        <div className="mt-14 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-100/60 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">100% NCERT</p>
              <p className="text-xs text-slate-500">Line-by-line coverage</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Sunday CBT Mocks</p>
              <p className="text-xs text-slate-500">Full exam pattern</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Bilingual Learning</p>
              <p className="text-xs text-slate-500">English + Hindi clarity</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-100/60 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Mentorship Group</p>
              <p className="text-xs text-slate-500">Direct WhatsApp support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

