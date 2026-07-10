# IJSDS Platform — QA & UX Audit Report

**Date:** 2026-07-10 · **Auditor:** Senior QA / UX review (code + live probes)
**Scope:** Frontend (`ijsds-scholarly-forge`, React/Vite/TS) + Backend (`IJSDSBackend`, Express/Prisma/Cloud Run) + live public endpoints.
**Evidence labels:** `[observed]` = exercised live (URL/console/log) · `[inferred]` = code-review inferred · `[verify]` = needs runtime confirmation with credentials.

---

## 1. Executive Summary

- **Overall health:** The public journal site and Scholar/SEO plumbing are in good shape (server-rendered `/papers/:id` with full Highwire meta, live sitemap, RSS, OAI). The **workflow core (submissions → review → decision → production) carries serious access-control and data-integrity defects** that must be fixed before this platform can be trusted with real peer review.
- **Top risk #1 — Broken access control on reviews (Critical):** any logged-in user can read *and modify* any review, including confidential comments to the editor and the submitted recommendation. `PATCH /api/reviews/:id` has no role gate and the ownership check only applies when `role === "reviewer"`, but real users hold role `author` with an `is_reviewer` flag.
- **Top risk #2 — Two databases, one UI (Critical):** 20 components (entire Production suite, Reports, Notifications, Discussions, Revision portal, File version history, two admin guards) still read/write the **legacy Supabase project**, while core flows use the new Express/Prisma Postgres. These modules operate on a different database than the rest of the app.
- **Top risk #3 — Role-semantics split (Critical):** middleware treats `is_editor`/`is_admin` flags as authoritative, but services check the `role` string. Result: editors approved via *Manage Requests* (flag set, role left `author`) **cannot actually change submission status** (the author branch silently drops the update), and flag-admins cannot grant roles.
- **Quick win #1:** Add an `authorize` gate + flag-aware ownership checks to `reviews.routes.js` / `reviews.service.js` (small diff, closes the IDOR).
- **Quick win #2:** Normalize role semantics in one helper (`hasEditorAccess(user)`) used by every service, or set `role` alongside flags in Manage Requests approval.
- **Quick win #3:** Align upload limits (frontend 25 MB vs backend 10 MB) and move the fee table to one source of truth; both are silent-failure generators.
- The codebase **does not type-check** (19 `tsc` errors) — Vite still builds, so type errors ship to production unnoticed.
- Visual/UX: three unreconciled design languages, pervasive 9–10px low-contrast labels (WCAG AA failures), and click-only expanders without keyboard support.

---

## 2. Findings by Module

### 2.1 Auth & Session (login / register / reset / ORCID)

| # | Finding | Severity | Roles | Evidence | Impact & Recommendation |
|---|---------|----------|-------|----------|--------------------------|
| A1 | Logout blocklist is in-memory only | High | All | `IJSDSBackend/src/modules/auth/auth.service.js:24-29` (comment admits it) `[inferred]` | On Cloud Run (multi-instance, restarts) revoked tokens stay valid up to 7 days. Move blocklist to Redis (already connected: `[redis] Connected` in logs) or switch to short-lived tokens + refresh. |
| A2 | JWT in `localStorage`, 7-day expiry | Medium | All | `src/lib/apiClient.ts:3-8`; `auth.service.js:21` `[inferred]` | XSS ⇒ full account theft for a week. Acceptable trade-off only if CSP is added and expiry shortened (24h) with refresh flow. |
| A3 | Role/permission flags baked into JWT | Medium (mitigated) | All | `auth.service.js:10-22`; mitigation in `middleware/auth.js` (per-request DB refresh, added 2026-07) `[inferred]` | Mitigation adds one DB query per request; consider caching profile lookups (60s TTL) once traffic grows. Verify the fix is deployed. |
| A4 | Public “Admin Registration” page creates a normal author account | High (trust) | Guest | Route `App.tsx:168` (`/admin/register`, PublicLayout); `src/pages/AdminRegister.tsx:48-59` calls plain `signUp`, toasts “Welcome to IJSDS administration”, navigates to `/admin` which then bounces `[inferred]` | Misleading and discoverable by URL guessing; also indexable (no `noindex`). Either remove the route, gate behind an invite token, or rename honestly (“Request admin access”). |
| A5 | Auth page has almost no ARIA / label wiring | Medium | All | `src/pages/Auth.tsx` — only 3 `aria-`/`htmlFor` hits in whole file `[inferred]` | Screen-reader users can’t associate labels/errors. Add `htmlFor`/`id` pairs and `aria-invalid`/`aria-describedby` on errors. |

### 2.2 Reviews API & Reviewer flow (Dashboard, Review Form, Assignment)

| # | Finding | Severity | Roles