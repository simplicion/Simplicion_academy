'use client';

import React from 'react';
import { Card, Button } from '@simplicion/ui';
import { Palette, Type, Building2, MessageSquareText, Undo2, Save, Check } from 'lucide-react';

export interface ThemeCustomizerState {
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  fontFamily: string;
  headerLayout: 'centered' | 'split' | 'login-left';
  instituteName: string;
  tagline: string;
  showHero: boolean;
  showOfferings: boolean;
  showCategories: boolean;
  showWhyUs: boolean;
  showFaq: boolean;
}

export interface TokenCustomizerProps {
  state: ThemeCustomizerState;
  onChange: (updates: Partial<ThemeCustomizerState>) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

export interface ThemePreset {
  name: string;
  primary: string;
  secondary: string;
  description: string;
}

export const PRESET_THEMES: ThemePreset[] = [
  { name: 'Royal Blue (Default)', primary: '#2563eb', secondary: '#1d4ed8', description: 'Classic & Trustworthy' },
  { name: 'Emerald Green', primary: '#059669', secondary: '#047857', description: 'Vibrant & Growth' },
  { name: 'Deep Purple', primary: '#7c3aed', secondary: '#6d28d9', description: 'Premium & Scholarly' },
  { name: 'Crimson Rose', primary: '#e11d48', secondary: '#be123c', description: 'Energetic & Bold' },
  { name: 'Warm Amber', primary: '#d97706', secondary: '#b45309', description: 'Warmth & Focus' },
  { name: 'Indigo Prestige', primary: '#4f46e5', secondary: '#4338ca', description: 'Modern & Confident' },
  { name: 'Teal Academy', primary: '#0d9488', secondary: '#0f766e', description: 'Calm & Balanced' },
  { name: 'Slate Graphite', primary: '#334155', secondary: '#1e293b', description: 'Sleek & Minimal' },
];

export const PRESET_COLORS = PRESET_THEMES.map((t) => ({ name: t.name, hex: t.primary }));

export const PRESET_RADII = [
  { label: 'Sharp (0px)', value: '0px' },
  { label: 'Subtle (4px)', value: '4px' },
  { label: 'Modern (8px)', value: '8px' },
  { label: 'Soft (16px)', value: '16px' },
  { label: 'Pill (9999px)', value: '9999px' },
];

export interface FontPreset {
  name: string;
  label: string;
  category: string;
  value: string;
  sample: string;
}

export const PRESET_FONTS: FontPreset[] = [
  {
    name: 'Inter',
    label: 'Inter',
    category: 'Clean & Professional',
    value: "'Inter', sans-serif",
    sample: 'Agile & modern learning experiences',
  },
  {
    name: 'Plus Jakarta Sans',
    label: 'Plus Jakarta Sans',
    category: 'Modern Grotesk',
    value: "'Plus Jakarta Sans', sans-serif",
    sample: 'Crisp geometry for digital education',
  },
  {
    name: 'Outfit',
    label: 'Outfit',
    category: 'Geometric & Bold',
    value: "'Outfit', sans-serif",
    sample: 'Distinctive, punchy headline typography',
  },
  {
    name: 'DM Sans',
    label: 'DM Sans',
    category: 'Friendly & Humanist',
    value: "'DM Sans', sans-serif",
    sample: 'Warm, approachable and highly readable',
  },
  {
    name: 'Poppins',
    label: 'Poppins',
    category: 'Rounded Geometric',
    value: "'Poppins', sans-serif",
    sample: 'Popular, friendly student portal style',
  },
  {
    name: 'Playfair Display',
    label: 'Playfair Display',
    category: 'Editorial & Academic Serif',
    value: "'Playfair Display', serif",
    sample: 'Prestigious, scholarly literature elegance',
  },
  {
    name: 'Noto Sans Devanagari',
    label: 'Noto Sans Devanagari',
    category: 'Bilingual & Indic Script',
    value: "'Noto Sans Devanagari', sans-serif",
    sample: 'शिक्षा और सफलता की नई राह',
  },
];

export const TokenCustomizer: React.FC<TokenCustomizerProps> = ({
  state,
  onChange,
  onSave,
  onReset,
  isSaving = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Storefront Design Controls</h2>
          <p className="text-xs text-slate-500">Live preview reflects your brand and theme edits instantly</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1 text-xs">
            <Undo2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Publishing...' : 'Publish Live'}</span>
          </Button>
        </div>
      </div>

      {/* Group 1: Brand Name & Hero Tagline */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Brand Name & Hero Tagline</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Brand / Academy Name
            </label>
            <input
              type="text"
              value={state.instituteName}
              onChange={(e) => onChange({ instituteName: e.target.value })}
              placeholder="e.g. Humanities CUET Academy"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Displayed on your storefront navigation header, student portal title, and footer copyright.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Hero Tagline
            </label>
            <textarea
              rows={2}
              value={state.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="e.g. Premier Humanities Coaching for CUET UG Entrance Exam"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The primary hero headline shown prominently to students visiting your storefront.
            </p>
          </div>
        </div>
      </Card>

      {/* Group 2: Website Color & Theme */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Palette className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Website Color & Theme</h3>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-2 block">
            Select Color Theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {PRESET_THEMES.map((theme) => {
              const isSelected = state.primaryColor.toLowerCase() === theme.primary.toLowerCase();
              return (
                <button
                  key={theme.primary}
                  type="button"
                  onClick={() => onChange({ primaryColor: theme.primary, secondaryColor: theme.secondary })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-xs"
                      style={{ backgroundColor: theme.primary }}
                    />
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{theme.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{theme.description}</p>
                </button>
              );
            })}
          </div>

          <label className="text-xs font-semibold text-slate-700 mb-2 block">
            Custom Brand Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={state.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5"
            />
            <input
              type="text"
              value={state.primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              className="text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg w-28 uppercase focus:ring-2 focus:ring-blue-500/20"
              placeholder="#2563EB"
            />
            <span className="text-[11px] text-slate-400">
              Live updates CTA buttons, active tabs, and accent badges.
            </span>
          </div>
        </div>
      </Card>

      {/* Group 3: Font Selection */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Type className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Website Font</h3>
        </div>

        <div className="space-y-2">
          {PRESET_FONTS.map((f) => {
            const isSelected = state.fontFamily === f.value;
            return (
              <label
                key={f.value}
                onClick={() => onChange({ fontFamily: f.value })}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 text-blue-950 ring-1 ring-blue-600/30'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold" style={{ fontFamily: f.value }}>
                      {f.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      • {f.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500" style={{ fontFamily: f.value }}>
                    {f.sample}
                  </p>
                </div>
                <input
                  type="radio"
                  name="fontFamily"
                  checked={isSelected}
                  onChange={() => onChange({ fontFamily: f.value })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
              </label>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
