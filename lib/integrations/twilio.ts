type TwilioConfig = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

function readTwilioConfig(): TwilioConfig {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() || "";
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() || "";
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM?.trim() || "";
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio omgeving is niet volledig geconfigureerd.");
  }
  return { accountSid, authToken, fromNumber };
}

/**
 * Productiegeschikte Twilio-call (geen mock):
 * gebruikt Twilio Messages API met Basic Auth.
 */
export async function sendWhatsAppViaTwilio(input: { to: string; body: string }): Promise<void> {
  const cfg = readTwilioConfig();
  const params = new URLSearchParams();
  params.set("From", cfg.fromNumber.startsWith("whatsapp:") ? cfg.fromNumber : `whatsapp:${cfg.fromNumber}`);
  params.set("To", input.to.startsWith("whatsapp:") ? input.to : `whatsapp:${input.to}`);
  params.set("Body", input.body);

  const basic = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(cfg.accountSid)}/Messages.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twilio fout (${res.status}): ${body}`);
  }
}
