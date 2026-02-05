import "server-only";

export type AuthRole = "USER" | "ADMIN" | "DOCTOR";

export type AuthAccount = {
  role: AuthRole;
  email: string;
  passwordHash: string;
  name: string;
  sub: string;
};

function normalizeBcryptHash(value: string) {
  // Allow storing hashes as `\$2a\$12\$...` in `.env.local` to avoid dotenv expansion.
  return value.replace(/\\\$/g, "$");
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getAuthAccounts(): AuthAccount[] {
  const userEmail = requiredEnv("USER_EMAIL");
  const userPasswordHash = normalizeBcryptHash(requiredEnv("USER_PASSWORD_HASH"));
  const adminEmail = requiredEnv("ADMIN_EMAIL");
  const adminPasswordHash = normalizeBcryptHash(
    requiredEnv("ADMIN_PASSWORD_HASH"),
  );

  const userName = process.env.USER_NAME || "User";
  const adminName = process.env.ADMIN_NAME || "Admin";
  const doctorEmail = process.env.DOCTOR_EMAIL;
  const doctorPasswordHash = process.env.DOCTOR_PASSWORD_HASH
    ? normalizeBcryptHash(process.env.DOCTOR_PASSWORD_HASH)
    : null;
  const doctorName = process.env.DOCTOR_NAME || "Doctor";

  const accounts: AuthAccount[] = [
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

  if (doctorEmail && doctorPasswordHash) {
    accounts.push({
      role: "DOCTOR",
      email: doctorEmail,
      passwordHash: doctorPasswordHash,
      name: doctorName,
      sub: "doctor",
    });
  }

  return accounts;
}

export function getSessionSecret() {
  return requiredEnv("SESSION_SECRET");
}
