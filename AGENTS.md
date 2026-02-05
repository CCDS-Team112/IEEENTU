# Repository Guidelines

## Project Structure & Module Organization

- `src/app/`: Next.js App Router routes, layouts, and route handlers.
  - `src/app/(public)/`: public routes (e.g., landing and login).
  - `src/app/(protected)/`: protected routes (e.g., `home`).
  - `src/app/layout.tsx`: root layout (navbar + accessibility toolbar).
  - `src/app/api/**/route.ts`: API endpoints (e.g., `src/app/api/health/route.ts`).
- `src/app/globals.css`: global styles (Tailwind via PostCSS).
- `public/`: static assets served at `/`.
- `.next/`: build output (generated; do not commit).

## Build, Test, and Development Commands

Use npm (lockfile: `package-lock.json`).

- `npm install`: install dependencies.
- `npm run dev`: start local dev server at `http://localhost:3000`.
- `npm run build`: create a production build.
- `npm start`: run the production server (requires `npm run build`).
- `npm run lint`: run ESLint (Next.js core-web-vitals + TypeScript).
- `npm run hash:password -- "<password>" [rounds]`: generate a bcrypt hash for `.env.local` (paste as-is; it escapes `$`).
- `npm run seed:user -- --email "<email>" --name "<name>" --role USER|ADMIN --password-hash "<hash>"`: create a MongoDB user record for local login.

## Coding Style & Naming Conventions

- Language: TypeScript + React (Next.js).
- Formatting: Prettier is configured via `.prettierrc` (includes `prettier-plugin-tailwindcss`).
  - Example: `npx prettier -w .`
- Linting: ESLint config lives in `eslint.config.mjs`.
- Naming:
  - React components: `PascalCase` (e.g., `UserCard.tsx`).
  - Hooks: `useSomething`.
  - API routes: `route.ts` under `src/app/api/<name>/` (Next.js convention).

## Testing Guidelines

- No test framework is configured yet (no `test` script in `package.json`).
- If you introduce tests, prefer co-locating near code (e.g., `src/**/__tests__/*`) and add a `npm test` script.
- Keep tests deterministic and avoid relying on external network calls.

## Commit & Pull Request Guidelines

- Git history is minimal (initial commits only). Use clear, scoped messages going forward.
- Recommended commit format: Conventional Commits (e.g., `feat: add health endpoint`, `fix: handle null input`).
- PRs should include:
  - What changed + why (short description).
  - Steps to test locally (commands + expected result).
  - Screenshots/GIFs for UI changes.
  - Notes on config/env changes (never commit secrets).

## Security & Configuration Tips

- Store secrets in `.env.local` (ignored by `.gitignore`).
- Don’t commit `.env*` files or private keys.
