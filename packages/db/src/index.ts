/**
 * @simplicion/db
 * Multi-Tenant Scoped Database Access Layer
 */

export interface TenantContext {
  tenantId: string;
}

/**
 * Ensures any query payload is strictly bound to the requested tenantId.
 * Throws a fatal security error if an attempt is made to query or mutate across tenant boundaries.
 */
export function enforceTenantScope<T extends { tenantId?: string }>(
  payload: T,
  context: TenantContext
): T & { tenantId: string } {
  if (payload.tenantId && payload.tenantId !== context.tenantId) {
    throw new Error(
      `Cross-Tenant Security Violation: Query tenantId "${payload.tenantId}" does not match active context "${context.tenantId}".`
    );
  }
  return {
    ...payload,
    tenantId: context.tenantId,
  };
}

export * from './repositories/prisma-tenant.repository';
export * from './repositories/prisma-offering.repository';
export * from './repositories/prisma-order.repository';
export * from './repositories/prisma-user.repository';
export * from './repositories/prisma-assessment.repository';
