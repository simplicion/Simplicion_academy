'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Copy,
  Trash2,
  FileText,
  Youtube,
  Link as LinkIcon,
  X,
  CheckCircle2,
  Edit3,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Search,
  ChevronsUpDown,
  Check,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function toEmbedUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  );
  if (m?.[1]) return `https://www.youtube-nocookie.com/embed/${m[1]}?modestbranding=1&rel=0`;
  return null;
}

export default function SubjectLessonsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const subjectId = params?.subjectId as string;

  const [subject, setSubject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [addingTopicLessonId, setAddingTopicLessonId] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Accordion expand/collapse + search state
  const [expandedLessonIds, setExpandedLessonIds] = useState<Record<string, boolean>>({});
  const [hasInitializedExpand, setHasInitializedExpand] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Lesson Rename state
  const [renamingLessonId, setRenamingLessonId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  // Right-hand Topic Content Editor Side Drawer
  const [editingTopic, setEditingTopic] = useState<any | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicText, setTopicText] = useState('');
  const [topicYoutube, setTopicYoutube] = useState('');
  const [topicDocs, setTopicDocs] = useState<Array<{ id: string; label: string; url: string }>>([]);
  const [docLabel, setDocLabel] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [isSavingTopic, setIsSavingTopic] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadSubject = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/curriculum`);
      const data = await res.json();
      if (data.success && Array.isArray(data.subjects)) {
        const found = data.subjects.find((s: any) => s.id === subjectId);
        setSubject(found || null);
        if (found?.lessons?.length && !hasInitializedExpand) {
          // Expand only the first lesson by default for a clean, scannable layout
          setExpandedLessonIds({ [found.lessons[0].id]: true });
          setHasInitializedExpand(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId, subjectId, hasInitializedExpand]);

  useEffect(() => {
    loadSubject();
  }, [loadSubject]);

  const lessons: any[] = subject?.lessons || [];

  const toggleLesson = (lessonId: string) => {
    setExpandedLessonIds((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const allExpanded = useMemo(() => {
    if (lessons.length === 0) return false;
    return lessons.every((l) => Boolean(expandedLessonIds[l.id]));
  }, [lessons, expandedLessonIds]);

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedLessonIds({});
    } else {
      const next: Record<string, boolean> = {};
      lessons.forEach((l) => {
        next[l.id] = true;
      });
      setExpandedLessonIds(next);
    }
  };

  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return lessons;
    return lessons
      .map((l) => {
        const lessonMatches = l.title.toLowerCase().includes(q);
        const matchingTopics = (l.topics || []).filter(
          (t: any) =>
            t.title.toLowerCase().includes(q) ||
            (t.textContent && t.textContent.toLowerCase().includes(q))
        );
        if (lessonMatches) return l;
        if (matchingTopics.length > 0) return { ...l, topics: matchingTopics };
        return null;
      })
      .filter(Boolean);
  }, [lessons, searchQuery]);

  const totalTopicsCount = useMemo(
    () => lessons.reduce((sum, l) => sum + (l.topics?.length || 0), 0),
    [lessons]
  );

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    const res = await fetch(`${API_BASE_URL}/subjects/${encodeURIComponent(subjectId)}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newLessonTitle.trim() }),
    });
    const data = await res.json();
    if (data.success && data.lesson) {
      setNewLessonTitle('');
      setExpandedLessonIds((prev) => ({ ...prev, [data.lesson.id]: true }));
      await loadSubject();
      showToast('Lesson created.');
    }
  };

  const handleRenameLesson = async (lessonId: string) => {
    const trimmed = renameDraft.trim();
    if (!trimmed) {
      setRenamingLessonId(null);
      return;
    }
    const res = await fetch(`${API_BASE_URL}/lessons/${encodeURIComponent(lessonId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
    });
    const data = await res.json();
    setRenamingLessonId(null);
    if (data.success) {
      await loadSubject();
      showToast('Lesson renamed.');
    }
  };

  const handleMoveLesson = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;
    const reordered = [...lessons];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setSubject((prev: any) => (prev ? { ...prev, lessons: reordered } : prev));
    await fetch(`${API_BASE_URL}/subjects/${encodeURIComponent(subjectId)}/lessons/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonIds: reordered.map((l) => l.id) }),
    });
    showToast('Lesson order updated.');
  };

  const handleDuplicateLesson = async (lessonId: string) => {
    const res = await fetch(`${API_BASE_URL}/lessons/${encodeURIComponent(lessonId)}/duplicate`, {
      method: 'POST',
    });
    const data = await res.json();
    if (data.success && data.lesson) {
      setExpandedLessonIds((prev) => ({ ...prev, [data.lesson.id]: true }));
      await loadSubject();
      showToast('Lesson and all its topics duplicated.');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson and all its topics?')) return;
    await fetch(`${API_BASE_URL}/lessons/${encodeURIComponent(lessonId)}`, { method: 'DELETE' });
    await loadSubject();
    showToast('Lesson deleted.');
  };

  const handleAddTopic = async (e: React.FormEvent, lessonId: string) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    const res = await fetch(`${API_BASE_URL}/lessons/${encodeURIComponent(lessonId)}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTopicTitle.trim() }),
    });
    const data = await res.json();
    if (data.success && data.topic) {
      setNewTopicTitle('');
      setAddingTopicLessonId(null);
      setExpandedLessonIds((prev) => ({ ...prev, [lessonId]: true }));
      await loadSubject();
      openTopicDrawer(data.topic);
    }
  };

  const handleDuplicateTopic = async (topicId: string) => {
    const res = await fetch(`${API_BASE_URL}/topics/${encodeURIComponent(topicId)}/duplicate`, {
      method: 'POST',
    });
    const data = await res.json();
    if (data.success) {
      await loadSubject();
      showToast('Topic duplicated.');
    }
  };

  const handleMoveTopic = async (lessonId: string, topics: any[], index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= topics.length) return;
    const reordered = [...topics];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setSubject((prev: any) =>
      prev
        ? {
            ...prev,
            lessons: prev.lessons.map((l: any) =>
              l.id === lessonId ? { ...l, topics: reordered } : l
            ),
          }
        : prev
    );
    await fetch(`${API_BASE_URL}/lessons/${encodeURIComponent(lessonId)}/topics/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicIds: reordered.map((t) => t.id) }),
    });
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Delete this topic?')) return;
    await fetch(`${API_BASE_URL}/topics/${encodeURIComponent(topicId)}`, { method: 'DELETE' });
    await loadSubject();
  };

  const openTopicDrawer = (topic: any) => {
    setEditingTopic(topic);
    setTopicTitle(topic.title || '');
    setTopicText(topic.textContent || '');
    setTopicYoutube(topic.youtubeUrl || '');
    setTopicDocs(Array.isArray(topic.docLinks) ? topic.docLinks : []);
    setDocLabel('');
    setDocUrl('');
  };

  const handleAddDocLink = () => {
    if (!docLabel.trim() || !docUrl.trim()) return;
    setTopicDocs((prev) => [
      ...prev,
      { id: `doc_${Date.now()}`, label: docLabel.trim(), url: docUrl.trim() },
    ]);
    setDocLabel('');
    setDocUrl('');
  };

  const handleMoveDocLink = (index: number, direction: -1 | 1) => {
    setTopicDocs((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const handleSaveTopicContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    setIsSavingTopic(true);
    try {
      const res = await fetch(`${API_BASE_URL}/topics/${encodeURIComponent(editingTopic.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topicTitle.trim(),
          textContent: topicText,
          youtubeUrl: topicYoutube.trim(),
          docLinks: topicDocs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTopic(null);
        await loadSubject();
        showToast('Topic content saved and live for students.');
      }
    } finally {
      setIsSavingTopic(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
        Loading lessons...
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center space-y-3">
        <p className="text-sm font-semibold text-[#0f172a]">Subject not found.</p>
        <Link href={`/batches/${courseId}/subjects`} className="text-xs font-semibold text-[#2563eb] underline">
          Back to Subjects
        </Link>
      </div>
    );
  }

  const previewEmbed = toEmbedUrl(topicYoutube);

  return (
    <div className="space-y-5 w-full min-w-0 pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
        <Link
          href={`/batches/${courseId}/subjects`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#2563eb]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Subjects</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {subject.title}
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Click any lesson to expand or collapse. Rename, reorder, duplicate lessons, and edit topic content cleanly.
            </p>
          </div>

          {/* Inline Add Lesson Form */}
          <form onSubmit={handleAddLesson} className="flex items-center gap-2 w-full lg:w-auto">
            <input
              type="text"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="New lesson name (e.g. Lesson 1: Algebra)"
              className="flex-1 lg:w-72 px-3.5 py-2 text-xs text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lesson</span>
            </button>
          </form>
        </div>

        {/* Utility Toolbar: Search + Expand/Collapse All + Count */}
        {lessons.length > 0 && (
          <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter lessons or topics..."
                className="w-full pl-8 pr-8 py-1.5 text-xs text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:bg-white focus:border-[#2563eb]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#64748b]">
                {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'} • {totalTopicsCount}{' '}
                {totalTopicsCount === 1 ? 'Topic' : 'Topics'}
              </span>
              <button
                type="button"
                onClick={handleToggleAll}
                data-testid="toggle-all-lessons-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-[#64748b]" />
                <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Lessons & Topics Accordion List */}
      {lessons.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
          No lessons yet. Type a lesson name above and click <strong>Add Lesson</strong>.
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="p-10 bg-white rounded-xl border border-[#e2e8f0] text-center text-xs text-[#64748b]">
          No lessons or topics match &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson: any) => {
            const originalIdx = lessons.findIndex((l) => l.id === lesson.id);
            const isExpanded = Boolean(searchQuery.trim()) || Boolean(expandedLessonIds[lesson.id]);
            const topicList: any[] = lesson.topics || [];
            const videoCount = topicList.filter((t) => Boolean(t.youtubeUrl)).length;
            const notesCount = topicList.filter((t) => Boolean(t.textContent)).length;
            const docsCount = topicList.reduce(
              (sum, t) => sum + (Array.isArray(t.docLinks) ? t.docLinks.length : 0),
              0
            );
            const isRenaming = renamingLessonId === lesson.id;

            return (
              <div
                key={lesson.id}
                data-testid={`lesson-accordion-${lesson.id}`}
                className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden transition-colors"
              >
                {/* Collapsible Lesson Header */}
                <div
                  onClick={() => {
                    if (!isRenaming) toggleLesson(lesson.id);
                  }}
                  className={`px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                    isExpanded
                      ? 'bg-[#f8fafc] border-b border-[#e2e8f0]'
                      : 'bg-white hover:bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLesson(lesson.id);
                      }}
                      aria-label={isExpanded ? 'Collapse lesson' : 'Expand lesson'}
                      className="p-1 rounded-md text-[#64748b] hover:bg-[#e2e8f0]/60 hover:text-[#0f172a] shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <span className="px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] text-xs font-bold shrink-0">
                      Lesson {originalIdx + 1}
                    </span>

                    {isRenaming ? (
                      <div
                        className="flex items-center gap-1.5 flex-1 max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleRenameLesson(lesson.id);
                            } else if (e.key === 'Escape') {
                              setRenamingLessonId(null);
                            }
                          }}
                          className="flex-1 px-2.5 py-1 text-xs font-semibold text-[#0f172a] bg-white border border-[#2563eb] rounded-md focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameLesson(lesson.id)}
                          className="p-1 rounded-md bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                          title="Save lesson name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingLessonId(null)}
                          className="p-1 rounded-md text-[#64748b] hover:bg-[#e2e8f0]"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <h2
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setRenamingLessonId(lesson.id);
                            setRenameDraft(lesson.title);
                          }}
                          className="text-sm font-bold text-[#0f172a] truncate"
                          title="Double-click to rename lesson"
                        >
                          {lesson.title}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f1f5f9] text-[#475569]">
                          {topicList.length} {topicList.length === 1 ? 'topic' : 'topics'}
                        </span>
                        {!isExpanded && (videoCount > 0 || notesCount > 0 || docsCount > 0) && (
                          <div className="hidden md:flex items-center gap-2 text-[11px] text-[#64748b]">
                            {videoCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[#dc2626]">
                                <Youtube className="w-3 h-3" /> {videoCount}
                              </span>
                            )}
                            {notesCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[#2563eb]">
                                <FileText className="w-3 h-3" /> {notesCount}
                              </span>
                            )}
                            {docsCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[#047857]">
                                <LinkIcon className="w-3 h-3" /> {docsCount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lesson Header Actions */}
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!searchQuery && (
                      <div className="flex items-center border border-[#e2e8f0] rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          disabled={originalIdx === 0}
                          onClick={() => handleMoveLesson(originalIdx, -1)}
                          className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#f8fafc] disabled:opacity-30"
                          title="Move lesson up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={originalIdx === lessons.length - 1}
                          onClick={() => handleMoveLesson(originalIdx, 1)}
                          className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#f8fafc] border-l border-[#e2e8f0] disabled:opacity-30"
                          title="Move lesson down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setRenamingLessonId(lesson.id);
                        setRenameDraft(lesson.title);
                      }}
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff]"
                      title="Rename lesson"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateLesson(lesson.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1]"
                      title="Duplicate this lesson and all topics under it"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#64748b]" />
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExpandedLessonIds((prev) => ({ ...prev, [lesson.id]: true }));
                        setAddingTopicLessonId(lesson.id);
                        setNewTopicTitle('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Topic</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626]"
                      title="Delete lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Topics Body */}
                {isExpanded && (
                  <div className="p-4 space-y-2 bg-white animate-accordion-open">
                    {addingTopicLessonId === lesson.id && (
                      <form
                        onSubmit={(e) => handleAddTopic(e, lesson.id)}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-[#eff6ff]/60 border border-[#bfdbfe]"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={newTopicTitle}
                          onChange={(e) => setNewTopicTitle(e.target.value)}
                          placeholder="Topic title (e.g. Quadratic Equations)"
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
                        >
                          Add &amp; Edit Content
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingTopicLessonId(null)}
                          className="p-1 text-[#64748b]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    )}

                    {topicList.length === 0 ? (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-xs text-[#64748b]">
                        <span>
                          No topics in this lesson yet. Add a topic to attach notes, YouTube videos, and document links.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingTopicLessonId(lesson.id);
                            setNewTopicTitle('');
                          }}
                          className="font-semibold text-[#2563eb] hover:underline shrink-0 ml-3"
                        >
                          + Add First Topic
                        </button>
                      </div>
                    ) : (
                      topicList.map((topic: any, tIdx: number) => {
                        const tDocsCount = Array.isArray(topic.docLinks) ? topic.docLinks.length : 0;
                        return (
                          <div
                            key={topic.id}
                            className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-[#e2e8f0] hover:border-[#2563eb] hover:bg-[#f8fafc] transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono font-bold text-[#64748b]">
                                {originalIdx + 1}.{tIdx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#0f172a] truncate">
                                  {topic.title}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-[#64748b]">
                                  {topic.youtubeUrl && (
                                    <span className="inline-flex items-center gap-1 text-[#dc2626] font-medium">
                                      <Youtube className="w-3 h-3" /> Video
                                    </span>
                                  )}
                                  {topic.textContent && (
                                    <span className="inline-flex items-center gap-1 text-[#2563eb] font-medium">
                                      <FileText className="w-3 h-3" /> Text Notes
                                    </span>
                                  )}
                                  {tDocsCount > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[#047857] font-medium">
                                      <LinkIcon className="w-3 h-3" /> {tDocsCount} Doc Link{tDocsCount > 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {!topic.youtubeUrl && !topic.textContent && tDocsCount === 0 && (
                                    <span className="text-[#94a3b8] italic">No content attached yet</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!searchQuery && topicList.length > 1 && (
                                <div className="flex items-center border border-[#e2e8f0] rounded-lg bg-white overflow-hidden">
                                  <button
                                    type="button"
                                    disabled={tIdx === 0}
                                    onClick={() => handleMoveTopic(lesson.id, topicList, tIdx, -1)}
                                    className="p-1 text-[#64748b] hover:text-[#2563eb] disabled:opacity-30"
                                    title="Move topic up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={tIdx === topicList.length - 1}
                                    onClick={() => handleMoveTopic(lesson.id, topicList, tIdx, 1)}
                                    className="p-1 text-[#64748b] hover:text-[#2563eb] border-l border-[#e2e8f0] disabled:opacity-30"
                                    title="Move topic down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDuplicateTopic(topic.id)}
                                className="p-1.5 rounded-lg text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff]"
                                title="Duplicate topic"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openTopicDrawer(topic)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe]"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Add / Edit Content</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#dc2626]"
                                title="Delete topic"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Right-Hand SAFS-04 Topic Content Editor Side Drawer */}
      {editingTopic && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex justify-end !mt-0">
          <div
            className="fixed inset-0 bg-[#0f172a]/45 backdrop-blur-[2px]"
            onClick={() => setEditingTopic(null)}
          />

          <div className="relative z-10 w-full max-w-xl bg-white h-[100dvh] border-l border-[#e2e8f0] shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0f172a]">Topic Content Editor</h2>
                <p className="text-xs text-[#64748b]">
                  Paste text notes, add a YouTube tutorial link, and attach named document links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="topic-editor-form"
              onSubmit={handleSaveTopicContent}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">Topic Name *</label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                />
              </div>

              {/* YouTube Video Link */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-[#dc2626]" />
                  <span>YouTube Video / Live Tutorial Link</span>
                </label>
                <input
                  type="url"
                  value={topicYoutube}
                  onChange={(e) => setTopicYoutube(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                />
                {previewEmbed && (
                  <div className="rounded-xl overflow-hidden border border-[#e2e8f0] aspect-video bg-black">
                    <iframe
                      src={previewEmbed}
                      title="YouTube preview"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Text Data (Copy-Paste Notes) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#2563eb]" />
                  <span>Text Data / Study Notes (Paste from anywhere)</span>
                </label>
                <textarea
                  rows={6}
                  value={topicText}
                  onChange={(e) => setTopicText(e.target.value)}
                  placeholder="Paste paragraphs, chapter summaries, key dates, or bullet notes here..."
                  className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                />
              </div>

              {/* Named Document Links */}
              <div className="space-y-2.5 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-[#2563eb]" />
                  <span>Document Links (Give any custom name, e.g. Paragraph, Notes)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={docLabel}
                    onChange={(e) => setDocLabel(e.target.value)}
                    placeholder="Label (e.g. Paragraph)"
                    className="sm:col-span-2 px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg"
                  />
                  <input
                    type="url"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="https://docs.google.com/..."
                    className="sm:col-span-2 px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocLink}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe]"
                  >
                    + Save Link
                  </button>
                </div>

                {topicDocs.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {topicDocs.map((d, dIdx) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-lg border border-[#e2e8f0] text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0f172a] truncate">{d.label}</p>
                          <p className="text-[11px] text-[#64748b] truncate">{d.url}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={dIdx === 0}
                            onClick={() => handleMoveDocLink(dIdx, -1)}
                            title="Move up"
                            className="p-1 text-[#94a3b8] hover:text-[#2563eb] disabled:opacity-30"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={dIdx === topicDocs.length - 1}
                            onClick={() => handleMoveDocLink(dIdx, 1)}
                            title="Move down"
                            className="p-1 text-[#94a3b8] hover:text-[#2563eb] disabled:opacity-30"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setTopicDocs((prev) => prev.filter((item) => item.id !== d.id))
                            }
                            title="Remove link"
                            className="p-1 text-[#94a3b8] hover:text-[#dc2626]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#334155] bg-white border border-[#cbd5e1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="topic-editor-form"
                disabled={isSavingTopic}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm disabled:opacity-60"
              >
                {isSavingTopic ? 'Saving...' : 'Save Topic Content'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
