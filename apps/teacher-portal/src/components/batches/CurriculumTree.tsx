'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from '@simplicion/ui';
import {
  Folder,
  FolderPlus,
  Video,
  FileText,
  FileCheck2,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  Layers,
} from 'lucide-react';

export interface ContentItem {
  id: string;
  type: 'video' | 'notes' | 'cbt';
  title: string;
  durationOrPages?: string;
  url?: string;
  allowDownload?: boolean;
}

export interface UnitNode {
  id: string;
  title: string;
  order: number;
  items: ContentItem[];
}

export interface SubjectNode {
  id: string;
  title: string;
  units: UnitNode[];
}

export interface CurriculumTreeProps {
  batchTitle: string;
  initialSubjects?: SubjectNode[];
  onSave?: (subjects: SubjectNode[]) => void;
}

export const CurriculumTree: React.FC<CurriculumTreeProps> = ({
  batchTitle,
  initialSubjects = [
    {
      id: 'sub-history',
      title: 'History: Themes in Indian History',
      units: [
        {
          id: 'u-1',
          title: 'Unit 1: Bricks, Beads and Bones - The Harappan Civilisation',
          order: 1,
          items: [
            {
              id: 'c-1',
              type: 'video',
              title: 'Harappan Settlement & Urban Planning Masterclass',
              durationOrPages: '48 mins',
            },
            {
              id: 'c-2',
              type: 'notes',
              title: 'NCERT Chapter 1 High-Yield Notes (Watermarked)',
              durationOrPages: '18 pages',
              allowDownload: false,
            },
            {
              id: 'c-3',
              type: 'cbt',
              title: 'CUET 2027 Mock 1: Harappan Civilisation',
              durationOrPages: '45 mins • 50 Questions',
            },
          ],
        },
        {
          id: 'u-2',
          title: 'Unit 2: Kings, Farmers and Towns - Early States and Economies',
          order: 2,
          items: [
            {
              id: 'c-4',
              type: 'video',
              title: 'The Mauryan Empire & Ashokan Inscriptions',
              durationOrPages: '52 mins',
            },
            {
              id: 'c-5',
              type: 'notes',
              title: 'Epigraphy & Numismatics Summary Notes',
              durationOrPages: '14 pages',
              allowDownload: false,
            },
          ],
        },
      ],
    },
    {
      id: 'sub-polsci',
      title: 'Political Science: Politics in India Since Independence',
      units: [
        {
          id: 'u-3',
          title: 'Unit 1: Challenges of Nation Building',
          order: 1,
          items: [
            {
              id: 'c-6',
              type: 'video',
              title: 'Integration of Princely States & Reorganisation',
              durationOrPages: '40 mins',
            },
          ],
        },
      ],
    },
  ],
  onSave,
}) => {
  const [subjects, setSubjects] = useState<SubjectNode[]>(initialSubjects);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'sub-history': true,
    'u-1': true,
    'u-2': true,
    'sub-polsci': true,
    'u-3': true,
  });

  // Modal State for adding content
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState<{ subjectId: string; unitId: string } | null>(
    null
  );
  const [newContentType, setNewContentType] = useState<'video' | 'notes' | 'cbt'>('video');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentMeta, setNewContentMeta] = useState('');

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubject = () => {
    const title = prompt('Enter Subject Name (e.g. Geography: Fundamentals of Human Geography):');
    if (!title || !title.trim()) return;

    const newSub: SubjectNode = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      units: [],
    };
    const next = [...subjects, newSub];
    setSubjects(next);
    setExpanded((prev) => ({ ...prev, [newSub.id]: true }));
    onSave?.(next);
  };

  const handleAddUnit = (subjectId: string) => {
    const title = prompt('Enter Unit / Chapter Title:');
    if (!title || !title.trim()) return;

    const next = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      const newUnit: UnitNode = {
        id: `u-${Date.now()}`,
        title: title.trim(),
        order: sub.units.length + 1,
        items: [],
      };
      setExpanded((prev) => ({ ...prev, [newUnit.id]: true }));
      return { ...sub, units: [...sub.units, newUnit] };
    });
    setSubjects(next);
    onSave?.(next);
  };

  const handleOpenAddContent = (subjectId: string, unitId: string) => {
    setActiveTarget({ subjectId, unitId });
    setNewContentTitle('');
    setNewContentMeta('');
    setIsAddContentOpen(true);
  };

  const handleConfirmAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTarget || !newContentTitle.trim()) return;

    const newItem: ContentItem = {
      id: `item-${Date.now()}`,
      type: newContentType,
      title: newContentTitle.trim(),
      durationOrPages:
        newContentMeta.trim() ||
        (newContentType === 'video' ? '45 mins' : newContentType === 'notes' ? '12 pages' : '50 Qs'),
      allowDownload: false,
    };

    const next = subjects.map((sub) => {
      if (sub.id !== activeTarget.subjectId) return sub;
      return {
        ...sub,
        units: sub.units.map((unit) => {
          if (unit.id !== activeTarget.unitId) return unit;
          return { ...unit, items: [...unit.items, newItem] };
        }),
      };
    });

    setSubjects(next);
    onSave?.(next);
    setIsAddContentOpen(false);
  };

  const handleDeleteItem = (subjectId: string, unitId: string, itemId: string) => {
    if (!confirm('Are you sure you want to remove this content item?')) return;
    const next = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub,
        units: sub.units.map((unit) => {
          if (unit.id !== unitId) return unit;
          return { ...unit, items: unit.items.filter((i) => i.id !== itemId) };
        }),
      };
    });
    setSubjects(next);
    onSave?.(next);
  };

  const handleDeleteUnit = (subjectId: string, unitId: string) => {
    if (!confirm('Are you sure you want to remove this unit and all its content?')) return;
    const next = subjects.map((sub) => {
      if (sub.id !== subjectId) return sub;
      return { ...sub, units: sub.units.filter((u) => u.id !== unitId) };
    });
    setSubjects(next);
    onSave?.(next);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">Curriculum Structure: {batchTitle}</h2>
          <p className="text-xs text-slate-500">
            Organize domain subjects, chapter units, recorded video lessons, watermarked notes, and CBT mocks.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleAddSubject} className="gap-1.5 text-xs font-bold">
          <FolderPlus className="w-4 h-4" />
          <span>Add Subject</span>
        </Button>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const isSubExpanded = expanded[subject.id] ?? true;

          return (
            <Card key={subject.id} className="overflow-hidden border border-slate-200 shadow-sm">
              {/* Subject Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpand(subject.id)}
                  className="flex items-center space-x-2 text-left text-sm font-bold text-slate-900 hover:text-blue-600 transition"
                >
                  {isSubExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>{subject.title}</span>
                  <Badge variant="outline" size="sm" className="ml-2 font-normal text-[10px]">
                    {subject.units.length} Units
                  </Badge>
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddUnit(subject.id)}
                  className="text-xs gap-1 py-1 px-2.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Unit</span>
                </Button>
              </div>

              {/* Units List */}
              {isSubExpanded && (
                <div className="p-4 space-y-4 bg-white">
                  {subject.units.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">No units added yet for this subject.</p>
                      <button
                        type="button"
                        onClick={() => handleAddUnit(subject.id)}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                      >
                        + Create First Unit
                      </button>
                    </div>
                  ) : (
                    subject.units.map((unit) => {
                      const isUnitExpanded = expanded[unit.id] ?? true;

                      return (
                        <div
                          key={unit.id}
                          className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40"
                        >
                          {/* Unit Title Bar */}
                          <div className="p-3 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleExpand(unit.id)}
                              className="flex items-center space-x-2 text-xs font-bold text-slate-800 text-left"
                            >
                              {isUnitExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>{unit.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({unit.items.length} items)
                              </span>
                            </button>

                            <div className="flex items-center space-x-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAddContent(subject.id, unit.id)}
                                className="text-[11px] py-1 px-2 gap-1 bg-white"
                              >
                                <Plus className="w-3 h-3 text-blue-600" />
                                <span>Add Content</span>
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUnit(subject.id, unit.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete Unit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Unit Items List */}
                          {isUnitExpanded && (
                            <div className="p-3 space-y-2 bg-white">
                              {unit.items.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic py-2 px-1">
                                  No video lectures, notes, or CBT tests in this unit yet.
                                </p>
                              ) : (
                                unit.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition"
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      {item.type === 'video' && (
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                          <Video className="w-3.5 h-3.5" />
                                        </div>
                                      )}
                                      {item.type === 'notes' && (
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                          <FileText className="w-3.5 h-3.5" />
                                        </div>
                                      )}
                                      {item.type === 'cbt' && (
                                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                          <FileCheck2 className="w-3.5 h-3.5" />
                                        </div>
                                      )}

                                      <div>
                                        <p className="text-xs font-semibold text-slate-800">
                                          {item.title}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-0.5">
                                          <span className="text-[10px] text-slate-400">
                                            {item.durationOrPages}
                                          </span>
                                          {item.type === 'notes' && !item.allowDownload && (
                                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 rounded">
                                              Watermarked View-Only
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(subject.id, unit.id, item.id)}
                                      className="p-1 text-slate-300 hover:text-red-500 rounded"
                                      title="Delete Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Content Modal */}
      <Modal
        isOpen={isAddContentOpen}
        onClose={() => setIsAddContentOpen(false)}
        title="Add Content Item to Unit"
      >
        <form onSubmit={handleConfirmAddContent} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Content Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNewContentType('video')}
                className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1 transition ${
                  newContentType === 'video'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Class</span>
              </button>
              <button
                type="button"
                onClick={() => setNewContentType('notes')}
                className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1 transition ${
                  newContentType === 'notes'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Notes (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setNewContentType('cbt')}
                className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center space-y-1 transition ${
                  newContentType === 'cbt'
                    ? 'bg-purple-50 border-purple-600 text-purple-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>CBT Mock</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Title *</label>
            <input
              type="text"
              required
              value={newContentTitle}
              onChange={(e) => setNewContentTitle(e.target.value)}
              placeholder={
                newContentType === 'video'
                  ? 'e.g. Megasthenes Indica & Mauryan Administration'
                  : newContentType === 'notes'
                  ? 'e.g. Chapter Revision Notes & Map Pointer'
                  : 'e.g. Daily Practice Test 04'
              }
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              {newContentType === 'video'
                ? 'Duration (e.g. 45 mins)'
                : newContentType === 'notes'
                ? 'Page Count (e.g. 14 pages)'
                : 'Questions / Duration (e.g. 50 Qs • 45 mins)'}
            </label>
            <input
              type="text"
              value={newContentMeta}
              onChange={(e) => setNewContentMeta(e.target.value)}
              placeholder="e.g. 45 mins"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsAddContentOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

