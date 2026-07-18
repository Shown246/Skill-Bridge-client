# SkillBridge Frontend Requirements

**Document type:** Frontend product and implementation requirements  
**Repository:** Standalone frontend repository  
**Primary stack:** Next.js App Router, TypeScript, Tailwind CSS  
**Backend dependency:** Separately deployed SkillBridge REST API  
**Status:** Implementation-ready

---

## 1. Purpose

This document defines the complete frontend requirements for SkillBridge, a tutoring marketplace where students discover tutors and book sessions, tutors manage profiles and recurring weekly availability, and administrators control users, tutor approvals, bookings, and categories.

The document is written for incremental, agentic development. Each requirement is intended to be independently implementable, testable, and traceable to an acceptance criterion.

---

## 2. Product Scope

The frontend must support three fixed roles:

- **Student:** Browse tutors, book sessions, cancel owned bookings before they start, review completed sessions, and manage a personal profile.
- **Tutor:** Create and maintain a tutor profile, select teaching categories, define recurring weekly availability, view assigned sessions, cancel assigned bookings before they start, and mark eligible sessions completed.
- **Admin:** View platform statistics, manage users, approve or reject tutor profiles, cancel or change the status of any booking, and manage categories.

Public visitors can browse approved tutors, search and filter tutors, view tutor profiles and reviews, and access authentication pages.

---

## 3. Binding Product Decisions

These decisions are mandatory and override assumptions that might otherwise be inferred:

1. The frontend and backend are separate applications in separate repositories.
2. Authentication and authorization use Better Auth.
3. The backend issues JWTs for authenticated business API requests.
4. Users may self-register only as `STUDENT` or `TUTOR`.
5. Admin accounts are seeded by the backend and cannot be created from the public registration UI.
6. Tutors require admin approval before appearing publicly or receiving bookings.
7. Banned users may sign in, but protected platform actions must be blocked.
8. All persisted and API date-time values use UTC.
9. Date-time values are displayed in the user's local browser timezone unless a screen explicitly indicates UTC.
10. Tutors define recurring weekly availability.
11. Students select a session start time and duration.
12. Tutor pricing is an hourly rate. The quoted session price is calculated from the selected duration.
13. A tutor cannot have overlapping confirmed bookings.
14. Students may cancel only their own bookings.
15. Tutors may cancel only bookings assigned to them.
16. Admins may cancel or change the status of any booking.
17. Cancellation is prohibited at or after the session start time.
18. Tutors may mark their own eligible sessions completed.
19. Admins may override any booking status, subject to backend validation.
20. Reviews require a completed booking, a 1-5 rating, and a written comment.
21. Only one review is allowed per booking.
22. Reviews cannot be edited or deleted in this release.
23. No payment method, transaction, payment status, checkout, or payment integration exists.
24. Frontend automated tests are not required.
25. The frontend must still pass linting, strict TypeScript checks, and a production build.
26. The frontend repository must contain at least 15 meaningful commits.

---

## 4. Out of Scope

The frontend must not implement:

- Payment collection, payment history, refunds, wallets, invoices, or checkout.
- Student-tutor messaging or video calling.
- Calendar-provider synchronization.
- Tutor payout management.
- Review editing or deletion.
- Social login unless separately approved.
- Admin self-registration.
- Native mobile applications.
- Real-time WebSocket updates; conventional refetching is sufficient.
- OpenAPI or Swagger UI.
- Frontend unit, integration, or end-to-end test suites.

---

## 5. Technical Requirements

### 5.1 Framework and Language

- Use Next.js with the App Router.
- Use TypeScript with strict mode enabled.
- Use Tailwind CSS for styling.
- Use React Server Components by default.
- Add `"use client"` only when browser state, effects, event handlers, Better Auth client APIs, or interactive controls require it.
- Do not use the Pages Router.
- Do not duplicate backend business rules as authoritative frontend logic.

### 5.2 Recommended Supporting Libraries

Equivalent libraries are acceptable when they provide the same behavior:

- Form management: React Hook Form.
- Schema validation: Zod.
- Server-state management: TanStack Query.
- URL query-state handling: native Next.js search parameters or a small typed helper.
- Date-time handling: date-fns, Luxon, or Day.js with UTC support.
- Icons: a single consistent icon library.
- Toasts: an accessible toast system.
- Class composition: `clsx` and/or `tailwind-merge`.

### 5.3 Runtime Configuration

The repository must provide `.env.example` with at least:

```env
NEXT_PUBLIC_APP_NAME=SkillBridge
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:4000
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
```

Rules:

- Do not expose secrets through `NEXT_PUBLIC_*`.
- API URLs must not be hardcoded in components.
- The application must fail clearly during development when required public environment variables are missing.
- Currency display must use the API-provided currency code when available and fall back to `NEXT_PUBLIC_DEFAULT_CURRENCY`.

### 5.4 Repository Scripts

The repository must expose at least:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

Adjust the lint command if required by the selected Next.js version, but preserve equivalent behavior.

---

## 6. Frontend Architecture

### 6.1 Required Layering

Use a structure equivalent to:

```text
src/
  app/
    (public)/
    (auth)/
    dashboard/
    tutor/
    admin/
    forbidden/
    suspended/
    layout.tsx
    loading.tsx
    error.tsx
    not-found.tsx
  components/
    ui/
    layout/
    auth/
    tutors/
    bookings/
    availability/
    reviews/
    admin/
  features/
    auth/
    tutors/
    bookings/
    availability/
    reviews/
    categories/
    admin/
  lib/
    api/
    auth/
    env/
    date/
    currency/
    validation/
    permissions/
  hooks/
  types/
  constants/
```

### 6.2 Module Boundaries

- Route files compose features; they must not contain large API or business-logic implementations.
- API calls belong in feature-specific API modules.
- Shared API transport behavior belongs in one central API client.
- Shared domain types belong in `types/` or feature modules, not inside page components.
- Form schemas belong beside the feature that owns the form.
- Reusable visual primitives belong in `components/ui`.
- Role and status checks must use centralized permission helpers.
- Date parsing, UTC conversion, and local formatting must use centralized utilities.
- Do not import admin-only modules into public route bundles unless necessary.

### 6.3 API Client

Create one typed API client with the following behavior:

1. Reads the backend base URL from validated environment configuration.
2. Sends `Accept: application/json`.
3. Sends `Content-Type: application/json` for JSON bodies.
4. Includes Better Auth credentials where required for auth endpoints.
5. Obtains a short-lived Better Auth-issued JWT for protected business API calls.
6. Sends the JWT as `Authorization: Bearer <token>`.
7. Keeps JWTs in memory; do not persist bearer tokens in `localStorage`.
8. On an expired-token response, attempts one token refresh/retrieval and retries the original request once.
9. Never retries validation, authorization, conflict, or not-found errors automatically.
10. Normalizes backend errors into a typed `ApiError`.
11. Preserves the backend `requestId` for support/debug displays.
12. Supports request cancellation through `AbortSignal`.
13. Does not log tokens, passwords, cookies, or authorization headers.

Suggested error type:

```ts
type ApiError = {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};
```

---

## 7. Authentication and Authorization

### 7.1 Better Auth Integration

- Use the Better Auth client for registration, sign-in, sign-out, and session retrieval.
- Use the backend Better Auth base URL.
- Auth requests must support cross-origin credentials when frontend and backend are deployed on different origins.
- The frontend must not manually implement password hashing, token signing, or session persistence.
- After successful authentication, obtain the business API JWT through the backend-supported Better Auth token flow.
- Treat the session as the UI identity source and the JWT as the credential for business API calls.

### 7.2 Registration

The registration form must include:

- Full name.
- Email.
- Password.
- Password confirmation.
- Role selection: `Student` or `Tutor`.
- Acceptance of terms checkbox if a terms page exists; otherwise omit it rather than creating a dead link.

Rules:

- Admin must not be an available role.
- Tutor registration must communicate that the tutor profile requires admin approval.
- On successful student registration, redirect to the student dashboard.
- On successful tutor registration, redirect to tutor profile onboarding.
- Existing email errors must be shown inline or at form level.
- Password rules must match backend-provided validation requirements.

### 7.3 Login

- Accept email and password.
- Show a generic invalid-credentials message.
- Preserve a safe internal `returnTo` URL.
- Redirect by role:
  - Student → `/dashboard`
  - Tutor → `/tutor/dashboard`
  - Admin → `/admin`
- If the account is banned, authentication still succeeds. Redirect to `/suspended` or show a persistent suspended state that blocks protected actions.
- Never reveal whether a particular email exists.

### 7.4 Route Protection

Use both server-aware route protection and client-side permission checks:

| Route group | Allowed roles |
|---|---|
| Public routes | Everyone |
| `/dashboard/**` | Active student |
| `/tutor/**` | Active tutor |
| `/admin/**` | Active admin |
| `/suspended` | Any authenticated banned user |
| `/forbidden` | Any authenticated user lacking permission |

Rules:

- Unauthenticated access to protected routes redirects to `/login?returnTo=...`.
- Wrong-role access redirects to `/forbidden`.
- Banned authenticated users are routed to `/suspended`.
- UI guards are not a security boundary; backend authorization remains mandatory.
- Hidden buttons must not be the only protection against unauthorized operations.

### 7.5 Authenticated User Shape

The frontend must support a user shape equivalent to:

```ts
type UserRole = "STUDENT" | "TUTOR" | "ADMIN";
type UserStatus = "ACTIVE" | "BANNED";
type TutorApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  tutorApprovalStatus?: TutorApprovalStatus | null;
};
```

---

## 8. Route Map

### 8.1 Public Routes

| Route | Requirement |
|---|---|
| `/` | Marketing homepage with navbar, four meaningful sections, and footer |
| `/tutors` | Approved tutor browse/search/filter page |
| `/tutors/[id]` | Approved tutor detail, reviews, availability, and booking entry |
| `/login` | Better Auth email/password sign-in |
| `/register` | Student/tutor registration |
| `/forbidden` | Permission-denied explanation |
| `/suspended` | Banned-account explanation |
| `/not-found` | Branded 404 page |

### 8.2 Student Routes

| Route | Requirement |
|---|---|
| `/dashboard` | Student overview |
| `/dashboard/bookings` | Upcoming, past, completed, and cancelled bookings |
| `/dashboard/bookings/[id]` | Booking detail |
| `/dashboard/profile` | Student profile management |

### 8.3 Tutor Routes

| Route | Requirement |
|---|---|
| `/tutor/dashboard` | Tutor overview and approval status |
| `/tutor/profile` | Tutor profile and category management |
| `/tutor/availability` | Recurring weekly availability editor |
| `/tutor/bookings` | Assigned teaching sessions |
| `/tutor/bookings/[id]` | Tutor booking detail and actions |

### 8.4 Admin Routes

| Route | Requirement |
|---|---|
| `/admin` | Platform statistics dashboard |
| `/admin/users` | User search, filtering, ban/unban |
| `/admin/tutors` | Tutor approval queue and profile review |
| `/admin/bookings` | All bookings and admin status control |
| `/admin/categories` | Category CRUD and activation management |

---

## 9. Global Layout and Navigation

### 9.1 Navbar

The navbar must:

- Display the SkillBridge brand and link to `/`.
- Provide public links to Home and Browse Tutors.
- Show Login and Register for anonymous visitors.
- Show a role-appropriate dashboard link for authenticated users.
- Show the current user's name/avatar when available.
- Provide sign-out.
- Collapse into an accessible mobile navigation.
- Indicate the current route.
- Avoid showing actions the current role cannot use.

### 9.2 Footer

The footer must:

- Appear on public pages.
- Include brand summary.
- Include links to Home, Browse Tutors, Login, and Register.
- Include copyright text using the current year.
- Avoid placeholder social or legal links.
- Remain visually distinct from page content.

### 9.3 Dashboard Shells

Each protected role group must have a dedicated shell with:

- Desktop sidebar or equivalent navigation.
- Mobile navigation.
- Page title area.
- User menu and sign-out.
- Active route state.
- Suspended-account interception.
- Consistent spacing and maximum content width.

---

## 10. Homepage Requirements

The homepage must contain a navbar, exactly four primary meaningful content sections, and a footer. Minor supporting content inside those sections is allowed.

### Section 1: Hero and Tutor Search

Required elements:

- Clear product value proposition.
- Supporting copy.
- Search input for tutor name, keyword, or subject.
- Search action that navigates to `/tutors?q=<value>`.
- Primary CTA to browse tutors.
- Optional secondary CTA to register as a tutor.
- Responsive visual treatment without relying on decorative assets for meaning.

### Section 2: Popular Categories

- Fetch active categories from the API.
- Display category name and optional description/icon.
- Each category links to `/tutors?categoryId=<id>`.
- Show loading skeletons.
- Show a compact empty state when no categories exist.
- Do not hardcode categories as the source of truth.

### Section 3: Featured Tutors

- Fetch approved featured tutors.
- Display at least four when data is available.
- Tutor card must show name, headline, categories, average rating, review count, hourly rate, and profile link.
- If fewer than four exist, display available tutors without fake data.
- Pending, rejected, or banned tutors must never appear.

### Section 4: How SkillBridge Works

Explain the student journey in three or four clear steps:

1. Browse tutors.
2. Review profile and availability.
3. Book a duration and time.
4. Attend and review after completion.

The section must be responsive and understandable without animation.

---

## 11. Tutor Discovery

### 11.1 Tutor List Page

The tutor list page must support:

- Keyword search.
- Category filter.
- Minimum rating filter.
- Maximum hourly rate filter.
- Sorting.
- Pagination.
- Clear-all-filters action.
- Results count.
- URL-synchronized filters.
- Browser back/forward compatibility.
- Mobile filter drawer or equivalent.
- Loading skeletons.
- Empty results state.
- API error with retry.

Supported sort values:

- Recommended/default.
- Highest rated.
- Price low to high.
- Price high to low.
- Most reviewed.

Suggested URL contract:

```text
/tutors?q=math&categoryId=...&minRating=4&maxHourlyRate=50&sort=rating_desc&page=1&pageSize=12
```

### 11.2 Tutor Card

Each card must show:

- Tutor image or initials fallback.
- Tutor name.
- Professional headline.
- Up to three categories with overflow indication.
- Average rating and review count.
- Hourly rate with currency.
- Optional experience years.
- Approval-safe public profile link.

### 11.3 Tutor Detail Page

Required sections:

- Tutor identity and headline.
- Tutor bio.
- Categories/subjects.
- Experience.
- Hourly rate.
- Average rating and review count.
- Review list with pagination or load-more.
- Availability/booking panel.
- Clear sign-in requirement for anonymous booking attempts.

Only approved, active tutors are publicly accessible. A missing, unapproved, rejected, or banned tutor must produce a public not-found result rather than exposing moderation state.

### 11.4 Metadata and Rendering

- Public tutor list and detail pages must have meaningful metadata.
- Tutor detail metadata may use fetched tutor name and headline.
- Public content should use server rendering where practical.
- Interactive filters and booking controls may use client components.
- Do not expose private tutor information in metadata or page source.

---

## 12. Booking Workflow

### 12.1 Booking Entry Conditions

A booking form is available only when:

- The visitor is authenticated.
- The user role is `STUDENT`.
- The account status is `ACTIVE`.
- The tutor is approved and active.
- At least one selectable slot exists.

For other cases:

- Anonymous visitor: prompt sign-in and preserve return URL.
- Tutor/admin: show that only student accounts can book.
- Banned student: show suspended-account message.
- No slots: show a no-availability state.

### 12.2 Booking Form

The booking UI must allow a student to:

1. Select a date.
2. Select a backend-provided available start time.
3. Select one backend-supported duration.
4. See the calculated end time.
5. See the tutor hourly rate.
6. See the calculated quoted session price.
7. Optionally add a short booking note when supported by the API.
8. Submit the booking.

The UI must not generate bookable slots from weekly availability alone. It must request backend-computed slots because only the backend can reliably account for conflicts and current booking state.

### 12.3 Booking Confirmation

Before submission, display:

- Tutor name.
- Category/subject.
- Local date.
- Local start and end time.
- Duration.
- Hourly rate.
- Quoted price.
- Explicit note that payment is not processed by SkillBridge.

After success:

- Show a success state.
- Link to the created booking detail.
- Invalidate tutor-slot and student-booking queries.
- Do not claim that email or calendar invitations were sent unless implemented.

### 12.4 Conflict Handling

When the backend returns a slot conflict:

- Show a clear message that the slot is no longer available.
- Refetch available slots.
- Preserve the selected date and duration when possible.
- Require the student to choose a valid new start time.
- Do not silently resubmit.

---

## 13. Student Experience

### 13.1 Student Dashboard

Display:

- Next upcoming booking.
- Count of upcoming bookings.
- Count of completed bookings.
- Pending-review count.
- Recent booking activity.
- Links to browse tutors and manage bookings.

Do not fabricate analytics when the API returns no data.

### 13.2 Student Bookings Page

Provide tabs or filters for:

- Upcoming.
- Completed.
- Cancelled.
- All.

Each booking item must show:

- Tutor.
- Category.
- Local date/time.
- Duration.
- Status.
- Quoted price.
- Contextual action:
  - View.
  - Cancel when allowed.
  - Review when eligible.

### 13.3 Student Booking Detail

Show:

- Booking identifier in a user-friendly form.
- Tutor and category.
- Start/end time.
- Duration.
- Status.
- Quoted price.
- Student note if present.
- Cancellation information when cancelled.
- Review status.
- Allowed actions.

### 13.4 Student Cancellation

- A student may cancel only an owned `CONFIRMED` booking.
- Cancellation action must be hidden or disabled at/after the start time.
- Use a confirmation dialog.
- Optional cancellation reason may be collected if the backend supports it.
- Handle race conditions where the backend rejects a now-started booking.
- After success, update all affected views.

### 13.5 Student Profile

Allow editing of backend-supported fields such as:

- Name.
- Profile image URL or supported image mechanism.
- Phone.
- General profile information.

Email changes are out of scope unless Better Auth email-change functionality is explicitly enabled by the backend.

---

## 14. Review Workflow

### 14.1 Eligibility

Show the review form only when:

- The current user is the booking's student.
- The booking status is `COMPLETED`.
- No review exists for the booking.
- The account is active.

### 14.2 Review Form

Required fields:

- Rating: integer from 1 through 5.
- Comment: written text within backend-defined limits.

Requirements:

- Rating control must be keyboard accessible.
- Display selected rating textually, not by icon color alone.
- Validate before submit.
- Disable duplicate submission while pending.
- Show server field errors.
- On success, replace the form with the immutable submitted review.

### 14.3 No Edit or Delete

- Do not display edit or delete controls.
- If a review already exists, render it read-only.
- Do not expose unsupported API calls in the frontend client.

---

## 15. Tutor Experience

### 15.1 Tutor Dashboard

Display:

- Approval status: `PENDING`, `APPROVED`, or `REJECTED`.
- Clear next step for incomplete or rejected profiles.
- Upcoming assigned sessions.
- Completed-session count.
- Average rating and review count.
- Availability summary.
- Profile completion cues.

Behavior by approval state:

- `PENDING`: tutor can edit profile and availability but cannot receive bookings.
- `REJECTED`: show admin feedback when supplied; allow profile correction.
- `APPROVED`: full tutor operations are available.
- `BANNED`: route to suspended state.

### 15.2 Tutor Profile Form

Support:

- Headline.
- Biography.
- Years of experience.
- Hourly rate.
- Category/subject selection with multiple values.
- Optional education or credentials fields when supported.
- Profile image through the supported user profile mechanism.

Rules:

- At least one category is required before submission for approval.
- Hourly rate must be positive and comply with backend precision/range rules.
- Clearly label saved, unsaved, pending approval, approved, and rejected states.
- Do not claim instant approval.
- Profile changes after approval remain subject to backend state returned by the API.

### 15.3 Recurring Weekly Availability

Provide an editor for all seven days.

Each availability interval includes:

- Day of week.
- Start local time.
- End local time.
- Enabled/disabled state.

Requirements:

- Support multiple intervals per day.
- Provide copy-to-days functionality.
- Prevent client-detectable overlaps on the same day.
- Require start before end.
- Display the timezone used for editing.
- Convert local weekly times to the backend's required UTC representation or offset-aware contract.
- Submit the complete intended weekly schedule, not ambiguous partial mutations, unless the API contract specifies otherwise.
- Warn that existing bookings are not automatically cancelled by availability changes.
- Show backend validation errors by day and interval.

### 15.4 Tutor Bookings

The tutor can:

- View assigned bookings.
- Filter by upcoming, completed, and cancelled.
- Open booking detail.
- Cancel an assigned confirmed booking before start.
- Mark an assigned confirmed booking completed when the backend reports it eligible.

The tutor cannot:

- Change another tutor's booking.
- Complete a future session.
- Cancel at or after the start time.
- Mark cancelled bookings completed.
- Edit student reviews.

---

## 16. Admin Experience

### 16.1 Admin Dashboard

Show backend-provided statistics such as:

- Total students.
- Total tutors.
- Tutors pending approval.
- Active and banned users.
- Upcoming bookings.
- Completed bookings.
- Cancelled bookings.
- Total reviews.

Statistics must link to relevant management pages when useful.

### 16.2 User Management

Provide:

- Search by name or email.
- Filter by role.
- Filter by status.
- Pagination.
- User summary.
- Ban/unban action.

Rules:

- Require confirmation for status changes.
- Display the impact of banning.
- Do not allow an admin to ban their own current account if the backend rejects it.
- Refresh affected rows after mutation.
- Banned users remain able to authenticate but cannot use protected business operations.

### 16.3 Tutor Approval

Provide:

- Pending approval list.
- Filters for pending, approved, and rejected.
- Tutor profile review view.
- Approve action.
- Reject action with required reason when the backend requires one.
- Status-change confirmation.
- Link to public profile only when approved.

Never expose pending tutor profiles on public routes.

### 16.4 Booking Administration

Provide:

- Search and filters by student, tutor, status, and date.
- Pagination.
- Booking detail.
- Admin status-change control.
- Cancellation action for any eligible booking.
- Required reason/note for administrative overrides when required by the API.
- Clear warning that admin actions override normal role workflows.

The UI must render only status transitions returned as allowed by the backend. It must not hardcode that every transition is always valid.

### 16.5 Category Management

Provide:

- Category list.
- Create category.
- Edit category.
- Activate/deactivate category.
- Optional delete action only if supported by the API.

Rules:

- Category name and slug must be unique.
- Prevent accidental destructive action with confirmation.
- Prefer deactivation when categories are referenced by tutors or bookings.
- Refresh public category-dependent views after changes.

---

## 17. API Contracts Consumed by the Frontend

The backend owns the definitive contract. The frontend must be implemented against endpoints equivalent to the following.

### 17.1 Authentication

Better Auth mounted under:

```text
/api/auth/*
```

Required capabilities:

- Sign up with email/password and role metadata.
- Sign in with email/password.
- Sign out.
- Get session.
- Retrieve a short-lived JWT for protected API use.

### 17.2 Public

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/categories` | Active public categories |
| `GET` | `/api/v1/tutors` | Approved tutor search/filter/pagination |
| `GET` | `/api/v1/tutors/:tutorId` | Approved tutor detail |
| `GET` | `/api/v1/tutors/:tutorId/reviews` | Public tutor reviews |
| `GET` | `/api/v1/tutors/:tutorId/slots` | Computed bookable slots |

### 17.3 Current User

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/me` | Extended current-user profile and status |
| `PATCH` | `/api/v1/me` | Update supported personal profile fields |

### 17.4 Student Bookings and Reviews

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/bookings` | Create confirmed booking |
| `GET` | `/api/v1/bookings` | Role-scoped current-user bookings |
| `GET` | `/api/v1/bookings/:bookingId` | Authorized booking detail |
| `PATCH` | `/api/v1/bookings/:bookingId/cancel` | Student/tutor cancellation |
| `POST` | `/api/v1/bookings/:bookingId/review` | Create immutable review |

### 17.5 Tutor

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/tutor/profile` | Own tutor profile |
| `PUT` | `/api/v1/tutor/profile` | Upsert own tutor profile |
| `GET` | `/api/v1/tutor/availability` | Own weekly availability |
| `PUT` | `/api/v1/tutor/availability` | Replace weekly availability |
| `GET` | `/api/v1/tutor/bookings` | Own assigned bookings |
| `PATCH` | `/api/v1/tutor/bookings/:bookingId/complete` | Complete eligible session |

### 17.6 Admin

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/stats` | Dashboard statistics |
| `GET` | `/api/v1/admin/users` | Paginated users |
| `PATCH` | `/api/v1/admin/users/:userId/status` | Ban/unban user |
| `GET` | `/api/v1/admin/tutors` | Tutor moderation list |
| `GET` | `/api/v1/admin/tutors/:tutorId` | Tutor moderation detail |
| `PATCH` | `/api/v1/admin/tutors/:tutorId/approval` | Approve/reject tutor |
| `GET` | `/api/v1/admin/bookings` | All bookings |
| `PATCH` | `/api/v1/admin/bookings/:bookingId/status` | Admin status override |
| `GET` | `/api/v1/admin/categories` | All categories |
| `POST` | `/api/v1/admin/categories` | Create category |
| `PATCH` | `/api/v1/admin/categories/:categoryId` | Update category |
| `PATCH` | `/api/v1/admin/categories/:categoryId/status` | Activate/deactivate |

---

## 18. Shared Frontend Domain Types

Use types equivalent to:

```ts
type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
};

type TutorSummary = {
  id: string;
  userId: string;
  name: string;
  image?: string | null;
  headline: string;
  categories: Pick<Category, "id" | "name" | "slug">[];
  experienceYears: number;
  hourlyRate: string;
  currencyCode: string;
  averageRating: number;
  reviewCount: number;
};

type Booking = {
  id: string;
  student: { id: string; name: string };
  tutor: { id: string; name: string };
  category: Pick<Category, "id" | "name">;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  hourlyRateSnapshot: string;
  quotedPrice: string;
  currencyCode: string;
  status: BookingStatus;
  note?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  completedAt?: string | null;
  review?: Review | null;
  allowedActions: string[];
};

type Review = {
  id: string;
  bookingId: string;
  student: { id: string; name: string; image?: string | null };
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
};

type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
```

Money values must remain strings from the API to avoid floating-point corruption. Convert only for presentation with a decimal-safe method.

---

## 19. Validation Rules

Frontend validation improves usability but must match backend rules.

### 19.1 Common

- Trim user-entered text before submission where appropriate.
- Reject whitespace-only required fields.
- Display field-level messages near controls.
- Preserve user input after recoverable API failures.
- Disable submit while a request is pending.
- Do not rely on disabled controls as authorization.

### 19.2 Authentication

- Name: required, backend-defined length.
- Email: required and syntactically valid.
- Password: required and must meet backend policy.
- Password confirmation: must match.
- Role: only student or tutor.

### 19.3 Tutor Profile

- Headline: required.
- Biography: required.
- Experience years: non-negative integer.
- Hourly rate: positive decimal.
- Categories: at least one active category.

### 19.4 Availability

- Start time must precede end time.
- Intervals on the same weekday must not overlap.
- Duplicate intervals must be rejected.
- Invalid or unsupported timezone conversions must block submission.

### 19.5 Booking

- Tutor and category required.
- Start time must be one returned by the slot endpoint.
- Duration must be one returned as supported.
- End time must fit within the selected slot.
- Past times must not be submitted.

### 19.6 Review

- Rating must be an integer 1–5.
- Comment is required and must satisfy backend min/max lengths.
- No edit/delete flow exists.

---

## 20. Loading, Empty, Error, and Success States

Every asynchronous screen must implement all applicable states.

### 20.1 Loading

- Route-level loading UI for major pages.
- Skeletons for lists and cards.
- Button-level pending state for mutations.
- Avoid layout shift where practical.

### 20.2 Empty

Examples:

- No tutors match filters.
- No categories exist.
- No upcoming bookings.
- No reviews yet.
- No pending tutor approvals.
- No weekly availability configured.

Each empty state must explain what happened and provide one relevant next action when possible.

### 20.3 Errors

Handle at least:

- Network unavailable.
- Unauthorized or expired auth.
- Forbidden role/action.
- Banned account.
- Validation failure.
- Resource not found.
- Booking conflict.
- Rate limiting.
- Unexpected server error.

Rules:

- Never render raw stack traces.
- Use the backend message only when safe and user-oriented.
- Display `requestId` for unexpected errors when supplied.
- Provide retry only for idempotent reads or explicitly safe operations.
- Use error boundaries for uncaught route errors.

### 20.4 Success

- Use clear success feedback for profile updates, availability updates, booking creation/cancellation/completion, review creation, approvals, status changes, and category mutations.
- Do not rely exclusively on transient toasts for important state changes; update visible page state.

---

## 21. Responsive Design and UI Consistency

Mandatory behavior:

- Support mobile widths from 320 px.
- Support tablet and desktop layouts.
- No horizontal overflow in normal use.
- Forms remain usable with software keyboards.
- Tables must become cards, scroll containers, or responsive grids on small screens.
- Touch targets must be reasonably sized.
- Use a consistent spacing scale, border radius, typography hierarchy, and interaction states.
- Maintain accessible contrast.
- Avoid decorative gradients or animation that reduce readability.
- Use one coherent color system across public and dashboard areas.

---

## 22. Accessibility

Target practical WCAG 2.1 AA behavior:

- All interactive controls keyboard accessible.
- Visible focus indicators.
- Semantic landmarks and headings.
- Form fields have programmatic labels.
- Errors are associated with fields.
- Dialogs trap focus and restore it on close.
- Menus and drawers support Escape.
- Status changes use an appropriate live region when needed.
- Color is never the only status indicator.
- Images have useful alt text or empty alt text when decorative.
- Star rating includes accessible text.
- Date/time controls include explicit labels and timezone context.
- Reduced-motion preferences are respected.

---

## 23. Performance

- Use server rendering for public pages where practical.
- Paginate tutor, review, booking, user, and admin lists.
- Avoid fetching protected dashboard data on public pages.
- Use responsive images and Next.js image optimization when compatible with the image source.
- Avoid shipping large charting libraries for simple statistics.
- Debounce tutor keyword search or submit explicitly.
- Cancel stale filter requests.
- Cache public categories and tutor summaries for a reasonable period.
- Invalidate cache after relevant admin mutations.
- Keep client components narrow.

---

## 24. Frontend Security

- Never store passwords.
- Never persist JWT bearer tokens in local storage.
- Never expose Better Auth secrets.
- Never trust role/status values supplied by forms or URL parameters.
- Sanitize or safely render user-generated biography and review text as plain text.
- Do not use raw HTML rendering for user content.
- Restrict redirect targets to internal safe paths.
- Do not log authentication credentials.
- Do not expose pending/rejected tutor details publicly.
- Ensure mutation buttons cannot accidentally submit twice.
- Treat all backend authorization failures as authoritative.

---

## 25. Implementation Phases and Dependency Order

### Phase 1: Foundation

Depends on: nothing.

Deliver:

- Next.js/TypeScript/Tailwind setup.
- Environment validation.
- App shell.
- UI primitives.
- API client foundation.
- Global error, loading, not-found pages.
- Date, currency, and permission utilities.

Exit criteria:

- Lint, typecheck, and build pass.
- Public placeholder routes render through the shared shell.

### Phase 2: Authentication and Role Routing

Depends on: Phase 1 and available backend auth endpoints.

Deliver:

- Better Auth client.
- Registration.
- Login.
- Sign-out.
- Session retrieval.
- JWT acquisition for business API.
- Protected route handling.
- Forbidden and suspended pages.
- Role-specific dashboard shells.

Exit criteria:

- Each role reaches only its allowed shell.
- Banned users reach suspended state.
- Admin is absent from registration.

### Phase 3: Public Marketplace

Depends on: Phase 1; auth is optional for browsing.

Deliver:

- Homepage with four required sections.
- Category fetching.
- Tutor list/search/filter/pagination.
- Tutor cards.
- Tutor detail.
- Public reviews.
- Metadata and responsive public navigation.

Exit criteria:

- Only approved active tutors appear.
- Filters are represented in URL state.
- Required loading/error/empty states exist.

### Phase 4: Student Booking

Depends on: Phases 2 and 3 plus backend slot/booking endpoints.

Deliver:

- Slot retrieval.
- Date/start/duration selection.
- Price calculation display.
- Booking submission.
- Conflict recovery.
- Student dashboard.
- Booking list/detail.
- Student cancellation.
- Student profile.

Exit criteria:

- Student can create and cancel an eligible booking.
- Start/end/price are clearly displayed.
- Conflict responses force reselection.

### Phase 5: Reviews

Depends on: completed bookings from Phase 4.

Deliver:

- Review eligibility state.
- Rating/comment form.
- Immutable submitted review state.
- Tutor review refresh.

Exit criteria:

- Exactly one review can be submitted per completed owned booking from the UI.
- No edit/delete controls exist.

### Phase 6: Tutor Operations

Depends on: Phase 2 and category endpoints.

Deliver:

- Tutor dashboard and approval state.
- Tutor profile/categories.
- Weekly availability editor.
- Tutor booking list/detail.
- Tutor cancellation.
- Tutor completion.

Exit criteria:

- Pending tutors can prepare profiles but remain unavailable publicly.
- Availability overlap is handled.
- Tutor can act only on assigned bookings.

### Phase 7: Admin Operations

Depends on: Phase 2 and all core backend admin endpoints.

Deliver:

- Admin statistics.
- User management.
- Tutor approval/rejection.
- Booking administration.
- Category management.

Exit criteria:

- Admin can perform all defined moderation operations.
- Public data refreshes after relevant changes.

### Phase 8: Hardening and Submission

Depends on: all prior phases.

Deliver:

- Responsive audit.
- Accessibility audit.
- Loading/error/empty-state audit.
- Production environment documentation.
- README setup and deployment instructions.
- Verify at least 15 meaningful commits.
- Production build verification.

---

## 26. Acceptance Criteria

### 26.1 Mandatory Assessment Criteria

- Homepage includes navbar, footer, and four meaningful sections.
- UI is responsive and visually consistent.
- Repository contains at least 15 meaningful frontend commits.
- All forms and data screens include validation, errors, and loading states.
- Deployment documentation identifies how the seeded admin credentials are obtained from backend deployment configuration without committing secrets.

### 26.2 Public Marketplace

- Anonymous users can browse approved tutors.
- Search, category, rating, price, sorting, and pagination work together.
- Filter state survives reload through URL parameters.
- Tutor details show reviews and current bookable availability.
- Pending/rejected/banned tutor profiles are not publicly exposed.

### 26.3 Authentication

- Student and tutor registration work.
- Admin is not selectable during registration.
- Role-based redirect works after login.
- Protected routes reject anonymous and wrong-role access.
- Banned authenticated users are shown the suspended state and cannot submit protected actions.

### 26.4 Booking

- Student can choose a backend-provided start time and duration.
- End time and quoted price update accurately.
- Successful booking is instantly `CONFIRMED`.
- Double-booking conflict receives a clear recovery UI.
- Student and tutor can cancel only owned/assigned bookings before start.
- Admin UI supports global booking status control.
- Cancellation controls disappear or disable at session start.
- No payment UI or payment status exists.

### 26.5 Reviews

- Review form appears only for a completed owned booking without an existing review.
- Rating accepts only 1–5.
- Comment is required.
- Submitted review becomes read-only.
- No edit/delete flow exists.

### 26.6 Tutor

- Tutor can create/update a profile and assign multiple categories.
- Tutor can define multiple non-overlapping intervals per weekday.
- Approval status is visible.
- Unapproved tutor cannot be booked.
- Tutor can view, cancel, and complete only assigned eligible sessions.

### 26.7 Admin

- Admin can search/filter users and ban/unban them.
- Admin can approve or reject tutor profiles.
- Admin can view all bookings and apply allowed status overrides.
- Admin can create/update/activate/deactivate categories.
- Admin dashboard displays API-derived statistics.

---

## 27. Frontend Verification Requirements

No automated frontend test suite is required. The following checks are mandatory before completion:

```bash
npm run lint
npm run typecheck
npm run build
```

Manual verification matrix must include:

- Anonymous desktop and mobile.
- Active student desktop and mobile.
- Active tutor in pending and approved states.
- Active admin.
- Banned student or tutor.
- Empty database-like states.
- Network failure.
- Validation failure.
- Booking conflict.
- Unauthorized and forbidden responses.
- At least one timezone conversion scenario crossing midnight.
- Cancellation immediately before and at session start boundary.

Record the manual verification checklist in the repository README or a dedicated `QA_CHECKLIST.md`.

---

## 28. Definition of Done

A frontend feature is done only when:

1. It is connected to the real backend contract or an explicitly temporary typed adapter.
2. Role/status visibility rules are implemented.
3. Loading, empty, error, and success states are implemented.
4. Forms include matching client validation and backend error mapping.
5. Mobile and desktop layouts are usable.
6. Keyboard operation and labels are verified.
7. UTC API values render correctly in local time.
8. No secret or bearer token is persisted or logged.
9. Lint and typecheck pass.
10. The production build passes.
11. The feature's acceptance criteria are manually verified.
12. Documentation and environment examples are updated.

The entire frontend is done only when all route groups, mandatory requirements, manual checks, deployment instructions, and the 15-commit minimum are complete.


---

## 30. Agentic Development Rules

An implementation agent must:

- Work phase by phase in dependency order.
- Read the backend contract before implementing each feature.
- Avoid inventing fields or endpoints silently.
- Add a typed contract change in one location before using it.
- Keep one authoritative permission map.
- Keep one authoritative API transport.
- Keep one authoritative UTC/local-time conversion strategy.
- Prefer small reviewable vertical slices.
- Run lint and typecheck after each slice.
- Run a production build at the end of each phase.
- Update `.env.example`, README, and manual QA checklist when behavior changes.
- Stop and report a contract mismatch rather than masking it with fake data.
