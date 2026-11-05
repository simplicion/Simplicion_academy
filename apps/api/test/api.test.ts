import { describe, it, expect } from 'vitest';
import { tenantResolutionMiddleware } from '../src/middleware/tenant-resolution';

describe('Thin Delivery API & Hostname Tenant Resolution Middleware', () => {
  const middleware = tenantResolutionMiddleware('simplicion.com');

  it('should resolve tenant from subdomain (cuet.simplicion.com)', () => {
    const req: any = { headers: { host: 'cuet.simplicion.com' } };
    const res: any = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.tenant).toBeDefined();
    expect(req.tenant?.slug).toBe('cuet');
    expect(req.tenant?.isCustomDomain).toBe(false);
  });

  it('should resolve tenant from custom domain (humanitiescuet.com)', () => {
    const req: any = { headers: { host: 'humanitiescuet.com' } };
    const res: any = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.tenant).toBeDefined();
    expect(req.tenant?.slug).toBe('humanitiescuet.com');
    expect(req.tenant?.isCustomDomain).toBe(true);
  });

  it('should allow header override for testing (x-tenant-slug)', () => {
    const req: any = { headers: { host: 'localhost:4000', 'x-tenant-slug': 'cuet' } };
    const res: any = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.tenant?.slug).toBe('cuet');
  });

  it('should not set tenant on platform apex or admin routes', () => {
    const req: any = { headers: { host: 'simplicion.com' } };
    const res: any = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.tenant).toBeUndefined();
  });
});

