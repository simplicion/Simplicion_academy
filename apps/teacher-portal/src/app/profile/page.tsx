'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Upload,
  Save,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  ShieldCheck,
  User,
  Trash2,
} from 'lucide-react';
import {
  ACADEMY_CATEGORIES,
  AcademyProfileData,
  DEFAULT_ACADEMY_PROFILE,
  mergeAcademyProfile,
  compressUploadedImage,
} from '../../lib/site-content';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AcademyProfilePage() {
  const [profile, setProfile] = useState<AcademyProfileData>(DEFAULT_ACADEMY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

    fetch(`${API_BASE_URL}/site-config?tenant=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json.data) {
          setProfile(
            mergeAcademyProfile(
              json.data.name,
              json.data.slug,
              json.data.settings?.branding,
              json.data.settings?.contact
            )
          );
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const updateField = <K extends keyof AcademyProfileData>(
    key: K,
    value: AcademyProfileData[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const compressed = await compressUploadedImage(file, 400);
    updateField('logoUrl', compressed);
    showToast('Logo ready. Click "Save Academy Profile" to publish.');
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const compressed = await compressUploadedImage(file, 1400);
    updateField('bannerUrl', compressed);
    showToast('Banner ready. Click "Save Academy Profile" to publish.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/site-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: profile.slug,
          instituteName: profile.academyName,
          tagline: profile.tagline,
          logoUrl: profile.logoUrl,
          bannerUrl: profile.bannerUrl,
          contact: {
            educatorName: profile.educatorName,
            educatorTitle: profile.educatorTitle,
            category: profile.category,
            establishedYear: profile.establishedYear,
            languages: profile.languages,
            supportEmail: profile.supportEmail,
            supportPhone: profile.supportPhone,
            whatsappNumber: profile.whatsappNumber,
            address: profile.address,
            city: profile.city,
            supportHours: profile.supportHours,
            youtubeUrl: profile.youtubeUrl,
            instagramUrl: profile.instagramUrl,
            telegramUrl: profile.telegramUrl,
            websiteUrl: profile.websiteUrl,
            gstin: profile.gstin,
            policyNote: profile.policyNote,
          },
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const stored = localStorage.getItem('simplicion_active_tenant');
        let prev = {};
        if (stored) {
          try {
            prev = JSON.parse(stored);
          } catch {
            // ignore
          }
        }
        localStorage.setItem(
          'simplicion_active_tenant',
          JSON.stringify({ ...prev, name: profile.academyName, slug: profile.slug })
        );
        window.dispatchEvent(new Event('simplicion-profile-updated'));
        showToast('Academy Profile saved & synced live to Teacher Dashboard, Student Landing Page, and Student Portal!');
      } else {
        showToast(json.error || 'Could not save Academy Profile.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    showToast(`${label} copied to clipboard.`);
  };

  if (isLoading) {
    return (
      <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
        Loading Academy Profile...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full min-w-0 pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            Academy Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Manage your academy name, logo, banner, educator info, contact details, and social links. Synced live across your Student Website &amp; Student Portal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3001'}/${encodeURIComponent(profile.slug || 'cuet-humanities')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#64748b]" />
          </a>

          <button
            type="submit"
            disabled={isSaving}
            data-testid="save-academy-profile-btn"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Academy Profile'}</span>
          </button>
        </div>
      </div>

      {/* Card 1: Academy Visual Identity (Logo + Cover Banner + Name + URLs) */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#2563eb]" />
          <h2 className="text-sm font-bold text-[#0f172a]">Identity, Logo &amp; Cover Banner</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Cover Banner Uploader */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#334155]">
                Academy Cover Banner (Shown on Student Landing Page &amp; Student Portal)
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadBanner}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{profile.bannerUrl ? 'Replace Banner' : 'Upload Banner'}</span>
                </button>
                {profile.bannerUrl && (
                  <button
                    type="button"
                    onClick={() => updateField('bannerUrl', '')}
                    className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626]"
                    title="Remove banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {profile.bannerUrl ? (
              <img
                src={profile.bannerUrl}
                alt="Academy cover banner"
                className="w-full h-44 object-cover rounded-xl border border-[#e2e8f0]"
              />
            ) : (
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-[#cbd5e1] hover:border-[#2563eb] bg-[#f8fafc] flex flex-col items-center justify-center gap-1.5 text-xs text-[#64748b] transition"
              >
                <Upload className="w-5 h-5 text-[#2563eb]" />
                <span className="font-semibold text-[#0f172a]">Upload Academy Cover Banner</span>
                <span className="text-[11px]">Recommended 1400×360px (PNG, JPG, WebP)</span>
              </button>
            )}
          </div>

          {/* Logo + Name + Tagline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-3 space-y-2">
              <label className="block text-xs font-semibold text-[#334155]">Academy Logo</label>
              <div className="flex items-center gap-3">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Academy logo"
                    className="w-16 h-16 rounded-xl object-cover border border-[#e2e8f0]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
                    <img src="/logo-black.svg" alt="" className="w-8 h-8 object-contain" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe]"
                  >
                    {profile.logoUrl ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {profile.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateField('logoUrl', '')}
                      className="text-[11px] font-semibold text-[#dc2626] hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Academy / Institute Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.academyName}
                  onChange={(e) => updateField('academyName', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-semibold text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Academy Category / Focus
                </label>
                <select
                  value={profile.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                >
                  {ACADEMY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Academy Tagline / Short Bio
                </label>
                <input
                  type="text"
                  value={profile.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="One crisp line describing your academy..."
                  className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                />
              </div>
            </div>
          </div>

          {/* Live Portal URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#f1f5f9]">
            <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                  Academy Website URL
                </span>
                <span className="text-xs font-mono font-semibold text-[#0f172a] truncate block">
                  learnings.simplicion.com/{profile.slug}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyText(`https://learnings.simplicion.com/${profile.slug}`, 'Academy URL')}
                className="p-1.5 rounded-md text-[#64748b] hover:text-[#2563eb] hover:bg-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block">
                  Student Portal Pattern
                </span>
                <span className="text-xs font-mono font-semibold text-[#0f172a] truncate block">
                  learnings.simplicion.com/s/{profile.slug}/&lt;student-id&gt;
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyText(`https://learnings.simplicion.com/s/${profile.slug}/`, 'Student Portal URL')
                }
                className="p-1.5 rounded-md text-[#64748b] hover:text-[#2563eb] hover:bg-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Educator & Academic Details */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
          <User className="w-4 h-4 text-[#2563eb]" />
          <h2 className="text-sm font-bold text-[#0f172a]">Lead Educator &amp; Academic Details</h2>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              Lead Educator / Founder Name
            </label>
            <input
              type="text"
              value={profile.educatorName}
              onChange={(e) => updateField('educatorName', e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              Title / Credentials
            </label>
            <input
              type="text"
              value={profile.educatorTitle}
              onChange={(e) => updateField('educatorTitle', e.target.value)}
              placeholder="e.g. Senior Faculty • 10+ Yrs Exp"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              Teaching Languages
            </label>
            <input
              type="text"
              value={profile.languages}
              onChange={(e) => updateField('languages', e.target.value)}
              placeholder="e.g. English, Hindi"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              Established Year
            </label>
            <input
              type="text"
              value={profile.establishedYear}
              onChange={(e) => updateField('establishedYear', e.target.value)}
              placeholder="e.g. 2022"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Contact & Student Support */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#2563eb]" />
          <h2 className="text-sm font-bold text-[#0f172a]">
            Contact &amp; Student Support (Displayed on Website Footer &amp; Student Portal)
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#64748b]" /> Support Email
            </label>
            <input
              type="email"
              value={profile.supportEmail}
              onChange={(e) => updateField('supportEmail', e.target.value)}
              placeholder="support@youracademy.com"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#64748b]" /> Support Phone
            </label>
            <input
              type="text"
              value={profile.supportPhone}
              onChange={(e) => updateField('supportPhone', e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              WhatsApp Helpdesk Number (With Country Code)
            </label>
            <input
              type="text"
              value={profile.whatsappNumber}
              onChange={(e) => updateField('whatsappNumber', e.target.value)}
              placeholder="919876543210"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#64748b]" /> City / Region
            </label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="New Delhi, India"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              Campus / Office Address (Optional)
            </label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Building / Street address"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#64748b]" /> Support Hours
            </label>
            <input
              type="text"
              value={profile.supportHours}
              onChange={(e) => updateField('supportHours', e.target.value)}
              placeholder="Mon–Sat, 10:00 AM – 7:00 PM IST"
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Card 4: Social Links & Legal / Trust Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2563eb]" />
            <h2 className="text-sm font-bold text-[#0f172a]">Social &amp; Community Links</h2>
          </div>

          <div className="p-6 space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#334155]">YouTube Channel URL</label>
              <input
                type="url"
                value={profile.youtubeUrl}
                onChange={(e) => updateField('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/@youracademy"
                className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#334155]">Instagram Profile URL</label>
              <input
                type="url"
                value={profile.instagramUrl}
                onChange={(e) => updateField('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/youracademy"
                className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#334155]">Telegram Group / Channel URL</label>
              <input
                type="url"
                value={profile.telegramUrl}
                onChange={(e) => updateField('telegramUrl', e.target.value)}
                placeholder="https://t.me/youracademy"
                className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#334155]">Official Website / LinkedIn</label>
              <input
                type="url"
                value={profile.websiteUrl}
                onChange={(e) => updateField('websiteUrl', e.target.value)}
                placeholder="https://youracademy.com"
                className="w-full px-3 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
            <h2 className="text-sm font-bold text-[#0f172a]">Trust, Billing &amp; Policy Info</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#334155]">
                GSTIN / Registration Number (Optional)
              </label>
              <input
                type="text"
                value={profile.gstin}
                onChange={(e) => updateField('gstin', e.target.value)}
                placeholder="e.g. 07AABCS1429B1Z5"
                className="w-full px-3.5 py-2 text-xs font-mono text-[#0f172a] border border-[#cbd5e1] rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#334155]">
                Enrollment / Support Policy Note (Shown in Footer)
              </label>
              <textarea
                rows={4}
                value={profile.policyNote}
                onChange={(e) => updateField('policyNote', e.target.value)}
                placeholder="e.g. Instant digital classroom access upon enrollment. Reach out to support for assistance."
                className="w-full px-3.5 py-2 text-xs text-[#0f172a] border border-[#cbd5e1] rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
