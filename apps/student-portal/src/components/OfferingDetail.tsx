'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@simplicion/ui';
import {
  Check,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
  Share2,
  Clock,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { OfferingAggregate } from '@simplicion/catalog';
import { AuthModal } from './AuthModal';
import { One80PayModal } from './checkout/One80PayModal';

export interface OfferingDetailProps {
  offering: any;
  tenantName: string;
  whatsappNumber?: string;
}

export const OfferingDetail: React.FC<OfferingDetailProps> = ({
  offering,
  tenantName,
  whatsappNumber = '919876543210',
}) => {
  const json = typeof offering?.toJSON === 'function' ? offering.toJSON() : offering;
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleEnrollClick = () => {
    const student = localStorage.getItem('simplicion_student');
    if (!student) {
      setIsAuthOpen(true);
    } else {
      setIsPayOpen(true);
    }
  };

  const waEnrollText = encodeURIComponent(
    `Hi sir, I want to enroll in the ${json.title} at ${tenantName}. Please send details.`
  );
  const waUrl = `https://wa.me/${whatsappNumber}?text=${waEnrollText}`;

  return (
    <div className="py-12 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[var(--brand-primary,#2563eb)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/#offerings" className="hover:text-[var(--brand-primary,#2563eb)]">
            Batches
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold truncate">
            {json.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Course Info (2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary,#2563eb)] bg-blue-50 dark:bg-blue-950/60 py-1 px-3 rounded-md">
                  {json.type.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 py-1 px-3 rounded-md">
                  Target: CUET UG 2027
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {json.title}
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {json.description}
              </p>
            </div>

            {/* Units & Curriculum Breakdown */}
            <Card padding="lg" className="border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[var(--brand-primary,#2563eb)]" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Included Subjects &amp; Units
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {json.units.length} Core Units
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {json.units.map((unit, idx) => (
                  <div
                    key={unit.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center space-x-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[var(--brand-primary,#2563eb)] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">
                      {unit.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Everything Included in this Batch */}
            <Card padding="lg" className="border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                What You Get Inside This Batch
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {json.features.map((feat) => (
                  <div key={feat.id} className="flex items-start space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {feat.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Pricing & Checkout Card (1 Column) */}
          <div className="space-y-6">
            <Card padding="lg" className="sticky top-24 border-2 border-[var(--brand-primary,#2563eb)]/40 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Limited Period Enrollment
                </span>
                {json.discountPercent > 0 && (
                  <Badge variant="discount" size="md">
                    {json.discountPercent}% OFF
                  </Badge>
                )}
              </div>

              {/* Price Calculation Display */}
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {json.isFree ? 'FREE' : `₹${json.pricing.salePrice.toLocaleString('en-IN')}`}
                </span>
                {json.pricing.mrp > json.pricing.salePrice && (
                  <span className="text-lg font-semibold text-slate-400 line-through">
                    ₹{json.pricing.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Inclusive of GST and all course study material.
              </p>

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 text-center">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      🎉 Enrollment Confirmed!
                    </p>
                  </div>
                  <Link href="/study" className="block w-full">
                    <Button variant="primary" size="lg" className="w-full">
                      <span>Go to Study Hub</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-base font-bold shadow-md"
                    onClick={handleEnrollClick}
                  >
                    <span>{json.isFree ? 'Claim Free Access' : 'Enroll Now'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button variant="outline" size="md" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      <span>Ask Doubts on WhatsApp</span>
                    </Button>
                  </a>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Instant access to recordings &amp; notes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Valid until CUET UG 2027 Exam Ends</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          setIsPayOpen(true);
        }}
      />

      <One80PayModal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        orderId={`180_ord_${json.id}_${Date.now()}`}
        amount={json.pricing?.salePrice || 4999}
        offeringTitle={json.title}
        tenantName={tenantName}
        onSuccess={() => {
          setIsPayOpen(false);
          setIsEnrolled(true);
        }}
      />
    </div>
  );
};

