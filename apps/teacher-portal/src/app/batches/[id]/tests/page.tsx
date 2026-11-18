'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  ClipboardCheck,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Edit3,
  Trash2,
  Upload,
  Clock,
  BookOpen,
  Layers,
  CheckCircle2,
  CircleDot,
  CheckSquare,
  Type,
  AlignLeft,
  ToggleLeft,
  Hash,
  X,
  ExternalLink,
  Award,
} from 'lucide-react';
import { QuestionAnswerType } from '@simplicion/assessment';
import {
  QuestionEditorModal,
  StudioQuestion,
} from '../../../../components/cbt/QuestionEditorModal';
import { BulkImporterModal } from '../../../../components/cbt/BulkImporterModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TYPE_META: Record<QuestionAnswerType, { label: string; icon: React.ElementType }> = {
  single_choice: { label: 'Radio Options', icon: CircleDot },
  multiple_choice: { label: 'Checkboxes', icon: CheckSquare },
  short_text: { label: 'Short Text', icon: Type },
  long_text: { label: 'Long Text', icon: AlignLeft },
  true_false: { label: 'True / False', icon: ToggleLeft },
  numeric: { label: 'Numerical', icon: Hash },
};

export default function CourseTestsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [tests, setTests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'lesson' | 'subject' | 'course'>('all');
  const [expandedTestIds, setExpandedTestIds] = useState<Record<string, boolean>>({});
  const [hasInitExpand, setHasInitExpand] = useState(false);

  // Create / Edit Test Metadata Drawer
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestMeta, setEditingTestMeta] = useState<any | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testDuration, setTestDuration] = useState('30');
  const [testStatus, setTestStatus] = useState<'live' | 'draft'>('live');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [isSavingTest, setIsSavingTest] = useState(false);

  // Reuse existing flexible QuestionEditorModal & BulkImporterModal per CourseTest
  const [activeTestIdForQuestion, setActiveTestIdForQuestion] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<StudioQuestion | null>(null);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [bulkImportTestId, setBulkImportTestId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const loadData = useCallback(async () => {
    if (!courseId) return;
    try {
      const [testsRes, currRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/tests`),
        fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/curriculum`),
      ]);
      const [testsData, currData] = await Promise.all([testsRes.json(), currRes.json()]);
      if (testsData.success) {
        const list = testsData.tests || [];
        setTests(list);
        if (list.length > 0 && !hasInitExpand) {
          setExpandedTestIds({ [list[0].id]: true });
          setHasInitExpand(true);
        }
      }
      if (currData.success) {
        setSubjects(currData.subjects || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId, hasInitExpand]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeSubjectObj = subjects.find((s) => s.id === selectedSubjectId);

  const openCreateTestModal = () => {
    setEditingTestMeta(null);
    setTestTitle('');
    setTestDescription('');
    setTestDuration('30');
    setTestStatus('live');
    setSelectedSubjectId('');
    setSelectedLessonId('');
    setIsTestModalOpen(true);
  };

  const openEditTestModal = (e: React.MouseEvent, test: any) => {
    e.stopPropagation();
    setEditingTestMeta(test);
    setTestTitle(test.title || '');
    setTestDescription(test.description || '');
    setTestDuration(String(test.durationMinutes || 30));
    setTestStatus(test.status === 'draft' ? 'draft' : 'live');
    setSelectedSubjectId(test.subjectId || '');
    setSelectedLessonId(test.lessonId || '');
    setIsTestModalOpen(true);
  };

  const handleSaveTestMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;
    setIsSavingTest(true);
    try {
      const payload = {
        title: testTitle.trim(),
        description: testDescription.trim() || null,
        durationMinutes: Math.max(1, Number(testDuration) || 30),
        status: testStatus,
        subjectId: selectedSubjectId || null,
        lessonId: selectedSubjectId && selectedLessonId ? selectedLessonId : null,
      };

      if (editingTestMeta) {
        const res = await fetch(
          `${API_BASE_URL}/course-tests/${encodeURIComponent(editingTestMeta.id)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (data.success) {
          setIsTestModalOpen(false);
          await loadData();
          showToast('Test updated and synced to Student Classroom.');
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}/tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.test) {
          setIsTestModalOpen(false);
          setExpandedTestIds((prev) => ({ ...prev, [data.test.id]: true }));
          await loadData();
          showToast('Test created! Add questions below to publish for students.');
        }
      }
    } finally {
      setIsSavingTest(false);
    }
  };

  const handleDeleteTest = async (e: React.MouseEvent, testId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this test and all its questions?')) return;
    await fetch(`${API_BASE_URL}/course-tests/${encodeURIComponent(testId)}`, {
      method: 'DELETE',
    });
    await loadData();
    showToast('Test deleted.');
  };

  const handleOpenAddQuestion = (e: React.MouseEvent, testId: string) => {
    e.stopPropagation();
    setExpandedTestIds((prev) => ({ ...prev, [testId]: true }));
    setActiveTestIdForQuestion(testId);
    setEditingQuestion(null);
    setIsQuestionEditorOpen(true);
  };

  const handleOpenEditQuestion = (testId: string, q: StudioQuestion) => {
    setActiveTestIdForQuestion(testId);
    setEditingQuestion(q);
    setIsQuestionEditorOpen(true);
  };

  const handleSaveQuestion = async (q: StudioQuestion) => {
    if (!activeTestIdForQuestion) return;
    setIsSavingQuestion(true);
    try {
      if (editingQuestion) {
        await fetch(
          `${API_BASE_URL}/course-tests/${encodeURIComponent(activeTestIdForQuestion)}/questions/${encodeURIComponent(editingQuestion.id)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q),
          }
        );
        showToast('Question updated.');
      } else {
        await fetch(
          `${API_BASE_URL}/course-tests/${encodeURIComponent(activeTestIdForQuestion)}/questions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q),
          }
        );
        showToast('Question added to test.');
      }
      setIsQuestionEditorOpen(false);
      await loadData();
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (testId: string, questionId: string) => {
    if (!confirm('Delete this question from the test?')) return;
    await fetch(
      `${API_BASE_URL}/course-tests/${encodeURIComponent(testId)}/questions/${encodeURIComponent(questionId)}`,
      { method: 'DELETE' }
    );
    await loadData();
    showToast('Question removed.');
  };

  const handleBulkImport = async (newQuestions: any[]) => {
    if (!bulkImportTestId) return;
    for (const q of newQuestions) {
      await fetch(
        `${API_BASE_URL}/course-tests/${encodeURIComponent(bulkImportTestId)}/questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(q),
        }
      );
    }
    setBulkImportTestId(null);
    await loadData();
    showToast(`Imported ${newQuestions.length} questions into test.`);
  };

  const filteredTests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tests.filter((t) => {
      if (scopeFilter !== 'all' && t.scope !== scopeFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.subjectTitle && t.subjectTitle.toLowerCase().includes(q)) ||
        (t.lessonTitle && t.lessonTitle.toLowerCase().includes(q))
      );
    });
  }, [tests, scopeFilter, searchQuery]);

  const allExpanded =
    filteredTests.length > 0 && filteredTests.every((t) => Boolean(expandedTestIds[t.id]));

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedTestIds({});
    } else {
      const next: Record<string, boolean> = {};
      filteredTests.forEach((t) => {
        next[t.id] = true;
      });
      setExpandedTestIds(next);
    }
  };

  const renderScopeLabel = (t: any) => {
    if (t.scope === 'lesson') {
      return `${t.subjectTitle || 'Subject'} → ${t.lessonTitle || 'Lesson'}`;
    }
    if (t.scope === 'subject') {
      return `Whole Subject: ${t.subjectTitle || 'Subject'}`;
    }
    return 'Whole Course Test';
  };

  return (
    <div className="space-y-5 w-full min-w-0 pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-lg text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              Course Tests &amp; Quizzes
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1">
              Create tests linked to a specific lesson, an entire subject, or the full course. Tests appear automatically inside the Student Classroom.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateTestModal}
            data-testid="create-course-test-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test</span>
          </button>
        </div>

        {/* Search + Scope Filter + Expand All */}
        {tests.length > 0 && (
          <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests by name, subject, or lesson..."
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

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-lg border border-[#e2e8f0]">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'lesson', label: 'Lesson' },
                    { id: 'subject', label: 'Subject' },
                    { id: 'course', label: 'Course' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setScopeFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      scopeFilter === tab.id
                        ? 'bg-white text-[#2563eb] shadow-xs'
                        : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
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
          </div>
        )}
      </div>

      {/* Tests Accordion List */}
      {isLoading ? (
        <div className="p-12 bg-white rounded-xl border border-[#e2e8f0] text-center text-sm text-[#64748b]">
          Loading course tests...
        </div>
      ) : tests.length === 0 ? (
        <div className="p-14 bg-white rounded-xl border border-[#e2e8f0] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center mx-auto">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#0f172a]">No Tests Created Yet</h2>
            <p className="text-xs text-[#64748b] max-w-md mx-auto">
              Create your first test and link it to any lesson, a whole subject, or the full course. Add radio, checkbox, short/long text, true/false, or numerical questions.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateTestModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Test</span>
          </button>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-10 bg-white rounded-xl border border-[#e2e8f0] text-center text-xs text-[#64748b]">
          No tests match your current search or filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => {
            const isExpanded = Boolean(expandedTestIds[test.id]);
            const questions: StudioQuestion[] = test.questions || [];

            return (
              <div
                key={test.id}
                data-testid={`course-test-card-${test.id}`}
                className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden"
              >
                {/* Collapsible Test Header */}
                <div
                  onClick={() =>
                    setExpandedTestIds((prev) => ({ ...prev, [test.id]: !prev[test.id] }))
                  }
                  className={`px-4 sm:px-5 py-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                    isExpanded
                      ? 'bg-[#f8fafc] border-b border-[#e2e8f0]'
                      : 'bg-white hover:bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      className="p-1 mt-0.5 rounded-md text-[#64748b] hover:bg-[#e2e8f0]/60 shrink-0"
                      aria-label={isExpanded ? 'Collapse test' : 'Expand test'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className="text-sm sm:text-base font-bold text-[#0f172a] truncate"
                          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                        >
                          {test.title}
                        </h2>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            test.status === 'live'
                              ? 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                              : 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]'
                          }`}
                        >
                          {test.status === 'live' ? 'Live for Students' : 'Draft'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1d4ed8] font-semibold">
                          {test.scope === 'subject' ? (
                            <Layers className="w-3 h-3" />
                          ) : (
                            <BookOpen className="w-3 h-3" />
                          )}
                          <span>{renderScopeLabel(test)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ClipboardCheck className="w-3 h-3" />
                          {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {test.durationMinutes} mins
                        </span>
                        {test.attemptsCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[#047857] font-semibold">
                            <Award className="w-3 h-3" />
                            {test.attemptsCount} attempt{test.attemptsCount > 1 ? 's' : ''} • Avg{' '}
                            {test.avgPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div
                    className="flex flex-wrap items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleOpenAddQuestion(e, test.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBulkImportTestId(test.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#334155] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1]"
                      title="Bulk import questions"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#64748b]" />
                      <span className="hidden md:inline">Import</span>
                    </button>

                    <a
                      href={`http://localhost:3001/test?courseTestId=${encodeURIComponent(test.id)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-[#2563eb] bg-white border border-[#e2e8f0]"
                      title="Preview Student Test View"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={(e) => openEditTestModal(e, test)}
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-[#2563eb] bg-white border border-[#e2e8f0]"
                      title="Edit test name or subject/lesson link"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteTest(e, test.id)}
                      className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626]"
                      title="Delete test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Questions List */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-2.5 bg-white animate-accordion-open">
                    {test.description && (
                      <p className="text-xs text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3.5 py-2.5">
                        {test.description}
                      </p>
                    )}

                    {questions.length === 0 ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-xs text-[#64748b]">
                        <span>
                          No questions added to this test yet. Click <strong>+ Add Question</strong> to build radio, checkbox, text, true/false, or numerical questions.
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleOpenAddQuestion(e, test.id)}
                          className="font-semibold text-[#2563eb] hover:underline"
                        >
                          + Add First Question
                        </button>
                      </div>
                    ) : (
                      questions.map((q, qIdx) => {
                        const meta = TYPE_META[q.type] || TYPE_META.single_choice;
                        const TypeIcon = meta.icon;
                        return (
                          <div
                            key={q.id}
                            className="p-3.5 rounded-lg border border-[#e2e8f0] hover:border-[#cbd5e1] bg-[#f8fafc]/50 flex flex-wrap items-start justify-between gap-3"
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                <span className="font-mono font-bold text-[#64748b]">
                                  Q{qIdx + 1}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#e2e8f0] text-[#334155] font-semibold">
                                  <TypeIcon className="w-3 h-3 text-[#2563eb]" />
                                  <span>{meta.label}</span>
                                </span>
                                <span className="text-[#047857] font-semibold">+{q.marks}</span>
                                {q.negativeMarks > 0 && (
                                  <span className="text-[#dc2626] font-semibold">
                                    -{q.negativeMarks}
                                  </span>
                                )}
                                {q.maxLength && (
                                  <span className="text-[#64748b]">
                                    Max {q.maxLength} chars
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-[#0f172a]">{q.prompt}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditQuestion(test.id, q)}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#2563eb] bg-[#eff6ff] hover:bg-[#dbeafe]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(test.id, q.id)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#dc2626]"
                                title="Remove question"
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

      {/* Create / Edit Test Drawer (Name + Subject Dropdown + Lesson Dropdown) */}
      {isTestModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex justify-end !mt-0">
          <div
            className="fixed inset-0 bg-[#0f172a]/45 backdrop-blur-[2px]"
            onClick={() => setIsTestModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white h-[100dvh] border-l border-[#e2e8f0] shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <h2
                  className="text-lg font-bold text-[#0f172a]"
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                >
                  {editingTestMeta ? 'Edit Course Test' : 'Create Course Test'}
                </h2>
                <p className="text-xs text-[#64748b]">
                  Link to a specific lesson, a whole subject, or the entire course.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="course-test-meta-form"
              onSubmit={handleSaveTestMeta}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">Test Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. Algebra Lesson Quiz or Full Math Mock Test"
                  className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              {/* Subject & Lesson Linking Dropdowns */}
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#334155]">
                    Link to Subject
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedLessonId('');
                    }}
                    data-testid="test-subject-select"
                    className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                  >
                    <option value="">Whole Course (All Subjects)</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSubjectId && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#334155]">
                      Link to Lesson (Optional)
                    </label>
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      data-testid="test-lesson-select"
                      className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                    >
                      <option value="">Whole Subject — {activeSubjectObj?.title}</option>
                      {(activeSubjectObj?.lessons || []).map((les: any) => (
                        <option key={les.id} value={les.id}>
                          {les.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#64748b]">
                      {selectedLessonId
                        ? 'Displayed directly inside this specific lesson in the Student Classroom.'
                        : 'Displayed as a Whole Subject Test inside this subject in the Student Classroom.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#334155]">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={testDuration}
                    onChange={(e) => setTestDuration(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#334155]">Visibility</label>
                  <select
                    value={testStatus}
                    onChange={(e) => setTestStatus(e.target.value as 'live' | 'draft')}
                    className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                  >
                    <option value="live">Published Live</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="Optional instructions shown before students start the test..."
                  className="w-full px-3.5 py-2 text-sm text-[#0f172a] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                />
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-[#334155] bg-white border border-[#cbd5e1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="course-test-meta-form"
                disabled={isSavingTest}
                data-testid="save-course-test-btn"
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm disabled:opacity-60"
              >
                {isSavingTest
                  ? 'Saving...'
                  : editingTestMeta
                    ? 'Save Test Changes'
                    : 'Create Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Flexible Side-Menu Question Builder Drawer (All 6 Answer Types) */}
      <QuestionEditorModal
        isOpen={isQuestionEditorOpen}
        onClose={() => setIsQuestionEditorOpen(false)}
        initialQuestion={editingQuestion}
        isSaving={isSavingQuestion}
        onSave={handleSaveQuestion}
      />

      {/* Existing Bulk Question Importer */}
      <BulkImporterModal
        isOpen={Boolean(bulkImportTestId)}
        onClose={() => setBulkImportTestId(null)}
        onImport={handleBulkImport}
      />
    </div>
  );
}
