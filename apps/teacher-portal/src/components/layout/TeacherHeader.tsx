'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Search, Plus, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@simplicion/ui';
import Link from 'next/link';

export interface TeacherHeaderProps {
  title?: string;
  subtitle?: string;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  title = 'Educator Studio',
  subtitle,
}) => {
  const [tenantSlug, setTenantSlug] = useState('cuet-humanities');
  const [academyName, setAcademyName] = useState('Humanities CUET Academy');
  const [teacherName, setTeacherName] = useState('Prof. Rajesh Sharma');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('slug');
      const n = params.get('name');
      const t = params.get('teacher');

      if (s) setTenantSlug(s);
      if (n) setAcademyName(n);
      if (t) setTeacherName(t);

      // Check localStorage for active tenant
      const stored = localStorage.getItem('simplicion_active_tenant');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (!s && parsed.slug) setTenantSlug(parsed.slug);
          if (!n && parsed.name) setAcademyName(parsed.name);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const studentPortalUrl = `http://localhost:3001/?tenant=${tenantSlug}`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {academyName}
            </h1>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <CheckCircle2 className="w-2.5 h-2.5 fill-emerald-600" />
              Live & Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Instructor: <strong className="text-slate-700">{teacherName}</strong> • Subdomain: <code className="text-blue-600 font-mono">{tenantSlug}.simplicion.com</code>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Prominent Launch / View Student Portal Button */}
        <a
          href={studentPortalUrl}
          target="_blank"
          rel="noreferrer"
          data-testid="launch-student-portal-btn"
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5 active:scale-95"
          title="Opens your live public student portal in a new tab"
        >
          <span>🚀 Launch Student Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Quick Action Button */}
        <Link href="/batches">
          <Button variant="primary" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Batch</span>
          </Button>
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5"></span>
        </button>
      </div>
    </header>
  );
};
