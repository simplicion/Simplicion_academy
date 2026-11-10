'use client';

import React, { useState } from 'react';
import { TokenCustomizer, ThemeCustomizerState } from '../../components/builder/TokenCustomizer';
import { LiveStorefrontPreview } from '../../components/builder/LiveStorefrontPreview';
import { CheckCircle2 } from 'lucide-react';

const INITIAL_STATE: ThemeCustomizerState = {
  primaryColor: '#2563eb',
  secondaryColor: '#1d4ed8',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  headerLayout: 'login-left',
  instituteName: 'Humanities CUET Academy',
  tagline: 'Premier Humanities Coaching for CUET UG Entrance Exam',
  showHero: true,
  showOfferings: true,
  showCategories: true,
  showWhyUs: true,
  showFaq: true,
};

export default function VisualPortalBuilderPage() {
  const [themeState, setThemeState] = useState<ThemeCustomizerState>(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleUpdate = (updates: Partial<ThemeCustomizerState>) => {
    setThemeState((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulating instant commit to Tenant theme configuration
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }, 600);
  };

  const handleReset = () => {
    setThemeState(INITIAL_STATE);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <p className="font-bold">Storefront Updated!</p>
            <p className="text-slate-400">Tokens published live to Student Portal.</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">No-Code Visual Portal Builder</h2>
        <p className="text-xs text-slate-500 mt-1">
          Customize your brand name, hero tagline, website color theme, and font with live interactive preview.
        </p>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Pane: Customizer Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TokenCustomizer
            state={themeState}
            onChange={handleUpdate}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
          />
        </div>

        {/* Right Pane: Live Storefront Preview (7 cols) */}
        <div className="lg:col-span-7 sticky top-20 h-[calc(100vh-7rem)]">
          <LiveStorefrontPreview state={themeState} />
        </div>
      </div>
    </div>
  );
}

