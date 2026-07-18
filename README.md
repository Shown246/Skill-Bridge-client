# SkillBridge frontend

A standalone Next.js 16 App Router client for the SkillBridge tutoring marketplace. It uses strict TypeScript, Tailwind CSS, TanStack Query, Better Auth 1.6, React Hook Form-compatible validation dependencies, Decimal.js, date-fns, Sonner, Lucide, and accessible semantic components.

## Local setup

1. Use Node.js 20.9 or newer and npm.
2. Copy `.env.example` to `.env.local`.
3. Start the SkillBridge backend on `http://localhost:5000` with its `FRONTEND_ORIGIN` set to `http://localhost:3000`.
4. Run `npm install`, then `npm run dev`.
5. Open `http://localhost:3000`.

The browser keeps the short-lived business API JWT in memory only. Better Auth maintains its own HTTP-only session cookie. Protected server layouts forward the incoming cookie to `/api/auth/token`, validate the resulting user through `/api/v1/me`, and enforce role and ban state before rendering.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm start
```

## Environment

| Variable | Local default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000` | SkillBridge business API origin |
| `NEXT_PUBLIC_AUTH_BASE_URL` | `http://localhost:5000` | Better Auth origin |
| `NEXT_PUBLIC_APP_NAME` | `SkillBridge` | Product name |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | `USD` | Fallback display currency |

All `NEXT_PUBLIC_*` values are visible to browsers; never put secrets in them.

## Vercel deployment

Import the repository into Vercel, set the four public environment variables for Production/Preview, and use the standard Next.js build command. The backend must allow the deployed frontend origin through CORS and Better Auth trusted origins.

Authentication also requires a production cookie topology that lets the browser send the Better Auth session cookie to the configured auth backend. When frontend and backend use different subdomains, configure Better Auth's cookie domain, `Secure`, and `SameSite` settings for that topology. Validate this before launch; frontend code cannot repair a cookie that the browser does not send.

Administrator accounts are not created by public registration. Obtain seeded admin credentials from the backend deployment's secret/configuration owner. Do not print them in terminal output, place them in frontend environment variables, or commit them.

## Contract notes

- `API_DOCUMENTATION.md` is authoritative. Tutor booking lists and completion use the generic `/api/v1/bookings` endpoints.
- Money remains a string/Decimal value until formatting. API date-times remain UTC until localized for display.
- Slot starts, supported duration keys, `allowedActions`, and `allowedAdminTransitions` are runtime authority.
- SkillBridge has no payment, messaging, video, calendar-sync, or review-editing interface.
- There is no admin category-list endpoint. The category admin screen can manage currently active categories, but after deactivation a category cannot be listed or reactivated through the supported API.

See [QA_CHECKLIST.md](./QA_CHECKLIST.md) for the manual test matrix and current verification record.
