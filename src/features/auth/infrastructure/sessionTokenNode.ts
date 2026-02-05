import { base64UrlDecodeNode, base64UrlEncodeNode } from "@/shared/lib/base64url-node";
import { hmacSha256Base64UrlNode, safeEqualNode } from "@/shared/lib/hmac-node";

export type SessionPayload = {
  sub: string;
  name: string;
  role: "USER" | "ADMIN";
};

export function signSessionToken(payload: SessionPayload, secret: string) {
  const payloadB64 = base64UrlEncodeNode(JSON.stringify(payload));
  const signature = hmacSha256Base64UrlNode(secret, payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSig = hmacSha256Base64UrlNode(secret, payloadB64);
  if (!safeEqualNode(signature, expectedSig)) return null;

  try {
    const decoded = base64UrlDecodeNode(payloadB64);
    const payload = JSON.parse(decoded) as unknown;
    if (
      !payload ||
      typeof payload !== "object" ||
      !("sub" in payload) ||
      !("name" in payload) ||
      !("role" in payload)
    ) {
      return null;
    }

    const { sub, name, role } = payload as Record<string, unknown>;
    if (typeof sub !== "string" || typeof name !== "string") return null;
    if (role !== "USER" && role !== "ADMIN") return null;

    return { sub, name, role };
  } catch {
    return null;
  }
}

