'use client';

import React from 'react';
import { Card, Button, Input, Badge } from '@simplicion/ui';
import { Palette, Layout, Type, Shield, Eye, Undo2, Save, Sparkles, Check } from 'lucide-react';

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

export const PRESET_COLORS = [
  { name: 'Royal Blue (Default)', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Crimson Rose', hex: '#e11d48' },
  { name: 'Warm Amber', hex: '#d97706' },
  { name: 'Slate Graphite', hex: '#334155' },
];

export const PRESET_RADII = [
  { label: 'Sharp (0px)', value: '0px' },
  { label: 'Subtle (4px)', value: '4px' },
  { label: 'Modern (8px)', value: '8px' },
  { label: 'Soft (16px)', value: '16px' },
  { label: 'Pill (9999px)', value: '9999px' },
];

export const PRESET_FONTS = [
  { label: 'Inter (Clean & Professional)', value: "'Inter', sans-serif" },
  { label: 'Plus Jakarta Sans (Modern Grotesk)', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Outfit (Geometric & Bold)', value: "'Outfit', sans-serif" },
  { label: 'DM Sans (Friendly & Humanist)', value: "'DM Sans', sans-serif" },
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
          <p className="text-xs text-slate-500">Live preview reflects your token edits instantly</p>
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

      {/* Group 1: Brand Colors */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Palette className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Brand Color Palette</h3>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-2 block">Primary Brand Color</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {PRESET_COLORS.map((col) => (
              <button
                key={col.hex}
                type="button"
                onClick={() => onChange({ primaryColor: col.hex })}
                className={`h-9 rounded-lg flex items-center justify-center transition-all border ${
                  state.primaryColor === col.hex
                    ? 'ring-2 ring-offset-2 ring-blue-600 scale-105 border-transparent'
                    : 'border-slate-200 hover:scale-102'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {state.primaryColor === col.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>

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
              className="text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg w-28 uppercase"
              placeholder="#2563EB"
            />
            <span className="text-[11px] text-slate-400">Used for CTA buttons, active tabs, and badges.</span>
          </div>
        </div>
      </Card>

      {/* Group 2: Typography & Border Radius */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Type className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Typography & Corner Radius</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Corner Border Radius</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_RADII.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onChange({ borderRadius: r.value })}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition ${
                    state.borderRadius === r.value
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">Font Family</label>
            <div className="space-y-1.5">
              {PRESET_FONTS.map((f) => (
                <label
                  key={f.value}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer text-xs transition ${
                    state.fontFamily === f.value
                      ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{f.label}</span>
                  <input
                    type="radio"
                    name="fontFamily"
                    checked={state.fontFamily === f.value}
                    onChange={() => onChange({ fontFamily: f.value })}
                    className="text-blue-600"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Group 3: Header Layout & Content */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Layout className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Layout & Navigation Variant</h3>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-2 block">Header Layout</label>
          <div className="grid grid-cols-3 gap-2">
            {(['login-left', 'split', 'centered'] as const).map((variant) => (
              <button
                key={variant}
                type="button"
                onClick={() => onChange({ headerLayout: variant })}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold capitalize transition ${
                  state.headerLayout === variant
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {variant.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Institute Brand Name</label>
            <input
              type="text"
              value={state.instituteName}
              onChange={(e) => onChange({ instituteName: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Hero Tagline</label>
            <input
              type="text"
              value={state.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Card>

      {/* Group 4: Section Toggles */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
          <Eye className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Storefront Section Visibility</h3>
        </div>

        <div className="space-y-2">
          {[
            { key: 'showHero', label: 'Hero Banner & Value Proposition' },
            { key: 'showOfferings', label: 'Featured Courses / Batches Slider' },
            { key: 'showCategories', label: 'Category & Subject Explorer' },
            { key: 'showWhyUs', label: 'Why Choose Us / Trust Badges' },
            { key: 'showFaq', label: 'Frequently Asked Questions (FAQ)' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <span className="font-medium">{item.label}</span>
              <input
                type="checkbox"
                checked={state[item.key as keyof ThemeCustomizerState] as boolean}
                onChange={(e) =>
                  onChange({ [item.key]: e.target.checked } as Partial<ThemeCustomizerState>)
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};

