# SkillBridge QA checklist

## Automated verification

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] No JWT persistence in local/session storage
- [x] API errors preserve request IDs and rate-limit retry metadata
- [x] One-time JWT refresh occurs only for `TOKEN_EXPIRED`
- [x] URL redirect targets are restricted to safe internal paths
- [x] Money quote calculation uses Decimal.js
- [x] Homepage has exactly four primary content sections
- [x] Runtime slot duration maps and booking action arrays control the UI
- [x] Live backend `/health` returned `UP` on 2026-07-18

## Manual role and responsive matrix

Run against a development database that is safe for mutations. Prefix generated users with `QA Student` and `QA Tutor`. Do not record passwords here.

- [ ] Anonymous: home, tutor filters, tutor detail, reviews, empty marketplace at 320px and desktop
- [ ] Student: registration, role redirect, profile update, slot selection, confirmed booking, list/detail
- [ ] Student: cancel immediately before start; verify action unavailable at/after start
- [ ] Student: completed booking review (rating 1–5, comment 10–2000); verify immutable result
- [ ] Tutor pending: create/replace profile and availability; confirm public non-disclosure
- [ ] Tutor rejected: see rejection reason and resubmit profile
- [ ] Tutor approved: public visibility, assigned bookings, cancellation, completion after end
- [ ] Admin: exactly six statistics, user search/filter, required-reason ban/unban and self-ban rejection
- [ ] Admin: tutor list/detail, approve, reject with reason, inactive-category approval rejection
- [ ] Admin: booking search/date/status filters and only backend-provided status transitions
- [ ] Admin: create/edit/deactivate category; confirm inactive listing/reactivation disclosure
- [ ] Banned student/tutor: authentication succeeds, `/suspended` renders, mutations remain blocked

## Error and boundary matrix

- [ ] Network unavailable gives a retryable, human-readable state
- [ ] Backend validation maps safe field errors without losing entered values
- [ ] `401 TOKEN_EXPIRED` refreshes and retries once
- [ ] `401 TOKEN_INVALID` clears the memory token and requires authentication again
- [ ] `403 FORBIDDEN` and ownership failures reveal no protected data
- [ ] `403 USER_BANNED` reaches the suspended experience
- [ ] `404` public pending/rejected/inactive tutor does not disclose profile data
- [ ] `409 BOOKING_SLOT_CONFLICT` clears selection and reloads slots
- [ ] `429 RATE_LIMITED` surfaces the message without an immediate retry loop
- [ ] Unexpected errors show `X-Request-Id` when returned
- [ ] Empty categories, tutors, reviews, bookings, approvals, and availability are understandable

## Timezone and accessibility

- [ ] Save one local interval whose UTC conversion crosses midnight; inspect the two backend fragments
- [ ] Reload that schedule and verify the local presentation remains usable
- [ ] Change OS/browser timezone and verify tutor slots remain the same UTC instants with new local labels
- [ ] Verify IANA timezone and DST re-save warning
- [ ] Keyboard-only navigation, visible focus, semantic labels, dialogs/confirmations, and star rating text
- [ ] Screen-reader live feedback for loading, mutations, and errors
- [ ] Reduced-motion preference and contrast
- [ ] No horizontal overflow at 320px, 768px, and desktop

## Current run record — 2026-07-18

Automated static verification and a live backend health check are recorded above. Destructive/live mutation scenarios remain unchecked because no QA or administrator credentials were supplied; the frontend does not discover, print, or store administrator credentials. The known backend category limitation is intentionally exposed in the admin UI rather than worked around with fabricated state.

### QA continuation — 2026-07-18 (Asia/Dhaka)

- [x] Repository, `README.md`, this checklist, `API_DOCUMENTATION.md`, and `FRONTEND_REQUIREMENTS.md` inspected before QA mutations.
- [x] Git baseline inspected. A pre-existing tracked `next-env.d.ts` development-route reference change remains preserved.
- [x] `.env.qa.local` exists, matches the ignored `.env*` rule, and is not tracked by Git. Its values were not printed or logged.
- [x] User confirmed the connected database is a test database and is safe for persistent QA records.
- [x] Backend `GET http://localhost:5000/health` returned HTTP 200 with an `X-Request-Id`.
- [x] Backend `GET http://localhost:5000/ready` returned HTTP 200 with an `X-Request-Id`, confirming database readiness.
- [x] Frontend development server returned HTTP 200 at `http://localhost:3000` before and after production verification.
- [x] `npm run lint` passed. The first run exceeded the two-minute command allowance without output; the required rerun completed successfully.
- [x] `npm run typecheck` passed.
- [x] `npm run build` passed with all 20 static/dynamic application routes generated successfully.
- [ ] Public registration and anonymous/student/tutor/admin role matrix. Not started because UI-driven registration and browser interaction are blocked; no direct API substitute was used.
- [ ] Admin authentication. Not attempted, and the ignored credentials were not loaded, because the in-app Browser is unavailable.
- [ ] Loading, empty, validation, network, forbidden, rate-limit, request-ID, and mutation-success UI states. Not executed due to the same Browser blocker.

No QA users, bookings, reviews, availability intervals, moderation changes, or category records were created during this blocked continuation. No backend code was changed. The backend limitation remains: there is no admin category-list endpoint, so inactive-category listing and reactivation cannot be tested or supported.

### Interactive QA execution — 2026-07-18 (Asia/Dhaka)

This continuation supersedes the earlier in-app Browser availability blocker: the in-app Browser connected successfully and was used for all UI interactions below. No backend code was changed and no QA records were deleted.

#### Environment and QA identities

- [x] Git status, repository files, `README.md`, this checklist, `QA_DEFECTS.md`, `API_DOCUMENTATION.md`, and `FRONTEND_REQUIREMENTS.md` were inspected before new QA mutations.
- [x] `.env.qa.local` exists and `git check-ignore` confirms it remains ignored. Credential values were loaded only for admin authentication and were not written to QA documentation.
- [x] Backend `/health` and `/ready` returned HTTP 200; readiness reported the database connected and both responses included `X-Request-Id`.
- [x] Frontend `/` returned HTTP 200 at `http://localhost:3000`.
- [x] Created student account `qa.student.mrq5xk4o@example.com` through public registration.
- [x] Created tutor account `qa.tutor.mrq5xk4o@example.com` through public registration.

#### Anonymous marketplace and responsive results

- [x] Homepage renders exactly four primary sections, semantic headings, footer, marketplace search, active empty-category copy, and active empty-featured-tutor copy.
- [x] Homepage search navigates to `/tutors?q=calculus`.
- [x] Tutor keyword and sort controls update URL state (`q=algebra`, `sort=price_asc`) and the clear-filter link is present.
- [x] Empty tutor results are understandable. Current public API data has zero active categories and zero approved tutors.
- [x] A nonexistent tutor UUID renders the branded public not-found experience without moderation disclosure.
- [ ] Public tutor detail, slots, review list, review pagination, tutor-result pagination, and combined category/rating/price filtering. **Backend data blocker:** there are no active categories or approved tutors to exercise result/detail behavior.
- [x] No horizontal overflow at 320 px, 768 px, or 1440 px. Homepage has four sections at tablet and desktop sizes.
- [ ] Responsive primary navigation. **FAIL (QA-FE-001):** `Find tutors` is hidden at 320 px and 768 px without an accessible menu replacement.
- [x] Visible keyboard focus styling is present (3 px outline observed on the brand link). Full keyboard traversal could not be reliably driven by the background browser controller.
- [x] Reduced-motion CSS is present and disables animation, transition, and smooth scrolling under `prefers-reduced-motion: reduce`.

#### Authentication, student, and wrong-role results

- [x] Required registration fields use native constraint validation; admin is not a registration role.
- [x] Student registration succeeds and redirects to `/student`.
- [x] Tutor registration succeeds and redirects to `/tutor`.
- [x] Duplicate registration keeps the form and shows `User already exists. Use another email.`
- [x] Wrong-password login shows the generic `Invalid email or password` message.
- [x] An external `returnTo` value is rejected; student login falls back to `/student`.
- [ ] Tutor approval disclosure on registration. **FAIL (QA-FE-002):** selecting the tutor role shows no approval requirement.
- [ ] Exact nested return target preservation. **FAIL (QA-FE-003):** anonymous `/student/profile` redirects with `returnTo=/student`.
- [x] Student profile name, phone, and avatar clearing persisted after reload.
- [x] Invalid avatar URL preserves the entered value and receives backend validation feedback.
- [ ] Field-level profile validation feedback. **FAIL (QA-FE-004):** only the generic `Validation failed.` toast is shown.
- [x] Student booking list renders a clear empty state and status filter.
- [x] Student access to `/tutor` and `/admin` redirects to `/forbidden` without protected data.
- [ ] Slot selection, booking creation/detail/conflict/cancellation, eligible completion review, immutable review, and cancellation boundary checks. **Blocked:** no approved tutor/active category exists and admin approval cannot be performed.

#### Tutor results

- [x] A new tutor without a profile sees the `Complete your profile` onboarding state and is not publicly listed.
- [x] Tutor profile form exposes headline, biography, experience, hourly rate, subjects, and full-replacement disclosure; save remains disabled without an active category.
- [x] Availability without a tutor profile renders a human-readable `Tutor profile not found. Create a profile first.` error with retry.
- [x] Tutor bookings render a clear empty state and status filter.
- [ ] Profile creation/replacement, category replacement, pending/rejected/approved state transitions, multiple intervals, overlap validation, UTC-midnight splitting/reload, assigned cancellation, and completion. **Blocked:** `GET /api/v1/categories` returns an empty active list and admin authentication returns 401.

#### Admin, banned-user, and category results

- [ ] Six statistics, user search/filter, ban/unban reason and self-ban rejection, tutor approval/rejection, booking administration, and category create/edit/deactivate. **Blocked:** seeded QA admin authentication returns HTTP 401.
- [ ] Banned-user sign-in, `/suspended`, and blocked mutations. **Blocked:** a QA user cannot be banned without working admin authentication.
- [ ] Inactive-category listing/reactivation. **Documented limitation:** the backend has no admin category-list endpoint; inactive categories cannot be listed or reactivated through supported APIs.

#### Loading, error, and mutation-state results

- [x] Route-level `Loading SkillBridge…`, query loading, button pending text, empty lists, forbidden, not-found, validation, registration success, login success, profile persistence, and sign-out success states were observed.
- [x] The backend returns `X-Request-Id` and rate-limit metadata headers.
- [ ] Browser-visible request IDs and rate-limit metadata. **Backend blocker:** CORS allows `http://localhost:3000` but does not expose `X-Request-Id`, `RateLimit`, or `Retry-After`, so browser JavaScript cannot read them.
- [ ] Network-unavailable UI. Not forced because doing so would require stopping the shared backend or unsupported browser interception.
- [ ] `429 RATE_LIMITED`. Not deliberately induced; repeated auth/booking/admin mutations were avoided as unsafe and unnecessary.
- [ ] `TOKEN_EXPIRED`/`TOKEN_INVALID` recovery. Not safely time-controlled in this run; static transport behavior remains covered by the automated verification record.

#### Required final commands

- [x] `npm run lint` — passed after the resumed interactive run.
- [x] `npm run typecheck` — passed after the resumed interactive run.
- [x] `npm run build` — passed; all 20 application routes were generated.

### Interactive QA resume — 2026-07-18 (Asia/Dhaka)

This continuation supersedes the earlier empty-data and administrator-authentication blockers. The documented backend seed was run once against the confirmed test database; it created the missing configured administrator without overwriting an existing account or password. Credentials remained outside the QA documentation.

#### Persistent QA records

- [x] Active category `QA Mathematics 2026-07-18` created and edited through the admin UI. It remains active so the tutor and booking matrix can continue in a later run.
- [x] Tutor `qa.tutor.resume.mrq86jn7@example.com` registered, given a profile and weekly availability, rejected with feedback, edited, and then approved.
- [x] Student `qa.student.resume.mrq86jn7@example.com` registered through the public UI.
- [x] Booking `24e35a82-e23d-489d-91ed-9e1be6bbf818` created for 2026-07-19 09:00–10:00 Asia/Dhaka at a $40.00 quote, then cancelled through the student UI with a reason.
- [x] The dedicated `banned-test@example.com` record was temporarily unbanned and re-banned with QA reasons, restoring its original banned state.

#### Newly completed coverage

- [x] Admin dashboard renders exactly six backend statistics.
- [x] Admin user search, role/status filters, required ban/unban reasons, a successful reversible status cycle, and self-ban rejection were verified.
- [x] Category creation and persisted editing were verified. **FAIL (QA-FE-005):** an edited category card remains stale until reload.
- [x] Tutor pending non-disclosure, rejection reason disclosure, profile edit/resubmission, approval, and public visibility were verified.
- [x] Public tutor detail, empty reviews, category/rate display, backend slot loading, booking quote, booking creation, student list/detail data, cancellation, and status history were verified.
- [ ] Distinguishable slot dates. **FAIL (QA-FE-006):** different dates render repeated time-only option labels.
- [ ] Immediate post-cancellation state. **FAIL (QA-FE-007):** cancellation succeeds in the backend but the detail page remains pending and `CONFIRMED` until reload.
- [x] Admin booking search/status filtering, cancelled booking detail/history, and backend-provided override options were verified.
- [x] The availability page identifies `Asia/Dhaka`, explains UTC splitting and DST/IANA re-save behavior, accepts a weekly interval, and reloads the saved local presentation.

#### Still open or time/data constrained

- [ ] UTC-midnight split inspection. Browser automation could not reliably commit non-default native `time` input values; the saved 09:00–10:00 interval therefore did not cross UTC midnight.
- [ ] Tutor assigned cancellation and completion, completed-booking review/immutability, cancellation at/after the exact start boundary, and conflict recovery need additional suitably timed bookings.
- [ ] Banned-user sign-in and mutation blocking remain open because the dedicated banned account password was not supplied.
- [ ] Inactive-category approval rejection and inactive listing/reactivation remain open; deactivating the only QA category would re-block the role matrix, and the backend still has no admin category-list endpoint.
- [ ] Network-offline, deliberate `429`, controlled token-expiry/invalid-token, OS timezone switching, full screen-reader traversal, and browser-visible request/rate-limit headers remain open under the previously documented environment constraints.
