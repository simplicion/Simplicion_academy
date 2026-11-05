import { Request, Response, NextFunction } from 'express';

export interface ResolvedTenant {
  id: string;
  slug: string;
  isCustomDomain: boolean;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: ResolvedTenant;
    }
  }
}

/**
 * Universal Hostname Tenant Resolution Middleware
 * Conforms to PRD Section 5 & SAFS-01
 */
export function tenantResolutionMiddleware(platformApexDomain: string = 'simplicion.com') {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawHost = req.headers.host || '';
    // Strip port if present (e.g., localhost:3000 -> localhost)
    const host = rawHost.split(':')[0].toLowerCase();

    // 1. Manual override header for local development / testing
    const overrideSlug = req.headers['x-tenant-slug'] as string | undefined;
    if (overrideSlug) {
      req.tenant = {
        id: `tenant-${overrideSlug}`,
        slug: overrideSlug.toLowerCase(),
        isCustomDomain: false,
      };
      return next();
    }

    // 2. Check if request is on platform apex or root
    if (host === platformApexDomain || host === `platform.${platformApexDomain}` || host === 'localhost') {
      // Platform apex (marketing / teacher signup / platform super admin)
      return next();
    }

    // 3. Check for tenant subdomain (e.g., cuet.simplicion.com)
    if (host.endsWith(`.${platformApexDomain}`)) {
      const subdomain = host.replace(`.${platformApexDomain}`, '').trim();
      if (subdomain && !['admin', 'studio', 'api', 'docs'].includes(subdomain)) {
        req.tenant = {
          id: `tenant-${subdomain}`,
          slug: subdomain,
          isCustomDomain: false,
        };
        return next();
      }
    }

    // 4. Custom Vanity Domain (e.g., humanitiescuet.com)
    req.tenant = {
      id: `tenant-custom-${host.replace(/[^a-z0-9]/g, '-')}`,
      slug: host,
      isCustomDomain: true,
    };

    next();
  };
}

