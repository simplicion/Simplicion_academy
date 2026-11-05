'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, Button } from '@simplicion/ui';
import { ShieldCheck, Download, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';

export interface WatermarkedDocumentViewerProps {
  documentTitle: string;
  documentPages: string[]; // Mock page text, HTML, or image URLs
  studentName?: string;
  studentPhone?: string;
  tenantName?: string;
  ipAddress?: string;
  allowDownload?: boolean;
}

/**
 * Pure Canvas 2D Watermark Renderer
 * Draws non-selectable, persistent diagonal watermark stamps across the canvas context
 */
export function drawCanvasWatermark(
  canvas: HTMLCanvasElement,
  options: {
    studentPhone: string;
    studentName: string;
    tenantName: string;
    timestamp?: string;
    ipAddress?: string;
  }
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const timestamp = options.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19);
  const stampText = `CONFIDENTIAL • ${options.tenantName.toUpperCase()} • ${options.studentPhone} • ${options.studentName} • ${timestamp}`;

  ctx.save();
  ctx.font = 'bold 13px Courier, monospace';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.16)'; // High-visibility subtle contrast
  ctx.textBaseline = 'middle';

  // Rotate canvas -45 degrees from center
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 4);
  ctx.translate(-width / 2, -height / 2);

  // Staggered repeating grid
  const stepX = 320;
  const stepY = 110;

  for (let x = -width; x < width * 2; x += stepX) {
    for (let y = -height; y < height * 2; y += stepY) {
      ctx.fillText(stampText, x, y);
    }
  }

  ctx.restore();
}

export const WatermarkedDocumentViewer: React.FC<WatermarkedDocumentViewerProps> = ({
  documentTitle,
  documentPages,
  studentName = 'Rahul Sharma',
  studentPhone = '+91 98765 43210',
  tenantName = 'Humanities CUET Academy',
  ipAddress = '103.21.244.18',
  allowDownload = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render canvas watermark on mount, page change, or resize
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 900;
      drawCanvasWatermark(canvas, {
        studentName,
        studentPhone,
        tenantName,
        ipAddress,
      });
    }
  }, [currentPage, zoomLevel, studentName, studentPhone, tenantName, ipAddress]);

  // Anti-Piracy Event Listeners: block Right Click, Ctrl+P (Print), Ctrl+S (Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
        e.preventDefault();
        setSecurityNotice('Printing, saving, and inspecting page source is restricted by copyright protection.');
        setTimeout(() => setSecurityNotice(null), 3000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSecurityNotice('Right-click context menu is disabled to prevent unauthorized copying.');
    setTimeout(() => setSecurityNotice(null), 3000);
  };

  const watermarkSummary = `CONFIDENTIAL • ${tenantName.toUpperCase()} • ${studentPhone}`;

  return (
    <div
      data-testid="watermarked-document-viewer"
      onContextMenu={handleContextMenu}
      className="flex flex-col space-y-4 max-w-4xl mx-auto select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Security Notification Banner */}
      {securityNotice && (
        <div
          role="alert"
          className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs flex items-center gap-2 animate-bounce shadow-sm"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{securityNotice}</span>
        </div>
      )}

      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl shadow-sm">
        <div className="flex items-center space-x-2 min-w-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold truncate max-w-xs sm:max-w-md">
            {documentTitle}
          </span>
          <span className="hidden md:inline-block text-[11px] bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded">
            Anti-Piracy Active
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(80, prev - 10))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-1">{zoomLevel}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {allowDownload && (
            <Button variant="secondary" size="sm" className="ml-2 gap-1 text-xs">
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Document Canvas with Dynamic Anti-Piracy Watermark Overlay */}
      <div className="relative overflow-hidden bg-slate-200 dark:bg-slate-900 p-6 rounded-2xl flex justify-center min-h-[500px]">
        {/* Layer 1: HTML5 Canvas 2D Dynamic Watermark Overlay */}
        <canvas
          ref={canvasRef}
          data-testid="watermark-canvas-overlay"
          className="absolute inset-0 z-30 pointer-events-none w-full h-full"
        />

        {/* Layer 2: CSS Diagonal Repeating Watermark Grid Fallback */}
        <div
          className="absolute inset-0 z-20 pointer-events-none flex flex-wrap items-center justify-around opacity-15 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="transform -rotate-45 font-mono font-black text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap p-8 tracking-wider"
            >
              {watermarkSummary}
            </div>
          ))}
        </div>

        {/* Layer 3: Document Content Page */}
        <div
          className="relative z-10 bg-white dark:bg-slate-950 p-8 sm:p-12 rounded-xl shadow-xl border border-slate-300 dark:border-slate-800 max-w-2xl w-full transition-transform duration-150"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-[var(--brand-primary,#2563eb)]">
              Official Study Notes
            </span>
            <span className="text-xs font-mono text-slate-400">
              Page {currentPage} of {documentPages.length}
            </span>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 space-y-4">
            <div dangerouslySetInnerHTML={{ __html: documentPages[currentPage - 1] }} />
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Confidential • Licensed to {studentName} ({studentPhone})</span>
            <span>IP: {ipAddress}</span>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {documentPages.length > 1 && (
        <div className="flex items-center justify-center space-x-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous Page
          </Button>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {currentPage} / {documentPages.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === documentPages.length}
            onClick={() => setCurrentPage((p) => Math.min(documentPages.length, p + 1))}
          >
            Next Page
          </Button>
        </div>
      )}
    </div>
  );
};
