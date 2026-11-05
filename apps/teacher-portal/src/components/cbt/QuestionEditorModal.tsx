'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '@simplicion/ui';
import { Languages, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Question } from '@simplicion/assessment';

export interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (q: Question) => void;
  initialQuestion?: Question | null;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
}) => {
  const [activeLang, setActiveLang] = useState<'en' | 'hi'>('en');
  const [promptEn, setPromptEn] = useState('');
  const [promptHi, setPromptHi] = useState('');
  const [type, setType] = useState<'single_choice' | 'multiple_choice'>('single_choice');
  const [marks, setMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [explanationEn, setExplanationEn] = useState('');
  const [explanationHi, setExplanationHi] = useState('');

  const [options, setOptions] = useState<
    Array<{ id: string; textEn: string; textHi: string }>
  >([
    { id: 'opt_1', textEn: '', textHi: '' },
    { id: 'opt_2', textEn: '', textHi: '' },
    { id: 'opt_3', textEn: '', textHi: '' },
    { id: 'opt_4', textEn: '', textHi: '' },
  ]);

  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>(['opt_1']);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuestion) {
      setPromptEn(initialQuestion.prompt);
      setPromptHi(initialQuestion.promptHindi || '');
      setType(initialQuestion.type === 'multiple_choice' ? 'multiple_choice' : 'single_choice');
      setMarks(initialQuestion.marks);
      setNegativeMarks(initialQuestion.negativeMarks);
      setExplanationEn(initialQuestion.explanation || '');
      setExplanationHi(initialQuestion.explanationHindi || '');
      setOptions(
        initialQuestion.options.map((opt) => ({
          id: opt.id,
          textEn: opt.text,
          textHi: opt.textHindi || '',
        }))
      );
      setCorrectOptionIds(initialQuestion.correctOptionIds);
    } else {
      setPromptEn('');
      setPromptHi('');
      setType('single_choice');
      setMarks(4);
      setNegativeMarks(1);
      setExplanationEn('');
      setExplanationHi('');
      setOptions([
        { id: 'opt_1', textEn: '', textHi: '' },
        { id: 'opt_2', textEn: '', textHi: '' },
        { id: 'opt_3', textEn: '', textHi: '' },
        { id: 'opt_4', textEn: '', textHi: '' },
      ]);
      setCorrectOptionIds(['opt_1']);
    }
    setError(null);
  }, [initialQuestion, isOpen]);

  const handleToggleCorrect = (optId: string) => {
    if (type === 'single_choice') {
      setCorrectOptionIds([optId]);
    } else {
      setCorrectOptionIds((prev) =>
        prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
      );
    }
  };

  const handleOptionTextChange = (optId: string, val: string) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id !== optId) return opt;
        return activeLang === 'en'
          ? { ...opt, textEn: val }
          : { ...opt, textHi: val };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptEn.trim()) {
      setError('Question prompt in English is required');
      return;
    }
    const emptyOption = options.find((opt) => !opt.textEn.trim());
    if (emptyOption) {
      setError('All 4 options must have text in English');
      return;
    }
    if (correctOptionIds.length === 0) {
      setError('Please select at least one correct option');
      return;
    }

    const question: Question = {
      id: initialQuestion?.id || `q_${Date.now()}`,
      unitId: initialQuestion?.unitId || 'u_general',
      tenantId: 'tenant_cuet',
      type,
      prompt: promptEn.trim(),
      promptHindi: promptHi.trim() || undefined,
      options: options.map((opt) => ({
        id: opt.id,
        text: opt.textEn.trim(),
        textHindi: opt.textHi.trim() || undefined,
      })),
      correctOptionIds,
      marks,
      negativeMarks,
      explanation: explanationEn.trim() || undefined,
      explanationHindi: explanationHi.trim() || undefined,
    };

    onSave(question);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialQuestion?.id ? 'Edit CBT Question' : 'Create CBT Question'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Language Tabs & Marking Scheme */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveLang('en')}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                activeLang === 'en' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveLang('hi')}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                activeLang === 'hi' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">Type:</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="text-xs border border-slate-300 rounded px-2 py-1"
            >
              <option value="single_choice">Single Choice (+4 / -1)</option>
              <option value="multiple_choice">Multiple Choice</option>
            </select>
          </div>
        </div>

        {/* Question Prompt */}
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>
              Question Prompt ({activeLang === 'en' ? 'English *' : 'Hindi Optional'})
            </span>
          </label>
          {activeLang === 'en' ? (
            <textarea
              required
              rows={3}
              value={promptEn}
              onChange={(e) => setPromptEn(e.target.value)}
              placeholder="e.g. Which of the following Harappan sites is renowned for sophisticated water reservoirs?"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          ) : (
            <textarea
              rows={3}
              value={promptHi}
              onChange={(e) => setPromptHi(e.target.value)}
              placeholder="उदा. निम्नलिखित में से कौन सा हड़प्पा स्थल उन्नत जल जलाशयों के लिए प्रसिद्ध है?"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          )}
        </div>

        {/* 4 Options */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Options & Correct Answer ({activeLang === 'en' ? 'English' : 'Hindi'})
          </label>
          {options.map((opt, idx) => {
            const isCorrect = correctOptionIds.includes(opt.id);
            const labelLetter = String.fromCharCode(65 + idx);

            return (
              <div
                key={opt.id}
                className={`p-2.5 rounded-lg border transition flex items-center space-x-3 ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleCorrect(opt.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                    isCorrect
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-300 text-slate-500 hover:border-slate-400'
                  }`}
                  title={isCorrect ? 'Correct Option' : 'Mark as Correct'}
                >
                  {isCorrect ? <Check className="w-3.5 h-3.5" /> : labelLetter}
                </button>

                <input
                  type="text"
                  required={activeLang === 'en'}
                  value={activeLang === 'en' ? opt.textEn : opt.textHi}
                  onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                  placeholder={`Option ${labelLetter} (${activeLang.toUpperCase()})`}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            );
          })}
        </div>

        {/* Marks & Explanations */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Marks (+)</label>
            <input
              type="number"
              min="1"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Negative Marks (-)</label>
            <input
              type="number"
              min="0"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(Number(e.target.value))}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            Explanation / Solution ({activeLang === 'en' ? 'English' : 'Hindi'})
          </label>
          {activeLang === 'en' ? (
            <textarea
              rows={2}
              value={explanationEn}
              onChange={(e) => setExplanationEn(e.target.value)}
              placeholder="e.g. Dholavira in Gujarat had massive stone-cut water reservoirs..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          ) : (
            <textarea
              rows={2}
              value={explanationHi}
              onChange={(e) => setExplanationHi(e.target.value)}
              placeholder="उदा. गुजरात के धोलावीरा में विशाल पत्थर के जलाशय मिले थे..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {initialQuestion?.id ? 'Update Question' : 'Save Question'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

