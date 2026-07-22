import "server-only";

import { Resend } from "resend";

/**
 * Transactional email. Currently only booking enquiry notifications.
 *
 * Sending is best-effort: the enquiry is already persisted in Sanity by the
 * time we get here, so a mail failure must not turn a successful submission
 * into an error for the person who filled the form in.
 */

export type BookingNotification = {
  name: string;
  email: string;
  interest: string;
  message?: string;
  sessionTitle?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendBookingNotification(
  enquiry: BookingNotification,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_NOTIFY_TO;
  const from = process.env.BOOKING_NOTIFY_FROM;

  if (!apiKey || !to || !from) {
    return { sent: false, error: "Email is not configured" };
  }

  const rows: Array<[string, string]> = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Interest", enquiry.interest],
  ];
  if (enquiry.sessionTitle) rows.push(["Session", enquiry.sessionTitle]);
  if (enquiry.message) rows.push(["Message", enquiry.message]);

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6">
      <h2 style="margin:0 0 16px">New AFE booking enquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="font-weight:600">${label}</td><td>${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
      </table>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: enquiry.email,
      subject: `AFE enquiry — ${enquiry.name} (${enquiry.interest})`,
      html,
    });

    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
