'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Globe,
  AlertCircle,
  X,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { AcademyDirectoryEntry } from '../lib/storefront-loader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AcademyDirectoryViewProps {
  initialAcademies: AcademyDirectoryEntry[];
  notFoundSlug?: string;
}

export const AcademyDirectoryView: React.FC<AcademyDirectoryViewProps> = ({
  initialAcademies,
  notFoundSlug,
}) => {
  const [academies, setAcademies] = useState<AcademyDirectoryEntry[]>(initialAcademies);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(initialAcademies.length === 0);

  useEffect(() => {
    const loadAcademies = () => {
      fetch(`${API_BASE_URL}/tenants/search`)
        .then((r) => r.json())
        .then((json) => {
          if (json?.success && Array.isArray(json.academies)) {
            setAcademies(json.academies);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    };

    if (initialAcademies.length === 0) {
      loadAcademies();
    } else {
      setIsLoading(false);
    }

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel('academy-directory-live')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'Tenant' }, loadAcademies)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'TenantSettings' },
            loadAcademies
          )
          .subscribe();
      }
    } catch {
      // optional realtime
    }

    return () => {
      if (channel) {
        try {
          createSupabaseClient().removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [initialAcademies.length]);

  const filteredAcademies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return academies;
    return academies.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.tagline || '').toLowerCase().includes(q) ||
        (item.teacherName || '').toLowerCase().includes(q) ||
        (item.exam || '').toLowerCase().includes(q)
      );
    });
  }, [academies, searchQuery]);

  return (
    <div className="min-h-[82vh] bg-[#f8fafc] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Invalid Slug Alert Banner */}
        {notFoundSlug && (
          <div className="p-4 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex items-start gap-3 text-sm text-[#92400e]">
            <AlertCircle className="w-5 h-5 text-[#d97706] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#78350f]">
                Academy &ldquo;/{notFoundSlug}&rdquo; was not found.
              </p>
              <p className="text-xs text-[#92400e] mt-0.5">
                Search for your academy below and click to open its official portal.
              </p>
            </div>
          </div>
        )}

        {/* Hero & Search Header */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 sm:p-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff6ff] border border-[#dbeafe] text-xs font-semibold text-[#2563eb]">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academy Directory</span>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h1
              className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Find Your Academy
            </h1>
            <p className="text-sm sm:text-base text-[#475569]">
              Every academy has its own dedicated portal link (
              <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#2563eb]">
                /academy-name
              </code>
              ). Search your academy below and click to open its website directly.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by academy name, URL slug, or subject..."
              autoFocus
              data-testid="academy-directory-search"
              className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-[#cbd5e1] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Directory Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2
              className="text-sm font-bold uppercase tracking-wider text-[#64748b]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {searchQuery.trim()
                ? `Matching Academies (${filteredAcademies.length})`
                : `All Academies (${academies.length})`}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-[#e2e8f0] p-5 space-y-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#e2e8f0]" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 rounded bg-[#e2e8f0]" />
                      <div className="h-3 w-20 rounded bg-[#f1f5f9]" />
                    </div>
                  </div>
                  <div className="h-9 w-full rounded-lg bg-[#f1f5f9]" />
                </div>
              ))}
            </div>
          ) : filteredAcademies.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#cbd5e1] p-12 text-center space-y-2">
              <Search className="w-8 h-8 text-[#94a3b8] mx-auto" />
              <h3 className="text-base font-bold text-[#0f172a]">
                {searchQuery.trim()
                  ? `No academy found for "${searchQuery}"`
                  : 'No Academies Available Yet'}
              </h3>
              <p className="text-xs text-[#64748b] max-w-md mx-auto">
                {searchQuery.trim()
                  ? 'Check the spelling of your academy name or clear the search filter to browse all academies.'
                  : 'Once educators launch their academies, they will appear here automatically.'}
              </p>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe]"
                >
                  Show All Academies
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAcademies.map((academy) => {
                const accent = academy.primaryColor || '#2563eb';
                const initials = academy.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join('') || 'A';

                return (
                  <Link
                    key={academy.id}
                    href={`/${encodeURIComponent(academy.slug)}`}
                    data-testid={`academy-card-${academy.slug}`}
                    className="group bg-white rounded-xl border border-[#e2e8f0] hover:border-[#2563eb] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3.5">
                      {/* Academy Logo + Name + Live Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {academy.logoUrl ? (
                            <img
                              src={academy.logoUrl}
                              alt={academy.name}
                              className="w-11 h-11 rounded-xl object-cover border border-[#e2e8f0] shrink-0 bg-white"
                            />
                          ) : (
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                              style={{ backgroundColor: accent }}
                            >
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3
                              className="text-base font-bold text-[#0f172a] group-hover:text-[#2563eb] transition-colors truncate"
                              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                            >
                              {academy.name}
                            </h3>
                            <p className="text-[11px] font-mono text-[#64748b] truncate">
                              /{academy.slug}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${
                            academy.portalLive === false
                              ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
                              : 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              academy.portalLive === false ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                            }`}
                          />
                          {academy.portalLive === false ? 'Offline' : 'Live'}
                        </span>
                      </div>

                      {/* Tagline */}
                      {academy.tagline && (
                        <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                          {academy.tagline}
                        </p>
                      )}

                      {/* Meta Pills */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f8fafc] border border-[#e2e8f0]">
                          <BookOpen className="w-3 h-3 text-[#2563eb]" />
                          <span>
                            {academy.publishedCoursesCount || 0}{' '}
                            {academy.publishedCoursesCount === 1 ? 'Course' : 'Courses'}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f8fafc] border border-[#e2e8f0] truncate max-w-full">
                          <Globe className="w-3 h-3 text-[#64748b] shrink-0" />
                          <span className="truncate">learnings.simplicion.com/{academy.slug}</span>
                        </span>
                      </div>
                    </div>

                    {/* Visit Button */}
                    <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs font-semibold text-[#2563eb]">
                      <span>Open Academy Website</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
