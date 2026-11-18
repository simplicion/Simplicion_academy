'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Radio, Calendar, Youtube, Link as LinkIcon, Plus, Trash2, MessageSquare } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface GoLiveSubjectOption {
  id: string;
  title: string;
  lessons: Array<{
    id: string;
    title: string;
    topics?: Array<{ id: string; title: string }>;
  }>;
}

export interface GoLiveCourseOption {
  id: string;
  title: string;
  subjects: GoLiveSubjectOption[];
}

export interface GoLiveDrawerProps {
  isOpen: boolean;
  courseId?: string;
  courseTitle?: string;
  subjects?: GoLiveSubjectOption[];
  courses?: GoLiveCourseOption[];
  onClose: () => void;
  onCreated: (session: any) => void;
}

function getLocalDatetimeString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function getYouTubeEmbedUrl(url: string): string | null {
  const m = url
    .trim()
    .match(
      /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
  return m?.[1] ? `https://www.youtube-nocookie.com/embed/${m[1]}?modestbranding=1&rel=0` : null;
}

export const GoLiveDrawer: React.FC<GoLiveDrawerProps> = ({
  isOpen,
  courseId,
  courseTitle,
  subjects = [],
  courses = [],
  onClose,
  onCreated,
}) => {
  const [mode, setMode] = useState<'now' | 'schedule'>('now');
  const [scheduledAt, setScheduledAt] = useState(getLocalDatetimeString());
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || courses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState('');
  const [attachedDocs, setAttachedDocs] = useState<Array<{ id: string; label: string; url: string }>>([]);
  const [docLabel, setDocLabel] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [enableStudentChat, setEnableStudentChat] = useState(true);
  const [enableSlowMode, setEnableSlowMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    } else if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courseId, courses, selectedCourseId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const isMultiCoursePicker = !courseId && courses.length > 0;
  const activeCourse = courses.find((c) => c.id === selectedCourseId);
  const effectiveCourseId = courseId || activeCourse?.id || '';
  const effectiveCourseTitle = courseTitle || activeCourse?.title || 'Course';
  const effectiveSubjects: GoLiveSubjectOption[] =
    subjects.length > 0 ? subjects : activeCourse?.subjects || [];

  const activeSubject = effectiveSubjects.find((s) => s.id === selectedSubjectId);
  const activeLesson = activeSubject?.lessons.find((l) => l.id === selectedLessonId);
  const activeTopic = activeLesson?.topics?.find((t) => t.id === selectedTopicId);

  const handleAddDoc = () => {
    if (!docLabel.trim() || !docUrl.trim()) return;
    setAttachedDocs((prev) => [
      ...prev,
      { id: `doc_${Date.now()}`, label: docLabel.trim(), url: docUrl.trim() },
    ]);
    setDocLabel('');
    setDocUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!effectiveCourseId) {
      setError('Please select a course for this live class.');
      return;
    }
    if (!youtubeLiveUrl.trim()) {
      setError('Please paste your YouTube Live stream link.');
      return;
    }
    if (!getYouTubeEmbedUrl(youtubeLiveUrl)) {
      setError('Please enter a valid YouTube URL (youtube.com/watch?v=..., youtu.be/..., or youtube.com/live/...).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/courses/${encodeURIComponent(effectiveCourseId)}/live-sessions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            scheduledAt: mode === 'schedule' ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
            subjectId: selectedSubjectId || null,
            subjectTitle: activeSubject?.title || null,
            lessonId: selectedLessonId || null,
            lessonTitle: activeLesson?.title || null,
            topicId: selectedTopicId || null,
            topicTitle: activeTopic?.title || null,
            title:
              title.trim() ||
              (activeTopic
                ? `Live: ${activeTopic.title}`
                : activeLesson
                  ? `Live: ${activeLesson.title}`
                  : activeSubject
                    ? `Live: ${activeSubject.title}`
                    : `Live — ${effectiveCourseTitle}`),
            youtubeLiveUrl: youtubeLiveUrl.trim(),
            attachedDocs,
            enableChat: enableStudentChat,
            chatSlowMode: enableStudentChat ? enableSlowMode : false,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start live session.');
      }

      onCreated(data.session);
      setTitle('');
      setYoutubeLiveUrl('');
      setAttachedDocs([]);
      setSelectedSubjectId('');
      setSelectedLessonId('');
      setSelectedTopicId('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not start live class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      data-testid="go-live-drawer"
      className="fixed inset-0 z-[100] flex justify-end !mt-0"
    >
      <div className="fixed inset-0 bg-[#0f172a]/45 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white h-[100dvh] border-l border-[#e2e8f0] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between shrink-0">
          <div>
            <h2
              className="text-lg font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Go Live / Schedule Class
            </h2>
            <p className="text-xs text-[#64748b]">
              Students enrolled in {effectiveCourseTitle} are notified immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form id="go-live-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs text-[#b91c1c] font-medium">
              {error}
            </div>
          )}

          {/* Instant vs Schedule Switch */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMode('now');
                setScheduledAt(getLocalDatetimeString());
              }}
              className={`p-3 rounded-xl border text-left transition ${
                mode === 'now'
                  ? 'border-[#2563eb] bg-[#eff6ff] ring-1 ring-[#2563eb]/20'
                  : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]'
              }`}
            >
              <Radio className={`w-4 h-4 mb-1 ${mode === 'now' ? 'text-[#dc2626]' : 'text-[#64748b]'}`} />
              <p className="text-xs font-bold text-[#0f172a]">Go Live Now</p>
              <p className="text-[11px] text-[#64748b]">Current date &amp; time selected</p>
            </button>

            <button
              type="button"
              onClick={() => setMode('schedule')}
              className={`p-3 rounded-xl border text-left transition ${
                mode === 'schedule'
                  ? 'border-[#2563eb] bg-[#eff6ff] ring-1 ring-[#2563eb]/20'
                  : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]'
              }`}
            >
              <Calendar className={`w-4 h-4 mb-1 ${mode === 'schedule' ? 'text-[#2563eb]' : 'text-[#64748b]'}`} />
              <p className="text-xs font-bold text-[#0f172a]">Schedule Class</p>
              <p className="text-[11px] text-[#64748b]">Pick future date &amp; time</p>
            </button>
          </div>

          {mode === 'schedule' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#334155]">
                Date &amp; Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
              />
            </div>
          )}

          {/* Course Picker (when opened from Academy-wide Live Classes Hub) */}
          {isMultiCoursePicker && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#334155]">
                Course *
              </label>
              <select
                required
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedSubjectId('');
                  setSelectedLessonId('');
                  setSelectedTopicId('');
                }}
                className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
              >
                <option value="">Select a Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Optional Subject / Chapter(Lesson) / Topic Association */}
          {effectiveSubjects.length > 0 && (
            <div className="space-y-3 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                Link to Subject, Chapter &amp; Topic (Optional)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#334155]">
                    Subject
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedLessonId('');
                      setSelectedTopicId('');
                    }}
                    className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg"
                  >
                    <option value="">General Course Live</option>
                    {effectiveSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#334155]">
                    Chapter / Lesson
                  </label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => {
                      setSelectedLessonId(e.target.value);
                      setSelectedTopicId('');
                    }}
                    disabled={!activeSubject}
                    className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg disabled:opacity-50"
                  >
                    <option value="">All Chapters</option>
                    {activeSubject?.lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeLesson?.topics && activeLesson.topics.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#334155]">
                    Topic
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg"
                  >
                    <option value="">Whole Chapter / Lesson</option>
                    {activeLesson.topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              Live Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. Live Revision Session — ${effectiveCourseTitle}`}
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
            />
          </div>

          {/* YouTube Live Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-[#dc2626]" />
              <span>YouTube Live Link *</span>
            </label>
            <input
              type="url"
              required
              value={youtubeLiveUrl}
              onChange={(e) => setYoutubeLiveUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/live/..."
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
            />
            {getYouTubeEmbedUrl(youtubeLiveUrl) && (
              <div className="mt-2 rounded-xl overflow-hidden border border-[#e2e8f0] aspect-video bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(youtubeLiveUrl)!}
                  title="YouTube Live preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Student Live Chat Toggle */}
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#2563eb] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#0f172a]">Student Live Chat</p>
                  <p className="text-[11px] text-[#64748b] leading-relaxed">
                    Let students chat with each other while watching the live video. You can toggle this ON or OFF anytime during class.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enableStudentChat}
                data-testid="go-live-chat-toggle"
                onClick={() => setEnableStudentChat((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  enableStudentChat ? 'bg-[#2563eb]' : 'bg-[#cbd5e1]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    enableStudentChat ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {enableStudentChat && (
              <label className="flex items-center gap-2 pt-2 border-t border-[#e2e8f0] text-xs text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSlowMode}
                  onChange={(e) => setEnableSlowMode(e.target.checked)}
                  className="rounded border-[#cbd5e1] text-[#2563eb]"
                />
                <span>Enable Slow Mode (1 message every 3 seconds per student)</span>
              </label>
            )}
          </div>

          {/* Additional Notes / Document Links */}
          <div className="space-y-2.5 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Attach Notes / Document Links (Optional)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input
                type="text"
                value={docLabel}
                onChange={(e) => setDocLabel(e.target.value)}
                placeholder="Name (e.g. Notes)"
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
                onClick={handleAddDoc}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe] flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {attachedDocs.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {attachedDocs.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-lg border border-[#e2e8f0] text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0f172a] truncate">{d.label}</p>
                      <p className="text-[11px] text-[#64748b] truncate">{d.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachedDocs((prev) => prev.filter((item) => item.id !== d.id))
                      }
                      className="text-[#94a3b8] hover:text-[#dc2626]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#334155] bg-white border border-[#cbd5e1]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="go-live-form"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm disabled:opacity-60"
          >
            {isSubmitting
              ? 'Publishing...'
              : mode === 'now'
                ? 'Go Live Now'
                : 'Schedule Live Class'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
