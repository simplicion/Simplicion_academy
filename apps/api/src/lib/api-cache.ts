import { Request, Response, NextFunction } from 'express';
import zlib from 'zlib';
import { invalidateStorefrontCache } from './storefront-cache';

interface CacheEntry {
  statusCode: number;
  contentType: string;
  rawBuffer: Buffer;
  gzipBuffer: Buffer | null;
  etag: string;
  storedAt: number;
  freshUntil: number;
  staleUntil: number;
}

const FRESH_TTL_MS = 25_000; // 25s fresh window -> instant RAM HIT
const STALE_TTL_MS = 10 * 60_000; // 10m stale-while-revalidate window -> instant STALE + background refresh
const MAX_CACHE_ENTRIES = 500;

const responseCache = new Map<string, CacheEntry>();
const revalidatingKeys = new Set<string>();
const inflightWaiters = new Map<string, Array<(entry: CacheEntry | null) => void>>();

const CACHEABLE_PREFIXES = [
  '/tenants/search',
  '/site-config',
  '/subscription/status',
  '/academy/overview',
  '/academy/live-sessions',
  '/academy/doubts',
  '/academy/students',
  '/courses',
  '/course-tests/',
  '/pay/180/payouts',
  '/notifications',
  '/student/enrollments',
  '/cbt/questions',
];

function isCacheableGetPath(path: string): boolean {
  return CACHEABLE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

function buildCacheKey(req: Request): string {
  // Normalize query parameters in deterministic sorted order so cache keys always match
  const [pathname, rawQuery] = req.originalUrl.split('?');
  if (!rawQuery) return pathname;
  const params = new URLSearchParams(rawQuery);
  params.delete('nocache');
  params.delete('_t');
  const sorted = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return sorted ? `${pathname}?${sorted}` : pathname;
}

function computeWeakEtag(buf: Buffer): string {
  let hash = 2166136261;
  for (let i = 0; i < buf.length; i++) {
    hash ^= buf[i];
    hash = Math.imul(hash, 16777619);
  }
  return `W/"${buf.length}-${(hash >>> 0).toString(36)}"`;
}

function evictOldestIfNeeded() {
  if (responseCache.size < MAX_CACHE_ENTRIES) return;
  const firstKey = responseCache.keys().next().value;
  if (firstKey) responseCache.delete(firstKey);
}

function sendCachedEntry(
  req: Request,
  res: Response,
  entry: CacheEntry,
  cacheState: 'HIT' | 'STALE' | 'COALESCED',
  startedMs: number
) {
  const elapsedMs = Math.max(0.05, Math.round((performance.now() - startedMs) * 100) / 100);
  res.setHeader('X-Cache', cacheState);
  res.setHeader('X-Response-Time-Ms', String(elapsedMs));
  res.setHeader('ETag', entry.etag);
  res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=60');
  res.setHeader('Vary', 'Accept-Encoding');

  if (req.headers['if-none-match'] === entry.etag) {
    res.status(304).end();
    return;
  }

  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  if (entry.gzipBuffer && acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', entry.contentType);
    res.setHeader('Content-Length', String(entry.gzipBuffer.length));
    res.status(entry.statusCode).end(entry.gzipBuffer);
    return;
  }

  res.setHeader('Content-Type', entry.contentType);
  res.setHeader('Content-Length', String(entry.rawBuffer.length));
  res.status(entry.statusCode).end(entry.rawBuffer);
}

function triggerBackgroundRevalidate(cacheKey: string, port: number) {
  if (revalidatingKeys.has(cacheKey)) return;
  revalidatingKeys.add(cacheKey);
  const sep = cacheKey.includes('?') ? '&' : '?';
  fetch(`http://127.0.0.1:${port}${cacheKey}${sep}nocache=1`, {
    headers: { 'x-bg-revalidate': '1' },
  })
    .catch(() => {})
    .finally(() => {
      revalidatingKeys.delete(cacheKey);
    });
}

let activeServerPort = Number(process.env.PORT || 4000);
let warmTimer: NodeJS.Timeout | null = null;
let knownWarmSlugs = new Set<string>(['cuet-humanities']);

export function setApiCachePort(port: number) {
  activeServerPort = port;
}

export function registerWarmTenantSlug(slug?: string | null) {
  if (slug && slug.trim()) {
    knownWarmSlugs.add(slug.trim().toLowerCase());
  }
}

export function invalidateAllApiCaches(triggerBackgroundRewarm = false) {
  responseCache.clear();
  invalidateStorefrontCache();

  if (triggerBackgroundRewarm) {
    if (warmTimer) clearTimeout(warmTimer);
    warmTimer = setTimeout(() => {
      warmHotCaches(activeServerPort).catch(() => {});
    }, 150);
  }
}

/**
 * Express middleware providing:
 * 1. Sub-millisecond RAM Read-Through SWR caching with pre-compressed Gzip buffers
 * 2. Singleflight in-flight request coalescing (prevents duplicate DB hits on concurrent loads)
 * 3. Instant automatic invalidation + background re-warm on any successful write (POST/PUT/PATCH/DELETE)
 */
export function apiResponseCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();

  // Bypass cache in unit tests unless explicitly enabled
  if (process.env.VITEST) {
    return next();
  }

  // On any write mutation, invalidate caches immediately after the write succeeds
  if (method !== 'GET' && method !== 'HEAD') {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        invalidateAllApiCaches(true);
      }
    });
    return next();
  }

  if (!isCacheableGetPath(req.path)) {
    return next();
  }

  const started = performance.now();
  const cacheKey = buildCacheKey(req);
  const bypass =
    req.query.nocache === '1' ||
    req.headers['x-bypass-cache'] === '1' ||
    req.headers['x-bg-revalidate'] === '1';

  // Track tenant slugs seen so background re-warming stays smart
  const qTenant = (req.query.tenant as string) || (req.query.tenantId as string);
  if (qTenant) registerWarmTenantSlug(qTenant);

  const now = Date.now();
  const cached = responseCache.get(cacheKey);

  if (!bypass && cached) {
    if (now <= cached.freshUntil) {
      return sendCachedEntry(req, res, cached, 'HIT', started);
    }
    if (now <= cached.staleUntil) {
      // Serve stale instantly (< 1ms) and refresh silently in background!
      triggerBackgroundRevalidate(cacheKey, activeServerPort);
      return sendCachedEntry(req, res, cached, 'STALE', started);
    }
  }

  // In-flight request coalescing (Singleflight): if another request is already querying Supabase
  // for this exact cache key, piggyback on its result instead of running duplicate SQL queries!
  if (!bypass && inflightWaiters.has(cacheKey)) {
    inflightWaiters.get(cacheKey)!.push((entry) => {
      if (entry && !res.headersSent) {
        sendCachedEntry(req, res, entry, 'COALESCED', started);
      } else if (!res.headersSent) {
        next();
      }
    });
    return;
  }

  if (!bypass) {
    inflightWaiters.set(cacheKey, []);
  }

  // Intercept res.json() to capture & pre-compress the response buffer for future < 1ms hits
  const origJson = res.json.bind(res);
  let resolvedWaiters = false;

  const flushWaiters = (entry: CacheEntry | null) => {
    if (resolvedWaiters) return;
    resolvedWaiters = true;
    const waiters = inflightWaiters.get(cacheKey);
    if (waiters) {
      inflightWaiters.delete(cacheKey);
      for (const fn of waiters) {
        try {
          fn(entry);
        } catch {
          // ignore
        }
      }
    }
  };

  res.on('close', () => flushWaiters(null));
  res.on('finish', () => flushWaiters(null));

  res.json = ((body: any) => {
    try {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const jsonStr = JSON.stringify(body);
        const rawBuffer = Buffer.from(jsonStr, 'utf8');
        const gzipBuffer =
          rawBuffer.length > 1024 ? zlib.gzipSync(rawBuffer, { level: 6 }) : null;
        const etag = computeWeakEtag(rawBuffer);
        const ts = Date.now();
        const entry: CacheEntry = {
          statusCode: res.statusCode,
          contentType: 'application/json; charset=utf-8',
          rawBuffer,
          gzipBuffer,
          etag,
          storedAt: ts,
          freshUntil: ts + FRESH_TTL_MS,
          staleUntil: ts + STALE_TTL_MS,
        };
        evictOldestIfNeeded();
        responseCache.set(cacheKey, entry);
        flushWaiters(entry);

        const elapsedMs = Math.round((performance.now() - started) * 100) / 100;
        res.setHeader('X-Cache', bypass ? 'REVALIDATED' : 'MISS');
        res.setHeader('X-Response-Time-Ms', String(elapsedMs));
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=60');
        res.setHeader('Vary', 'Accept-Encoding');

        const acceptEncoding = String(req.headers['accept-encoding'] || '');
        if (gzipBuffer && acceptEncoding.includes('gzip')) {
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Content-Type', entry.contentType);
          res.setHeader('Content-Length', String(gzipBuffer.length));
          return res.status(res.statusCode).end(gzipBuffer);
        }

        res.setHeader('Content-Type', entry.contentType);
        res.setHeader('Content-Length', String(rawBuffer.length));
        return res.status(res.statusCode).end(rawBuffer);
      }
    } catch {
      // Fallback cleanly to default res.json
    }
    flushWaiters(null);
    return origJson(body);
  }) as any;

  return next();
}

/**
 * Lightweight zero-dependency Gzip compression for non-cached JSON endpoints (like /public/storefront).
 */
export function gzipJsonMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.VITEST) return next();
  const acceptEncoding = String(req.headers['accept-encoding'] || '');
  if (!acceptEncoding.includes('gzip')) return next();

  const origJson = res.json.bind(res);
  res.json = ((body: any) => {
    try {
      if (res.getHeader('Content-Encoding')) {
        return origJson(body);
      }
      const rawBuffer = Buffer.from(JSON.stringify(body), 'utf8');
      if (rawBuffer.length > 1024) {
        const gz = zlib.gzipSync(rawBuffer, { level: 6 });
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', String(gz.length));
        return res.status(res.statusCode).end(gz);
      }
    } catch {
      // fallback
    }
    return origJson(body);
  }) as any;

  return next();
}

/**
 * Silently pre-warms hot endpoints on startup & after writes so the very first user click
 * hits RAM in < 5ms instead of waiting 1.5–4s for remote Supabase cold queries.
 */
export async function warmHotCaches(port = activeServerPort): Promise<void> {
  if (process.env.VITEST) return;
  const base = `http://127.0.0.1:${port}`;
  try {
    // 1. Warm academy directory & discover all real tenant slugs
    const tenantsRes = await fetch(`${base}/tenants/search?nocache=1`, {
      headers: { 'x-bg-revalidate': '1' },
    });
    const tenantsJson: any = await tenantsRes.json().catch(() => null);
    if (tenantsJson?.success && Array.isArray(tenantsJson.academies)) {
      for (const a of tenantsJson.academies) {
        if (a?.slug) registerWarmTenantSlug(a.slug);
      }
    }

    const slugs = Array.from(knownWarmSlugs);
    const urls: string[] = [];
    for (const slug of slugs) {
      const enc = encodeURIComponent(slug);
      urls.push(
        `${base}/public/storefront?tenant=${enc}`,
        `${base}/site-config?tenant=${enc}`,
        `${base}/subscription/status?tenant=${enc}`,
        `${base}/academy/overview?tenant=${enc}`,
        `${base}/courses?tenant=${enc}`,
        `${base}/academy/live-sessions?tenant=${enc}`,
        `${base}/academy/students?tenant=${enc}`,
        `${base}/pay/180/payouts?tenant=${enc}&tenantId=${enc}`
      );
    }

    // Warm in parallel batches of 4 so we don't overwhelm the Supabase connection pool
    for (let i = 0; i < urls.length; i += 4) {
      const batch = urls.slice(i, i + 4);
      await Promise.all(
        batch.map((u) =>
          fetch(u, { headers: { 'x-bg-revalidate': '1' } }).catch(() => {})
        )
      );
    }
  } catch {
    // Non-fatal background warm
  }
}
