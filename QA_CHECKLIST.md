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
