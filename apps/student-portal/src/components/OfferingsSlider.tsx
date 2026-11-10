'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@simplicion/ui';
import { Sparkles, Calendar, Check, ArrowRight, BookOpen } from 'lucide-react';
import { OfferingAggregate } from '@simplicion/catalog';

export interface OfferingsSliderProps {
  offerings: OfferingAggregate[];
}

export const OfferingsSlider: React.FC<OfferingsSliderProps> = ({ offerings }) => {
  return (
    <section id="offerings" className="py-16 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" size="sm" className="mb-2">
            Target CUET UG 2027
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Featured Upcoming Batches
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Select your target batch. Enrolling in the Foundation Batch automatically grants full free
            access to the Crash Course revision module.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {offerings.map((offering) => {
            const json = typeof offering?.toJSON === 'function' ? offering.toJSON() : offering;
            return (
              <Card
                key={json.id}
                hoverable
                className="flex flex-col justify-between border-2 border-slate-200/80 dark:border-slate-800 hover:border-[var(--brand-primary,#2563eb)] dark:hover:border-[var(--brand-primary,#2563eb)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary,#2563eb)] bg-blue-50 dark:bg-blue-950/60 py-1 px-2.5 rounded-md">
                      {json.type.replace('_', ' ')}
                    </span>
                    {json.discountPercent > 0 && (
                      <Badge variant="discount" size="sm">
                        {json.discountPercent}% OFF
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    <Link href={`/o/${json.slug}`} className="hover:text-[var(--brand-primary,#2563eb)] transition-colors">
                      {json.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {json.description}
                  </p>

                  {/* Pricing Display */}
                  <div className="flex items-baseline space-x-3 mb-6 p-3 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {json.isFree ? 'FREE' : `₹${json.pricing.salePrice.toLocaleString('en-IN')}`}
                    </span>
                    {json.pricing.mrp > json.pricing.salePrice && (
                      <span className="text-sm font-semibold text-slate-400 line-through">
                        ₹{json.pricing.mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                    {json.isFree && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        (With Foundation Batch)
                      </span>
                    )}
                  </div>

                  {/* Highlights Checklist */}
                  <div className="space-y-2 mb-6">
                    {json.features.slice(0, 4).map((f) => (
                      <div key={f.id} className="flex items-center text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <Link href={`/o/${json.slug}`} className="flex-1">
                    <Button variant="primary" size="md" className="w-full">
                      <span>Enroll in Batch</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>

                  <Link href={`/o/${json.slug}`}>
                    <Button variant="outline" size="md">
                      <BookOpen className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

