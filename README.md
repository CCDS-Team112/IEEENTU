## Access Starter

Accessibility-first Next.js skeleton with:

- Public landing (`/`) and login (`/login`)
- Protected home (`/home`) guarded by `src/middleware.ts`
- Signed, httpOnly session cookie (contains only `sub`, `name`, `role`)
- Global accessibility toolbar (high contrast + font scaling)

## Setup

Install dependencies:

```bash
npm install
```

Run commands from the project folder (the one containing `package.json`), e.g.:

```bash
cd "C:\Users\hname\OneDrive\Desktop\IEEE Hackathon\my-hackathon-app"
```

Create a `.env.local` (never commit secrets):

```bash
USER_EMAIL=user@example.com
USER_PASSWORD=password
```

## Create users (MongoDB)

Users are stored in MongoDB (not in env). Generate a bcrypt hash:

```bash
npm run hash:password -- "your password here"
```

Seed a user into MongoDB:

```bash
npm run seed:user -- --email "user@example.com" --name "Sample User" --role USER --password-hash "<paste hash here>"
```

Repeat with `--role ADMIN` for an admin account.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Health Chat Test Page

1. Add your Gemini key to `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
```

2. Start the app with `npm run dev` and open `http://localhost:3000/health-chat-test`.

This route is test-only and uses `/api/health-intake` to extract intake fields with the Gemini SDK.

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
