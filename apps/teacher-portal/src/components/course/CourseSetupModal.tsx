'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, IndianRupee, Users, Image as ImageIcon, CheckCircle2, Tag, Star } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CourseSetupModalProps {
  isOpen: boolean;
  course: {
    id: string;
    title: string;
    description?: string | null;
    priceInr?: number;
    originalPriceInr?: number | null;
    discountPercent?: number;
    discountLabel?: string | null;
    isFeatured?: boolean;
    maxStudents?: number | null;
    bannerUrl?: string | null;
    isSetupComplete?: boolean;
  };
  onClose?: () => void;
  onCompleted: (
    updatedCourse: any,
    meta?: { requiresSubscription?: boolean; message?: string }
  ) => void;
}

/**
 * Compresses selected banner image client-side (<250KB WebP/JPEG) for instant 4G loads.
 */
async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const webp = canvas.toDataURL('image/webp', 0.8);
        resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const CourseSetupModal: React.FC<CourseSetupModalProps> = ({
  isOpen,
  course,
  onClose,
  onCompleted,
}) => {
  const [priceInr, setPriceInr] = useState(String(course.priceInr ?? 2999));
  const [isFree, setIsFree] = useState(course.isSetupComplete ? (course.priceInr ?? 0) === 0 : false);
  const [hasDiscount, setHasDiscount] = useState(
    Boolean(course.originalPriceInr && course.originalPriceInr > (course.priceInr ?? 0))
  );
  const [originalPriceInr, setOriginalPriceInr] = useState(
    course.originalPriceInr ? String(course.originalPriceInr) : ''
  );
  const [discountLabel, setDiscountLabel] = useState(course.discountLabel || '');
  const [isFeatured, setIsFeatured] = useState(Boolean(course.isFeatured));
  const [maxStudents, setMaxStudents] = useState(
    course.maxStudents ? String(course.maxStudents) : '200'
  );
  const [unlimitedSeats, setUnlimitedSeats] = useState(
    course.isSetupComplete ? course.maxStudents === null : false
  );
  const [description, setDescription] = useState(course.description || '');
  const [bannerUrl, setBannerUrl] = useState<string>(course.bannerUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && course.isSetupComplete && onClose && !isSubmitting) {
        onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, course.isSetupComplete, onClose, isSubmitting]);

  if (!isOpen || !mounted) return null;

  const processSelectedFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    setError(null);
    const compressed = await compressImageFile(file);
    setBannerUrl(compressed);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processSelectedFile(e.target.files?.[0]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processSelectedFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = isFree ? 0 : Number(priceInr);
    if (!isFree && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setError('Please enter a valid course price in INR.');
      return;
    }

    const parsedOriginal =
      hasDiscount && originalPriceInr.trim() !== '' ? Number(originalPriceInr) : null;
    if (hasDiscount && parsedOriginal !== null && (Number.isNaN(parsedOriginal) || parsedOriginal <= parsedPrice)) {
      setError('Original MRP must be higher than the discounted selling price.');
      return;
    }

    const parsedSeats = unlimitedSeats ? null : Number(maxStudents);
    if (!unlimitedSeats && (!parsedSeats || parsedSeats < 1)) {
      setError('Please enter a valid maximum number of students.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(course.id)}/setup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceInr: parsedPrice,
          originalPriceInr: hasDiscount ? parsedOriginal : null,
          discountLabel: hasDiscount ? discountLabel.trim() || null : null,
          isFeatured,
          maxStudents: parsedSeats,
          bannerUrl: bannerUrl || null,
          description: description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not save course setup.');
      }
      onCompleted(data.course, {
        requiresSubscription: Boolean(data.requiresSubscription),
        message: data.message,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save course setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      data-testid="course-setup-modal"
      onClick={() => course.isSetupComplete && onClose && !isSubmitting && onClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/55 backdrop-blur-[2px] !mt-0"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] flex flex-col border border-[#e2e8f0] overflow-hidden"
      >
        {/* SAFS-04 Clean Sticky Modal Header */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-start justify-between gap-4 shrink-0 bg-white">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe] mb-1.5">
              Complete Course Setup
            </span>
            <h2
              className="text-lg font-bold text-[#0f172a] tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
            >
              {course.title}
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Set pricing, enrollment capacity, and your course banner. You can publish live anytime with an active ₹250/mo Educator Plan.
            </p>
          </div>
          {course.isSetupComplete && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form
          id="course-setup-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto flex-1"
        >
          {error && (
            <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs text-[#b91c1c] font-medium">
              {error}
            </div>
          )}

          {/* 1. Course Price per Student */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Course Price per Student (INR)</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-[#cbd5e1] text-[#2563eb]"
                />
                <span>Free Course</span>
              </label>
            </div>
            {!isFree && (
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#64748b]">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  required
                  value={priceInr}
                  onChange={(e) => setPriceInr(e.target.value)}
                  placeholder="2999"
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm font-semibold text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                />
              </div>
            )}

            {/* Course Discount & Offer Pricing */}
            <div className="pt-1 space-y-2.5">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#334155] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasDiscount(checked);
                    if (checked && !originalPriceInr) {
                      const base = isFree ? 999 : Math.max(499, Math.round((Number(priceInr) || 1000) * 1.4));
                      setOriginalPriceInr(String(base));
                    }
                  }}
                  className="rounded border-[#cbd5e1] text-[#2563eb]"
                />
                <Tag className="w-3.5 h-3.5 text-[#059669]" />
                <span>Offer a Discount (Show MRP &amp; % OFF on Student Portal)</span>
              </label>

              {hasDiscount && (
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-[#475569]">
                        Original Price / MRP (₹)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={originalPriceInr}
                        onChange={(e) => setOriginalPriceInr(e.target.value)}
                        placeholder="e.g. 4999"
                        className="w-full px-3 py-2 text-xs font-semibold text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-[#475569]">
                        Discount Percentage (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={(() => {
                          const mrp = Number(originalPriceInr || 0);
                          const sale = isFree ? 0 : Number(priceInr || 0);
                          if (mrp <= 0 || mrp <= sale) return 0;
                          return Math.min(100, Math.round(((mrp - sale) / mrp) * 100));
                        })()}
                        onChange={(e) => {
                          const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                          const mrp = Number(originalPriceInr || 0);
                          if (mrp > 0) {
                            const computedSale = Math.max(0, Math.round(mrp * (1 - pct / 100)));
                            if (computedSale === 0) {
                              setIsFree(true);
                              setPriceInr('0');
                            } else {
                              setIsFree(false);
                              setPriceInr(String(computedSale));
                            }
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-[#059669] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-[#475569]">
                      Offer Badge Text (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={32}
                      value={discountLabel}
                      onChange={(e) => setDiscountLabel(e.target.value)}
                      placeholder="e.g. Early Bird Offer, Festive Sale, Limited Seats"
                      className="w-full px-3 py-2 text-xs text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  {Number(originalPriceInr || 0) > (isFree ? 0 : Number(priceInr || 0)) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-[#64748b]">Student sees:</span>
                      <span className="font-bold text-[#0f172a]">
                        {isFree ? 'Free' : `₹${Number(priceInr || 0).toLocaleString('en-IN')}`}
                      </span>
                      <span className="line-through text-[#94a3b8]">
                        ₹{Number(originalPriceInr).toLocaleString('en-IN')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                        {Math.round(
                          ((Number(originalPriceInr) - (isFree ? 0 : Number(priceInr || 0))) /
                            Number(originalPriceInr)) *
                            100
                        )}
                        % OFF
                      </span>
                      {discountLabel.trim() && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eff6ff] text-[#1d4ed8]">
                          {discountLabel.trim()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Star as Featured Highlight (Max 2) */}
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#fffbeb]/60 cursor-pointer transition-colors">
              <span className="flex items-center gap-2 text-xs font-semibold text-[#0f172a]">
                <Star
                  className={`w-4 h-4 ${
                    isFeatured ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-[#94a3b8]'
                  }`}
                />
                <span>Star in Featured Highlights (Max 2 courses)</span>
              </span>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-[#cbd5e1] text-[#f59e0b]"
              />
            </label>
          </div>

          {/* 2. Maximum Students Capacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Max Students Allowed</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={unlimitedSeats}
                  onChange={(e) => setUnlimitedSeats(e.target.checked)}
                  className="rounded border-[#cbd5e1] text-[#2563eb]"
                />
                <span>Unlimited Seats</span>
              </label>
            </div>
            {!unlimitedSeats && (
              <input
                type="number"
                min={1}
                required
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
              />
            )}
          </div>

          {/* 3. Short Description (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#334155]">
              Course Summary (Shown on Student Landing Page)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what students will learn in this course..."
              className="w-full px-3.5 py-2 text-sm text-[#0f172a] bg-white border border-[#cbd5e1] rounded-lg placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
            />
          </div>

          {/* 4. Course Banner Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Course Banner Image</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {bannerUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-[#e2e8f0] group">
                <img
                  src={bannerUrl}
                  alt="Course banner preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-[#0f172a]/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#0f172a]"
                  >
                    Replace Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerUrl('')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#dc2626] text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`w-full py-8 px-4 rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center gap-2 text-center ${
                  isDragging
                    ? 'border-[#2563eb] bg-[#eff6ff]'
                    : 'border-[#cbd5e1] hover:border-[#2563eb] bg-[#f8fafc] hover:bg-[#eff6ff]/40'
                }`}
              >
                <Upload className="w-6 h-6 text-[#2563eb]" />
                <span className="text-xs font-semibold text-[#0f172a]">
                  {isDragging ? 'Drop your banner image here' : 'Drag & drop or click to upload course banner'}
                </span>
                <span className="text-[11px] text-[#64748b]">
                  Recommended 1200×630px (PNG, JPG, WebP) — auto-compressed &amp; hosted on Supabase CDN
                </span>
              </button>
            )}
          </div>

        </form>

        {/* Sticky Footer Submit Bar (Always reachable on all laptop & mobile heights) */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] shrink-0">
          <button
            type="submit"
            form="course-setup-form"
            disabled={isSubmitting}
            data-testid="complete-course-setup-btn"
            className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Saving Setup...'
                : course.isSetupComplete
                  ? 'Save Course Settings'
                  : 'Save Setup & Continue'}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
