/** Vriendelijke NL-label voor gespreks-/berichtkanaal. */
export function channelLabelNl(channel: string | null | undefined): string {
  const c = (channel || "").trim().toLowerCase();
  if (!c) return "Kanaal";
  const map: Record<string, string> = {
    whatsapp: "WhatsApp",
    email: "E-mail",
    mail: "E-mail",
    webchat: "Webchat",
    widget: "Webchat",
    inbox: "Inbox",
    sms: "SMS",
  };
  return map[c] ?? c.charAt(0).toUpperCase() + c.slice(1);
}
