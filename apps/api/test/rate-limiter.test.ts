import { describe, it, expect, beforeEach } from 'vitest';
import { SlidingWindowRateLimiter } from '../src/middleware/rate-limiter';

describe('Sliding-Window Rate Limiter Middleware', () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    limiter = new SlidingWindowRateLimiter({
      windowMs: 60 * 1000, // 1 minute for test
      maxRequests: 3, // Max 3 requests
      message: 'Too many requests.',
    });
  });

  it('allows requests up to the maximum limit and sets correct rate limit headers', () => {
    const middleware = limiter.middleware();
    const req: any = { ip: '192.168.1.1', body: { phone: '9876543210' } };
    const headers: Record<string, string> = {};
    const res: any = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
    };

    let nextCount = 0;
    const next = () => {
      nextCount++;
    };

    // 1st request
    middleware(req, res, next);
    expect(nextCount).toBe(1);
    expect(headers['X-RateLimit-Limit']).toBe('3');
    expect(headers['X-RateLimit-Remaining']).toBe('2');

    // 2nd request
    middleware(req, res, next);
    expect(nextCount).toBe(2);
    expect(headers['X-RateLimit-Remaining']).toBe('1');

    // 3rd request (at limit)
    middleware(req, res, next);
    expect(nextCount).toBe(3);
    expect(headers['X-RateLimit-Remaining']).toBe('0');
  });

  it('throttles with HTTP 429 and Retry-After header when threshold exceeded', () => {
    const middleware = limiter.middleware();
    const req: any = { ip: '10.0.0.1', body: { phone: '9876543210' } };
    const headers: Record<string, string> = {};
    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
      status: (code: number) => {
        statusCode = code;
        return {
          json: (body: any) => {
            jsonBody = body;
          },
        };
      },
    };

    let nextCount = 0;
    const next = () => {
      nextCount++;
    };

    // Send 3 requests (all allowed)
    middleware(req, res, next);
    middleware(req, res, next);
    middleware(req, res, next);
    expect(nextCount).toBe(3);

    // 4th request must be throttled with 429
    middleware(req, res, next);
    expect(nextCount).toBe(3); // Next not called
    expect(statusCode).toBe(429);
    expect(jsonBody.success).toBe(false);
    expect(jsonBody.error).toBe('Too many requests.');
    expect(headers['Retry-After']).toBeDefined();
    expect(Number(headers['Retry-After'])).toBeGreaterThan(0);
  });

  it('maintains independent rate limit counters for distinct clients', () => {
    const middleware = limiter.middleware();
    const reqClientA: any = { ip: '1.1.1.1', body: { phone: '9111111111' } };
    const reqClientB: any = { ip: '2.2.2.2', body: { phone: '9222222222' } };

    const res: any = {
      setHeader: () => {},
      status: () => ({ json: () => {} }),
    };

    let nextA = 0;
    let nextB = 0;

    // Client A exhausts quota (3 requests)
    middleware(reqClientA, res, () => nextA++);
    middleware(reqClientA, res, () => nextA++);
    middleware(reqClientA, res, () => nextA++);
    expect(nextA).toBe(3);

    // Client A is blocked
    middleware(reqClientA, res, () => nextA++);
    expect(nextA).toBe(3);

    // Client B can still make requests normally
    middleware(reqClientB, res, () => nextB++);
    expect(nextB).toBe(1);
  });
});

