'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Clock, MessageCircle, Globe, Youtube, Instagram, Send } from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import {
  AcademyProfileData,
  DEFAULT_ACADEMY_PROFILE,
  mergeAcademyProfile,
} from '../lib/site-content';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface FooterProps {
  tenantName: string;
  tagline?: string;
  whatsappNumber?: string;
  supportPhone?: string;
}

export const Footer: React.FC<FooterProps> = ({ tenantName }) => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<AcademyProfileData>({
    ...DEFAULT_ACADEMY_PROFILE,
    academyName: tenantName || DEFAULT_ACADEMY_PROFILE.academyName,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentPath = pathname || window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    const pathSlug =
      pathParts[0] === 's' && pathParts[1]
        ? pathParts[1]
        : pathParts[0] && !['test', 'notifications'].includes(pathParts[0])
          ? pathParts[0]
          : null;
    const slug = (params.get('tenant') || params.get('academySlug') || pathSlug || '').toLowerCase();

    // On root Academy Directory ("/") show clean platform footer without single-academy details
    if (!slug) {
      setProfile({
        ...DEFAULT_ACADEMY_PROFILE,
        academyName: 'Learnings Simplicion',
        tagline: 'Search and visit your academy portal.',
      });
      return;
    }

    const applyConfig = (cfg: any) => {
      if (!cfg) return;
      setProfile(
        mergeAcademyProfile(
          cfg.name,
          cfg.slug,
          cfg.settings?.branding,
          cfg.settings?.contact
        )
      );
    };

    const handleHydratedEvent = (ev: Event) => {
      const cfg = (ev as CustomEvent)?.detail;
      if (cfg && cfg.slug?.toLowerCase() === slug) {
        applyConfig(cfg);
      }
    };

    const loadProfile = () => {
      fetch(`${API_BASE_URL}/public/storefront?tenant=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json?.success && json.siteConfig) {
            applyConfig(json.siteConfig);
          } else {
            setProfile({
              ...DEFAULT_ACADEMY_PROFILE,
              academyName: 'Learnings Simplicion',
              tagline: 'Search and visit your academy portal.',
            });
          }
        })
        .catch(() => {});
    };

    const existingSSR = (window as any).__SIMPLICION_STOREFRONT__;
    if (existingSSR && existingSSR.slug?.toLowerCase() === slug) {
      applyConfig(existingSSR);
    } else {
      loadProfile();
    }

    window.addEventListener('simplicion-storefront-hydrated', handleHydratedEvent);

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`footer-live-profile-${slug}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Tenant' }, loadProfile)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'TenantSettings' },
            loadProfile
          )
          .subscribe();
      }
    } catch {
      // optional
    }

    return () => {
      window.removeEventListener('simplicion-storefront-hydrated', handleHydratedEvent);
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [pathname]);

  const cleanWhatsapp = (profile.whatsappNumber || '').replace(/[^0-9]/g, '');

  return (
    <footer className="mt-auto bg-white border-t border-[#e2e8f0] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Academy Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={profile.academyName}
                  className="w-8 h-8 rounded-lg object-cover border border-[#e2e8f0]"
                />
              ) : (
                <img
                  src="/logo-black.svg"
                  alt="Learnings Simplicion"
                  className="w-7 h-7 object-contain"
                />
              )}
              <span
                className="text-base font-bold tracking-tight text-[#0f172a]"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                {profile.academyName}
              </span>
            </div>
            {profile.tagline && (
              <p className="text-xs text-[#64748b] leading-relaxed max-w-sm">
                {profile.tagline}
              </p>
            )}
            {profile.educatorName && (
              <p className="text-xs text-[#475569]">
                Led by <strong className="text-[#0f172a]">{profile.educatorName}</strong>
                {profile.educatorTitle ? ` • ${profile.educatorTitle}` : ''}
              </p>
            )}
            {(profile.category || profile.languages || profile.establishedYear) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {profile.category && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f8fafc] border border-[#e2e8f0] text-[#475569]">
                    {profile.category}
                  </span>
                )}
                {profile.languages && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f8fafc] border border-[#e2e8f0] text-[#475569]">
                    {profile.languages}
                  </span>
                )}
                {profile.establishedYear && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f8fafc] border border-[#e2e8f0] text-[#475569]">
                    Est. {profile.establishedYear}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Contact & Student Support */}
          <div className="space-y-2.5 text-xs text-[#475569]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
              Contact &amp; Support
            </h3>
            {profile.supportEmail && (
              <a
                href={`mailto:${profile.supportEmail}`}
                className="flex items-center gap-2 hover:text-[#0f172a]"
              >
                <Mail className="w-3.5 h-3.5 text-[#64748b]" />
                <span>{profile.supportEmail}</span>
              </a>
            )}
            {profile.supportPhone && (
              <a
                href={`tel:${profile.supportPhone}`}
                className="flex items-center gap-2 hover:text-[#0f172a]"
              >
                <Phone className="w-3.5 h-3.5 text-[#64748b]" />
                <span>{profile.supportPhone}</span>
              </a>
            )}
            {(profile.address || profile.city) && (
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#64748b] mt-0.5 shrink-0" />
                <span>{[profile.address, profile.city].filter(Boolean).join(', ')}</span>
              </p>
            )}
            {profile.supportHours && (
              <p className="flex items-center gap-2 text-[#64748b]">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{profile.supportHours}</span>
              </p>
            )}
          </div>

          {/* Social & Quick Help */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
              Connect With Us
            </h3>
            {cleanWhatsapp && (
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-95 transition"
                style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Support</span>
              </a>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {profile.youtubeUrl && (
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] hover:text-[#0f172a]"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </a>
              )}
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] hover:text-[#0f172a]"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              )}
              {profile.telegramUrl && (
                <a
                  href={profile.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] hover:text-[#0f172a]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] hover:text-[#0f172a]"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row + Sign up as a Teacher link */}
        <div className="pt-6 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748b]">
          <p>
            © {new Date().getFullYear()} {profile.academyName}. All rights reserved.
            {profile.gstin ? ` • GSTIN: ${profile.gstin}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {profile.policyNote ? <p>{profile.policyNote}</p> : null}
            <a
              href={process.env.NEXT_PUBLIC_TEACHER_PORTAL_URL || '/t'}
              data-testid="footer-teacher-signup-link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] border border-[#dbeafe] transition-colors"
            >
              <span>Sign up as a Teacher</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
