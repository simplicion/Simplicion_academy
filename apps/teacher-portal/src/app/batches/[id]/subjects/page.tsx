'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  BookOpen,
  ArrowRight,
  Trash2,
  Layers,
  X,
  Edit3,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CourseSubjectsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMoveSubject = async (e: React.MouseEvent, index: number, direction: -1 | 1) => {
    e.preventDefault();
    e.stopPropagation();
    const target = index + direction;
    if (target < 0 || target >= subjects.length) return;
    const reordered = [...subjects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setSubjects(reordered);
    await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/subjects/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectIds: reordered.map((s) => s.id) }),
    });
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setTitle('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openRenameModal = (e: React.MouseEvent, subject: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubject(subject);
    setTitle(subject.title || '');
    setDescription(subject.description || '');
    setIsModalOpen(true);
  };

  const loadSubjects = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/curriculum`);
      const data = await res.json();
      if (data.success) setSubjects(data.subjects || []);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsCreating(true);
    try {
      if (editingSubject) {
        const res = await fetch(
          `${API_BASE_URL}/subjects/${encodeURIComponent(editingSubject.id)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title.trim(), description: description.trim() }),
          }
        );
        const data = await res.json();
        if (data.success && data.subject) {
          setSubjects((prev) =>
            prev.map((s) => (s.id === editingSubject.id ? data.subject : s))
          );
          setEditingSubject(null);
          setTitle('');
          setDescription('');
          setIsModalOpen(false);
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/subjects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), description: description.trim() }),
        });
        const data = await res.json();
        if (data.success && data.subject) {
          setSubjects((prev) => [...prev, data.subject]);
          setTitle('');
          setDescription('');
          setIsModalOpen(false);
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, subjectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this subject and all lessons inside it?')) return;
    await fetch(`${API_BASE_URL}/subjects/${encodeURIComponent(subjectId)}`, { method: 'DELETE' });
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Course Subjects
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1">
              Create, reorder, and organize subjects for this course. Click any card to manage expandable lessons &amp; topics.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            data-testid="add-subject-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>

        {subjects.length > 0 && (
          <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subjects..."
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
            <span className="text-xs font-medium text-[#64748b]">
              {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
          Loading subjects...
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-14 bg-white rounded-xl border border-[#e2e8f0] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#0f172a]">No Subjects Created Yet</h2>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              Start by adding subjects (e.g., History, Political Science, Physics) and organize lessons &amp; topics inside each one.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects
            .filter((s) => {
              const q = searchQuery.trim().toLowerCase();
              if (!q) return true;
              return (
                s.title.toLowerCase().includes(q) ||
                (s.description && s.description.toLowerCase().includes(q))
              );
            })
            .map((subject) => {
              const idx = subjects.findIndex((s) => s.id === subject.id);
              const lessonCount = subject.lessons?.length || 0;
              const topicCount = (subject.lessons || []).reduce(
                (sum: number, l: any) => sum + (l.topics?.length || 0),
                0
              );
              return (
                <Link
                  key={subject.id}
                  href={`/batches/${courseId}/subjects/${subject.id}`}
                  className="group bg-white rounded-xl border border-[#e2e8f0] shadow-sm hover:border-[#2563eb] card-interactive p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        {!searchQuery && subjects.length > 1 && (
                          <>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => handleMoveSubject(e, idx, -1)}
                              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#2563eb] disabled:opacity-30"
                              title="Move subject earlier"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === subjects.length - 1}
                              onClick={(e) => handleMoveSubject(e, idx, 1)}
                              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#2563eb] disabled:opacity-30"
                              title="Move subject later"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={(e) => openRenameModal(e, subject)}
                          className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#2563eb]"
                          title="Rename subject"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSubject(e, subject.id)}
                          className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626]"
                          title="Delete subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                        Subject {idx + 1}
                      </span>
                      <h3
                        className="text-base font-bold text-[#0f172a] group-hover:text-[#2563eb] transition-colors mt-0.5"
                        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                      >
                        {subject.title}
                      </h3>
                      {subject.description && (
                        <p className="text-xs text-[#64748b] mt-1 line-clamp-2">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
                    <span className="text-[#475569] font-medium">
                      {lessonCount} Lessons • {topicCount} Topics
                    </span>
                    <span className="font-semibold text-[#2563eb] inline-flex items-center gap-1">
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
        </div>
      )}

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/55 backdrop-blur-[2px] !mt-0"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90dvh] flex flex-col border border-[#e2e8f0] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0f172a]">
                {editingSubject ? 'Rename Subject' : 'Add New Subject'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Indian History"
                  className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Short Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="NCERT Chapters 1-12 complete syllabus"
                  className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#334155] border border-[#cbd5e1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60"
                >
                  {isCreating
                    ? 'Saving...'
                    : editingSubject
                      ? 'Save Changes'
                      : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
