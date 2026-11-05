'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from '@simplicion/ui';
import {
  MessageCircleQuestion,
  CheckCircle2,
  Clock,
  Search,
  Send,
  HelpCircle,
  Sparkles,
  User,
} from 'lucide-react';

export interface DoubtItem {
  id: string;
  studentName: string;
  studentPhone: string;
  batchName: string;
  unitTitle: string;
  question: string;
  submittedAt: string;
  status: 'pending' | 'answered';
  answer?: string;
  answeredAt?: string;
}

const INITIAL_DOUBTS: DoubtItem[] = [
  {
    id: 'd1',
    studentName: 'Aarav Sharma',
    studentPhone: '+91 98765 43210',
    batchName: 'CUET 2027: Humanities Foundation Batch',
    unitTitle: 'Unit 1: Bricks, Beads and Bones',
    question:
      'Sir, what is the exact difference between Citadels and Lower Towns in Harappa? Were they segregated for religious or administrative reasons?',
    submittedAt: '15 mins ago',
    status: 'pending',
  },
  {
    id: 'd2',
    studentName: 'Sneha Mukherjee',
    studentPhone: '+91 91234 56789',
    batchName: 'CUET History Domain Intensive Crash Course',
    unitTitle: 'Unit 2: Kings, Farmers and Towns',
    question:
      'In Major Rock Edict XIII, which regions are mentioned as receiving Ashoka’s humanitarian missions outside India?',
    submittedAt: '1 hour ago',
    status: 'pending',
  },
  {
    id: 'd3',
    studentName: 'Vikas Rao',
    studentPhone: '+91 94567 89012',
    batchName: 'CUET 2027: Humanities Foundation Batch',
    unitTitle: 'Unit 2: Kings, Farmers and Towns',
    question:
      'Is Kautilya’s Arthashastra primarily focused on domestic statecraft or foreign military conquest?',
    submittedAt: '3 hours ago',
    status: 'answered',
    answer:
      'Kautilya’s Arthashastra covers both internal administration (treasury, taxation, civil law) and the Mandala theory of foreign relations and alliance-building.',
    answeredAt: '2 hours ago',
  },
];

export default function DoubtsQueuePage() {
  const [doubts, setDoubts] = useState<DoubtItem[]>(INITIAL_DOUBTS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'answered'>('all');
  const [search, setSearch] = useState('');

  // Active reply state
  const [replyingDoubt, setReplyingDoubt] = useState<DoubtItem | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleOpenReply = (doubt: DoubtItem) => {
    setReplyingDoubt(doubt);
    setReplyText(doubt.answer || '');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingDoubt || !replyText.trim()) return;

    setDoubts((prev) =>
      prev.map((d) =>
        d.id === replyingDoubt.id
          ? {
              ...d,
              status: 'answered',
              answer: replyText.trim(),
              answeredAt: 'Just now',
            }
          : d
      )
    );
    setReplyingDoubt(null);
  };

  const filtered = doubts.filter((d) => {
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesSearch =
      d.studentName.toLowerCase().includes(search.toLowerCase()) ||
      d.question.toLowerCase().includes(search.toLowerCase()) ||
      d.unitTitle.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = doubts.filter((d) => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Doubts Queue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Answer student questions from lectures, notes, and CBT mock tests.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant={pendingCount > 0 ? 'warning' : 'success'} size="md">
            {pendingCount} Pending Resolution
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          {(['all', 'pending', 'answered'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded text-xs font-bold capitalize transition ${
                filterStatus === status ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doubts by student or keyword..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {filtered.map((doubt) => (
          <Card key={doubt.id} className="p-5 hover:border-slate-300 transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{doubt.studentName}</h4>
                  <p className="text-[10px] text-slate-400">
                    {doubt.batchName} • <span className="font-semibold text-slate-600">{doubt.unitTitle}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{doubt.submittedAt}</span>
                </span>
                {doubt.status === 'pending' ? (
                  <Badge variant="warning" size="sm">
                    Pending
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    Answered
                  </Badge>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="pl-11">
              <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                "{doubt.question}"
              </p>

              {/* Answer display if present */}
              {doubt.answer && (
                <div className="mt-2.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between font-bold text-[11px] text-emerald-800">
                    <span className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Educator Response:</span>
                    </span>
                    <span className="text-[10px] font-normal text-emerald-600">{doubt.answeredAt}</span>
                  </div>
                  <p className="leading-relaxed">{doubt.answer}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-3 flex justify-end">
                <Button
                  variant={doubt.status === 'pending' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleOpenReply(doubt)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{doubt.status === 'pending' ? 'Reply to Student' : 'Edit Response'}</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={Boolean(replyingDoubt)}
        onClose={() => setReplyingDoubt(null)}
        title={`Respond to ${replyingDoubt?.studentName}`}
      >
        <form onSubmit={handleSendReply} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
            <span className="font-bold block mb-1">Student's Doubt:</span>
            <p className="italic">"{replyingDoubt?.question}"</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Your Explanation *</label>
            <textarea
              required
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Provide a thorough, encouraging answer citing historical sources or NCERT themes..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setReplyingDoubt(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="gap-1 font-bold">
              <Send className="w-3.5 h-3.5" />
              <span>Send Solution</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

