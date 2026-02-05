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

## Contact Doctor (Sprint 1)

The Contact Doctor flow creates a Google Calendar event with a Google Meet link,
sends the link via email, and stores the appointment in a JSON file.

### Required env vars

Add these to `.env.local`:

```bash
GOOGLE_OAUTH_CLIENT_ID=your-oauth-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-oauth-client-secret
GOOGLE_OAUTH_REFRESH_TOKEN=your-refresh-token
GOOGLE_CALENDAR_ID=thechampions.intuition@gmail.com
```

Notes:
- Google Calendar sends invitations directly to attendee emails.

### Google Calendar setup (OAuth)

1. Create a Google Cloud project and enable the Google Calendar API.
2. Create an OAuth Client ID (Desktop or Web).
3. Generate a refresh token for your Google account with the scope:
   `https://www.googleapis.com/auth/calendar`.
4. Set `GOOGLE_CALENDAR_ID` to the organizer email (your Gmail).

### Appointment storage

Appointments are stored at `data/appointments.json` after the first booking.

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
