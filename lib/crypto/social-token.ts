import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const PREFIX = "v1";

function key32(): Buffer {
  const raw = process.env.SOCIAL_TOKEN_KEY?.trim();
  return createHash("sha256")
    .update(raw || "zylmero-social-dev-key-change-in-production")
    .digest();
}

/** Seal opaque string for at-rest storage (DB). */
export function sealSocialToken(plain: string): string {
  const key = key32();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}:${iv.toString("base64url")}:${tag.toString("base64url")}:${enc.toString("base64url")}`;
}

export function unsealSocialToken(sealed: string): string | null {
  if (!sealed.startsWith(`${PREFIX}:`)) return null;
  const parts = sealed.split(":");
  if (parts.length !== 4) return null;
  const [, ivB64, tagB64, dataB64] = parts;
  try {
    const iv = Buffer.from(ivB64!, "base64url");
    const tag = Buffer.from(tagB64!, "base64url");
    const data = Buffer.from(dataB64!, "base64url");
    const key = key32();
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
