/**
 * Tenant White-Label Theme Engine
 * Conforms to SAFS-04 & PRD FR-STUDIO-1
 */

export interface TenantThemeConfig {
  primaryColor: string;
  primaryHoverColor?: string;
  accentColor: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Outfit' | 'Noto Sans Devanagari';
  logoUrl?: string;
  faviconUrl?: string;
}

export const defaultSimplicionTheme: TenantThemeConfig = {
  primaryColor: '#2563eb',
  primaryHoverColor: '#1d4ed8',
  accentColor: '#3b82f6',
  borderRadius: 'md',
  fontFamily: 'Plus Jakarta Sans',
};

export const referenceHumanitiesCuetTheme: TenantThemeConfig = {
  primaryColor: '#1e3a8a', // Deep Academic Navy
  primaryHoverColor: '#172554',
  accentColor: '#f59e0b', // Scholarly Amber
  borderRadius: 'lg',
  fontFamily: 'Noto Sans Devanagari',
};

/**
 * Converts tenant theme configuration to CSS Root Custom Properties
 */
export function generateThemeCssVariables(theme: TenantThemeConfig): Record<string, string> {
  const radiusMap = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  };

  const fontMap = {
    Inter: 'Inter, system-ui, sans-serif',
    'Plus Jakarta Sans': '"Plus Jakarta Sans", Inter, sans-serif',
    Outfit: 'Outfit, system-ui, sans-serif',
    'Noto Sans Devanagari': '"Noto Sans Devanagari", Inter, sans-serif',
  };

  return {
    '--brand-primary': theme.primaryColor,
    '--brand-primary-hover': theme.primaryHoverColor || theme.primaryColor,
    '--brand-accent': theme.accentColor,
    '--brand-radius': radiusMap[theme.borderRadius] || '8px',
    '--brand-font': fontMap[theme.fontFamily] || 'Inter, sans-serif',
  };
}

/**
 * Helper to generate inline style string for SSR injection
 */
export function generateThemeStyleString(theme: TenantThemeConfig): string {
  const vars = generateThemeCssVariables(theme);
  return Object.entries(vars)
    .map(([key, val]) => `${key}: ${val};`)
    .join(' ');
}

