'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@simplicion/ui';
import {
  FileCheck2,
  Plus,
  Upload,
  Search,
  CheckCircle,
  HelpCircle,
  Edit2,
  Trash2,
  Languages,
} from 'lucide-react';
import { Question } from '@simplicion/assessment';
import { QuestionEditorModal } from '../../components/cbt/QuestionEditorModal';
import { BulkImporterModal } from '../../components/cbt/BulkImporterModal';

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q_1',
    unitId: 'u_harappa',
    tenantId: 'tenant_cuet',
    type: 'single_choice',
    prompt: 'Which of the following Harappan sites is renowned for sophisticated water reservoirs and stepwells?',
    promptHindi: 'निम्नलिखित में से कौन सा हड़प्पा स्थल उन्नत जल जलाशयों और सीढ़ीदार कुओं के लिए प्रसिद्ध है?',
    options: [
      { id: 'opt_1', text: 'Dholavira', textHindi: 'धोलावीरा' },
      { id: 'opt_2', text: 'Kalibangan', textHindi: 'कालीबंगा' },
      { id: 'opt_3', text: 'Lothal', textHindi: 'लोथल' },
      { id: 'opt_4', text: 'Banawali', textHindi: 'बनावली' },
    ],
    correctOptionIds: ['opt_1'],
    marks: 4,
    negativeMarks: 1,
    explanation: 'Dholavira in the Rann of Kutch (Gujarat) possessed unique stone-cut water reservoirs.',
  },
  {
    id: 'q_2',
    unitId: 'u_maurya',
    tenantId: 'tenant_cuet',
    type: 'single_choice',
    prompt: 'Who deciphered the Brahmi and Kharosthi scripts used in earliest Ashokan inscriptions in 1838?',
    promptHindi: '1838 में अशोक के प्राचीनतम अभिलेखों में प्रयुक्त ब्राह्मी और खरोष्ठी लिपियों को किसने पढ़ा था?',
    options: [
      { id: 'opt_1', text: 'James Prinsep', textHindi: 'जेम्स प्रिंसेप' },
      { id: 'opt_2', text: 'Alexander Cunningham', textHindi: 'अलेक्जेंडर कनिंघम' },
      { id: 'opt_3', text: 'Sir John Marshall', textHindi: 'सर जॉन मार्शल' },
      { id: 'opt_4', text: 'Mortimer Wheeler', textHindi: 'मोर्टिमर व्हीलर' },
    ],
    correctOptionIds: ['opt_1'],
    marks: 4,
    negativeMarks: 1,
    explanation: 'James Prinsep, an officer in the mint of the East India Company, deciphered Brahmi in 1838.',
  },
  {
    id: 'q_3',
    unitId: 'u_polsci',
    tenantId: 'tenant_cuet',
    type: 'single_choice',
    prompt: 'Which leader played the historic role of the "Iron Man of India" in integrating 565 princely states?',
    promptHindi: '565 रियासतों के एकीकरण में किस नेता ने "भारत के लौह पुरुष" की ऐतिहासिक भूमिका निभाई?',
    options: [
      { id: 'opt_1', text: 'Sardar Vallabhbhai Patel', textHindi: 'सरदार वल्लभभाई पटेल' },
      { id: 'opt_2', text: 'Jawaharlal Nehru', textHindi: 'जवाहरलाल नेहरू' },
      { id: 'opt_3', text: 'Dr. B.R. Ambedkar', textHindi: 'डॉ. बी.आर. अम्बेडकर' },
      { id: 'opt_4', text: 'C. Rajagopalachari', textHindi: 'सी. राजगोपालाचारी' },
    ],
    correctOptionIds: ['opt_1'],
    marks: 4,
    negativeMarks: 1,
    explanation: 'Sardar Vallabhbhai Patel served as the First Home Minister and unified the princely states.',
  },
];

export default function CbtQuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [search, setSearch] = useState('');

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = (q: Question) => {
    if (editingQuestion) {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)));
    } else {
      setQuestions((prev) => [q, ...prev]);
    }
  };

  const handleBulkImport = (newQuestions: Question[]) => {
    setQuestions((prev) => [...newQuestions, ...prev]);
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm('Are you sure you want to remove this question from the bank?')) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const filtered = questions.filter(
    (q) =>
      q.prompt.toLowerCase().includes(search.toLowerCase()) ||
      (q.promptHindi && q.promptHindi.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">CBT Question Bank Studio</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create bilingual NTA CUET questions, set +4/-1 marking rules, and assemble timed mock test papers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImporterOpen(true)}
            className="gap-1.5 text-xs font-bold"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import (CSV/JSON)</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>New Question</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by text or keyword..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} of {questions.length} Questions
        </span>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.map((q, idx) => (
          <Card key={q.id} className="p-4 hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 leading-snug">{q.prompt}</p>
                  {q.promptHindi && (
                    <p className="text-[11px] text-slate-600 font-medium">{q.promptHindi}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <Badge variant="outline" size="sm" className="text-[10px]">
                  +{q.marks} / -{q.negativeMarks}
                </Badge>
                {q.promptHindi && (
                  <Badge variant="secondary" size="sm" className="text-[10px] gap-0.5">
                    <Languages className="w-3 h-3" />
                    <span>Bilingual</span>
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(q)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                  title="Edit Question"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete Question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
              {q.options.map((opt, optIdx) => {
                const isCorrect = q.correctOptionIds.includes(opt.id);
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <div
                    key={opt.id}
                    className={`p-2 rounded-lg text-xs flex items-center space-x-2 border ${
                      isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-slate-50/50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="truncate">{opt.text}</span>
                    {isCorrect && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation footer */}
            {q.explanation && (
              <div className="ml-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                <span className="font-bold text-slate-800">Explanation: </span>
                <span>{q.explanation}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Question Editor Modal */}
      <QuestionEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
      />

      {/* Bulk Importer Modal */}
      <BulkImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
}

