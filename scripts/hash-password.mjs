import bcrypt from "bcryptjs";

const password = process.argv[2];
const rounds = Number(process.argv[3] ?? 12);

if (!password) {
  // Intentionally avoid prompting to keep this script dependency-free.
  console.error("Usage: npm run hash:password -- <password> [rounds]");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, rounds);
// Next.js loads `.env.local` with dotenv expansion. Bcrypt hashes contain `$...`,
// which can be treated as variable expansion. Escape `$` so it's safe to paste.
const escapedForDotenvExpand = hash.replace(/\$/g, "\\$");
console.log(escapedForDotenvExpand);
