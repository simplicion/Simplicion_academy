'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Radio,
  Users,
  ExternalLink,
  Wallet,
  Palette,
  Lock,
  Globe,
  EyeOff,
  LogOut,
} from 'lucide-react';
import {
  SubscriptionUpgradeModal,
  TeacherSubscriptionInfo,
} from '../subscription/SubscriptionUpgradeModal';
import { prefetchApiUrl, clearClientApiCache } from '../providers/FastApiProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Batches & Courses', href: '/batches', icon: BookOpen },
  { label: 'Live Classes', href: '/live-classes', icon: Radio },
  { label: 'Website Editor', href: '/website-editor', icon: Palette },
  { label: 'Payouts & Revenue', href: '/payouts', icon: Wallet },
  { label: 'Student Roster', href: '/students', icon: Users },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [academyName, setAcademyName] = useState('Learnings Simplicion');
  const [tenantSlug, setTenantSlug] = useState('cuet-humanities');
  const [logoUrl, setLogoUrl] = useState('');
  const [educatorName, setEducatorName] = useState('Lead Educator');
  const [supportEmail, setSupportEmail] = useState('support@simplicion.com');
  const [subscription, setSubscription] = useState<TeacherSubscriptionInfo | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [portalLive, setPortalLive] = useState(true);
  const [portalOfflineMessage, setPortalOfflineMessage] = useState(
    'This academy portal is temporarily unavailable while the educator updates courses and study material. Please check back soon!'
  );
  const [isUpdatingPortal, setIsUpdatingPortal] = useState(false);
  const [showOfflineNoticeEditor, setShowOfflineNoticeEditor] = useState(false);
  const [portalToast, setPortalToast] = useState<string | null>(null);

  const loadProfile = useCallback(() => {
    let activeSlug = 'cuet-humanities';
    const stored = localStorage.getItem('simplicion_active_tenant');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setAcademyName(parsed.name);
        if (parsed.slug) {
          setTenantSlug(parsed.slug);
          activeSlug = parsed.slug;
        }
      } catch {
        // ignore
      }
    }

    Promise.all([
      fetch(`${API_BASE_URL}/site-config?tenant=${encodeURIComponent(activeSlug)}`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/subscription/status?tenant=${encodeURIComponent(activeSlug)}`).then((r) => r.json()),
    ])
      .then(([json, subRes]) => {
        if (json?.success && json.data) {
          if (json.data.name) setAcademyName(json.data.name);
          if (json.data.slug) setTenantSlug(json.data.slug);
          if (typeof json.data.portalLive === 'boolean') setPortalLive(json.data.portalLive);
          if (json.data.portalOfflineMessage) {
            setPortalOfflineMessage(json.data.portalOfflineMessage);
          }
          const branding = json.data.settings?.branding || {};
          const contact = json.data.settings?.contact || {};
          if (branding.logoUrl !== undefined) setLogoUrl(branding.logoUrl || '');
          if (contact.educatorName) setEducatorName(contact.educatorName);
          if (contact.supportEmail) setSupportEmail(contact.supportEmail);
        }
        if (subRes?.success && subRes.subscription) {
          setSubscription(subRes.subscription);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadProfile();
    window.addEventListener('simplicion-profile-updated', loadProfile);
    window.addEventListener('simplicion-subscription-updated', loadProfile);
    window.addEventListener('simplicion-portal-status-updated', loadProfile);
    return () => {
      window.removeEventListener('simplicion-profile-updated', loadProfile);
      window.removeEventListener('simplicion-subscription-updated', loadProfile);
      window.removeEventListener('simplicion-portal-status-updated', loadProfile);
    };
  }, [loadProfile]);

  const handleTogglePortalStatus = async (nextLive: boolean) => {
    if (isUpdatingPortal || nextLive === portalLive) return;
    setIsUpdatingPortal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/site-config/portal-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: tenantSlug,
          portalLive: nextLive,
          portalOfflineMessage,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPortalLive(data.portalLive);
        if (data.portalOfflineMessage) setPortalOfflineMessage(data.portalOfflineMessage);
        window.dispatchEvent(new Event('simplicion-portal-status-updated'));
        setPortalToast(
          data.portalLive ? 'Student Portal is now Live!' : 'Student Portal set to Offline'
        );
        setTimeout(() => setPortalToast(null), 2600);
      }
    } finally {
      setIsUpdatingPortal(false);
    }
  };

  const handleSaveOfflineMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingPortal) return;
    setIsUpdatingPortal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/site-config/portal-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: tenantSlug,
          portalLive,
          portalOfflineMessage,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowOfflineNoticeEditor(false);
        setPortalToast('Offline notice updated');
        setTimeout(() => setPortalToast(null), 2400);
      }
    } finally {
      setIsUpdatingPortal(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('simplicion_teacher_token');
      localStorage.removeItem('simplicion_active_tenant');
      localStorage.removeItem('180_identity_token');
      clearClientApiCache();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  const initials = educatorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'LE';

  return (
    <aside className="w-64 bg-white text-[#0f172a] flex flex-col h-[100dvh] border-r border-[#e2e8f0] shrink-0">
      {/* Official Brand & Academy Logo Header (SAFS-04) */}
      <div className="h-16 px-4 border-b border-[#e2e8f0] flex items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={academyName}
            className="w-8 h-8 rounded-lg object-cover border border-[#e2e8f0] shrink-0"
          />
        ) : (
          <img
            src="/logo-black.svg"
            alt="Learnings Simplicion"
            className="w-8 h-8 object-contain shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2
            className="text-sm font-bold truncate text-[#0f172a]"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {academyName}
          </h2>
          <p className="text-[11px] text-[#64748b] truncate">Learnings Simplicion</p>
        </div>
      </div>

      {/* Live Educator Subscription Pill (₹250/month) */}
      {subscription?.isActive ? (
        <div className="px-3.5 py-2.5 mx-3 mt-4 mb-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#334155]">Educator Plan</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            ₹250/mo
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsUpgradeModalOpen(true)}
          data-testid="sidebar-upgrade-plan-btn"
          className="px-3.5 py-2.5 mx-3 mt-4 mb-2 rounded-lg bg-[#fffbeb] hover:bg-[#fef3c7] border border-[#fde68a] flex items-center justify-between gap-2 transition-colors text-left"
        >
          <span className="text-xs font-semibold text-[#92400e] flex items-center gap-1.5 min-w-0">
            <Lock className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
            <span className="truncate">Free Draft</span>
          </span>
          <span className="inline-flex items-center text-[11px] font-bold text-white bg-[#2563eb] px-2 py-0.5 rounded-full shrink-0">
            ₹250/mo
          </span>
        </button>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const dynamicBadge = item.badge;

          const handlePrefetch = () => {
            const enc = encodeURIComponent(tenantSlug || 'cuet-humanities');
            if (item.href === '/dashboard') prefetchApiUrl(`${API_BASE_URL}/academy/overview?tenant=${enc}`);
            else if (item.href === '/batches') prefetchApiUrl(`${API_BASE_URL}/courses?tenant=${enc}`);
            else if (item.href === '/live-classes') prefetchApiUrl(`${API_BASE_URL}/academy/live-sessions?tenant=${enc}`);
            else if (item.href === '/payouts') prefetchApiUrl(`${API_BASE_URL}/pay/180/payouts?tenant=${enc}&tenantId=${enc}`);
            else if (item.href === '/students') prefetchApiUrl(`${API_BASE_URL}/academy/students?tenant=${enc}`);
            else if (item.href === '/website-editor') prefetchApiUrl(`${API_BASE_URL}/site-config?tenant=${enc}`);
          };

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={handlePrefetch}
              onFocus={handlePrefetch}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                  : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#2563eb]' : 'text-[#64748b]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {dynamicBadge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-[#fef2f2] text-[#dc2626]'
                  }`}
                >
                  {dynamicBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions: Student Portal Publish Toggle, View Website & Academy Profile Shortcut */}
      <div className="p-3 border-t border-[#e2e8f0] space-y-2.5">
        {portalToast && (
          <div className="px-2.5 py-1.5 rounded-lg bg-[#0f172a] text-white text-[11px] font-semibold text-center">
            {portalToast}
          </div>
        )}

        {/* Compact Student Portal Live / Unlive Control */}
        <div
          data-testid="sidebar-portal-visibility"
          className={`rounded-xl border p-2.5 space-y-2 transition-colors ${
            portalLive
              ? 'bg-[#f8fafc] border-[#e2e8f0]'
              : 'bg-[#fffbeb]/80 border-[#fde68a]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#334155] flex items-center gap-1.5">
              {portalLive ? (
                <Globe className="w-3.5 h-3.5 text-[#059669]" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-[#d97706]" />
              )}
              <span>Student Portal</span>
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                portalLive
                  ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                  : 'bg-white text-[#b45309] border-[#fde68a]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  portalLive ? 'bg-[#10b981]' : 'bg-[#f59e0b]'
                }`}
              />
              {portalLive ? 'Live' : 'Offline'}
            </span>
          </div>

          <div
            role="group"
            aria-label="Student Portal Visibility"
            className="grid grid-cols-2 p-0.5 rounded-lg bg-white border border-[#e2e8f0]"
          >
            <button
              type="button"
              disabled={isUpdatingPortal}
              data-testid="portal-toggle-live-btn"
              onClick={() => handleTogglePortalStatus(true)}
              className={`inline-flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-semibold transition-all disabled:opacity-60 ${
                portalLive
                  ? 'bg-[#10b981] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0f172a]'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Live</span>
            </button>
            <button
              type="button"
              disabled={isUpdatingPortal}
              data-testid="portal-toggle-unlive-btn"
              onClick={() => handleTogglePortalStatus(false)}
              className={`inline-flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-semibold transition-all disabled:opacity-60 ${
                !portalLive
                  ? 'bg-[#d97706] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0f172a]'
              }`}
            >
              <EyeOff className="w-3 h-3" />
              <span>Unlive</span>
            </button>
          </div>

          {!portalLive && (
            <div className="pt-0.5">
              {!showOfflineNoticeEditor ? (
                <button
                  type="button"
                  onClick={() => setShowOfflineNoticeEditor(true)}
                  className="text-[11px] font-semibold text-[#b45309] hover:underline"
                >
                  Edit offline notice message
                </button>
              ) : (
                <form onSubmit={handleSaveOfflineMessage} className="space-y-1.5">
                  <textarea
                    rows={2}
                    value={portalOfflineMessage}
                    onChange={(e) => setPortalOfflineMessage(e.target.value)}
                    placeholder="Friendly unavailable message..."
                    className="w-full px-2 py-1.5 text-[11px] text-[#0f172a] bg-white border border-[#fcd34d] rounded-md focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowOfflineNoticeEditor(false)}
                      className="px-2 py-1 text-[10px] font-semibold text-[#64748b] hover:text-[#0f172a]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingPortal}
                      className="px-2.5 py-1 rounded-md text-[10px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <a
          href={`${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3001'}/${encodeURIComponent(tenantSlug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors"
        >
          <span>View Student Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#64748b]" />
        </a>

        <div className="flex items-center gap-1.5">
          <Link
            href="/profile"
            className="flex-1 min-w-0 flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#f8fafc] transition-colors"
            title="Academy Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#dbeafe] flex items-center justify-center font-bold text-xs text-[#2563eb] shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0f172a] truncate">{educatorName}</p>
              <p className="text-[11px] text-[#64748b] truncate">{supportEmail}</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            data-testid="sidebar-logout-btn"
            title="Log out"
            aria-label="Log out"
            className="p-2 rounded-lg text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] border border-transparent hover:border-[#fecaca] transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        tenantSlug={tenantSlug}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgraded={(sub) => {
          setSubscription(sub);
          setIsUpgradeModalOpen(false);
        }}
      />
    </aside>
  );
};
