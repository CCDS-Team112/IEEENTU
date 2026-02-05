## Access Starter

Accessibility-first Next.js skeleton with:

- Public landing (`/`) and login (`/login`)
- Protected home (`/home`) guarded by `src/middleware.ts`
- Signed, httpOnly session cookie (contains only `sub`, `name`, `role`)
- Global accessibility toolbar (high contrast + font scaling)

## Setup

```bash
npm install
```

Configure local credentials in `.env.local`.

Required env vars:

```bash
SESSION_SECRET=dev-only-change-me

USER_EMAIL=user@example.com
USER_NAME=Sample User
USER_PASSWORD_HASH='...'

ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Sample Admin
ADMIN_PASSWORD_HASH='...'
```

Generate a bcrypt hash:

```bash
npm run hash:password -- "your password here"
```

Paste the output into `.env.local` **including the quotes** (bcrypt hashes start
with `$...`, and Next’s dotenv expansion can otherwise treat them like variables).

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Repo Structure (high level)

```text
src/
  app/
    (public)/
      page.tsx
      login/page.tsx
    (protected)/
      home/page.tsx
    layout.tsx
    globals.css
  middleware.ts
  features/
    auth/
    accessibility/
  shared/
```
