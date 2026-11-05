'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal } from '@simplicion/ui';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Bookmark,
  Languages,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Question, Scorecard } from '@simplicion/assessment';
import { CbtScorecard } from './CbtScorecard';

export interface CbtSimulatorProps {
  testTitle: string;
  durationMinutes?: number;
  questions: Question[];
  onFinish?: (scorecard: Scorecard) => void;
}

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review';

export const CbtSimulator: React.FC<CbtSimulatorProps> = ({
  testTitle,
  durationMinutes = 45,
  questions,
  onFinish,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>(() => {
    const init: Record<string, QuestionStatus> = {};
    questions.forEach((q, i) => {
      init[q.id] = i === 0 ? 'not_answered' : 'not_visited';
    });
    return init;
  });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(durationMinutes * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);

  // Countdown Timer
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto-submit when time expires!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optionId: string) => {
    const isMulti = currentQ.type === 'multiple_choice';
    setAnswers((prev) => {
      const current = prev[currentQ.id] || [];
      if (isMulti) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [currentQ.id]: next };
      } else {
        return { ...prev, [currentQ.id]: [optionId] };
      }
    });
  };

  const handleSaveAndNext = () => {
    const selected = answers[currentQ.id] || [];
    setStatuses((prev) => ({
      ...prev,
      [currentQ.id]: selected.length > 0 ? 'answered' : 'not_answered',
    }));

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (statuses[questions[nextIdx].id] === 'not_visited') {
        setStatuses((prev) => ({ ...prev, [questions[nextIdx].id]: 'not_answered' }));
      }
    }
  };

  const handleMarkForReviewAndNext = () => {
    setStatuses((prev) => ({
      ...prev,
      [currentQ.id]: 'marked_for_review',
    }));

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (statuses[questions[nextIdx].id] === 'not_visited') {
        setStatuses((prev) => ({ ...prev, [questions[nextIdx].id]: 'not_answered' }));
      }
    }
  };

  const handleClearResponse = () => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: [] }));
    setStatuses((prev) => ({ ...prev, [currentQ.id]: 'not_answered' }));
  };

  const handleJumpToQuestion = (idx: number) => {
    // Commit current status if unanswered
    if (statuses[currentQ.id] === 'not_visited') {
      setStatuses((prev) => ({ ...prev, [currentQ.id]: 'not_answered' }));
    }
    setCurrentIdx(idx);
    if (statuses[questions[idx].id] === 'not_visited') {
      setStatuses((prev) => ({ ...prev, [questions[idx].id]: 'not_answered' }));
    }
  };

  const handleFinalSubmit = () => {
    setIsSubmitModalOpen(false);

    // Compute final Scorecard
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let totalMarks = 0;
    let maxMarks = 0;

    questions.forEach((q) => {
      maxMarks += q.marks;
      const userSelected = answers[q.id] || [];
      if (userSelected.length > 0) {
        attempted++;
        const isCorrect =
          q.correctOptionIds.length === userSelected.length &&
          q.correctOptionIds.every((id) => userSelected.includes(id));
        if (isCorrect) {
          correct++;
          totalMarks += q.marks;
        } else {
          incorrect++;
          totalMarks -= q.negativeMarks;
        }
      }
    });

    const unattempted = questions.length - attempted;
    const accuracyPercent = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const percentageScore = maxMarks > 0 ? Math.round((Math.max(0, totalMarks) / maxMarks) * 100) : 0;

    const finalScorecard: Scorecard = {
      totalQuestions: questions.length,
      attempted,
      correct,
      incorrect,
      unattempted,
      totalMarksScored: Math.max(0, totalMarks),
      maxPossibleMarks: maxMarks,
      accuracyPercent,
      percentageScore,
    };

    setScorecard(finalScorecard);
    setIsCompleted(true);
    if (onFinish) onFinish(finalScorecard);
  };

  // Time format
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Question counts by status
  const answeredCount = Object.values(statuses).filter((s) => s === 'answered').length;
  const markedCount = Object.values(statuses).filter((s) => s === 'marked_for_review').length;
  const notAnsweredCount = Object.values(statuses).filter((s) => s === 'not_answered').length;
  const notVisitedCount = Object.values(statuses).filter((s) => s === 'not_visited').length;

  if (isCompleted && scorecard) {
    return (
      <CbtScorecard
        testTitle={testTitle}
        scorecard={scorecard}
        questions={questions}
        userAnswers={answers}
        onRetake={() => {
          setAnswers({});
          setTimeLeftSeconds(durationMinutes * 60);
          setCurrentIdx(0);
          setIsCompleted(false);
        }}
      />
    );
  }

  const isLowTime = timeLeftSeconds < 300; // < 5 minutes

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col select-none">
      {/* Top CBT Header */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
            National Testing Agency Pattern Simulator
          </span>
          <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-md">{testTitle}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-200"
          >
            <Languages className="w-4 h-4 text-amber-400" />
            <span>Language: {language === 'en' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Countdown Timer */}
          <div
            className={`flex items-center space-x-2 py-1.5 px-3 rounded-lg font-mono font-bold text-sm border ${
              isLowTime
                ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse'
                : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          <Button variant="danger" size="sm" onClick={() => setIsSubmitModalOpen(true)}>
            <span>Submit Test</span>
            <Send className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </header>

      {/* Main CBT Workspace (Question Area + Question Palette) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Viewport (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Question {currentIdx + 1} of {questions.length}
              </span>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 py-0.5 px-2 rounded">
                  +{currentQ.marks} Marks
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 py-0.5 px-2 rounded">
                  -{currentQ.negativeMarks} Negative
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-8 leading-relaxed">
              {language === 'hi' && currentQ.textHi ? currentQ.textHi : currentQ.textEn}
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = (answers[currentQ.id] || []).includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center space-x-3 border-2 ${
                      isSelected
                        ? 'border-[var(--brand-primary,#2563eb)] bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                        isSelected
                          ? 'bg-[var(--brand-primary,#2563eb)] text-white border-transparent'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {opt.id.toUpperCase().replace('OPT', '')}
                    </span>
                    <span>{language === 'hi' && opt.textHi ? opt.textHi : opt.textEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleClearResponse}>
                Clear Response
              </Button>
              <Button variant="secondary" size="sm" onClick={handleMarkForReviewAndNext}>
                <Bookmark className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                <span>Mark for Review &amp; Next</span>
              </Button>
            </div>

            <Button variant="primary" size="md" onClick={handleSaveAndNext}>
              <span>Save &amp; Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Question Palette Sidebar (1 Column) */}
        <div className="space-y-6">
          {/* Palette Legend */}
          <Card padding="md" className="border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Question Palette Status
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {answeredCount}
                </span>
                <span className="text-slate-600 dark:text-slate-300">Answered</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {notAnsweredCount}
                </span>
                <span className="text-slate-600 dark:text-slate-300">Not Answered</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {markedCount}
                </span>
                <span className="text-slate-600 dark:text-slate-300">Review</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center">
                  {notVisitedCount}
                </span>
                <span className="text-slate-600 dark:text-slate-300">Not Visited</span>
              </div>
            </div>
          </Card>

          {/* Palette Grid */}
          <Card padding="md" className="border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Questions (Jump to Item)
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const status = statuses[q.id] || 'not_visited';
                const isCurrent = currentIdx === idx;

                const bgColors = {
                  answered: 'bg-emerald-600 text-white',
                  not_answered: 'bg-rose-600 text-white',
                  marked_for_review: 'bg-purple-600 text-white',
                  not_visited: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                };

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-9 rounded-lg font-bold text-xs transition-transform hover:scale-105 flex items-center justify-center ${
                      bgColors[status]
                    } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Examination"
        description="Are you sure you want to finish your test attempt? Answers cannot be changed once submitted."
      >
        <div className="space-y-4 py-2">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-bold">{questions.length}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Answered:</span>
              <span>{answeredCount}</span>
            </div>
            <div className="flex justify-between text-purple-600 font-semibold">
              <span>Marked for Review:</span>
              <span>{markedCount}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>Unanswered / Not Visited:</span>
              <span>{questions.length - answeredCount}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Resume Test
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              onClick={handleFinalSubmit}
            >
              Confirm &amp; Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

