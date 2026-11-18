import { LiveStudioCourse } from '../components/LiveCoursesSection';

export interface StorefrontSiteConfig {
  id: string;
  slug: string;
  name: string;
  status: string;
  planId: string;
  ownerUserId: string;
  portalLive?: boolean;
  portalOfflineMessage?: string;
  settings?: {
    branding?: Record<string, any>;
    contact?: Record<string, any>;
    labels?: Record<string, any>;
    seo?: Record<string, any>;
    enabledModules?: Record<string, any>;
  };
}

export interface InitialStorefrontPayload {
  slug: string;
  siteConfig: StorefrontSiteConfig | null;
  courses: LiveStudioCourse[];
}

export interface AcademyDirectoryEntry {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  portalLive?: boolean;
  publishedCoursesCount?: number;
  teacherName?: string;
  specialty?: string;
  exam?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Fetches all live academies from Supabase PostgreSQL for the root Academy Finder directory.
 */
export async function fetchAcademiesServer(): Promise<AcademyDirectoryEntry[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/tenants/search`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.academies)) return [];
    return json.academies;
  } catch {
    return [];
  }
}

/**
 * Fetches combined academy config + published courses from the sub-5ms cached
 * /public/storefront endpoint on the server so SSR renders real academy data on first byte.
 */
export async function fetchStorefrontServer(
  rawSlug = 'cuet-humanities'
): Promise<InitialStorefrontPayload | null> {
  const slug = (rawSlug || 'cuet-humanities').toLowerCase();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      `${API_BASE_URL}/public/storefront?tenant=${encodeURIComponent(slug)}`,
      {
        cache: 'no-store',
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;
    return {
      slug: json.siteConfig?.slug || slug,
      siteConfig: json.siteConfig || null,
      courses: Array.isArray(json.courses) ? json.courses : [],
    };
  } catch {
    return null;
  }
}
