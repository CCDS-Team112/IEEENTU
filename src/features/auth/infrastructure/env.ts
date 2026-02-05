import "server-only";

export type AuthRole = "USER" | "ADMIN";

export type AuthAccount = {
  role: AuthRole;
  email: string;
  passwordHash: string;
  name: string;
  sub: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getAuthAccounts(): AuthAccount[] {
  const userEmail = requiredEnv("USER_EMAIL");
  const userPasswordHash = requiredEnv("USER_PASSWORD_HASH");
  const adminEmail = requiredEnv("ADMIN_EMAIL");
  const adminPasswordHash = requiredEnv("ADMIN_PASSWORD_HASH");

  const userName = process.env.USER_NAME || "User";
  const adminName = process.env.ADMIN_NAME || "Admin";

  return [
    {
      role: "USER",
      email: userEmail,
      passwordHash: userPasswordHash,
      name: userName,
      sub: "user",
    },
    {
      role: "ADMIN",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: adminName,
      sub: "admin",
    },
  ];
}

export function getSessionSecret() {
  return requiredEnv("SESSION_SECRET");
}
