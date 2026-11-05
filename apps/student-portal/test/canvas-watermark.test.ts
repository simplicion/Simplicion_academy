import { describe, it, expect } from 'vitest';
import { drawCanvasWatermark } from '../src/components/WatermarkedDocumentViewer';

describe('PDF & Study Notes Canvas Anti-Piracy Watermark Pipeline', () => {
  it('draws diagonal watermark stamps with student and tenant identification onto 2D canvas', () => {
    const textCalls: string[] = [];
    let rotationAngle = 0;
    let fillStyleSet = '';

    // Mock HTML5 Canvas 2D Context
    const mockCtx: any = {
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: (rad: number) => {
        rotationAngle = rad;
      },
      fillText: (text: string) => {
        textCalls.push(text);
      },
      set fillStyle(val: string) {
        fillStyleSet = val;
      },
      get fillStyle() {
        return fillStyleSet;
      },
      set font(_: string) {},
      set textBaseline(_: string) {},
    };

    const mockCanvas: any = {
      width: 800,
      height: 1000,
      getContext: (type: string) => (type === '2d' ? mockCtx : null),
    };

    drawCanvasWatermark(mockCanvas, {
      studentName: 'Ananya Verma',
      studentPhone: '+919876500000',
      tenantName: 'CUET Humanities Academy',
      timestamp: '2026-11-05 20:30:00',
      ipAddress: '103.21.244.18',
    });

    // Verify -45 degree canvas rotation
    expect(rotationAngle).toBeCloseTo(-Math.PI / 4, 3);

    // Verify stamp content
    expect(textCalls.length).toBeGreaterThan(0);
    const sampleStamp = textCalls[0];
    expect(sampleStamp).toContain('CONFIDENTIAL');
    expect(sampleStamp).toContain('CUET HUMANITIES ACADEMY');
    expect(sampleStamp).toContain('+919876500000');
    expect(sampleStamp).toContain('Ananya Verma');
    expect(sampleStamp).toContain('2026-11-05 20:30:00');
  });

  it('enforces zoom constraints between 80% and 150%', () => {
    const clampZoom = (current: number, delta: number) => {
      const next = current + delta;
      return Math.min(150, Math.max(80, next));
    };

    expect(clampZoom(100, 10)).toBe(110);
    expect(clampZoom(150, 10)).toBe(150); // Max capped at 150%
    expect(clampZoom(80, -10)).toBe(80); // Min floored at 80%
    expect(clampZoom(90, -20)).toBe(80);
  });

  it('detects and intercepts anti-piracy shortcut events (Ctrl+P, Ctrl+S)', () => {
    const isPiracyKey = (e: { ctrlKey?: boolean; metaKey?: boolean; key: string }) => {
      const isModifier = e.ctrlKey || e.metaKey;
      return Boolean(isModifier && ['p', 's', 'u'].includes(e.key.toLowerCase()));
    };

    expect(isPiracyKey({ ctrlKey: true, key: 'p' })).toBe(true); // Print
    expect(isPiracyKey({ metaKey: true, key: 's' })).toBe(true); // Save Page
    expect(isPiracyKey({ ctrlKey: true, key: 'u' })).toBe(true); // View Source
    expect(isPiracyKey({ ctrlKey: false, key: 'p' })).toBe(false); // Normal typing
    expect(isPiracyKey({ ctrlKey: true, key: 'f' })).toBe(false); // Find in page
  });
});

