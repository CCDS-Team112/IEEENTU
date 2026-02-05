import { headers } from "next/headers";

export async function getServerBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${protocol}://${host}`;
}
