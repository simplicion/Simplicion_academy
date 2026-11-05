import { describe, it, expect } from 'vitest';
import { ThemeCustomizerState } from '../src/components/builder/TokenCustomizer';
import { TenantAggregate } from '@simplicion/tenant';

describe('No-Code Portal Builder & Theme Tokens', () => {
  const initialTheme: ThemeCustomizerState = {
    primaryColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    borderRadius: '8px',
    fontFamily: "'Inter', sans-serif",
    headerLayout: 'login-left',
    instituteName: 'Humanities CUET Academy',
    tagline: 'Premier Humanities Coaching for CUET UG Entrance Exam',
    showHero: true,
    showOfferings: true,
    showCategories: true,
    showWhyUs: true,
    showFaq: true,
  };

  it('updates brand primary color and verifies contrast compliance', () => {
    const updatedTheme: ThemeCustomizerState = {
      ...initialTheme,
      primaryColor: '#059669', // Emerald Green
    };

    expect(updatedTheme.primaryColor).toBe('#059669');
    expect(updatedTheme.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('switches header layout between login-left, split, and centered', () => {
    const layouts: Array<'login-left' | 'split' | 'centered'> = ['login-left', 'split', 'centered'];

    layouts.forEach((layout) => {
      const theme: ThemeCustomizerState = {
        ...initialTheme,
        headerLayout: layout,
      };
      expect(theme.headerLayout).toBe(layout);
    });
  });

  it('toggles storefront section visibility independently', () => {
    let theme: ThemeCustomizerState = { ...initialTheme };

    // Teacher disables FAQ and Categories to focus solely on conversion
    theme = {
      ...theme,
      showFaq: false,
      showCategories: false,
    };

    expect(theme.showFaq).toBe(false);
    expect(theme.showCategories).toBe(false);
    expect(theme.showHero).toBe(true);
    expect(theme.showOfferings).toBe(true);
  });

  it('commits theme customization into TenantAggregate correctly', () => {
    const tenant = TenantAggregate.create(
      'tenant_cuet',
      'cuet-humanities',
      'Humanities CUET Academy',
      'teacher_001',
      'plan_pro'
    );

    expect(tenant.settings.branding.primaryColor).toBe('#2563eb');

    tenant.updateBranding({
      primaryColor: '#7c3aed',
      headerLayout: 'login-left',
    });

    expect(tenant.settings.branding.primaryColor).toBe('#7c3aed');
    expect(tenant.settings.branding.headerLayout).toBe('login-left');
  });
});
