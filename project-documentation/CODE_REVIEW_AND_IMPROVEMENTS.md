# CODE_REVIEW_AND_IMPROVEMENTS.md — TODO: fix my life

A senior-engineer review of the actual code. Findings are classified CRITICAL / HIGH / MEDIUM / LOW. One CRITICAL bug was fixed during this audit; everything else is reported (not changed) so you decide what to action.

---

## 1. Existing Strengths
- **Clean layered backend:** routes → middleware → controllers → models. Each layer has one job.
- **Consistent response shape** (`{ success, ... }`) across the API.
- **Real authorization**, not just authentication — ownership is enforced server-side on every private resource.
- **Password security done right:** bcrypt hashing in a `pre('save')` hook guarded by `isModified`, plaintext never returned.
- **Thoughtful data modeling:** embedding 7 days in one weekly document elegantly solves weekly/daily sync.
- **Good DX:** zero-config in-memory DB, `node --watch` dev script, and a genuine 20-check E2E suite.
- **Useful indexes**, including the unique `{user, weekStartDate}` constraint.
- **Nice UX touches:** debounced search and auto-save, optimistic-ish local updates, confetti feedback.

---

## 2. Findings

### CRITICAL

**CRITICAL-1 — `JournalView` referenced an undefined function (FIXED in this audit).**
`frontend/src/pages/JournalView.jsx` rendered `<ConfirmationModal onConfirm={handleConfirmDelete} />`, but the component only defines `handleDelete`. `handleConfirmDelete` is undefined in that scope, so the single-entry view page threw a `ReferenceError` as soon as React evaluated the JSX — meaning **clicking any journal card to read it crashed the page**. Vite's production build does not catch this (it's a runtime, not compile-time, error), so the bug shipped silently.
**Fix applied:** changed `onConfirm={handleConfirmDelete}` → `onConfirm={handleDelete}`. Verified by a clean rebuild.
**Impact of leaving it:** core "read entry / edit / delete from detail view" flow fully broken.

### HIGH

**HIGH-1 — JWT secret hardcoded fallback. ✅ FIXED.**
Previously `utils/generateToken.js` and `middleware/authMiddleware.js` each defaulted to a literal string if `JWT_SECRET` was unset (and the two literals differed). **Fixed:** a new `backend/config/env.js` loads `.env`, **requires `JWT_SECRET`**, and `process.exit(1)`s with a clear message if it's missing/empty. Both files now import the single validated `JWT_SECRET`; no literals remain. Verified: blank secret → clean exit code 1.

**HIGH-2 — CORS wide open. ✅ FIXED.**
`server.js` previously used `origin: '*'`. **Fixed:** CORS now uses an **allowlist** (`CLIENT_ORIGINS`, comma-separated) defaulting to local dev origins; requests with no `Origin` header (curl, server-to-server, the E2E suite) are still allowed. Add your Vercel URL to `CLIENT_ORIGINS` in production.

**HIGH-3 — No rate limiting on auth endpoints. ✅ FIXED.**
**Fixed:** added `express-rate-limit` (`middleware/rateLimitMiddleware.js`, `authLimiter`) on `POST /auth/login` and `POST /auth/register` — 30 attempts per IP per 15 min, returning 429 past the limit. `app.set('trust proxy', 1)` was added so the real client IP is used behind Render's proxy. Verified: burst of logins returns 401s then 429s; the 20/20 E2E suite still passes.

**HIGH-4 — Last-write-wins on the weekly document (concurrency).**
Planner mutations do `findOne → mutate in memory → save()`. Two near-simultaneous writes to the same week (e.g., two tabs) can clobber each other because the whole document is re-saved. *Recommendation:* use atomic update operators (`$push`, `$set` with array filters) or optimistic concurrency (version key) for task/field mutations.

### MEDIUM

**MEDIUM-1 — Silent frontend error handling.** Dashboard and planner failures are mostly `console.error`'d with no user-facing message. A failed save on the daily planner only flips an internal `dirty` status that isn't rendered. *Recommendation:* surface toasts/banners on fetch/save failures.

**MEDIUM-2 — `GET` with write side effects.** `getWeeklyPlanner`/`getDailyPlanner` create data on read (upsert). Convenient, but violates HTTP GET semantics and means a read can fail on the unique index under a race. *Recommendation:* document it, or move creation to an explicit action.

**MEDIUM-3 — Unused / orphaned code and fields.** `imageUrl` (no upload UI), `weather` (saved but never displayed in `JournalView`), task `priority` (stored, never shown), `isFavorite` + `startDate/endDate` filters (backend-only, no UI), and deps `clsx`/`tailwind-merge` appear unused in `src`. *Recommendation:* either wire them into the UI or remove to reduce confusion.

**MEDIUM-4 — Duplicated logic.** Tag normalization is duplicated in `createEntry` and `updateEntry`; the "find-or-create weekly planner" block is repeated in several planner handlers; paper-style→class mapping is repeated across three pages. *Recommendation:* extract helpers (`normalizeTags`, `getOrCreatePlanner`, `paperClassFor`).

**MEDIUM-5 — No pagination on `GET /entries`.** All matching entries are returned at once. Fine for a personal diary, but unbounded. *Recommendation:* add `limit`/`skip` (or cursor) pagination.

**MEDIUM-6 — Date handling relies on server/browser local time.** `getMondayOfWeek` and several `new Date().toISOString().split('T')[0]` calls mix local and UTC. Users in different timezones (or a UTC server) can see off-by-one day boundaries. *Recommendation:* standardize on a single timezone strategy.

### LOW

- **LOW-1 — README/API drift:** README said `PUT /api/auth/profile`; real route is `PUT /api/auth/me`. (Corrected in the new docs.)
- **LOW-2 — No automated frontend tests**, no linter/formatter config committed.
- **LOW-3 — Magic strings/enums** (moods, stickers) are duplicated between frontend constants and backend enums; could share a single source.
- **LOW-4 — `JournalView` imports several unused icons/doodles**; minor bundle noise.
- **LOW-5 — Accessibility:** icon-only buttons (delete, toggles, mobile menu) often lack `aria-label`; color-coded day themes aren't paired with non-color cues. *Note:* full WCAG compliance requires manual testing with assistive tech and expert review.

---

## 3. Security Summary
| Area | State |
|---|---|
| Password storage | ✅ bcrypt, salted, guarded hook |
| AuthN | ✅ JWT Bearer, 30-day expiry |
| AuthZ | ✅ server-side ownership checks |
| Secret management | ⚠️ hardcoded fallback (HIGH-1) |
| CORS | ⚠️ `*` (HIGH-2) |
| Brute-force protection | ❌ none (HIGH-3) |
| Token storage | ⚠️ `localStorage` (XSS-exposed) |
| Input validation | ✅ schema + controller + client |

## 4. Performance Notes
- Good indexes already in place. Main concerns are **no pagination** (MEDIUM-5) and **whole-document planner saves** (HIGH-4) as data grows. The client bundle is a single ~335 KB JS chunk (~100 KB gzipped) — acceptable, but code-splitting routes would help first paint.

## 5. Technical Debt
- Orphaned fields/features (MEDIUM-3), duplicated logic (MEDIUM-4), and the timezone ambiguity (MEDIUM-6) are the main debts. None block the product, but they'll slow future features.

## 6. Prioritized Improvement Plan
1. **(Done)** Fix the `JournalView` crash. ✅
2. **(Done)** Harden auth: require `JWT_SECRET`, lock CORS, add rate limiting (HIGH-1/2/3). ✅
3. **Fix planner concurrency** with atomic updates (HIGH-4).
4. **Surface errors in the UI** + add save-failure feedback (MEDIUM-1).
5. **Wire up or remove** the orphaned fields/features and de-duplicate helpers (MEDIUM-3/4).

## 7. Suggested Future Features
- Image attachments (the `imageUrl` field is already there) via a storage provider.
- Favorites toggle + date-range filter UI (backend already supports both).
- Monthly calendar / mood streaks using `getJournalStats`.
- Export a journal/planner to PDF.
- Move JWT to an httpOnly cookie and add refresh tokens.
