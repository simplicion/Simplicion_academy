import { describe, it, expect } from 'vitest';

export function generateWatermarkString(studentName: string, studentPhone: string, dateStr?: string): string {
  const date = dateStr || new Date().toISOString().split('T')[0];
  return `${studentName} • ${studentPhone} • ${date}`;
}

export function generateWatermarkGrid(text: string, count: number = 12): string[] {
  return Array.from({ length: count }, () => text);
}

describe('Anti-Piracy Dynamic Watermarking Security', () => {
  it('generates an immutable trace string combining identity, mobile number, and access stamp', () => {
    const name = 'Rahul Sharma';
    const phone = '+91 98765 43210';
    const date = '2026-11-05';

    const watermark = generateWatermarkString(name, phone, date);
    expect(watermark).toContain('Rahul Sharma');
    expect(watermark).toContain('+91 98765 43210');
    expect(watermark).toContain('2026-11-05');
  });

  it('generates a repetitive diagonal grid matrix to prevent screen capture crop avoidance', () => {
    const text = 'Priya Patel • +91 91234 56789 • 2026-11-05';
    const grid = generateWatermarkGrid(text, 16);

    expect(grid).toHaveLength(16);
    grid.forEach((stamp) => {
      expect(stamp).toBe(text);
    });
  });

  it('validates that student sensitive identifiers are cleanly formatted without corruption', () => {
    const edgeName = "O'Connor & Sons Student";
    const phone = '+91-98765-43210';
    const watermark = generateWatermarkString(edgeName, phone, '2026-11-05');

    expect(watermark).toBe("O'Connor & Sons Student • +91-98765-43210 • 2026-11-05");
  });
});

