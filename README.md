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
USER_PASSWORD_HASH=\$2a\$12\$...

ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Sample Admin
ADMIN_PASSWORD_HASH=\$2a\$12\$...
```

Generate a bcrypt hash:

```bash
npm run hash:password -- "your password here"
```

Paste the output into `.env.local` exactly as printed (it escapes `$` as `\$` to
avoid Next’s dotenv expansion).

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

## MongoDB:

Username: transonviet2004_db_user
password: a7jMVpEXRmW4SpDt
mongo_uri: mongodb+srv://transonviet2004_db_user:a7jMVpEXRmW4SpDt@cluster0.u918sfq.mongodb.net/?appName=Cluster0
