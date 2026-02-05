# PRD: Accessibility First Next.js Skeleton (Landing, Auth, Protected Home)

## 1) Context and intent
This PRD defines a low complexity base skeleton that is immediately demoable and sets up clean extension points for future features. The focus is an accessibility first UI that works well for visually impaired users, while keeping implementation scope intentionally small for hackathon speed.

---

## 2) Product overview
**Product name (working):** Access Starter  
**Type:** Web app skeleton (MVP foundation)  
**Primary audience:** Hackathon team, judges, future contributors  
**Core idea:** Ship a polished, accessible, production shaped Next.js app with authentication, route protection, and an accessibility first UI system, plus minimal instrumentation hooks for future before vs after evaluation.

---

## 3) Goals
1. Provide a clean Next.js foundation with:
   - Landing page (public)
   - Login page (public)
   - Home page (protected)
   - Sign out (clears session)
2. Bake in accessibility defaults for visually impaired users:
   - High contrast mode
   - Font size scaling
   - Strong focus states and keyboard navigation
   - Screen reader friendly structure
3. Keep complexity low while enabling future adaptive and AI features:
   - Feature based structure
   - Clear boundaries for auth, preferences, and UI components
   - Minimal metrics hooks to support baseline vs improved demos later

---

## 4) Non-goals (for this skeleton)
- Database and user profile management
- Roles, permissions, admin panel
- Payments, notifications, file uploads
- Full AI personalization logic (only extension points, no heavy models)

---

## 5) Success criteria
### Functional
- A new developer can run the app locally within 5 minutes
- Auth flow works end-to-end: login → protected home → sign out → redirected

### Accessibility and UX
- All pages navigable by keyboard only
- Forms have labels, helpful error messages, and accessible focus handling
- High contrast and font scaling work across all pages

### Hackathon readiness
- Repository includes clear execution instructions in `README.md`
- App is stable for a live demo without manual intervention
- No external secrets required for the default demo login

---

## 6) Scope and user stories

### Personas
- **Visitor:** not logged in, exploring landing page
- **User:** logged in, can access home and sign out
- **Judge:** evaluates usability quickly, often using keyboard and zoom

### User stories with acceptance criteria

#### US1: View landing page
As a visitor, I can view a landing page that explains the product and has a clear call to action.
- Landing route is `/`
- Contains “Log in” button that routes to `/login`
- Contains “Skip to content” link
- Works at 200% browser zoom without layout breaking

#### US2: Log in
As a visitor, I can log in using a minimal, low friction method.
- Login route is `/login`
- At least one login method works without external secrets (Demo Auth)
- Error states are visible and announced to assistive tech (aria-live)

#### US3: Access protected home
As a user, I can access `/home` only when authenticated.
- Unauthenticated visits to `/home` redirect to `/login`
- Authenticated visits render home page content

#### US4: Sign out
As a user, I can sign out and be returned to the landing page.
- Sign out clears session
- User is redirected to `/`
- `/home` becomes inaccessible again

#### US5: Accessibility preferences
As a visually impaired user, I can quickly adjust contrast and font size.
- An accessibility toolbar is visible on all pages
- Controls include: Contrast toggle, Font size cycle (100%, 115%, 130%)
- Preferences persist across refresh (localStorage or cookies)
- Focus ring is clearly visible on interactive elements

---

## 7) Functional requirements

### Routing
- `/` Landing (public)
- `/login` Login (public)
- `/home` Home (protected)

### Authentication (low complexity)

1) **Optional Auth.js adapter (future ready)**
- Add OAuth providers later if desired
- Keep as an adapter, not required for the MVP skeleton

### Route protection
- Use Next.js middleware to guard `/home`
- If unauthenticated, redirect to `/login`

### UI layout
Shared layout with:
- Top navigation
- Skip link
- Accessibility toolbar
- Consistent container spacing and typography

---

## 8) Non-functional requirements

### Accessibility (must-have)
Minimum requirements:
- Semantic HTML landmarks: `header`, `main`, `nav`, `footer`
- Proper labels for all inputs
- Visible focus states for keyboard navigation
- High contrast mode using design tokens
- Font scaling without overflow
- Respect `prefers-reduced-motion` by disabling non-essential animations
- Interactive elements meet minimum touch target size

### Performance
- No blocking calls on initial page load
- Lightweight client scripts
- Graceful behavior on slow devices: toolbar and nav still work even if JS is delayed

### Reliability
- Must work reliably during a live demo without manual intervention
- No dependency on external API keys for baseline run

---

## 9) Technical design and clean architecture

### Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI based components for accessible primitives)
- class-variance-authority, clsx, tailwind-merge (component variants and clean class composition)
- lucide-react (icons)
- react-hook-form + zod (forms and validation)
- next-themes (theme management)

### Project structure (feature based)
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
      ui/
        LoginForm.tsx
        UserMenu.tsx
      application/
        signIn.ts
        signOut.ts
        getSession.ts
      infrastructure/
        demoAuth.ts
        authAdapter.ts

    accessibility/
      ui/
        A11yToolbar.tsx
      application/
        preferencesStore.ts
      domain/
        preferences.ts

  shared/
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
      Navbar.tsx
    lib/
      cn.ts
      constants.ts
```
### Boundary rules
- Pages call application functions only
- UI components are dumb by default
- Infrastructure is the only layer that touches cookies, storage, or external SDKs
- Keep auth swappable by hiding implementation behind `authAdapter`

---

## 10) UI specification (minimal but beautiful)

### Visual system
Use token based CSS variables:
- `--bg`, `--fg`, `--muted`, `--border`, `--primary`, `--focus`

Provide two modes:
- Default theme
- High contrast theme

### Components required
- Navbar (includes login state and sign out)
- Primary button, secondary button
- Card, input, label, error message
- Accessibility toolbar (contrast toggle, font scaling)
- Toast or inline alert component for errors

### Page content (MVP)
- **Landing**
  - Product name, short tagline, CTA “Log in”
  - Section listing accessibility features
- **Login**
  - One click demo login button
  - Optional email field later, but keep minimal
- **Home**
  - Welcome card with user name
  - Placeholder sections: “Upcoming features”, “Accessibility status”
  - User menu with sign out

---

## 11) Minimal instrumentation for future demos
Implement lightweight hooks only:
- A tiny `metrics` utility that can record:
  - Page load time (client)
  - Interaction count on key flows (login clicks, form errors)
- A simple dev-only panel (behind `?debug=1`) that displays counts

No analytics backend required.

---

## 12) Testing and quality gates
- ESLint + Prettier + prettier-plugin-tailwindcss
- Optional minimal tests:
  - Middleware redirect behavior
  - Preference store persistence
- Manual accessibility checklist for demo readiness:
  - Keyboard-only navigation on all pages
  - 200% zoom check
  - Screen reader labeling sanity check

---

## 13) Deliverables
1. Working Next.js repository
2. `README.md` with:
   - Setup steps
   - How to run locally
   - Demo credentials or “Demo Login” instructions
   - Architecture overview and folder structure
3. Optional: deployed link for judges

---

## 14) Implementation plan (low complexity)
### Milestone 1: Scaffolding
- Create Next.js app with TypeScript, Tailwind
- Add shadcn/ui base setup
- Add layout, navbar, skip link

### Milestone 2: Demo Auth and protected routing
- Implement cookie based demo session
- Add middleware guard for `/home`
- Implement sign out

### Milestone 3: Accessibility toolbar
- Contrast toggle
- Font size cycle
- Persist preferences

### Milestone 4: Polish
- Landing page sections
- Login and home page UI
- Focus states and form error handling
- README

---

## 15) Definition of done
- All routes exist and match spec
- Login and sign out work end-to-end
- `/home` protected by middleware
- Accessibility toolbar works globally and persists preferences
- Keyboard navigation works with visible focus
- README allows a judge to run without secrets
- Demo is stable and reproducible
