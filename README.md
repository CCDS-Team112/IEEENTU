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
SESSION_SECRET=dev-only-change-me-to-a-long-random-string
MONGODB_URI=mongodb+srv://...
MONGODB_DB=access_starter
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
