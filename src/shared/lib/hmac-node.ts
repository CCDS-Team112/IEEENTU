import { createHmac, timingSafeEqual } from "crypto";

export function hmacSha256Base64UrlNode(secret: string, data: string) {
  const hmac = createHmac("sha256", secret).update(data).digest("base64");
  return hmac.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function safeEqualNode(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

