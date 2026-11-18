'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@simplicion/ui';
import { Check, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Zap } from 'lucide-react';
import { OfferingAggregate } from '@simplicion/catalog';

export interface OfferingsSliderProps {
  offerings: OfferingAggregate[];
  enrolledIds?: string[];
  onEnroll?: (offeringJson: any) => void;
}

export const OfferingsSlider: React.FC<OfferingsSliderProps> = ({
  offerings,
  enrolledIds = [],
  onEnroll,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section
      id="offerings"
      className="py-16 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" size="sm" className="mb-2">
            Structured Program
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Featured Upcoming Batches
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Select your target batch and enroll directly with 180 Identity &amp; 180 Pay. Enrolling
            in the Foundation Batch automatically grants full free access to the Crash Course
            revision module.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {offerings.map((offering) => {
            const json = typeof offering?.toJSON === 'function' ? offering.toJSON() : (offering as any);
            const isEnrolled = enrolledIds.includes(json.id);
            const isExpanded = expandedId === json.id;

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
                    <div className="flex items-center gap-1.5">
                      {isEnrolled && (
                        <Badge variant="success" size="sm">
                          Enrolled
                        </Badge>
                      )}
                      {json.discountPercent > 0 && (
                        <Badge variant="discount" size="sm">
                          {json.discountPercent}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {json.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {json.description}
                  </p>

                  {/* Pricing Display (Whole Currency Units for 180 Pay) */}
                  <div className="flex items-baseline space-x-3 mb-5 p-3 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl">
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
                  <div className="space-y-2 mb-5">
                    {json.features.slice(0, 4).map((f: any) => (
                      <div key={f.id} className="flex items-center text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Inline Expandable Syllabus Drawer (keeps everything on ONE landing page) */}
                  {json.units && json.units.length > 0 && (
                    <div className="mb-5">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : json.id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-[var(--brand-primary,#2563eb)] hover:underline py-1.5"
                      >
                        <span>
                          {isExpanded ? 'Hide' : 'View'} Included Subjects ({json.units.length} Units)
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                          {json.units.map((unit: any, idx: number) => (
                            <div
                              key={unit.id}
                              className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300"
                            >
                              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[var(--brand-primary,#2563eb)] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="truncate font-medium">{unit.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {isEnrolled ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enrolled via 180 Pay — Access Active</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full font-bold shadow-sm"
                      onClick={() => onEnroll?.(json)}
                    >
                      {json.isFree ? (
                        <>
                          <span>Claim Free Access</span>
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1.5" />
                          <span>Enroll Now — ₹{json.pricing.salePrice.toLocaleString('en-IN')} via 180 Pay</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
