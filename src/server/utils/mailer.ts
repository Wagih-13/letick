export type MailInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  fromOverride?: string;
};

export async function sendMail(input: MailInput) {
  // Lazy-load nodemailer to avoid bundling it in routes that don't send email
  const nodemailer = (await import("nodemailer")).default;
  // Prefer generic SMTP_* envs, fallback to GMAIL_SMTP_* for backward compatibility
  const service = (process.env.EMAIL_SERVICE || "").toLowerCase();
  const host = process.env.SMTP_HOST || process.env.GMAIL_SMTP_HOST || (service === "gmail" ? "smtp.gmail.com" : undefined) || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || process.env.GMAIL_SMTP_PORT || (service === "gmail" ? 465 : 587));
  const secure = port === 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_FROM;
  const pass = process.env.SMTP_PASSWORD || process.env.GMAIL_SMTP_PASS || process.env.EMAIL_PASSWORD;
  if (!user || !pass) throw new Error("Missing SMTP_USER/SMTP_PASSWORD (or Gmail fallbacks)");

  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  const from = input.fromOverride || process.env.EMAIL_FROM || user;

  const info = await transporter.sendMail({ from, to: input.to, subject: input.subject, html: input.html, text: input.text });
  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected } as any;
}
