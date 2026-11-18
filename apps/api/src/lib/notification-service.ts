import { EventEmitter } from 'events';
import { getPrisma } from './supabase';

export type NotificationEventType = 'doubt_reply' | 'live_started' | 'enrollment';

export interface NotificationPayload {
  tenantSlug: string;
  studentId: string;
  courseId?: string | null;
  type: NotificationEventType;
  title: string;
  body: string;
  linkUrl?: string | null;
}

class NotificationEventBus extends EventEmitter {}

export const notificationBus = new NotificationEventBus();

const WEBHOOK_URL = process.env.NOTIFICATION_WEBHOOK_URL || '';

/**
 * Optional non-blocking multi-channel webhook hook (WhatsApp 1-Tap / Email / Push).
 */
notificationBus.on('notification.created', (payload: NotificationPayload) => {
  if (!WEBHOOK_URL) return;
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event:
        payload.type === 'doubt_reply'
          ? 'doubt.replied'
          : payload.type === 'live_started'
            ? 'session.live_started'
            : 'course.enrolled',
      timestamp: new Date().toISOString(),
      payload,
    }),
  }).catch(() => {
    // Never block primary request path on optional external webhook
  });
});

export class NotificationService {
  static async notifyStudent(payload: NotificationPayload): Promise<void> {
    const prisma = getPrisma();
    if (prisma) {
      await prisma.studentNotification.create({
        data: {
          tenantSlug: payload.tenantSlug,
          studentId: payload.studentId,
          courseId: payload.courseId || null,
          type: payload.type,
          title: payload.title,
          body: payload.body,
          linkUrl: payload.linkUrl || null,
        },
      });
    }
    notificationBus.emit('notification.created', payload);
  }

  static async notifyMany(payloads: NotificationPayload[]): Promise<void> {
    if (payloads.length === 0) return;
    const prisma = getPrisma();
    if (prisma) {
      await prisma.studentNotification.createMany({
        data: payloads.map((p) => ({
          tenantSlug: p.tenantSlug,
          studentId: p.studentId,
          courseId: p.courseId || null,
          type: p.type,
          title: p.title,
          body: p.body,
          linkUrl: p.linkUrl || null,
        })),
      });
    }
    for (const payload of payloads) {
      notificationBus.emit('notification.created', payload);
    }
  }
}
