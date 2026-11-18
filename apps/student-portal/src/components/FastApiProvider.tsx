'use client';

import { useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const FRESH_MS = 12_000;
const STALE_MS = 120_000;

interface ClientCacheEntry {
  status: number;
  statusText: string;
  headers: Array<[string, string]>;
  bodyText: string;
  freshUntil: number;
  staleUntil: number;
}

const clientGetCache = new Map<string, ClientCacheEntry>();
const clientInflight = new Map<string, Promise<ClientCacheEntry | null>>();

export function clearClientApiCache() {
  clientGetCache.clear();
}

function buildResponse(entry: ClientCacheEntry): Response {
  return new Response(entry.bodyText, {
    status: entry.status,
    statusText: entry.statusText,
    headers: entry.headers,
  });
}

export function FastApiProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).__SIMPLICION_FAST_FETCH_INSTALLED__) return;
    (window as any).__SIMPLICION_FAST_FETCH_INSTALLED__ = true;

    const nativeFetch = window.fetch.bind(window);

    const runNetworkFetch = (url: string, init?: RequestInit): Promise<ClientCacheEntry | null> => {
      const existing = clientInflight.get(url);
      if (existing) return existing;

      const p = nativeFetch(url, init)
        .then(async (res) => {
          if (!res.ok) return null;
          const bodyText = await res.text();
          const headers: Array<[string, string]> = [];
          res.headers.forEach((v, k) => {
            if (k.toLowerCase() !== 'content-encoding' && k.toLowerCase() !== 'content-length') {
              headers.push([k, v]);
            }
          });
          const now = Date.now();
          const entry: ClientCacheEntry = {
            status: res.status,
            statusText: res.statusText,
            headers,
            bodyText,
            freshUntil: now + FRESH_MS,
            staleUntil: now + STALE_MS,
          };
          clientGetCache.set(url, entry);
          return entry;
        })
        .catch(() => null)
        .finally(() => {
          clientInflight.delete(url);
        });

      clientInflight.set(url, p);
      return p;
    };

    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = (init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET') || 'GET').toUpperCase();

      if (!url.startsWith(API_BASE_URL)) {
        return nativeFetch(input, init);
      }

      if (method !== 'GET' && method !== 'HEAD') {
        const res = await nativeFetch(input, init);
        if (res.ok) {
          clientGetCache.clear();
        }
        return res;
      }

      if (url.includes('nocache=1')) {
        return nativeFetch(input, init);
      }

      const now = Date.now();
      const cached = clientGetCache.get(url);
      if (cached) {
        if (now <= cached.freshUntil) {
          return buildResponse(cached);
        }
        if (now <= cached.staleUntil) {
          runNetworkFetch(url, init).catch(() => {});
          return buildResponse(cached);
        }
      }

      const fetched = await runNetworkFetch(url, init);
      if (fetched) {
        return buildResponse(fetched);
      }
      return nativeFetch(input, init);
    }) as typeof window.fetch;

    const invalidateEvents = [
      'simplicion-auth-changed',
      'simplicion-notifications-updated',
    ];
    invalidateEvents.forEach((ev) => window.addEventListener(ev, clearClientApiCache));

    return () => {
      invalidateEvents.forEach((ev) => window.removeEventListener(ev, clearClientApiCache));
    };
  }, []);

  return null;
}
