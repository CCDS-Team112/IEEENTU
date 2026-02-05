import bcrypt from "bcryptjs";

const password = process.argv[2];
const rounds = Number(process.argv[3] ?? 12);

if (!password) {
  // Intentionally avoid prompting to keep this script dependency-free.
  console.error("Usage: npm run hash:password -- <password> [rounds]");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, rounds);
// Wrap in single-quotes to prevent dotenv variable expansion on `$...`.
console.log(`'${hash}'`);
