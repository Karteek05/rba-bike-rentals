import { insertNotificationJob } from "@/lib/data/repository";
import type { NotificationJob } from "@/lib/types/domain";
import { newId } from "@/lib/utils/ids";

type NotificationPayload = Record<string, unknown>;

async function enqueue(channel: NotificationJob["channel"], params: {
  templateKey: string;
  recipient: string;
  payload: NotificationPayload;
}) {
  return insertNotificationJob({
    id: newId("notif"),
    channel,
    template_key: params.templateKey,
    recipient: params.recipient,
    payload: params.payload,
    status: "queued",
    created_at: new Date().toISOString()
  });
}

export async function notifyUser(params: {
  userId: string;
  email?: string | null;
  templateKey: string;
  payload: NotificationPayload;
}) {
  const jobs = [
    enqueue("email", {
      templateKey: params.templateKey,
      recipient: params.email || params.userId,
      payload: params.payload
    }),
    enqueue("in_app", {
      templateKey: params.templateKey,
      recipient: params.userId,
      payload: params.payload
    })
  ];
  return Promise.all(jobs);
}

export async function notifyAdmin(params: {
  templateKey: string;
  payload: NotificationPayload;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin_ops_team";
  return Promise.all([
    enqueue("email", {
      templateKey: params.templateKey,
      recipient: adminEmail,
      payload: params.payload
    }),
    enqueue("in_app", {
      templateKey: params.templateKey,
      recipient: "admin_ops_team",
      payload: params.payload
    })
  ]);
}
