import { describe, it, expect } from 'vitest';
import {
  colors,
  spacing,
  radii,
  typography,
  defaultSimplicionTheme,
  referenceHumanitiesCuetTheme,
  generateThemeCssVariables,
} from '../src';

describe('SAFS-04 Design System & Token Conformance', () => {
  it('should define the canonical Simplicion blue primary color (#2563eb)', () => {
    expect(colors.primary[600]).toBe('#2563eb');
    expect(colors.primary[500]).toBe('#3b82f6');
  });

  it('should define semantic feedback callout colors conforming to SAFS-04 Chapter 2', () => {
    expect(colors.info).toBe('#2563eb'); // Blue
    expect(colors.success).toBe('#10b981'); // Emerald Green
    expect(colors.warning).toBe('#f59e0b'); // Amber
    expect(colors.error).toBe('#ef4444'); // Crimson
  });

  it('should define the canonical 4px-based spacing scale', () => {
    expect(spacing.xs).toBe('4px');
    expect(spacing.sm).toBe('8px');
    expect(spacing.md).toBe('16px');
    expect(spacing.lg).toBe('24px');
    expect(spacing.xl).toBe('32px');
  });

  it('should generate valid CSS custom properties for default Simplicion theme', () => {
    const cssVars = generateThemeCssVariables(defaultSimplicionTheme);
    expect(cssVars['--brand-primary']).toBe('#2563eb');
    expect(cssVars['--brand-radius']).toBe('8px');
    expect(cssVars['--brand-font']).toContain('Plus Jakarta Sans');
  });

  it('should generate valid CSS custom properties for reference Humanities CUET theme', () => {
    const cssVars = generateThemeCssVariables(referenceHumanitiesCuetTheme);
    expect(cssVars['--brand-primary']).toBe('#1e3a8a'); // Deep Academic Navy
    expect(cssVars['--brand-accent']).toBe('#f59e0b'); // Scholarly Amber
    expect(cssVars['--brand-radius']).toBe('12px');
    expect(cssVars['--brand-font']).toContain('Noto Sans Devanagari');
  });
});

