import { base64UrlDecodeWeb } from "@/shared/lib/base64url-web";
import { hmacSha256Base64UrlWeb, safeEqualWeb } from "@/shared/lib/hmac-web";

export type SessionPayload = {
  sub: string;
  name: string;
  role: "USER" | "ADMIN";
};

export async function verifySessionTokenEdge(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSig = await hmacSha256Base64UrlWeb(secret, payloadB64);
  if (!safeEqualWeb(signature, expectedSig)) return null;

  try {
    const decoded = base64UrlDecodeWeb(payloadB64);
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

