import "server-only";

import bcrypt from "bcryptjs";

export async function verifyPassword(password: string, hash: string) {
  // bcryptjs is CPU-heavy; keep this on the server.
  return bcrypt.compare(password, hash);
}
