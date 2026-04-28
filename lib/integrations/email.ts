export type EmailRuntimeConfig = {
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  secureSmtp: boolean;
};

/**
 * IMAP/SMTP structuur voor productie:
 * - Inbound parsing via IMAP polling / IDLE worker
 * - Outbound replies via SMTP transport
 */
export function readEmailRuntimeConfig(): EmailRuntimeConfig {
  const imapHost = process.env.EMAIL_IMAP_HOST?.trim() || "";
  const smtpHost = process.env.EMAIL_SMTP_HOST?.trim() || "";
  const username = process.env.EMAIL_USERNAME?.trim() || "";
  const password = process.env.EMAIL_PASSWORD?.trim() || "";
  const imapPort = Number(process.env.EMAIL_IMAP_PORT || 993);
  const smtpPort = Number(process.env.EMAIL_SMTP_PORT || 587);
  const secureSmtp = String(process.env.EMAIL_SMTP_SECURE || "false") === "true";

  if (!imapHost || !smtpHost || !username || !password) {
    throw new Error("E-mail omgeving is niet volledig geconfigureerd.");
  }
  return { imapHost, imapPort, smtpHost, smtpPort, username, password, secureSmtp };
}
