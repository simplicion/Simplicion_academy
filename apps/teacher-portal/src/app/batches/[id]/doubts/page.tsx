'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  MessageCircleQuestion,
  CheckCircle2,
  Send,
  Pin,
  User,
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  X,
} from 'lucide-react';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const QUICK_REPLIES = [
  'Please check the attached lesson notes for the step-by-step explanation.',
  'Great question! We will solve this live in our upcoming class.',
  'Focus on the NCERT key points highlighted in this topic.',
];

export default function CourseDoubtsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [doubts, setDoubts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadDoubts = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/doubts`);
      const data = await res.json();
      if (data.success) {
        const list = data.doubts || [];
        setDoubts(list);
        setExpandedIds((prev) => {
          const next = { ...prev };
          for (const d of list) {
            if (next[d.id] === undefined) {
              // Keep open doubts expanded by default, collapse already-answered doubts cleanly
              next[d.id] = d.status === 'open';
            }
          }
          return next;
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadDoubts();

    let channel: any = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        const supabase = createSupabaseClient();
        channel = supabase
          .channel(`teacher-doubts-${courseId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'CourseDoubt', filter: `courseId=eq.${courseId}` },
            () => loadDoubts()
          )
          .subscribe();
      }
    } catch {
      // ignore
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
  }, [courseId, loadDoubts]);

  const handleReply = async (e: React.FormEvent, doubtId: string) => {
    e.preventDefault();
    const reply = (replyDrafts[doubtId] || '').trim();
    if (!reply) return;

    setSubmittingId(doubtId);
    try {
      const res = await fetch(
        `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/doubts/${encodeURIComponent(doubtId)}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reply }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setReplyDrafts((prev) => ({ ...prev, [doubtId]: '' }));
        await loadDoubts();
        showToast('Reply sent! Student received an instant notification.');
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, doubtId: string) => {
    e.stopPropagation();
    const res = await fetch(
      `${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/doubts/${encodeURIComponent(doubtId)}/pin-faq`,
      { method: 'PATCH' }
    );
    const data = await res.json();
    if (data.success) {
      await loadDoubts();
      showToast(
        data.doubt?.isPinnedFaq
          ? 'Pinned as public Lesson FAQ for all students.'
          : 'Unpinned from Lesson FAQ.'
      );
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return doubts.filter((d) => {
      if (filter !== 'all' && d.status !== filter) return false;
      if (!q) return true;
      return (
        d.studentName?.toLowerCase().includes(q) ||
        d.studentId?.toLowerCase().includes(q) ||
        d.lessonContextLabel?.toLowerCase().includes(q) ||
        d.question?.toLowerCase().includes(q)
      );
    });
  }, [doubts, filter, searchQuery]);

  const openCount = doubts.filter((d) => d.status === 'open').length;
  const allExpanded = filtered.length > 0 && filtered.every((d) => Boolean(expandedIds[d.id]));

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const next: Record<string, boolean> = {};
      filtered.forEach((d) => {
        next[d.id] = true;
      });
      setExpandedIds(next);
    }
  };

  return (
    <div className="space-y-5 w-full min-w-0 pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Course Doubts
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1">
              Open doubts expand automatically; answered doubts stay compact until clicked. Replies push live to students.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1 rounded-lg border border-[#e2e8f0] self-start sm:self-auto">
            {(['all', 'open', 'answered'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition ${
                  filter === tab
                    ? 'bg-white text-[#2563eb] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {tab === 'open' ? `Open (${openCount})` : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Expand/Collapse All Bar */}
        {doubts.length > 0 && (
          <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, lesson, or question..."
                className="w-full pl-8 pr-8 py-1.5 text-xs text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:bg-white focus:border-[#2563eb]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleToggleAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0]"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-[#64748b]" />
              <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
          Loading doubts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-14 bg-white rounded-xl border border-[#e2e8f0] text-center space-y-2">
          <MessageCircleQuestion className="w-8 h-8 text-[#2563eb] mx-auto" />
          <p className="text-sm font-bold text-[#0f172a]">No doubts in this view</p>
          <p className="text-xs text-[#64748b]">
            When enrolled students ask a doubt from any lesson or live class, it appears here instantaneously.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doubt) => {
            const isExpanded = Boolean(expandedIds[doubt.id]);

            return (
              <div
                key={doubt.id}
                className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden"
              >
                {/* Collapsible Doubt Header */}
                <div
                  onClick={() =>
                    setExpandedIds((prev) => ({ ...prev, [doubt.id]: !prev[doubt.id] }))
                  }
                  className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                    isExpanded
                      ? 'bg-[#f8fafc] border-b border-[#e2e8f0]'
                      : 'bg-white hover:bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      className="p-0.5 mt-0.5 text-[#64748b] shrink-0"
                      aria-label={isExpanded ? 'Collapse doubt' : 'Expand doubt'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f172a]">
                          <User className="w-3.5 h-3.5 text-[#2563eb]" />
                          {doubt.studentName}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748b]">
                          ID: {doubt.studentId}
                        </span>
                        {doubt.studentEmail && (
                          <span className="text-[11px] text-[#64748b]">• {doubt.studentEmail}</span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] text-[11px] font-semibold">
                          <BookOpen className="w-3 h-3" />
                          <span>{doubt.lessonContextLabel}</span>
                        </span>
                      </div>

                      {!isExpanded && (
                        <p className="text-xs text-[#475569] truncate">{doubt.question}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden md:inline text-[11px] text-[#94a3b8]">
                      {new Date(doubt.createdAt).toLocaleString('en-IN')}
                    </span>

                    {doubt.status === 'answered' && (
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(e, doubt.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                          doubt.isPinnedFaq
                            ? 'bg-[#eff6ff] border-[#2563eb] text-[#1d4ed8]'
                            : 'bg-white border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a]'
                        }`}
                      >
                        <Pin className="w-3 h-3" />
                        <span>{doubt.isPinnedFaq ? 'Pinned FAQ' : 'Pin as FAQ'}</span>
                      </button>
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        doubt.status === 'answered'
                          ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                          : 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                      }`}
                    >
                      {doubt.status === 'answered' ? 'Answered' : 'Open'}
                    </span>
                  </div>
                </div>

                {/* Expanded Doubt Body + Quick Reply Templates + Reply Form */}
                {isExpanded && (
                  <div className="p-5 space-y-3.5 bg-white animate-accordion-open">
                    <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-sm text-[#0f172a]">
                      {doubt.question}
                    </div>

                    {doubt.reply && (
                      <div className="p-3.5 rounded-lg bg-[#ecfdf5]/70 border border-[#a7f3d0] space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">
                          Your Reply
                        </span>
                        <p className="text-sm text-[#0f172a]">{doubt.reply}</p>
                      </div>
                    )}

                    {/* Quick Reply Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-[#64748b] mr-1">
                        Quick reply:
                      </span>
                      {QUICK_REPLIES.map((tpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setReplyDrafts((prev) => ({ ...prev, [doubt.id]: tpl }))
                          }
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#475569] bg-[#f8fafc] hover:bg-[#eff6ff] hover:text-[#2563eb] border border-[#e2e8f0] transition"
                        >
                          {tpl.length > 46 ? `${tpl.slice(0, 46)}…` : tpl}
                        </button>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => handleReply(e, doubt.id)}
                      className="flex items-center gap-2.5"
                    >
                      <input
                        type="text"
                        value={replyDrafts[doubt.id] || ''}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({ ...prev, [doubt.id]: e.target.value }))
                        }
                        placeholder={
                          doubt.reply
                            ? 'Update your answer...'
                            : 'Write a clear answer for the student...'
                        }
                        className="flex-1 px-3.5 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                      />
                      <button
                        type="submit"
                        disabled={submittingId === doubt.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingId === doubt.id ? 'Sending...' : 'Send Reply'}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
