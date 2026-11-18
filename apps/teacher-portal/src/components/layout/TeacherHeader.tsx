'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export interface TeacherHeaderProps {
  title?: string;
  subtitle?: string;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = () => {
  const [tenantSlug, setTenantSlug] = useState('');
  const [academyName, setAcademyName] = useState('Learnings Simplicion');
  const [teacherName, setTeacherName] = useState('Educator');
  const [portalLive, setPortalLive] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    let activeSlug = 'cuet-humanities';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('slug');
      const n = params.get('name');
      const t = params.get('teacher');

      if (s) {
        setTenantSlug(s);
        activeSlug = s;
      }
      if (n) setAcademyName(n);
      if (t) setTeacherName(t);

      const stored = localStorage.getItem('simplicion_active_tenant');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!s && parsed.slug) {
            setTenantSlug(parsed.slug);
            activeSlug = parsed.slug;
          }
          if (!n && parsed.name) setAcademyName(parsed.name);
        } catch {
          // ignore
        }
      }
    }

    const fetchStatus = () => {
      fetch(`${apiBase}/site-config?tenant=${encodeURIComponent(activeSlug)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json?.success && json.data) {
            if (json.data.name) setAcademyName(json.data.name);
            if (typeof json.data.portalLive === 'boolean') setPortalLive(json.data.portalLive);
          }
        })
        .catch(() => {});
    };

    fetchStatus();
    window.addEventListener('simplicion-portal-status-updated', fetchStatus);
    window.addEventListener('simplicion-profile-updated', fetchStatus);
    return () => {
      window.removeEventListener('simplicion-portal-status-updated', fetchStatus);
      window.removeEventListener('simplicion-profile-updated', fetchStatus);
    };
  }, []);

  const cleanSlug = tenantSlug === 'cuet-humanities' ? 'humanities-cuet' : tenantSlug;
  const studentPortalUrl = `${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'http://localhost:3001'}/${cleanSlug}`;
  const prodDisplayUrl = `learnings.simplicion.com/${cleanSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${prodDisplayUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1
            className="text-base font-bold text-[#0f172a] leading-tight truncate"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            {academyName}
          </h1>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
              portalLive
                ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#047857]'
                : 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
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
        <p className="text-xs text-[#64748b] truncate">
          {teacherName} •{' '}
          <code className="text-[#2563eb] font-mono font-medium">{prodDisplayUrl}</code>
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] transition-colors flex items-center gap-1.5"
          title="Copy academy URL"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-[#047857]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#64748b]" />
              <span className="hidden sm:inline">Copy Link</span>
            </>
          )}
        </button>

        <a
          href={studentPortalUrl}
          target="_blank"
          rel="noreferrer"
          data-testid="launch-student-portal-btn"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] transition-colors flex items-center gap-1.5"
          title="Open your public student portal"
        >
          <span className="hidden md:inline">Open Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#64748b]" />
        </a>

        <Link
          href="/batches"
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Batch</span>
        </Link>
      </div>
    </header>
  );
};
