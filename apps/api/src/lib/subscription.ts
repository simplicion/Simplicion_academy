import { getPrisma } from './supabase';

export const TEACHER_SUBSCRIPTION_AMOUNT_INR = 250;

export interface TeacherSubscriptionState {
  isActive: boolean;
  status: 'active' | 'inactive' | 'expired';
  planAmountInr: number;
  currency: 'INR';
  interval: 'monthly';
  subscriptionId?: string;
  activatedAt?: string;
  expiresAt?: string;
  paymentMethod?: string;
}

// In-memory fallback for unit tests / offline mode
const memorySubscriptions = new Map<string, TeacherSubscriptionState>();

function evaluateState(raw?: any): TeacherSubscriptionState {
  if (!raw || raw.status !== 'active') {
    return {
      isActive: false,
      status: 'inactive',
      planAmountInr: TEACHER_SUBSCRIPTION_AMOUNT_INR,
      currency: 'INR',
      interval: 'monthly',
    };
  }

  const now = Date.now();
  const expMs = raw.expiresAt ? new Date(raw.expiresAt).getTime() : 0;
  if (expMs > 0 && expMs <= now) {
    return {
      isActive: false,
      status: 'expired',
      planAmountInr: TEACHER_SUBSCRIPTION_AMOUNT_INR,
      currency: 'INR',
      interval: 'monthly',
      subscriptionId: raw.subscriptionId,
      activatedAt: raw.activatedAt,
      expiresAt: raw.expiresAt,
      paymentMethod: raw.paymentMethod,
    };
  }

  return {
    isActive: true,
    status: 'active',
    planAmountInr: Number(raw.planAmountInr || raw.amount || TEACHER_SUBSCRIPTION_AMOUNT_INR),
    currency: 'INR',
    interval: 'monthly',
    subscriptionId: raw.subscriptionId,
    activatedAt: raw.activatedAt,
    expiresAt: raw.expiresAt,
    paymentMethod: raw.paymentMethod,
  };
}

export async function getTeacherSubscription(
  tenantSlug = 'cuet-humanities'
): Promise<TeacherSubscriptionState> {
  const normalized = tenantSlug.toLowerCase();
  const prisma = getPrisma();

  if (prisma) {
    try {
      const tenant =
        (await prisma.tenant.findUnique({
          where: { slug: normalized },
          include: { settings: true },
        })) ||
        (await prisma.tenant.findUnique({
          where: { slug: 'cuet-humanities' },
          include: { settings: true },
        }));

      const enabledModules = (tenant?.settings?.enabledModules as Record<string, any>) || {};
      return evaluateState(enabledModules.teacherSubscription);
    } catch {
      // fallback to memory
    }
  }

  return evaluateState(memorySubscriptions.get(normalized));
}

export async function activateTeacherSubscription(
  tenantSlug = 'cuet-humanities',
  details: {
    subscriptionId: string;
    paymentMethod?: string;
    teacherName?: string;
    email?: string;
  }
): Promise<TeacherSubscriptionState> {
  const normalized = tenantSlug.toLowerCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const record = {
    status: 'active' as const,
    planAmountInr: TEACHER_SUBSCRIPTION_AMOUNT_INR,
    currency: 'INR' as const,
    interval: 'monthly' as const,
    subscriptionId: details.subscriptionId,
    paymentMethod: details.paymentMethod || '180_pay_upi',
    teacherName: details.teacherName || 'Educator',
    email: details.email || null,
    activatedAt: now.toISOString(),
    expiresAt,
  };

  memorySubscriptions.set(normalized, { ...record, isActive: true });

  const prisma = getPrisma();
  if (prisma) {
    try {
      const tenant =
        (await prisma.tenant.findUnique({
          where: { slug: normalized },
          include: { settings: true },
        })) ||
        (await prisma.tenant.findUnique({
          where: { slug: 'cuet-humanities' },
          include: { settings: true },
        }));

      if (tenant?.settings) {
        const currentModules = (tenant.settings.enabledModules as Record<string, any>) || {};
        await prisma.tenantSettings.update({
          where: { tenantId: tenant.id },
          data: {
            enabledModules: {
              ...currentModules,
              teacherSubscription: record,
            },
          },
        });
      }
    } catch (err: any) {
      console.warn('[Subscription] Supabase persist warning:', err?.message);
    }
  }

  return evaluateState(record);
}

export async function deactivateTeacherSubscription(
  tenantSlug = 'cuet-humanities'
): Promise<TeacherSubscriptionState> {
  const normalized = tenantSlug.toLowerCase();
  memorySubscriptions.delete(normalized);

  const prisma = getPrisma();
  if (prisma) {
    try {
      const tenant =
        (await prisma.tenant.findUnique({
          where: { slug: normalized },
          include: { settings: true },
        })) ||
        (await prisma.tenant.findUnique({
          where: { slug: 'cuet-humanities' },
          include: { settings: true },
        }));

      if (tenant?.settings) {
        const currentModules = (tenant.settings.enabledModules as Record<string, any>) || {};
        await prisma.tenantSettings.update({
          where: { tenantId: tenant.id },
          data: {
            enabledModules: {
              ...currentModules,
              teacherSubscription: { status: 'inactive', planAmountInr: TEACHER_SUBSCRIPTION_AMOUNT_INR },
            },
          },
        });
      }
    } catch {
      // ignore
    }
  }

  return evaluateState(null);
}
