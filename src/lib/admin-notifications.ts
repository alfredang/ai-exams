import { db } from '@/lib/db';

export type NotifyKind =
  | 'webhook.failed'
  | 'order.refund'
  | 'inventory.low'
  | 'generation.failed'
  | 'email.failed'
  | 'enquiry.new'
  | 'manual';

export async function notify(input: {
  kind: NotifyKind;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await db.adminNotification.create({
      data: {
        kind: input.kind,
        title: input.title.slice(0, 200),
        body: input.body?.slice(0, 1000) ?? null,
        link: input.link ?? null
      }
    });
  } catch {
    // Notifications must never break the calling flow.
  }
}
