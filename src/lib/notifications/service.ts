import { insertNotificationJob } from "@/lib/data/repository";
import { sendSmtpMail } from "@/lib/integrations/smtp";
import type { NotificationJob } from "@/lib/types/domain";
import { newId } from "@/lib/utils/ids";

type NotificationPayload = Record<string, unknown>;

function smtpReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM);
}

function formatMoney(value: unknown) {
  return typeof value === "number" ? `Rs. ${value.toLocaleString("en-IN")}` : "the payable amount";
}

function buildUserEmail(params: {
  templateKey: string;
  payload: NotificationPayload;
}) {
  if (params.templateKey === "booking_approved_pay_now") {
    return {
      subject: "Your RBA booking is approved",
      text: [
        "Your RBA booking has been confirmed by the admin team.",
        "",
        `Booking ID: ${String(params.payload.booking_id ?? "")}`,
        `Vehicle: ${String(params.payload.vehicle_id ?? "")}`,
        `Amount: ${formatMoney(params.payload.total_payable)}`,
        params.payload.payment_url ? `Payment link: ${String(params.payload.payment_url)}` : "",
        "",
        "You can pay now from My Bookings. After payment, the team will coordinate pickup for the bike."
      ].filter(Boolean).join("\n")
    };
  }

  if (params.templateKey === "booking_submitted") {
    return {
      subject: "We received your RBA booking request",
      text: [
        "We received your booking request.",
        "",
        `Booking ID: ${String(params.payload.booking_id ?? "")}`,
        `Vehicle: ${String(params.payload.vehicle_id ?? "")}`,
        "",
        "The team will review availability and update the booking status."
      ].join("\n")
    };
  }

  return null;
}

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
  const recipient = params.email || params.userId;
  const jobs: Array<Promise<unknown>> = [
    enqueue("email", {
      templateKey: params.templateKey,
      recipient,
      payload: params.payload
    }),
    enqueue("in_app", {
      templateKey: params.templateKey,
      recipient: params.userId,
      payload: params.payload
    })
  ];

  const email = buildUserEmail(params);
  if (email && params.email && smtpReady()) {
    jobs.push(
      sendSmtpMail({
        to: params.email,
        subject: email.subject,
        text: email.text
      }).catch((error) =>
        enqueue("email", {
          templateKey: `${params.templateKey}_smtp_failed`,
          recipient,
          payload: {
            ...params.payload,
            error: error instanceof Error ? error.message : "SMTP send failed"
          }
        })
      )
    );
  }

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
