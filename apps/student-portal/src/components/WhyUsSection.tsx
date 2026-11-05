'use client';

import React from 'react';
import { Card } from '@simplicion/ui';
import { Award, Monitor, HelpCircle, Compass } from 'lucide-react';
import { WhyUsFeature } from '../lib/tenant-data';

export interface WhyUsSectionProps {
  features: WhyUsFeature[];
}

export const WhyUsSection: React.FC<WhyUsSectionProps> = ({ features }) => {
  const iconMap: Record<string, React.ReactNode> = {
    award: <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    monitor: <Monitor className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    'help-circle': <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    compass: <Compass className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
  };

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Why Humanities Aspirants Choose Us
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Dedicated pedagogy built specifically for Arts &amp; Humanities entrance examinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <Card key={idx} padding="lg" hoverable className="text-left space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-slate-800 w-fit rounded-xl border border-blue-100 dark:border-slate-700">
                {iconMap[feat.icon] || <Award className="w-6 h-6 text-blue-600" />}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {feat.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

