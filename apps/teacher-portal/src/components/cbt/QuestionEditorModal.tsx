'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  CircleDot,
  CheckSquare,
  Type,
  AlignLeft,
  ToggleLeft,
  Hash,
} from 'lucide-react';
import { QuestionAnswerType } from '@simplicion/assessment';

export interface StudioQuestion {
  id: string;
  unitId?: string;
  tenantId?: string;
  tenantSlug?: string;
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
  explanationHindi?: string;
}

export interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (q: StudioQuestion) => void;
  initialQuestion?: StudioQuestion | null;
  isSaving?: boolean;
}

const ANSWER_TYPES: Array<{
  type: QuestionAnswerType;
  label: string;
  subtitle: string;
  icon: React.ElementType;
}> = [
  { type: 'single_choice', label: 'Radio Options', subtitle: 'Single correct choice', icon: CircleDot },
  { type: 'multiple_choice', label: 'Checkboxes', subtitle: 'Multiple correct', icon: CheckSquare },
  { type: 'short_text', label: 'Short Text', subtitle: 'Single line + limit', icon: Type },
  { type: 'long_text', label: 'Long Text', subtitle: 'Paragraph + limit', icon: AlignLeft },
  { type: 'true_false', label: 'True / False', subtitle: 'Binary statement', icon: ToggleLeft },
  { type: 'numeric', label: 'Numerical', subtitle: 'Exact number value', icon: Hash },
];

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
  isSaving = false,
}) => {
  const [activeLang, setActiveLang] = useState<'en' | 'hi'>('en');
  const [promptEn, setPromptEn] = useState('');
  const [promptHi, setPromptHi] = useState('');
  const [type, setType] = useState<QuestionAnswerType>('single_choice');
  const [marks, setMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [maxLength, setMaxLength] = useState(150);
  const [placeholder, setPlaceholder] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
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
    if (!isOpen) return;

    if (initialQuestion) {
      setPromptEn(initialQuestion.prompt || '');
      setPromptHi(initialQuestion.promptHindi || '');
      setType(initialQuestion.type || 'single_choice');
      setMarks(initialQuestion.marks ?? 4);
      setNegativeMarks(initialQuestion.negativeMarks ?? 0);
      setMaxLength(
        initialQuestion.maxLength ?? (initialQuestion.type === 'long_text' ? 500 : 150)
      );
      setPlaceholder(initialQuestion.placeholder || '');
      setExpectedAnswer(initialQuestion.expectedAnswer || '');
      setExplanationEn(initialQuestion.explanation || '');
      setExplanationHi(initialQuestion.explanationHindi || '');

      if (initialQuestion.options && initialQuestion.options.length > 0) {
        setOptions(
          initialQuestion.options.map((opt) => ({
            id: opt.id,
            textEn: opt.text,
            textHi: opt.textHindi || '',
          }))
        );
      } else {
        setOptions([
          { id: 'opt_1', textEn: '', textHi: '' },
          { id: 'opt_2', textEn: '', textHi: '' },
          { id: 'opt_3', textEn: '', textHi: '' },
          { id: 'opt_4', textEn: '', textHi: '' },
        ]);
      }
      setCorrectOptionIds(
        initialQuestion.correctOptionIds?.length ? initialQuestion.correctOptionIds : ['opt_1']
      );
    } else {
      setPromptEn('');
      setPromptHi('');
      setType('single_choice');
      setMarks(4);
      setNegativeMarks(1);
      setMaxLength(150);
      setPlaceholder('');
      setExpectedAnswer('');
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
    setActiveLang('en');
    setError(null);
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const handleSelectType = (nextType: QuestionAnswerType) => {
    setType(nextType);
    setError(null);
    if (nextType === 'true_false') {
      setCorrectOptionIds(['true']);
      setNegativeMarks(0);
    } else if (nextType === 'short_text') {
      setMaxLength(150);
      setNegativeMarks(0);
    } else if (nextType === 'long_text') {
      setMaxLength(600);
      setNegativeMarks(0);
    } else if (nextType === 'numeric') {
      setNegativeMarks(0);
    } else if (nextType === 'single_choice') {
      setCorrectOptionIds((prev) => [prev[0] || options[0]?.id || 'opt_1']);
    }
  };

  const handleToggleCorrect = (optId: string) => {
    if (type === 'single_choice' || type === 'true_false') {
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
        return activeLang === 'en' ? { ...opt, textEn: val } : { ...opt, textHi: val };
      })
    );
  };

  const handleAddOption = () => {
    if (options.length >= 8) return;
    const nextId = `opt_${Date.now()}_${options.length + 1}`;
    setOptions((prev) => [...prev, { id: nextId, textEn: '', textHi: '' }]);
  };

  const handleRemoveOption = (optId: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.id !== optId));
    setCorrectOptionIds((prev) => prev.filter((id) => id !== optId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!promptEn.trim()) {
      setError('Question prompt in English is required.');
      return;
    }

    let finalOptions: Array<{ id: string; text: string; textHindi?: string }> = [];
    let finalCorrectIds: string[] = [];

    if (type === 'single_choice' || type === 'multiple_choice') {
      const filled = options.filter((o) => o.textEn.trim().length > 0);
      if (filled.length < 2) {
        setError('Please fill at least 2 answer options.');
        return;
      }
      finalOptions = filled.map((o) => ({
        id: o.id,
        text: o.textEn.trim(),
        textHindi: o.textHi.trim() || undefined,
      }));
      finalCorrectIds = correctOptionIds.filter((id) => filled.some((o) => o.id === id));
      if (finalCorrectIds.length === 0) {
        setError('Please mark at least one correct option.');
        return;
      }
    } else if (type === 'true_false') {
      finalOptions = [
        { id: 'true', text: 'True', textHindi: 'सत्य (True)' },
        { id: 'false', text: 'False', textHindi: 'असत्य (False)' },
      ];
      finalCorrectIds = correctOptionIds.includes('false') ? ['false'] : ['true'];
    } else if (type === 'short_text' || type === 'long_text') {
      if (!Number.isFinite(maxLength) || maxLength < 10 || maxLength > 10000) {
        setError('Character limit must be between 10 and 10,000 characters.');
        return;
      }
    } else if (type === 'numeric') {
      if (expectedAnswer.trim() === '' || Number.isNaN(Number(expectedAnswer))) {
        setError('Please enter a valid numeric correct answer.');
        return;
      }
    }

    const question: StudioQuestion = {
      id: initialQuestion?.id || `q_${Date.now()}`,
      unitId: initialQuestion?.unitId || 'u_general',
      tenantId: 'tenant_cuet_01',
      tenantSlug: 'cuet-humanities',
      type,
      prompt: promptEn.trim(),
      promptHindi: promptHi.trim() || undefined,
      options: finalOptions,
      correctOptionIds: finalCorrectIds,
      maxLength: type === 'short_text' || type === 'long_text' ? Number(maxLength) : undefined,
      placeholder:
        type === 'short_text' || type === 'long_text' || type === 'numeric'
          ? placeholder.trim() ||
            (type === 'numeric'
              ? 'Enter numeric value...'
              : `Type your answer (max ${maxLength} characters)...`)
          : undefined,
      expectedAnswer:
        type === 'short_text' || type === 'long_text' || type === 'numeric'
          ? expectedAnswer.trim() || undefined
          : undefined,
      marks: Number(marks) || 4,
      negativeMarks: Math.max(0, Number(negativeMarks) || 0),
      explanation: explanationEn.trim() || undefined,
      explanationHindi: explanationHi.trim() || undefined,
    };

    onSave(question);
  };

  const charPresets = type === 'long_text' ? [300, 500, 1000, 2000] : [50, 100, 150, 250];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      data-testid="question-side-drawer"
      className="fixed inset-0 z-[100] flex justify-end !mt-0"
    >
      {/* Subtle Backdrop */}
      <div
        className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Right-Hand SAFS-04 Slide-Over Side-Menu Form */}
      <div className="relative z-10 w-full max-w-xl bg-white h-[100dvh] border-l border-[#e2e8f0] shadow-2xl flex flex-col">
        {/* Sticky Drawer Header */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between gap-4 bg-white shrink-0">
          <div>
            <h2
              className="text-lg font-bold text-[#0f172a] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {initialQuestion?.id ? 'Edit Question' : 'Create New Question'}
            </h2>
            <p className="text-xs text-[#64748b]">
              Choose any answer type — students can take this live on your portal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Bilingual Toggle */}
            <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-lg border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setActiveLang('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  activeLang === 'en'
                    ? 'bg-white text-[#2563eb] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('hi')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  activeLang === 'hi'
                    ? 'bg-white text-[#2563eb] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                हिन्दी
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Workspace */}
        <form
          id="cbt-side-drawer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
        >
          {error && (
            <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] flex items-center gap-2 text-xs text-[#b91c1c] font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Answer Type Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Answer Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ANSWER_TYPES.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    data-testid={`answer-type-${item.type}`}
                    onClick={() => handleSelectType(item.type)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff] ring-1 ring-[#2563eb]/20'
                        : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? 'text-[#2563eb]' : 'text-[#64748b]'
                        }`}
                      />
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#2563eb]" />}
                    </div>
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isSelected ? 'text-[#1d4ed8]' : 'text-[#0f172a]'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">{item.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Question Prompt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              {activeLang === 'en' ? 'Question Prompt (English) *' : 'प्रश्न (हिन्दी - वैकल्पिक)'}
            </label>
            <textarea
              rows={3}
              required={activeLang === 'en'}
              value={activeLang === 'en' ? promptEn : promptHi}
              onChange={(e) =>
                activeLang === 'en' ? setPromptEn(e.target.value) : setPromptHi(e.target.value)
              }
              placeholder={
                activeLang === 'en'
                  ? 'Write your question clearly here...'
                  : 'यहाँ प्रश्न हिन्दी में लिखें...'
              }
              className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition"
            />
          </div>

          {/* 3. Dynamic Answer Configuration Section */}
          {(type === 'single_choice' || type === 'multiple_choice') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#334155]">
                  {type === 'single_choice'
                    ? 'Radio Options (Select 1 Correct Answer)'
                    : 'Checkbox Options (Select All Correct Answers)'}
                </label>
                {options.length < 8 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Option</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => {
                  const isCorrect = correctOptionIds.includes(opt.id);
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition ${
                        isCorrect
                          ? 'bg-[#ecfdf5]/70 border-[#10b981]'
                          : 'bg-white border-[#e2e8f0]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleCorrect(opt.id)}
                        title="Mark as correct answer"
                        className={`w-6 h-6 shrink-0 flex items-center justify-center border transition ${
                          type === 'single_choice' ? 'rounded-full' : 'rounded-md'
                        } ${
                          isCorrect
                            ? 'bg-[#10b981] border-[#10b981] text-white'
                            : 'bg-white border-[#cbd5e1] text-[#64748b] hover:border-[#2563eb]'
                        }`}
                      >
                        {isCorrect ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[11px] font-bold">{letter}</span>
                        )}
                      </button>

                      <input
                        type="text"
                        value={activeLang === 'en' ? opt.textEn : opt.textHi}
                        onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                        placeholder={`Option ${letter} (${activeLang.toUpperCase()})`}
                        className="flex-1 min-w-0 text-sm text-[#0f172a] bg-transparent border-0 focus:outline-none placeholder:text-[#94a3b8]"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          aria-label={`Remove option ${letter}`}
                          className="p-1 text-[#94a3b8] hover:text-[#dc2626] rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(type === 'short_text' || type === 'long_text') && (
            <div className="space-y-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="char-limit-input"
                    className="text-xs font-semibold text-[#334155]"
                  >
                    Character Limit (Max Characters)
                  </label>
                  <div className="flex items-center gap-1">
                    {charPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setMaxLength(preset)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition ${
                          maxLength === preset
                            ? 'bg-[#2563eb] text-white border-[#2563eb]'
                            : 'bg-white text-[#475569] border-[#cbd5e1] hover:border-[#2563eb]'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="char-limit-input"
                  type="number"
                  min={10}
                  max={10000}
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Input Placeholder Text (Optional)
                </label>
                <input
                  type="text"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder={`Type your answer (max ${maxLength} characters)...`}
                  className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Expected Answer / Reference Key (Optional)
                </label>
                <input
                  type="text"
                  value={expectedAnswer}
                  onChange={(e) => setExpectedAnswer(e.target.value)}
                  placeholder={
                    type === 'short_text'
                      ? 'Leave blank for manual grading, or enter exact answer for auto-grading'
                      : 'Enter key phrase or model answer for auto-checking'
                  }
                  className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>

              {/* Live Student Input Preview */}
              <div className="pt-2 border-t border-[#e2e8f0] space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                  Student Answer Box Preview
                </span>
                {type === 'short_text' ? (
                  <input
                    type="text"
                    disabled
                    placeholder={placeholder || `Type your answer (max ${maxLength} characters)...`}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#cbd5e1] rounded-lg text-[#94a3b8]"
                  />
                ) : (
                  <textarea
                    rows={3}
                    disabled
                    placeholder={placeholder || `Write your response (max ${maxLength} characters)...`}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#cbd5e1] rounded-lg text-[#94a3b8] resize-none"
                  />
                )}
                <div className="text-right text-[11px] font-mono text-[#64748b]">
                  0 / {maxLength} characters
                </div>
              </div>
            </div>
          )}

          {type === 'true_false' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#334155]">
                Select Correct Answer
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['true', 'false'] as const).map((val) => {
                  const selected = correctOptionIds.includes(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleToggleCorrect(val)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold capitalize flex items-center justify-center gap-2 transition ${
                        selected
                          ? 'bg-[#ecfdf5] border-[#10b981] text-[#047857]'
                          : 'bg-white border-[#e2e8f0] text-[#334155] hover:bg-[#f8fafc]'
                      }`}
                    >
                      {selected && <Check className="w-4 h-4 text-[#10b981]" />}
                      <span>{val}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {type === 'numeric' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Correct Numeric Value *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={expectedAnswer}
                  onChange={(e) => setExpectedAnswer(e.target.value)}
                  placeholder="e.g. 9.8 or 42"
                  className="w-full px-3 py-2 text-sm font-mono text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Placeholder / Unit
                </label>
                <input
                  type="text"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="e.g. Enter value in km"
                  className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>
            </div>
          )}

          {/* 4. Marking Scheme */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#334155]">Marks (+)</label>
              <input
                type="number"
                min={1}
                step={0.5}
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#334155]">
                Negative Marks (-)
              </label>
              <input
                type="number"
                min={0}
                step={0.25}
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
              />
            </div>
          </div>

          {/* 5. Solution / Explanation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              Solution / Explanation (Shown after test submission)
            </label>
            <textarea
              rows={2}
              value={activeLang === 'en' ? explanationEn : explanationHi}
              onChange={(e) =>
                activeLang === 'en'
                  ? setExplanationEn(e.target.value)
                  : setExplanationHi(e.target.value)
              }
              placeholder="Briefly explain the correct answer..."
              className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
            />
          </div>
        </form>

        {/* Sticky Drawer Footer */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#334155] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="cbt-side-drawer-form"
            disabled={isSaving}
            data-testid="save-question-btn"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors disabled:opacity-60"
          >
            {isSaving
              ? 'Saving...'
              : initialQuestion?.id
                ? 'Update Question'
                : 'Save Question'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
