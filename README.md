# Note Taking App

A full-stack note-taking app built with Next.js, MongoDB, and Auth.js. Create, edit, archive, tag, and search notes with a responsive desktop and mobile layout.

## Features

- Email/password sign-up and log-in (Auth.js v5)
- Create, edit, delete, and archive notes
- Tag notes and filter by tag (including archived notes)
- **Debounced search** across title, content, and tags (300ms delay to reduce API calls while typing)
- Light/dark theme
- Change password from settings
- Server-prefetched notes for fast first paint

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4
- **Database:** MongoDB
- **Auth:** Auth.js (NextAuth v5)
- **Testing:** Vitest (unit), Playwright (e2e)

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### Environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` | Random secret for session encryption. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `AUTH_TRUST_HOST` | Set to `true` when behind a reverse proxy (Vercel, Nginx, etc.) |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name (default: `note_taking_app`) |

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright e2e tests |

## Project Structure

```
src/
  app/              # App Router pages and API routes
  auth.ts           # Auth.js configuration
  components/       # UI components (notes, auth, settings)
  hooks/            # Shared React hooks (e.g. useDebouncedValue)
  lib/              # Data access, validation, API client
  types/            # Shared TypeScript types
tests/
  unit/             # Vitest tests
  e2e/              # Playwright tests
```

## CI

GitHub Actions runs lint, unit tests, Playwright e2e tests, and a production build on every push and pull request. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
