// Simplicion Academy — Supabase Edge Function API Gateway
// Deployed via GitHub Actions (`supabase functions deploy api --project-ref fzogbyhgufiaywcctjkp`)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bypass-cache',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=5, stale-while-revalidate=60',
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  // Strip /functions/v1/api or /api prefix when invoked via Supabase Edge Functions
  const path = url.pathname.replace(/^\/(?:functions\/v1\/)?api/, '') || '/';

  try {
    if (path === '/health' || path === '/') {
      return json({
        status: 'healthy',
        runtime: 'supabase-edge',
        timestamp: new Date().toISOString(),
        supabaseUrl,
      });
    }

    if (path === '/tenants/search' && req.method === 'GET') {
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const { data: tenants, error } = await supabase
        .from('Tenant')
        .select('id, slug, name, status, planId, TenantSettings(*)')
        .order('createdAt', { ascending: false });
      if (error) return json({ success: false, error: error.message }, 500);

      const academies = (tenants || [])
        .map((t: any) => {
          const settings = Array.isArray(t.TenantSettings) ? t.TenantSettings[0] : t.TenantSettings;
          const branding = settings?.branding || {};
          const contact = settings?.contact || {};
          const enabledModules = settings?.enabledModules || {};
          return {
            id: t.id,
            slug: t.slug,
            name: t.name,
            tagline: branding.tagline || '',
            logoUrl: branding.logoUrl || '',
            bannerUrl: branding.bannerUrl || '',
            primaryColor: branding.primaryColor || '#2563eb',
            portalLive: enabledModules.portalLive !== false,
            teacherName: contact.educatorName || '',
            specialty: branding.tagline || contact.category || '',
            exam: contact.category || 'Online Academy',
          };
        })
        .filter((a: any) => {
          if (!q) return true;
          return (
            a.name.toLowerCase().includes(q) ||
            a.slug.toLowerCase().includes(q) ||
            a.tagline.toLowerCase().includes(q)
          );
        });

      return json({ success: true, source: 'supabase-edge', count: academies.length, academies });
    }

    if (path === '/public/storefront' && req.method === 'GET') {
      const slug = (url.searchParams.get('tenant') || '').toLowerCase();
      if (!slug) return json({ success: false, notFound: true, siteConfig: null, courses: [] }, 404);

      const { data: tenant } = await supabase
        .from('Tenant')
        .select('id, slug, name, status, planId, ownerUserId, TenantSettings(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!tenant) {
        return json({ success: false, notFound: true, slug, siteConfig: null, courses: [] });
      }

      const settings = Array.isArray((tenant as any).TenantSettings)
        ? (tenant as any).TenantSettings[0]
        : (tenant as any).TenantSettings || {};
      const enabledModules = settings?.enabledModules || {};

      const { data: courses } = await supabase
        .from('StudioCourse')
        .select('*')
        .eq('tenantSlug', tenant.slug)
        .eq('status', 'live')
        .eq('isSetupComplete', true)
        .order('createdAt', { ascending: false });

      return json({
        success: true,
        source: 'supabase-edge',
        siteConfig: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          status: tenant.status,
          planId: tenant.planId,
          ownerUserId: tenant.ownerUserId,
          portalLive: enabledModules.portalLive !== false,
          portalOfflineMessage: enabledModules.portalOfflineMessage || '',
          settings,
        },
        courses: courses || [],
      });
    }

    return json({ success: false, error: `Route not found: ${req.method} ${path}` }, 404);
  } catch (err: any) {
    return json({ success: false, error: err?.message || 'Edge function error' }, 500);
  }
});
