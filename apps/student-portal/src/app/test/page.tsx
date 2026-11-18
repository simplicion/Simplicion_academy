'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  ArrowLeft,
  FileCheck2,
  CircleDot,
  CheckSquare,
  Type,
  AlignLeft,
  ToggleLeft,
  Hash,
} from 'lucide-react';
import { QuestionAnswerType } from '@simplicion/assessment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LiveQuestion {
  id: string;
  type: QuestionAnswerType;
  prompt: string;
  promptHindi?: string;
  options: Array<{ id: string; text: string; textHindi?: string }>;
  correctOptionIds: string[];
  maxLength?: number;
  placeholder?: string;
  expectedAnswer?: string;
  marks: number;
  negativeMarks: number;
  explanation?: string;
}

interface AnswerEntry {
  selectedOptionIds: string[];
  textAnswer: string;
}

const TYPE_BADGE: Record<QuestionAnswerType, { label: string; icon: React.ElementType }> = {
  single_choice: { label: 'Radio — Choose 1', icon: CircleDot },
  multiple_choice: { label: 'Checkboxes — Choose All That Apply', icon: CheckSquare },
  short_text: { label: 'Short Text Answer', icon: Type },
  long_text: { label: 'Long Text Answer', icon: AlignLeft },
  true_false: { label: 'True / False', icon: ToggleLeft },
  numeric: { label: 'Numerical Answer', icon: Hash },
};

export default function LiveStudentTestPage() {
  const [testTitle, setTestTitle] = useState('Course Assessment');
  const [testScopeLabel, setTestScopeLabel] = useState<string | null>(null);
  const [courseTestId, setCourseTestId] = useState<string | null>(null);
  const [backHref, setBackHref] = useState('/');
  const [backLabel, setBackLabel] = useState('Explore Courses');
  const [durationMins, setDurationMins] = useState(45);
  const [questions, setQuestions] = useState<LiveQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [answers, setAnswers] = useState<Record<string, AnswerEntry>>({});
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ scorecard: any; breakdown: any[] } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('tenant') || params.get('academySlug') || '';
    const cTestId = params.get('courseTestId');
    const cId = params.get('courseId');
    const sId = params.get('studentId');

    if (cId && slug) {
      setBackHref(
        `/s/${encodeURIComponent(slug)}/${encodeURIComponent(sId || 'student')}/course/${encodeURIComponent(cId)}`
      );
      setBackLabel('Back to Classroom');
    } else if (slug) {
      setBackHref(`/${encodeURIComponent(slug)}`);
      setBackLabel('Back to Academy');
    }

    if (!cTestId) {
      setIsLoading(false);
      return;
    }

    setCourseTestId(cTestId);
    fetch(`${API_BASE_URL}/course-tests/${encodeURIComponent(cTestId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.test?.title) setTestTitle(data.test.title);
          if (data.test?.scope === 'lesson') {
            setTestScopeLabel(`${data.test.subjectTitle || 'Subject'} → ${data.test.lessonTitle || 'Lesson'}`);
          } else if (data.test?.scope === 'subject') {
            setTestScopeLabel(`Whole Subject: ${data.test.subjectTitle || 'Subject'}`);
          } else if (data.test?.courseTitle) {
            setTestScopeLabel(`Course Test • ${data.test.courseTitle}`);
          }
          if (data.test?.durationMinutes) {
            setDurationMins(data.test.durationMinutes);
            setTimeLeft(data.test.durationMinutes * 60);
          }
          if (Array.isArray(data.questions)) {
            setQuestions(data.questions);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading || result || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, result, questions.length]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  const isAnswered = (q: LiveQuestion) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.type === 'short_text' || q.type === 'long_text' || q.type === 'numeric') {
      return ans.textAnswer.trim().length > 0;
    }
    return ans.selectedOptionIds.length > 0;
  };

  const handleToggleOption = (q: LiveQuestion, optId: string) => {
    setAnswers((prev) => {
      const existing = prev[q.id] || { selectedOptionIds: [], textAnswer: '' };
      if (q.type === 'multiple_choice') {
        const nextIds = existing.selectedOptionIds.includes(optId)
          ? existing.selectedOptionIds.filter((id) => id !== optId)
          : [...existing.selectedOptionIds, optId];
        return { ...prev, [q.id]: { ...existing, selectedOptionIds: nextIds } };
      }
      return { ...prev, [q.id]: { ...existing, selectedOptionIds: [optId] } };
    });
  };

  const handleTextChange = (q: LiveQuestion, val: string) => {
    const limited = q.maxLength ? val.slice(0, q.maxLength) : val;
    setAnswers((prev) => {
      const existing = prev[q.id] || { selectedOptionIds: [], textAnswer: '' };
      return { ...prev, [q.id]: { ...existing, textAnswer: limited } };
    });
  };

  const handleClearCurrent = () => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { selectedOptionIds: [], textAnswer: '' },
    }));
  };

  const handleToggleMark = () => {
    if (!currentQ) return;
    setMarkedIds((prev) =>
      prev.includes(currentQ.id)
        ? prev.filter((id) => id !== currentQ.id)
        : [...prev, currentQ.id]
    );
  };

  const handleSubmitTest = async () => {
    if (!courseTestId) return;
    setIsSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      let studentId = params.get('studentId') || 'guest';
      let studentName = 'Student';
      try {
        const saved = localStorage.getItem('simplicion_student');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.id) studentId = parsed.id;
          if (parsed?.name) studentName = parsed.name;
        }
      } catch {
        // ignore
      }

      const res = await fetch(
        `${API_BASE_URL}/course-tests/${encodeURIComponent(courseTestId)}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, studentName, answers }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setResult({ scorecard: data.scorecard, breakdown: data.breakdown });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setMarkedIds([]);
    setCurrentIdx(0);
    setResult(null);
    setTimeLeft(durationMins * 60);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8fafc]">
        <p className="text-sm text-[#64748b]">Loading assessment...</p>
      </div>
    );
  }

  if (!courseTestId || questions.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f8fafc] p-6 text-center space-y-4">
        <FileCheck2 className="w-10 h-10 text-[#2563eb]" />
        <h1 className="text-xl font-bold text-[#0f172a]">
          {!courseTestId ? 'Open Tests Inside Your Course Classroom' : 'No Questions Added Yet'}
        </h1>
        <p className="text-sm text-[#64748b] max-w-md">
          {!courseTestId
            ? 'Assessments and quizzes belong to enrolled courses. Open any enrolled course classroom to start an assessment.'
            : "Your educator hasn't added questions to this course test yet. Check back shortly."}
        </p>
        <Link
          href={backHref}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
        >
          {backLabel}
        </Link>
      </div>
    );
  }

  // Scorecard & Detailed Review Screen
  if (result) {
    const sc = result.scorecard;
    return (
      <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Test Submitted
              </span>
              <h1
                className="text-2xl font-bold text-[#0f172a]"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                {testTitle} — Result
              </h1>
              <p className="text-xs text-[#64748b]">
                Instant evaluation across radio, checkbox, text, true/false, and numerical questions.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Test</span>
              </button>
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{backLabel}</span>
              </Link>
            </div>
          </div>

          {/* Score Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <span className="text-xs font-semibold text-[#64748b]">Score</span>
              <p className="text-2xl font-bold text-[#2563eb] mt-1">
                {sc.totalMarksScored} / {sc.maxPossibleMarks}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <span className="text-xs font-semibold text-[#64748b]">Correct</span>
              <p className="text-2xl font-bold text-[#059669] mt-1">{sc.correct}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <span className="text-xs font-semibold text-[#64748b]">Incorrect</span>
              <p className="text-2xl font-bold text-[#dc2626] mt-1">{sc.incorrect}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
              <span className="text-xs font-semibold text-[#64748b]">Accuracy</span>
              <p className="text-2xl font-bold text-[#0f172a] mt-1">{sc.accuracyPercent}%</p>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <div className="space-y-3">
            {questions.map((q, i) => {
              const row = result.breakdown.find((b) => b.questionId === q.id);
              const status = row?.status || 'unattempted';
              return (
                <div
                  key={q.id}
                  className="p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#475569]">Question {i + 1}</span>
                    {status === 'correct' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks})
                      </span>
                    )}
                    {status === 'incorrect' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#b91c1c]">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect (-{q.negativeMarks})
                      </span>
                    )}
                    {status === 'submitted_for_review' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8]">
                        Submitted for Educator Review
                      </span>
                    )}
                    {status === 'unattempted' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#64748b]">
                        Unattempted
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-[#0f172a]">{q.prompt}</p>

                  {row?.studentAnswer && (
                    <div className="text-xs text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 space-y-1">
                      <p>
                        <strong>Your Response:</strong>{' '}
                        {Array.isArray(row.studentAnswer)
                          ? row.studentAnswer
                              .map((id: string) => q.options.find((o) => o.id === id)?.text || id)
                              .join(', ')
                          : row.studentAnswer}
                      </p>
                      {row.expectedAnswer && (
                        <p className="text-[#047857]">
                          <strong>Expected Answer:</strong> {row.expectedAnswer}
                        </p>
                      )}
                      {row.correctOptionIds && row.correctOptionIds.length > 0 && (
                        <p className="text-[#047857]">
                          <strong>Correct Option(s):</strong>{' '}
                          {row.correctOptionIds
                            .map((id: string) => q.options.find((o) => o.id === id)?.text || id)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-xs text-[#64748b]">
                      <strong className="text-[#334155]">Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const badge = TYPE_BADGE[currentQ.type] || TYPE_BADGE.single_choice;
  const BadgeIcon = badge.icon;
  const currentAns = answers[currentQ.id] || { selectedOptionIds: [], textAnswer: '' };
  const answeredCount = questions.filter((q) => isAnswered(q)).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Exam Status Bar */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            {courseTestId && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748b] hover:text-[#2563eb]"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>{backLabel}</span>
              </Link>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="text-lg font-bold text-[#0f172a]"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
              >
                {testTitle}
              </h1>
              {testScopeLabel && (
                <span className="px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] text-[11px] font-semibold">
                  {testScopeLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748b]">
              Answered {answeredCount} of {questions.length} questions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-lg border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  lang === 'en' ? 'bg-white text-[#2563eb] shadow-xs' : 'text-[#64748b]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                  lang === 'hi' ? 'bg-white text-[#2563eb] shadow-xs' : 'text-[#64748b]'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff6ff] border border-[#dbeafe] text-[#1d4ed8] font-mono text-sm font-bold">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              type="button"
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              data-testid="submit-live-test-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Test'}</span>
            </button>
          </div>
        </div>

        {/* Main Workspace: Active Question + Palette Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Question Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] text-xs font-semibold">
                  <BadgeIcon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </span>
              </div>
              <span className="text-xs font-semibold text-[#047857] bg-[#ecfdf5] px-2.5 py-0.5 rounded-md">
                +{currentQ.marks} / -{currentQ.negativeMarks}
              </span>
            </div>

            <p className="text-base sm:text-lg font-semibold text-[#0f172a] leading-relaxed">
              {lang === 'hi' && currentQ.promptHindi ? currentQ.promptHindi : currentQ.prompt}
            </p>

            {/* Dynamic Answer Widget based on Question Type */}
            {(currentQ.type === 'single_choice' ||
              currentQ.type === 'multiple_choice' ||
              currentQ.type === 'true_false') && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const selected = currentAns.selectedOptionIds.includes(opt.id);
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleOption(currentQ, opt.id)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center gap-3 transition ${
                        selected
                          ? 'bg-[#eff6ff] border-[#2563eb] ring-1 ring-[#2563eb]/20'
                          : 'bg-white border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1]'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 shrink-0 flex items-center justify-center border transition ${
                          currentQ.type === 'multiple_choice' ? 'rounded-md' : 'rounded-full'
                        } ${
                          selected
                            ? 'bg-[#2563eb] border-[#2563eb] text-white'
                            : 'bg-white border-[#cbd5e1]'
                        }`}
                      >
                        {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#64748b] w-5">
                        {currentQ.type === 'true_false' ? '' : `${letter}.`}
                      </span>
                      <span className="text-sm font-medium text-[#0f172a]">
                        {lang === 'hi' && opt.textHindi ? opt.textHindi : opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === 'short_text' && (
              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={currentQ.maxLength || 150}
                  value={currentAns.textAnswer}
                  onChange={(e) => handleTextChange(currentQ, e.target.value)}
                  placeholder={
                    currentQ.placeholder ||
                    `Type your answer (max ${currentQ.maxLength || 150} characters)...`
                  }
                  className="w-full px-4 py-3 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span>Single-line response</span>
                  <span className="font-mono font-semibold">
                    {currentAns.textAnswer.length} / {currentQ.maxLength || 150} characters
                  </span>
                </div>
              </div>
            )}

            {currentQ.type === 'long_text' && (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  maxLength={currentQ.maxLength || 600}
                  value={currentAns.textAnswer}
                  onChange={(e) => handleTextChange(currentQ, e.target.value)}
                  placeholder={
                    currentQ.placeholder ||
                    `Write your detailed answer (max ${currentQ.maxLength || 600} characters)...`
                  }
                  className="w-full px-4 py-3 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span>Long-form response</span>
                  <span className="font-mono font-semibold">
                    {currentAns.textAnswer.length} / {currentQ.maxLength || 600} characters
                  </span>
                </div>
              </div>
            )}

            {currentQ.type === 'numeric' && (
              <div className="space-y-2">
                <input
                  type="number"
                  step="any"
                  value={currentAns.textAnswer}
                  onChange={(e) => handleTextChange(currentQ, e.target.value)}
                  placeholder={currentQ.placeholder || 'Enter numerical answer...'}
                  className="w-full max-w-xs px-4 py-3 text-base font-mono font-semibold text-[#0f172a] bg-white border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>
            )}

            {/* Navigation Actions */}
            <div className="pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearCurrent}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-[#64748b] hover:text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0]"
                >
                  Clear Response
                </button>
                <button
                  type="button"
                  onClick={handleToggleMark}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                    markedIds.includes(currentQ.id)
                      ? 'bg-[#fffbeb] border-[#fcd34d] text-[#b45309]'
                      : 'bg-white border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{markedIds.includes(currentQ.id) ? 'Marked' : 'Mark for Review'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#334155] bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
                  >
                    <span>Save &amp; Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Finish &amp; Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Question Palette (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Question Palette
            </h2>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const active = idx === currentIdx;
                const answered = isAnswered(q);
                const marked = markedIds.includes(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-lg text-xs font-bold border transition ${
                      active
                        ? 'bg-[#2563eb] text-white border-[#2563eb] ring-2 ring-[#2563eb]/20'
                        : marked
                          ? 'bg-[#fffbeb] text-[#b45309] border-[#fcd34d]'
                          : answered
                            ? 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]'
                            : 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0] hover:border-[#cbd5e1]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] grid grid-cols-2 gap-2 text-[11px] text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#ecfdf5] border border-[#a7f3d0]" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#fffbeb] border border-[#fcd34d]" />
                <span>Marked ({markedIds.length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#f8fafc] border border-[#e2e8f0]" />
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
