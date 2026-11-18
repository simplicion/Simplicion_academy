'use client';

import React from 'react';

/**
 * Clean SAFS-04 Skeleton Loader displayed only while dynamic academy text, brand colors,
 * and critical above-the-fold images finish preloading — prevents any flash of default content.
 */
export const StorefrontSkeleton: React.FC = () => {
  return (
    <div
      data-testid="storefront-skeleton"
      aria-busy="true"
      aria-label="Loading academy storefront"
      className="min-h-screen bg-[#f8fafc] animate-pulse"
    >
      {/* Hero Skeleton */}
      <div className="bg-white border-b border-[#e2e8f0] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="h-6 w-48 rounded-full bg-[#e2e8f0]" />
            <div className="space-y-3">
              <div className="h-10 w-5/6 rounded-xl bg-[#e2e8f0]" />
              <div className="h-10 w-2/3 rounded-xl bg-[#e2e8f0]" />
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-4 w-full rounded bg-[#f1f5f9]" />
              <div className="h-4 w-4/5 rounded bg-[#f1f5f9]" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-40 rounded-lg bg-[#cbd5e1]" />
              <div className="h-11 w-36 rounded-lg bg-[#e2e8f0]" />
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="h-64 sm:h-80 w-full rounded-2xl bg-[#e2e8f0]" />
          </div>
        </div>
      </div>

      {/* Courses Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-36 rounded-full bg-[#e2e8f0]" />
          <div className="h-8 w-64 rounded-lg bg-[#e2e8f0]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-xs"
            >
              <div className="h-44 w-full bg-[#e2e8f0]" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 rounded bg-[#e2e8f0]" />
                <div className="h-3.5 w-full rounded bg-[#f1f5f9]" />
                <div className="h-3.5 w-2/3 rounded bg-[#f1f5f9]" />
                <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
                  <div className="h-6 w-20 rounded bg-[#e2e8f0]" />
                  <div className="h-9 w-28 rounded-lg bg-[#cbd5e1]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
