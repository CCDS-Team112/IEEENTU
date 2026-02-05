import "server-only";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getSessionSecret() {
  return requiredEnv("SESSION_SECRET");
}
