'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Monitor,
  Smartphone,
  Image as ImageIcon,
} from 'lucide-react';
import {
  BRAND_COLOR_SWATCHES,
  DEFAULT_WEBSITE_CONTENT,
  WebsiteSectionContent,
  mergeWebsiteContent,
  compressUploadedImage,
} from '../../lib/site-content';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type SectionKey = 'hero' | 'courses' | 'showcase' | 'whyUs' | 'faqs';

export default function WebsiteEditorPage() {
  const [tenantSlug, setTenantSlug] = useState('cuet-humanities');
  const [academyName, setAcademyName] = useState('Learnings Simplicion');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [content, setContent] = useState<WebsiteSectionContent>(DEFAULT_WEBSITE_CONTENT);
  const [openSection, setOpenSection] = useState<SectionKey | null>('hero');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const heroFileRef = useRef<HTMLInputElement>(null);
  const showcaseFileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let slug = 'cuet-humanities';
    const stored = localStorage.getItem('simplicion_active_tenant');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.slug) slug = parsed.slug;
      } catch {
        // ignore
      }
    }
    setTenantSlug(slug);

    fetch(`${API_BASE_URL}/site-config?tenant=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json.data) {
          if (json.data.name) setAcademyName(json.data.name);
          const branding = json.data.settings?.branding || {};
          if (branding.primaryColor) setPrimaryColor(branding.primaryColor);
          if (branding.logoUrl) setLogoUrl(branding.logoUrl);
          setContent(mergeWebsiteContent(branding.websiteContent));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/site-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: tenantSlug,
          primaryColor,
          tagline: content.hero.tagline,
          websiteContent: content,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Website & brand color published live across Student Landing Page & Student Portal!');
      } else {
        showToast(json.error || 'Could not publish website changes.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!confirm('Reset all website sections back to clean neutral default copy & images?')) return;
    setContent(DEFAULT_WEBSITE_CONTENT);
    setPrimaryColor('#2563eb');
    showToast('Reset to neutral defaults. Click "Publish Live" to apply.');
  };

  const handleUploadSectionImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'hero' | 'showcase'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const compressed = await compressUploadedImage(file, 1200);
    if (target === 'hero') {
      setContent((prev) => ({ ...prev, hero: { ...prev.hero, heroImageUrl: compressed } }));
    } else {
      setContent((prev) => ({ ...prev, showcase: { ...prev.showcase, imageUrl: compressed } }));
    }
    showToast('Image optimized and ready. Click "Publish Live" to save.');
  };

  const toggleSectionAccordion = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  if (isLoading) {
    return (
      <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
        Loading Website Editor...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Action Header */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            Website Editor
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Customize every section, text, image, and your single brand color. Changes apply live to both your Student Landing Page and Student Portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Reset Neutral</span>
          </button>

          <a
            href={`${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3001'}/${encodeURIComponent(tenantSlug || 'cuet-humanities')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
          >
            <span>Open Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#64748b]" />
          </a>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            data-testid="publish-website-btn"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Section Controls (Left) + Live Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Single Color Picker + Expandable Section Accordions (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Single Brand Accent Color Picker */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#2563eb]" />
                <div>
                  <h2 className="text-sm font-bold text-[#0f172a]">
                    Single Brand Accent Color
                  </h2>
                  <p className="text-[11px] text-[#64748b]">
                    Choose one color — applied automatically across your Student Landing Page &amp; Student Portal.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a]">
                {primaryColor}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {BRAND_COLOR_SWATCHES.map((swatch) => {
                const isSelected = primaryColor.toLowerCase() === swatch.hex.toLowerCase();
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setPrimaryColor(swatch.hex)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'border-[#0f172a] bg-[#f8fafc] ring-2 ring-[#0f172a]/10 text-[#0f172a]'
                        : 'border-[#e2e8f0] bg-white text-[#475569] hover:border-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span>{swatch.name}</span>
                  </button>
                );
              })}

              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#e2e8f0] bg-white text-[#475569] cursor-pointer hover:border-[#cbd5e1]">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span>Custom</span>
              </label>
            </div>
          </div>

          {/* SECTION 1: HERO SECTION */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSectionAccordion('hero')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-[#f8fafc] hover:bg-[#f1f5f9]/70 transition"
            >
              <div className="flex items-center gap-2.5">
                {openSection === 'hero' ? (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8]">
                  Section 1
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">Hero Banner &amp; Highlights</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContent((p) => ({ ...p, hero: { ...p.hero, visible: !p.hero.visible } }));
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[#0f172a]"
              >
                {content.hero.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{content.hero.visible ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>

            {openSection === 'hero' && (
              <div className="p-5 space-y-4 border-t border-[#e2e8f0]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#334155]">Top Badge Text</label>
                    <input
                      type="text"
                      value={content.hero.badgeText}
                      onChange={(e) =>
                        setContent((p) => ({ ...p, hero: { ...p.hero, badgeText: e.target.value } }))
                      }
                      className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#334155]">Primary Button Text</label>
                    <input
                      type="text"
                      value={content.hero.primaryCtaText}
                      onChange={(e) =>
                        setContent((p) => ({
                          ...p,
                          hero: { ...p.hero, primaryCtaText: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Main Headline</label>
                  <input
                    type="text"
                    value={content.hero.headline}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, hero: { ...p.hero, headline: e.target.value } }))
                    }
                    className="w-full px-3 py-2 text-sm font-semibold text-[#0f172a] border border-[#cbd5e1] rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Accent Tagline</label>
                  <input
                    type="text"
                    value={content.hero.tagline}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, hero: { ...p.hero, tagline: e.target.value } }))
                    }
                    className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Hero Description</label>
                  <textarea
                    rows={3}
                    value={content.hero.description}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, hero: { ...p.hero, description: e.target.value } }))
                    }
                    className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">
                    Secondary Button Text (Leave blank to hide)
                  </label>
                  <input
                    type="text"
                    value={content.hero.secondaryCtaText}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        hero: { ...p.hero, secondaryCtaText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
                  />
                </div>

                {/* Hero Image Upload / Replace */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" />
                      Hero Feature Image
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        ref={heroFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadSectionImage(e, 'hero')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => heroFileRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setContent((p) => ({
                            ...p,
                            hero: { ...p.hero, heroImageUrl: '/images/hero-academy.svg' },
                          }))
                        }
                        className="text-[11px] font-semibold text-[#64748b] hover:text-[#0f172a]"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={content.hero.heroImageUrl}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, hero: { ...p.hero, heroImageUrl: e.target.value } }))
                    }
                    placeholder="Or paste an image URL..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg"
                  />
                </div>

                {/* Highlights Ribbon Items */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#334155]">
                      Key Highlight Cards
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setContent((p) => ({
                          ...p,
                          hero: {
                            ...p.hero,
                            highlights: [
                              ...p.hero.highlights,
                              { title: 'New Highlight', subtitle: 'Short supporting detail' },
                            ],
                          },
                        }))
                      }
                      className="text-xs font-semibold text-[#2563eb] inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                  {content.hero.highlights.map((h, idx) => (
                    <div key={idx} className="grid grid-cols-11 gap-2 items-center">
                      <input
                        type="text"
                        value={h.title}
                        onChange={(e) => {
                          const next = [...content.hero.highlights];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setContent((p) => ({ ...p, hero: { ...p.hero, highlights: next } }));
                        }}
                        className="col-span-5 px-2.5 py-1.5 text-xs border border-[#cbd5e1] rounded-lg"
                      />
                      <input
                        type="text"
                        value={h.subtitle}
                        onChange={(e) => {
                          const next = [...content.hero.highlights];
                          next[idx] = { ...next[idx], subtitle: e.target.value };
                          setContent((p) => ({ ...p, hero: { ...p.hero, highlights: next } }));
                        }}
                        className="col-span-5 px-2.5 py-1.5 text-xs border border-[#cbd5e1] rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = content.hero.highlights.filter((_, i) => i !== idx);
                          setContent((p) => ({ ...p, hero: { ...p.hero, highlights: next } }));
                        }}
                        className="col-span-1 p-1.5 text-[#94a3b8] hover:text-[#dc2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: COURSES SECTION HEADER */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSectionAccordion('courses')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-[#f8fafc] hover:bg-[#f1f5f9]/70 transition"
            >
              <div className="flex items-center gap-2.5">
                {openSection === 'courses' ? (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8]">
                  Section 2
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">Courses Section Heading</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContent((p) => ({
                    ...p,
                    courses: { ...p.courses, visible: !p.courses.visible },
                  }));
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b]"
              >
                {content.courses.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{content.courses.visible ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>

            {openSection === 'courses' && (
              <div className="p-5 space-y-3.5 border-t border-[#e2e8f0]">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Section Badge</label>
                  <input
                    type="text"
                    value={content.courses.badgeText}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        courses: { ...p.courses, badgeText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Heading</label>
                  <input
                    type="text"
                    value={content.courses.heading}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        courses: { ...p.courses, heading: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-sm font-semibold border border-[#cbd5e1] rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Subtitle</label>
                  <textarea
                    rows={2}
                    value={content.courses.subtitle}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        courses: { ...p.courses, subtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: CLASSROOM SHOWCASE & VISUAL */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSectionAccordion('showcase')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-[#f8fafc] hover:bg-[#f1f5f9]/70 transition"
            >
              <div className="flex items-center gap-2.5">
                {openSection === 'showcase' ? (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8]">
                  Section 3
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">About &amp; Visual Showcase</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContent((p) => ({
                    ...p,
                    showcase: { ...p.showcase, visible: !p.showcase.visible },
                  }));
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b]"
              >
                {content.showcase.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{content.showcase.visible ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>

            {openSection === 'showcase' && (
              <div className="p-5 space-y-4 border-t border-[#e2e8f0]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#334155]">Badge</label>
                    <input
                      type="text"
                      value={content.showcase.badgeText}
                      onChange={(e) =>
                        setContent((p) => ({
                          ...p,
                          showcase: { ...p.showcase, badgeText: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#334155]">Heading</label>
                    <input
                      type="text"
                      value={content.showcase.heading}
                      onChange={(e) =>
                        setContent((p) => ({
                          ...p,
                          showcase: { ...p.showcase, heading: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs font-semibold border border-[#cbd5e1] rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Description</label>
                  <textarea
                    rows={3}
                    value={content.showcase.description}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        showcase: { ...p.showcase, description: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-lg"
                  />
                </div>

                {/* Showcase Image Replace */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" />
                      Showcase Photo / Graphic
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        ref={showcaseFileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadSectionImage(e, 'showcase')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => showcaseFileRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-[#2563eb]"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setContent((p) => ({
                            ...p,
                            showcase: {
                              ...p.showcase,
                              imageUrl: '/images/showcase-classroom.svg',
                            },
                          }))
                        }
                        className="text-[11px] font-semibold text-[#64748b]"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={content.showcase.imageUrl}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        showcase: { ...p.showcase, imageUrl: e.target.value },
                      }))
                    }
                    placeholder="Or paste image URL..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg"
                  />
                </div>

                {/* Checklist Bullets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#334155]">Bullet Points</label>
                    <button
                      type="button"
                      onClick={() =>
                        setContent((p) => ({
                          ...p,
                          showcase: {
                            ...p.showcase,
                            bullets: [...p.showcase.bullets, 'New learning benefit'],
                          },
                        }))
                      }
                      className="text-xs font-semibold text-[#2563eb] inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Point
                    </button>
                  </div>
                  {content.showcase.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const next = [...content.showcase.bullets];
                          next[idx] = e.target.value;
                          setContent((p) => ({ ...p, showcase: { ...p.showcase, bullets: next } }));
                        }}
                        className="flex-1 px-3 py-1.5 text-xs border border-[#cbd5e1] rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = content.showcase.bullets.filter((_, i) => i !== idx);
                          setContent((p) => ({ ...p, showcase: { ...p.showcase, bullets: next } }));
                        }}
                        className="p-1.5 text-[#94a3b8] hover:text-[#dc2626]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: WHY CHOOSE US */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSectionAccordion('whyUs')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-[#f8fafc] hover:bg-[#f1f5f9]/70 transition"
            >
              <div className="flex items-center gap-2.5">
                {openSection === 'whyUs' ? (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8]">
                  Section 4
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">Why Choose Us Cards</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContent((p) => ({ ...p, whyUs: { ...p.whyUs, visible: !p.whyUs.visible } }));
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b]"
              >
                {content.whyUs.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{content.whyUs.visible ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>

            {openSection === 'whyUs' && (
              <div className="p-5 space-y-4 border-t border-[#e2e8f0]">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Section Heading</label>
                  <input
                    type="text"
                    value={content.whyUs.heading}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, whyUs: { ...p.whyUs, heading: e.target.value } }))
                    }
                    className="w-full px-3 py-2 text-sm font-semibold border border-[#cbd5e1] rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#334155]">Subtitle</label>
                  <input
                    type="text"
                    value={content.whyUs.subtitle}
                    onChange={(e) =>
                      setContent((p) => ({ ...p, whyUs: { ...p.whyUs, subtitle: e.target.value } }))
                    }
                    className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-lg"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#334155]">Feature Cards</label>
                    <button
                      type="button"
                      onClick={() =>
                        setContent((p) => ({
                          ...p,
                          whyUs: {
                            ...p.whyUs,
                            features: [
                              ...p.whyUs.features,
                              { title: 'New Pillar', description: 'Describe why learners love this.' },
                            ],
                          },
                        }))
                      }
                      className="text-xs font-semibold text-[#2563eb] inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Card
                    </button>
                  </div>
                  {content.whyUs.features.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={f.title}
                          onChange={(e) => {
                            const next = [...content.whyUs.features];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setContent((p) => ({ ...p, whyUs: { ...p.whyUs, features: next } }));
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#cbd5e1] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = content.whyUs.features.filter((_, i) => i !== idx);
                            setContent((p) => ({ ...p, whyUs: { ...p.whyUs, features: next } }));
                          }}
                          className="p-1.5 text-[#94a3b8] hover:text-[#dc2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={f.description}
                        onChange={(e) => {
                          const next = [...content.whyUs.features];
                          next[idx] = { ...next[idx], description: e.target.value };
                          setContent((p) => ({ ...p, whyUs: { ...p.whyUs, features: next } }));
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: FAQ */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div
              onClick={() => toggleSectionAccordion('faqs')}
              className="px-5 py-4 flex items-center justify-between cursor-pointer select-none bg-[#f8fafc] hover:bg-[#f1f5f9]/70 transition"
            >
              <div className="flex items-center gap-2.5">
                {openSection === 'faqs' ? (
                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8]">
                  Section 5
                </span>
                <h3 className="text-sm font-bold text-[#0f172a]">Frequently Asked Questions</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContent((p) => ({ ...p, faqs: { ...p.faqs, visible: !p.faqs.visible } }));
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b]"
              >
                {content.faqs.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{content.faqs.visible ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>

            {openSection === 'faqs' && (
              <div className="p-5 space-y-4 border-t border-[#e2e8f0]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#334155]">Heading</label>
                    <input
                      type="text"
                      value={content.faqs.heading}
                      onChange={(e) =>
                        setContent((p) => ({ ...p, faqs: { ...p.faqs, heading: e.target.value } }))
                      }
                      className="w-full px-3 py-2 text-xs font-semibold border border-[#cbd5e1] rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#334155]">Subtitle</label>
                    <input
                      type="text"
                      value={content.faqs.subtitle}
                      onChange={(e) =>
                        setContent((p) => ({ ...p, faqs: { ...p.faqs, subtitle: e.target.value } }))
                      }
                      className="w-full px-3 py-2 text-xs border border-[#cbd5e1] rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#334155]">Q&amp;A Items</label>
                    <button
                      type="button"
                      onClick={() =>
                        setContent((p) => ({
                          ...p,
                          faqs: {
                            ...p.faqs,
                            items: [
                              ...p.faqs.items,
                              { question: 'New question?', answer: 'Write a helpful answer here.' },
                            ],
                          },
                        }))
                      }
                      className="text-xs font-semibold text-[#2563eb] inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add FAQ
                    </button>
                  </div>
                  {content.faqs.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => {
                            const next = [...content.faqs.items];
                            next[idx] = { ...next[idx], question: e.target.value };
                            setContent((p) => ({ ...p, faqs: { ...p.faqs, items: next } }));
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#cbd5e1] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = content.faqs.items.filter((_, i) => i !== idx);
                            setContent((p) => ({ ...p, faqs: { ...p.faqs, items: next } }));
                          }}
                          className="p-1.5 text-[#94a3b8] hover:text-[#dc2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => {
                          const next = [...content.faqs.items];
                          next[idx] = { ...next[idx], answer: e.target.value };
                          setContent((p) => ({ ...p, faqs: { ...p.faqs, items: next } }));
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sticky Live Preview Frame (5 cols) */}
        <div className="xl:col-span-5 xl:sticky xl:top-6 space-y-3">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            {/* Preview Toolbar */}
            <div className="px-4 py-3 bg-[#0f172a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span>Live Student Website Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md ${
                    previewDevice === 'desktop' ? 'bg-white text-[#0f172a]' : 'text-white/70'
                  }`}
                  title="Desktop preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md ${
                    previewDevice === 'mobile' ? 'bg-white text-[#0f172a]' : 'text-white/70'
                  }`}
                  title="Mobile preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rendered Preview Canvas */}
            <div className="p-4 bg-[#f1f5f9] flex justify-center">
              <div
                className={`bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden transition-all max-h-[680px] overflow-y-auto ${
                  previewDevice === 'mobile' ? 'w-[320px]' : 'w-full'
                }`}
              >
                {/* Mini Header */}
                <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <img src="/logo-black.svg" alt="" className="w-5 h-5 object-contain" />
                    )}
                    <span className="text-xs font-bold text-[#0f172a] truncate">{academyName}</span>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Login
                  </span>
                </div>

                {/* Mini Hero */}
                {content.hero.visible && (
                  <div className="p-5 space-y-3 border-b border-[#f1f5f9]">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${primaryColor}16`,
                        color: primaryColor,
                      }}
                    >
                      {content.hero.badgeText}
                    </span>
                    <h4 className="text-base font-bold text-[#0f172a] leading-snug">
                      {content.hero.headline}
                    </h4>
                    <p className="text-[11px] font-semibold" style={{ color: primaryColor }}>
                      {content.hero.tagline}
                    </p>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">
                      {content.hero.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span
                        className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {content.hero.primaryCtaText}
                      </span>
                      {content.hero.secondaryCtaText && (
                        <span className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-[#0f172a] border border-[#cbd5e1]">
                          {content.hero.secondaryCtaText}
                        </span>
                      )}
                    </div>
                    {content.hero.heroImageUrl && (
                      <img
                        src={content.hero.heroImageUrl}
                        alt="Hero preview"
                        className="w-full h-36 object-cover rounded-lg border border-[#e2e8f0] mt-2"
                      />
                    )}
                  </div>
                )}

                {/* Mini Courses Section */}
                {content.courses.visible && (
                  <div className="p-5 bg-[#f8fafc] border-b border-[#f1f5f9] space-y-2">
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ color: primaryColor }}
                    >
                      {content.courses.badgeText}
                    </span>
                    <h5 className="text-sm font-bold text-[#0f172a]">{content.courses.heading}</h5>
                    <p className="text-[11px] text-[#64748b]">{content.courses.subtitle}</p>
                    <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#0f172a]">Your Published Courses</span>
                      <span
                        className="px-2 py-1 rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Buy Course
                      </span>
                    </div>
                  </div>
                )}

                {/* Mini Showcase */}
                {content.showcase.visible && (
                  <div className="p-5 space-y-2.5 border-b border-[#f1f5f9]">
                    <h5 className="text-sm font-bold text-[#0f172a]">{content.showcase.heading}</h5>
                    {content.showcase.imageUrl && (
                      <img
                        src={content.showcase.imageUrl}
                        alt="Showcase preview"
                        className="w-full h-32 object-cover rounded-lg border border-[#e2e8f0]"
                      />
                    )}
                    <p className="text-[11px] text-[#64748b]">{content.showcase.description}</p>
                  </div>
                )}

                {/* Mini Why Us */}
                {content.whyUs.visible && (
                  <div className="p-5 bg-[#f8fafc] space-y-2 border-b border-[#f1f5f9]">
                    <h5 className="text-sm font-bold text-[#0f172a]">{content.whyUs.heading}</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {content.whyUs.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="p-2.5 bg-white rounded-lg border border-[#e2e8f0]">
                          <p className="text-[11px] font-bold text-[#0f172a] truncate">{f.title}</p>
                          <p className="text-[10px] text-[#64748b] line-clamp-2 mt-0.5">
                            {f.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mini FAQs */}
                {content.faqs.visible && (
                  <div className="p-5 space-y-2">
                    <h5 className="text-sm font-bold text-[#0f172a]">{content.faqs.heading}</h5>
                    {content.faqs.items.slice(0, 2).map((q, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-[#e2e8f0] text-[11px] font-semibold text-[#0f172a]"
                      >
                        {q.question}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
