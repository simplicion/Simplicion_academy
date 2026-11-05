'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@simplicion/ui';
import {
  BookOpen,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  IndianRupee,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { BatchEditorModal, BatchFormData } from '../../components/batches/BatchEditorModal';

const INITIAL_BATCHES: BatchFormData[] = [
  {
    id: 'cuet-humanities-foundation-2027',
    title: 'CUET 2027: Humanities Foundation Batch',
    slug: 'cuet-humanities-foundation-2027',
    targetExam: 'CUET UG 2027',
    description: 'Comprehensive 1-year coaching for History, Pol Sci, Geography, and Economics.',
    mrp: 9999,
    sellingPrice: 4999,
    validityDays: 365,
    maxCapacity: 1000,
    status: 'active',
  },
  {
    id: 'cuet-history-domain-crash',
    title: 'CUET History Domain Intensive Crash Course',
    slug: 'cuet-history-domain-crash',
    targetExam: 'CUET UG 2026',
    description: 'High-yield revision and 500+ NCERT MCQ practice for CUET History domain.',
    mrp: 3999,
    sellingPrice: 1999,
    validityDays: 90,
    maxCapacity: 500,
    status: 'active',
  },
  {
    id: 'political-science-ncert-mastery',
    title: 'Political Science Class 12 NCERT Mastery',
    slug: 'political-science-ncert-mastery',
    targetExam: 'Board + CUET 2027',
    description: 'Line-by-line NCERT breakdown with mind maps and weekly subjective tests.',
    mrp: 1499,
    sellingPrice: 0,
    validityDays: 180,
    maxCapacity: 200,
    status: 'active',
  },
];

export default function BatchesManagerPage() {
  const [batches, setBatches] = useState<BatchFormData[]>(INITIAL_BATCHES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchFormData | null>(null);
  const [search, setSearch] = useState('');

  const handleOpenCreate = () => {
    setEditingBatch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (batch: BatchFormData) => {
    setEditingBatch(batch);
    setIsModalOpen(true);
  };

  const handleSaveBatch = (data: BatchFormData) => {
    if (data.id) {
      setBatches((prev) => prev.map((b) => (b.id === data.id ? data : b)));
    } else {
      const newBatch: BatchFormData = {
        ...data,
        id: `batch-${Date.now()}`,
      };
      setBatches((prev) => [newBatch, ...prev]);
    }
  };

  const handleDeleteBatch = (id?: string) => {
    if (!id || !confirm('Are you sure you want to delete this batch?')) return;
    setBatches((prev) => prev.filter((b) => b.id !== id));
  };

  const filtered = batches.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.targetExam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Batches & Courses Manager</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create academic offerings, customize pricing, and manage structured curriculum trees.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 text-xs font-bold">
          <Plus className="w-4 h-4" />
          <span>New Batch Offering</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batches by title or exam..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {batches.length} Batches
        </span>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((batch) => {
          const discount =
            batch.mrp > 0 && batch.sellingPrice < batch.mrp
              ? Math.round(((batch.mrp - batch.sellingPrice) / batch.mrp) * 100)
              : 0;

          return (
            <Card key={batch.id} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm" className="text-[10px]">
                    {batch.targetExam}
                  </Badge>
                  {batch.status === 'active' ? (
                    <Badge variant="success" size="sm">Active</Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">Draft</Badge>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{batch.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {batch.description}
                </p>

                {/* Key Metrics */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pricing</span>
                    <span className="font-bold text-slate-900">
                      {batch.sellingPrice === 0 ? 'Free' : `₹ ${batch.sellingPrice}`}
                    </span>
                    {discount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold ml-1.5">
                        {discount}% off
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Validity</span>
                    <span className="font-semibold text-slate-700">{batch.validityDays} Days</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link href={`/batches/${batch.id}/curriculum`}>
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs py-1.5 px-3">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Curriculum</span>
                  </Button>
                </Link>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(batch)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                    title="Edit Batch Info"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBatch(batch.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Batch Editor Modal */}
      <BatchEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBatch}
        initialData={editingBatch}
      />
    </div>
  );
}

