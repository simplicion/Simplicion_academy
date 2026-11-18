'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@simplicion/ui';
import { ShieldCheck, User, LogOut, Bell } from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { openOne80IdentityBottomSheet } from '../lib/one80-sdk';
import { applyBrandColorTokens } from '../lib/site-content';

interface One80AuthUser {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  provider?: '180_identity';
  token?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface HeaderProps {
  tenantName: string;
  tagline: string;
  headerLayout?: 'login-left' | 'login-right';
  studyLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  tenantName,
  tagline,
}) => {
  const pathname = usePathname();
  const [liveBrandName, setLiveBrandName] = useState(tenantName);
  const [liveLogoUrl, setLiveLogoUrl] = useState<string>('');
  const [liveTagline, setLiveTagline] = useState(tagline);
  const [brandHydrated, setBrandHydrated] = useState(false);
  const [user, setUser] = useState<One80AuthUser | null>(null);
  const [isOpeningAuth, setIsOpeningAuth] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotifications = useCallback(async (studentId?: string) => {
    if (!studentId) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications?studentId=${encodeURIComponent(studentId)}`
      );
      const json = await res.json();
      if (json?.success && typeof json.unreadCount === 'number') {
        setUnreadCount(json.unreadCount);
      }
    } catch {
      // ignore network failure
    }
  }, []);

  useEffect(() => {
    const studentId = user?.id;
    if (!studentId) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadNotifications(studentId);

    let notifChannel: any = null;
    try {
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ) {
        const supabase = createSupabaseClient();
        notifChannel = supabase
          .channel(`header-notifs-${studentId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'StudentNotification' },
            () => {
              fetchUnreadNotifications(studentId);
            }
          )
          .subscribe();
      }
    } catch {
      // Realtime optional fallback
    }

    const handleNotifRefresh = () => fetchUnreadNotifications(studentId);
    window.addEventListener('simplicion-notifications-updated', handleNotifRefresh);

    return () => {
      window.removeEventListener('simplicion-notifications-updated', handleNotifRefresh);
      if (notifChannel) {
        try {
          createSupabaseClient().removeChannel(notifChannel);
        } catch {
          // ignore
        }
      }
    };
  }, [user?.id, fetchUnreadNotifications]);

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

    // On the root Academy Directory ("/") with no academy slug, render platform branding cleanly
    if (!slug) {
      setLiveBrandName('Learnings Simplicion');
      setLiveLogoUrl('');
      setLiveTagline('Find your academy portal');
      applyBrandColorTokens('#2563eb');
      setBrandHydrated(true);
      if (typeof document !== 'undefined') {
        document.title = 'Find Your Academy | Learnings Simplicion';
      }
      return;
    }

    const applyBranding = (name?: string, branding?: Record<string, any>) => {
      const resolvedName = name?.trim() || 'Learnings Simplicion';
      setLiveBrandName(resolvedName);
      if (branding?.tagline !== undefined) setLiveTagline(branding.tagline || '');
      if (branding?.logoUrl !== undefined) setLiveLogoUrl(branding.logoUrl || '');
      if (branding?.primaryColor) {
        applyBrandColorTokens(branding.primaryColor);
      }
      if (branding?.accentColor) {
        document.documentElement.style.setProperty('--brand-accent', branding.accentColor);
      }
      if (branding?.fontFamily) {
        document.documentElement.style.setProperty('--brand-font', branding.fontFamily);
        document.body.style.fontFamily = branding.fontFamily;
      }
      setBrandHydrated(true);

      // Sync browser tab title & favicon to the academy's own brand identity
      if (typeof document !== 'undefined') {
        document.title = branding?.tagline
          ? `${resolvedName} | ${branding.tagline}`
          : resolvedName;
        if (branding?.logoUrl) {
          let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = branding.logoUrl;
        }
      }
    };

    const handleHydratedEvent = (ev: Event) => {
      const cfg = (ev as CustomEvent)?.detail;
      if (cfg && cfg.slug?.toLowerCase() === slug) {
        applyBranding(cfg.name, cfg.settings?.branding);
      }
    };

    const loadSiteConfig = () => {
      fetch(`${API_BASE_URL}/public/storefront?tenant=${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.success && json.siteConfig) {
            applyBranding(json.siteConfig.name, json.siteConfig.settings?.branding);
          } else {
            setLiveBrandName('Learnings Simplicion');
            setLiveLogoUrl('');
            setLiveTagline('Find your academy portal');
            setBrandHydrated(true);
          }
        })
        .catch(() => {
          setBrandHydrated(true);
        });
    };

    const existingSSR = (window as any).__SIMPLICION_STOREFRONT__;
    if (existingSSR && existingSSR.slug?.toLowerCase() === slug) {
      applyBranding(existingSSR.name, existingSSR.settings?.branding);
    } else {
      loadSiteConfig();
    }

    window.addEventListener('simplicion-storefront-hydrated', handleHydratedEvent);

    // Subscribe to Supabase Realtime for instant live storefront theme/brand updates
    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`header-live-branding-${slug}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Tenant' }, () => {
            loadSiteConfig();
          })
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'TenantSettings' },
            () => {
              loadSiteConfig();
            }
          )
          .subscribe();
      }
    } catch {
      // Realtime optional fallback
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

  useEffect(() => {
    const syncUser = () => {
      const saved = localStorage.getItem('simplicion_student');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    syncUser();

    // Handle 180 Identity OAuth callback (?code=...&state=...) directly on the single landing page
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const redirectUri = `${window.location.origin}/`;
      fetch(`${API_BASE_URL}/auth/180/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const payload: One80AuthUser = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              phone: data.user.phone || '',
              provider: '180_identity',
              token: data.token,
            };
            localStorage.setItem('simplicion_student', JSON.stringify(payload));
            if (data.token) {
              localStorage.setItem('180_identity_token', data.token);
            }
            setUser(payload);
            window.dispatchEvent(new Event('simplicion-auth-changed'));
          }
        })
        .catch(() => {
          // ignore network failures cleanly
        })
        .finally(() => {
          params.delete('code');
          params.delete('state');
          const cleanSearch = params.toString();
          const cleanUrl = `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', cleanUrl);
        });
    }

    const handleOpenAuth = () => {
      launch180BottomSheet();
    };

    window.addEventListener('simplicion-auth-changed', syncUser);
    window.addEventListener('open-180-auth', handleOpenAuth);
    return () => {
      window.removeEventListener('simplicion-auth-changed', syncUser);
      window.removeEventListener('open-180-auth', handleOpenAuth);
    };
  }, []);

  /**
   * Opens the official 180 Identity hosted bottom sheet produced directly by 180 Core SDK.
   * Zero custom login/signup form is rendered by our code.
   */
  const launch180BottomSheet = async () => {
    setIsOpeningAuth(true);
    try {
      await openOne80IdentityBottomSheet({
        onSuccess: async (res) => {
          setIsOpeningAuth(false);
          let payload: One80AuthUser = {
            id: res.user?.id || res.user?.sub || `180_usr_${Date.now()}`,
            name: res.user?.name || res.user?.email?.split('@')[0] || 'Student',
            email: res.user?.email || '',
            phone: res.user?.phone || '',
            provider: '180_identity',
            token: res.token || res.accessToken,
          };

          if (res.code) {
            try {
              const callbackRes = await fetch(`${API_BASE_URL}/auth/180/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code: res.code,
                  redirectUri: `${window.location.origin}/`,
                }),
              });
              const data = await callbackRes.json();
              if (callbackRes.ok && data.success && data.user) {
                payload = {
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email || '',
                  phone: data.user.phone || '',
                  provider: '180_identity',
                  token: data.token,
                };
              }
            } catch {
              // Keep details returned by 180 Identity SDK
            }
          }

          localStorage.setItem('simplicion_student', JSON.stringify(payload));
          if (payload.token) {
            localStorage.setItem('180_identity_token', payload.token);
          }
          setUser(payload);
          window.dispatchEvent(new Event('simplicion-auth-changed'));
        },
        onError: () => setIsOpeningAuth(false),
        onCancel: () => setIsOpeningAuth(false),
      });
    } catch {
      setIsOpeningAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('simplicion_student');
    localStorage.removeItem('180_identity_token');
    setUser(null);
    window.dispatchEvent(new Event('simplicion-auth-changed'));
  };

  const handleBrandClick = () => {
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const targetHome =
        parts[0] === 's' && parts[1]
          ? `/${parts[1]}`
          : parts[0] && !['test', 'notifications'].includes(parts[0])
            ? `/${parts[0]}`
            : '/';
      if (window.location.pathname !== targetHome) {
        window.location.href = targetHome;
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-950/95 border-b border-[#e2e8f0] dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Official Logo (or Academy Profile Custom Logo) + Brand Name */}
        <button
          type="button"
          onClick={handleBrandClick}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          {!brandHydrated ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-[#e2e8f0]" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-[#e2e8f0]" />
                <div className="hidden md:block h-2.5 w-44 rounded bg-[#f1f5f9]" />
              </div>
            </div>
          ) : (
            <>
              {liveLogoUrl ? (
                <img
                  src={liveLogoUrl}
                  alt={liveBrandName || 'Academy Logo'}
                  className="w-9 h-9 rounded-lg object-cover border border-[#e2e8f0] shrink-0"
                />
              ) : (
                <>
                  <img
                    src="/logo-black.svg"
                    alt={liveBrandName || 'Learnings Simplicion'}
                    className="w-8 h-8 object-contain dark:hidden shrink-0"
                  />
                  <img
                    src="/logo-white.svg"
                    alt={liveBrandName || 'Learnings Simplicion'}
                    className="w-8 h-8 object-contain hidden dark:block shrink-0"
                  />
                </>
              )}
              <div className="min-w-0">
                <span
                  className="block text-base sm:text-lg font-bold tracking-tight text-[#0f172a] dark:text-white group-hover:text-[var(--brand-primary,#2563eb)] transition-colors truncate"
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                >
                  {liveBrandName || 'Learnings Simplicion'}
                </span>
                {liveTagline && (
                  <span className="hidden md:block text-[11px] text-[#64748b] truncate max-w-[280px]">
                    {liveTagline}
                  </span>
                )}
              </div>
            </>
          )}
        </button>

        {/* Clean Single Login Button (Logged Out) or Notifications Bell + 180 ID Pill (Logged In) */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                href="/notifications"
                title="Notifications"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                data-testid="header-notifications-bell"
                className="relative p-2 rounded-lg border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#475569] hover:text-[#2563eb] transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#dc2626] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center space-x-2.5 bg-[#eff6ff] dark:bg-slate-800 py-1.5 px-3 rounded-full border border-[#dbeafe] dark:border-slate-700">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#1e3a8a] dark:text-blue-200">
                  <User className="w-3.5 h-3.5 text-[#2563eb] dark:text-blue-400" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </div>
                <span
                  title="Verified by 180 Identity"
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>180 ID</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  aria-label="Log out"
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              data-testid="header-login-btn"
              disabled={isOpeningAuth}
              onClick={() => launch180BottomSheet()}
              style={{ backgroundColor: 'var(--brand-primary, #2563eb)' }}
              className="px-5 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-95"
            >
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
