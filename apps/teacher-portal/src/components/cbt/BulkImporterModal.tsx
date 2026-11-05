'use client';

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@simplicion/ui';
import { Upload, FileCode, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Question } from '@simplicion/assessment';

export interface ParsedQuestionRow {
  rowNumber: number;
  question?: Question;
  rawPrompt: string;
  isValid: boolean;
  error?: string;
}

export interface BulkImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (validQuestions: Question[]) => void;
}

export function parseBulkQuestionInput(rawText: string): ParsedQuestionRow[] {
  const rows: ParsedQuestionRow[] = [];
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  // 1. Try parsing as JSON array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const items = JSON.parse(trimmed);
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          const rowNum = index + 1;
          if (!item.prompt || typeof item.prompt !== 'string' || !item.prompt.trim()) {
            rows.push({
              rowNumber: rowNum,
              rawPrompt: item.prompt || `Item ${rowNum}`,
              isValid: false,
              error: 'Missing question prompt',
            });
            return;
          }

          if (!Array.isArray(item.options) || item.options.length < 2) {
            rows.push({
              rowNumber: rowNum,
              rawPrompt: item.prompt,
              isValid: false,
              error: 'Must contain at least 2 options',
            });
            return;
          }

          if (!Array.isArray(item.correctOptionIds) || item.correctOptionIds.length === 0) {
            rows.push({
              rowNumber: rowNum,
              rawPrompt: item.prompt,
              isValid: false,
              error: 'No correct option specified',
            });
            return;
          }

          const q: Question = {
            id: item.id || `q_bulk_${Date.now()}_${index}`,
            unitId: item.unitId || 'u_general',
            tenantId: 'tenant_cuet',
            type: item.type === 'multiple_choice' ? 'multiple_choice' : 'single_choice',
            prompt: item.prompt.trim(),
            promptHindi: item.promptHindi,
            options: item.options.map((opt: any, optIdx: number) => ({
              id: opt.id || `opt_${optIdx + 1}`,
              text: opt.text || String(opt),
              textHindi: opt.textHindi,
            })),
            correctOptionIds: item.correctOptionIds,
            marks: item.marks || 4,
            negativeMarks: item.negativeMarks ?? 1,
            explanation: item.explanation,
            explanationHindi: item.explanationHindi,
          };

          rows.push({
            rowNumber: rowNum,
            question: q,
            rawPrompt: q.prompt,
            isValid: true,
          });
        });
        return rows;
      }
    } catch (e: any) {
      // Continue to CSV fallback
    }
  }

  // 2. CSV parsing fallback:
  // Format: Prompt,OptionA,OptionB,OptionC,OptionD,CorrectOptionIndex(1-4),Marks,NegativeMarks
  const lines = trimmed.split('\n');
  lines.forEach((line, index) => {
    const rowNum = index + 1;
    if (!line.trim() || line.startsWith('#') || line.toLowerCase().startsWith('prompt,')) return;

    const parts = line.split(',').map((p) => p.trim());
    if (parts.length < 6) {
      rows.push({
        rowNumber: rowNum,
        rawPrompt: parts[0] || `Line ${rowNum}`,
        isValid: false,
        error: 'Incomplete CSV line: expected prompt, 4 options, and correct index (1-4)',
      });
      return;
    }

    const [prompt, optA, optB, optC, optD, correctIdxStr, marksStr, negMarksStr] = parts;
    const correctIdx = parseInt(correctIdxStr, 10);
    if (isNaN(correctIdx) || correctIdx < 1 || correctIdx > 4) {
      rows.push({
        rowNumber: rowNum,
        rawPrompt: prompt,
        isValid: false,
        error: `Invalid correct option index: "${correctIdxStr}". Must be 1, 2, 3, or 4`,
      });
      return;
    }

    const options = [
      { id: 'opt_1', text: optA },
      { id: 'opt_2', text: optB },
      { id: 'opt_3', text: optC || 'N/A' },
      { id: 'opt_4', text: optD || 'N/A' },
    ];

    const q: Question = {
      id: `q_bulk_${Date.now()}_${index}`,
      unitId: 'u_general',
      tenantId: 'tenant_cuet',
      type: 'single_choice',
      prompt,
      options,
      correctOptionIds: [`opt_${correctIdx}`],
      marks: parseInt(marksStr, 10) || 4,
      negativeMarks: parseInt(negMarksStr, 10) || 1,
    };

    rows.push({
      rowNumber: rowNum,
      question: q,
      rawPrompt: prompt,
      isValid: true,
    });
  });

  return rows;
}

export const BulkImporterModal: React.FC<BulkImporterModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [inputText, setInputText] = useState('');
  const [previewRows, setPreviewRows] = useState<ParsedQuestionRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  const handleParse = () => {
    const parsed = parseBulkQuestionInput(inputText);
    setPreviewRows(parsed);
    setHasParsed(true);
  };

  const validRows = previewRows.filter((r) => r.isValid && r.question);
  const invalidRows = previewRows.filter((r) => !r.isValid);

  const handleConfirmImport = () => {
    const validQuestions = validRows.map((r) => r.question!);
    onImport(validQuestions);
    onClose();
  };

  const sampleJson = `[
  {
    "prompt": "Which ruler inscribed the Junagadh rock inscription?",
    "options": [
      { "id": "opt_1", "text": "Rudradaman I" },
      { "id": "opt_2", "text": "Ashoka" },
      { "id": "opt_3", "text": "Chandragupta Maurya" },
      { "id": "opt_4", "text": "Samudragupta" }
    ],
    "correctOptionIds": ["opt_1"],
    "marks": 4,
    "negativeMarks": 1
  }
]`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import CBT Questions">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Paste JSON or CSV Questions
            </label>
            <button
              type="button"
              onClick={() => setInputText(sampleJson)}
              className="text-[10px] text-blue-600 hover:underline font-bold flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Sample JSON</span>
            </button>
          </div>

          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setHasParsed(false);
            }}
            placeholder="Paste JSON array or CSV lines:&#10;Prompt,OptionA,OptionB,OptionC,OptionD,CorrectIndex(1-4),Marks,NegMarks"
            className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleParse}
            disabled={!inputText.trim()}
            className="text-xs gap-1"
          >
            <span>Parse & Validate Data</span>
          </Button>
        </div>

        {/* Validation Summary & Preview Table */}
        {hasParsed && (
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-bold text-slate-800">Validation Results:</span>
              <Badge variant="success" size="sm">
                {validRows.length} Valid
              </Badge>
              {invalidRows.length > 0 && (
                <Badge variant="danger" size="sm">
                  {invalidRows.length} Errors
                </Badge>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Prompt</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewRows.map((row) => (
                    <tr key={row.rowNumber} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-500">{row.rowNumber}</td>
                      <td className="py-2 px-3 font-medium text-slate-800 truncate max-w-xs">
                        {row.rawPrompt}
                      </td>
                      <td className="py-2 px-3">
                        {row.isValid ? (
                          <span className="text-emerald-700 font-bold flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span>Invalid</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {row.isValid
                          ? `${row.question?.options.length} Options (+${row.question?.marks}/-${row.question?.negativeMarks})`
                          : row.error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmImport}
            disabled={validRows.length === 0}
            className="text-xs font-bold"
          >
            Import {validRows.length} Questions
          </Button>
        </div>
      </div>
    </Modal>
  );
};

