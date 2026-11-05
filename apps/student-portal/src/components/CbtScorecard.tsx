'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@simplicion/ui';
import { Trophy, CheckCircle, XCircle, ArrowRight, RotateCcw, BookOpen, AlertCircle } from 'lucide-react';
import { Question, Scorecard } from '@simplicion/assessment';

export interface CbtScorecardProps {
  testTitle: string;
  scorecard: Scorecard;
  questions: Question[];
  userAnswers: Record<string, string[]>;
  onRetake: () => void;
}

export const CbtScorecard: React.FC<CbtScorecardProps> = ({
  testTitle,
  scorecard,
  questions,
  userAnswers,
  onRetake,
}) => {
  const [showSolutions, setShowSolutions] = useState(false);

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Celebration Card */}
        <Card padding="lg" className="text-center border-2 border-emerald-500/30 shadow-xl bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/20">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8" />
          </div>

          <Badge variant="success" size="md" className="mb-2">
            Assessment Completed
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {testTitle} Performance Report
          </h1>

          {/* Large Score Metric */}
          <div className="mt-6 flex items-center justify-center space-x-6">
            <div className="text-center">
              <span className="text-5xl font-black text-slate-900 dark:text-white">
                {scorecard.totalMarksScored}
              </span>
              <span className="text-sm text-slate-500 block mt-1">
                out of {scorecard.maxPossibleMarks} Marks
              </span>
            </div>

            <div className="h-12 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="text-center">
              <span className="text-5xl font-black text-[var(--brand-primary,#2563eb)]">
                {scorecard.accuracyPercent}%
              </span>
              <span className="text-sm text-slate-500 block mt-1">Accuracy Rate</span>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 block">Total Questions</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{scorecard.totalQuestions}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">Correct (+4)</span>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{scorecard.correct}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40">
              <span className="text-xs text-rose-600 dark:text-rose-400 block font-semibold">Incorrect (-1)</span>
              <span className="text-xl font-bold text-rose-700 dark:text-rose-300">{scorecard.incorrect}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 block">Unattempted</span>
              <span className="text-xl font-bold text-slate-600 dark:text-slate-300">{scorecard.unattempted}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant={showSolutions ? 'secondary' : 'primary'}
              size="md"
              onClick={() => setShowSolutions(!showSolutions)}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span>{showSolutions ? 'Hide Detailed Solutions' : 'Review Solutions & Explanations'}</span>
            </Button>

            <Button variant="outline" size="md" onClick={onRetake}>
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Retake Test</span>
            </Button>

            <Link href="/study">
              <Button variant="ghost" size="md">
                <span>Return to Study Hub</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Detailed Solutions Accordion */}
        {showSolutions && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Questions &amp; Verified Explanations
            </h2>

            {questions.map((q, idx) => {
              const userSelected = userAnswers[q.id] || [];
              const isCorrect =
                userSelected.length === q.correctOptionIds.length &&
                userSelected.every((id) => q.correctOptionIds.includes(id));
              const isUnattempted = userSelected.length === 0;

              return (
                <Card key={q.id} padding="md" className="border border-slate-200 dark:border-slate-800 text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500">Question {idx + 1}</span>
                    {isUnattempted ? (
                      <Badge variant="secondary" size="sm">Unattempted (0)</Badge>
                    ) : isCorrect ? (
                      <Badge variant="success" size="sm" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Correct (+{q.marks})</span>
                      </Badge>
                    ) : (
                      <Badge variant="error" size="sm" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        <span>Incorrect (-{q.negativeMarks})</span>
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{q.textEn}</p>

                  {/* Options */}
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt) => {
                      const isOptionCorrect = q.correctOptionIds.includes(opt.id);
                      const isOptionSelected = userSelected.includes(opt.id);

                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg text-xs font-medium flex items-center justify-between border ${
                            isOptionCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                              : isOptionSelected
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{opt.textEn}</span>
                          {isOptionCorrect && <span className="text-[10px] uppercase font-bold text-emerald-600">Correct Answer</span>}
                          {!isOptionCorrect && isOptionSelected && (
                            <span className="text-[10px] uppercase font-bold text-rose-600">Your Answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pedagogical Explanation */}
                  {q.explanationEn && (
                    <div className="mt-3 p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                      <span className="font-bold block mb-1">Detailed Explanation:</span>
                      <span>{q.explanationEn}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

