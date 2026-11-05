'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Card, Badge } from '@simplicion/ui';
import { BookOpen, IndianRupee, Calendar, Users, AlertCircle } from 'lucide-react';

export interface BatchFormData {
  id?: string;
  title: string;
  slug: string;
  targetExam: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  validityDays: number;
  maxCapacity: number;
  status: 'active' | 'draft' | 'archived';
}

export interface BatchEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BatchFormData) => void;
  initialData?: BatchFormData | null;
}

export const BatchEditorModal: React.FC<BatchEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<BatchFormData>({
    title: '',
    slug: '',
    targetExam: 'CUET UG 2027',
    description: '',
    mrp: 9999,
    sellingPrice: 4999,
    validityDays: 365,
    maxCapacity: 1000,
    status: 'active',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        slug: '',
        targetExam: 'CUET UG 2027',
        description: '',
        mrp: 9999,
        sellingPrice: 4999,
        validityDays: 365,
        maxCapacity: 1000,
        status: 'active',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.id ? prev.slug : slug,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Batch title is required');
      return;
    }
    if (!formData.slug.trim()) {
      setError('Batch URL slug is required');
      return;
    }
    if (formData.sellingPrice > formData.mrp) {
      setError('Selling price cannot be greater than MRP');
      return;
    }
    if (formData.sellingPrice < 0 || formData.mrp <= 0) {
      setError('Please provide valid pricing');
      return;
    }

    onSave(formData);
    onClose();
  };

  const discountPercent =
    formData.mrp > 0 && formData.sellingPrice < formData.mrp
      ? Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 100)
      : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Edit Batch Offering' : 'Create New Batch Offering'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Batch Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. CUET 2027: Humanities Foundation Batch"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">URL Slug *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="cuet-2027-humanities"
              className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Target Exam</label>
            <input
              type="text"
              value={formData.targetExam}
              onChange={(e) => setFormData((prev) => ({ ...prev, targetExam: e.target.value }))}
              placeholder="CUET UG 2027"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">Description</label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Comprehensive coaching with live lectures, NCERT notes, and CBT mocks..."
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
          ></textarea>
        </div>

        {/* Pricing & Commercial Rules */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
              <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
              <span>Commercial Pricing & Rules</span>
            </span>
            {discountPercent > 0 && (
              <Badge variant="success" size="sm">
                {discountPercent}% Discount
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">MRP (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.mrp}
                onChange={(e) => setFormData((prev) => ({ ...prev, mrp: Number(e.target.value) }))}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Selling Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sellingPrice: Number(e.target.value) }))
                }
                className="w-full text-xs font-bold text-blue-600 px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Validity (Days)</label>
              <input
                type="number"
                min="1"
                value={formData.validityDays}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validityDays: Number(e.target.value) }))
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Student Cap</label>
              <input
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, maxCapacity: Number(e.target.value) }))
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-4">
          <label className="text-xs font-semibold text-slate-700">Status:</label>
          <div className="flex items-center space-x-3 text-xs">
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === 'active'}
                onChange={() => setFormData((prev) => ({ ...prev, status: 'active' }))}
              />
              <span className="font-medium text-emerald-700">Active (Live)</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={formData.status === 'draft'}
                onChange={() => setFormData((prev) => ({ ...prev, status: 'draft' }))}
              />
              <span className="font-medium text-slate-600">Draft</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {initialData?.id ? 'Update Batch' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

