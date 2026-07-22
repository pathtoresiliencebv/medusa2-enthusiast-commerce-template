import nodemailer from "nodemailer";

export type SupportNotification = {
  id: string;
  type: string;
  subject: string;
  message: string;
  customer?: { id: string; email?: string; first_name?: string; last_name?: string } | null;
  order?: { id: string; display_id?: number | string } | null;
  transcript?: unknown;
};

export async function sendSupportNotification(input: SupportNotification) {
  const host = process.env.SUPPORT_SMTP_HOST;
  const user = process.env.SUPPORT_SMTP_USER;
  const pass = process.env.SUPPORT_SMTP_PASSWORD;
  if (!host || !user || !pass) throw new Error("SMTP is niet geconfigureerd");

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SUPPORT_SMTP_PORT || 465),
    secure: (process.env.SUPPORT_SMTP_SECURE || "true") === "true",
    auth: { user, pass },
  });
  const customer = input.customer
    ? `${input.customer.first_name || ""} ${input.customer.last_name || ""} <${input.customer.email || input.customer.id}>`.trim()
    : "Gast";
  const transcript = JSON.stringify(input.transcript || [], null, 2).slice(0, 25_000);
  await transporter.sendMail({
    from: process.env.SUPPORT_FROM || user,
    to: process.env.SUPPORT_INBOX || "support@example.com",
    subject: `[LVRO support ${input.id}] ${input.subject}`,
    text: [
      `Case-ID: ${input.id}`,
      `Categorie: ${input.type}`,
      `Klant: ${customer}`,
      `Bestelling: ${input.order?.display_id || input.order?.id || "niet geselecteerd"}`,
      "",
      input.message,
      "",
      "Transcript:",
      transcript,
    ].join("\n"),
  });
}
