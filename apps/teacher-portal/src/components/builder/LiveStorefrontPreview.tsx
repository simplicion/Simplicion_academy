'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Sparkles, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ThemeCustomizerState } from './TokenCustomizer';

export interface LiveStorefrontPreviewProps {
  state: ThemeCustomizerState;
}

export const LiveStorefrontPreview: React.FC<LiveStorefrontPreviewProps> = ({ state }) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const containerWidth =
    device === 'mobile' ? 'max-w-[375px]' : device === 'tablet' ? 'max-w-[768px]' : 'w-full';

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Viewport Control Bar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] font-mono text-slate-400 ml-2">Live Storefront Preview</span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded text-xs transition ${
              device === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded text-xs transition ${
              device === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded text-xs transition ${
              device === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Viewport */}
      <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-900/50">
        <div
          className={`${containerWidth} w-full transition-all duration-300 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col`}
          style={{
            fontFamily: state.fontFamily,
          }}
        >
          {/* Header Preview */}
          <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            {state.headerLayout === 'login-left' && (
              <>
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-1.5 border border-slate-300 hover:bg-slate-50 transition"
                  style={{ borderRadius: state.borderRadius }}
                >
                  Student Login
                </button>
                <div className="text-center">
                  <h1 className="text-sm font-black tracking-tight text-slate-900">
                    {state.instituteName || 'Academy Name'}
                  </h1>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-1.5 text-white transition shadow-sm"
                  style={{
                    backgroundColor: state.primaryColor,
                    borderRadius: state.borderRadius,
                  }}
                >
                  Explore Batches
                </button>
              </>
            )}

            {state.headerLayout === 'split' && (
              <>
                <div className="text-left">
                  <h1 className="text-sm font-black tracking-tight text-slate-900">
                    {state.instituteName || 'Academy Name'}
                  </h1>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="text-xs font-bold px-3 py-1.5 border border-slate-300 hover:bg-slate-50 transition"
                    style={{ borderRadius: state.borderRadius }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="text-xs font-bold px-3 py-1.5 text-white transition"
                    style={{
                      backgroundColor: state.primaryColor,
                      borderRadius: state.borderRadius,
                    }}
                  >
                    Enroll Now
                  </button>
                </div>
              </>
            )}

            {state.headerLayout === 'centered' && (
              <div className="w-full flex flex-col items-center justify-center space-y-2">
                <h1 className="text-sm font-black tracking-tight text-slate-900">
                  {state.instituteName || 'Academy Name'}
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="text-[11px] font-bold px-3 py-1 border border-slate-300"
                    style={{ borderRadius: state.borderRadius }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="text-[11px] font-bold px-3 py-1 text-white"
                    style={{
                      backgroundColor: state.primaryColor,
                      borderRadius: state.borderRadius,
                    }}
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Hero Section Preview */}
          {state.showHero && (
            <div className="p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 text-center">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 inline-block mb-3"
                style={{
                  backgroundColor: `${state.primaryColor}15`,
                  color: state.primaryColor,
                  borderRadius: state.borderRadius,
                }}
              >
                Top Rated CUET Prep
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {state.tagline || 'Master CUET with India’s Elite Humanities Faculty'}
              </h2>
              <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto">
                Comprehensive video lectures, watermarked NCERT summary notes, and real NTA-pattern CBT mock tests.
              </p>
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-bold text-white shadow-md transition"
                  style={{
                    backgroundColor: state.primaryColor,
                    borderRadius: state.borderRadius,
                  }}
                >
                  Explore 2027 Batches &rarr;
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-bold text-slate-700 border border-slate-300 bg-white hover:bg-slate-50"
                  style={{ borderRadius: state.borderRadius }}
                >
                  Take Free Mock Test
                </button>
              </div>
            </div>
          )}

          {/* Offerings Slider Preview */}
          {state.showOfferings && (
            <div className="p-6 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Featured Academic Batches</h3>
                  <p className="text-[11px] text-slate-500">Full year comprehensive syllabus coverage</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Course Card 1 */}
                <div
                  className="p-3.5 border border-slate-200 bg-white hover:shadow-md transition space-y-2"
                  style={{ borderRadius: state.borderRadius }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Foundation 2027
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      50% OFF
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    CUET 2027: Humanities Foundation Batch
                  </h4>
                  <p className="text-[10px] text-slate-500">History • Pol Science • Geography</p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-black text-slate-900">₹ 4,999</span>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[11px] font-bold text-white"
                      style={{
                        backgroundColor: state.primaryColor,
                        borderRadius: state.borderRadius,
                      }}
                    >
                      Enroll
                    </button>
                  </div>
                </div>

                {/* Course Card 2 */}
                <div
                  className="p-3.5 border border-slate-200 bg-white hover:shadow-md transition space-y-2"
                  style={{ borderRadius: state.borderRadius }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      Crash Course
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Free Trial
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    CUET History Domain Intensive Crash
                  </h4>
                  <p className="text-[10px] text-slate-500">Class 12 Themes in Indian History</p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-black text-slate-900">₹ 1,999</span>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[11px] font-bold text-white"
                      style={{
                        backgroundColor: state.primaryColor,
                        borderRadius: state.borderRadius,
                      }}
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Explorer Preview */}
          {state.showCategories && (
            <div className="p-6 border-b border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Browse by Domain Subject</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {['History', 'Political Science', 'Geography', 'Economics'].map((sub) => (
                  <div
                    key={sub}
                    className="p-2.5 border border-slate-100 bg-slate-50/60 font-semibold text-slate-700 hover:bg-slate-100 transition"
                    style={{ borderRadius: state.borderRadius }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why Choose Us Preview */}
          {state.showWhyUs && (
            <div className="p-6 border-b border-slate-100 bg-slate-50 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 text-center">Why Learn With Us</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <ShieldCheck
                    className="w-5 h-5 mx-auto mb-1"
                    style={{ color: state.primaryColor }}
                  />
                  <h4 className="text-xs font-bold text-slate-800">Anti-Piracy Security</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Watermarked dynamic document viewer</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-800">Authentic CBT Mocks</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Exact NTA CUET format & scoring</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <CheckCircle2
                    className="w-5 h-5 mx-auto mb-1"
                    style={{ color: state.primaryColor }}
                  />
                  <h4 className="text-xs font-bold text-slate-800">Direct Doubt Support</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Daily educator answers & community</p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Accordion Preview */}
          {state.showFaq && (
            <div className="p-6 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h3>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800 flex justify-between">
                  <span>How do I access my enrolled courses?</span>
                  <span>+</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800 flex justify-between">
                  <span>Can I take CBT tests on mobile phone?</span>
                  <span>+</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Preview */}
          <footer className="p-4 bg-slate-900 text-slate-400 text-[10px] text-center mt-auto">
            © 2026 {state.instituteName || 'Academy Name'}. Powered by Simplicion Multi-Tenant Engine.
          </footer>
        </div>
      </div>
    </div>
  );
};

