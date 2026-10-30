# PROJECT_OVERVIEW.md — TODO: fix my life

> Product name: **TODO: fix my life** (formerly branded "Bloom & Note").
> Repository folder name: `cozy-journal-planner/` (unchanged — this is an internal identifier).

---

## 1. Project Introduction

**TODO: fix my life** is a full-stack web application that combines a **private digital journal** with a **weekly + daily personal planner**, wrapped in a soft, hand-drawn "cozy stationery" aesthetic. A user registers an account, logs in, writes dated journal entries (with moods, tags, stickers, paper styles, weather), and plans their week day-by-day with to-do lists, a daily goal, a reminder note, and freeform notes. Every piece of data is private to the logged-in user and stored in MongoDB.

It is a classic **MERN stack** application: **M**ongoDB, **E**xpress, **R**eact, **N**ode.js.

## 2. Problem Statement

People who want to journal and plan digitally often face two separate tools: a notes/diary app and a to-do/planner app. This project unifies both into one aesthetic, private space. A specific design goal is that the **weekly planner and the daily planner are the same underlying data** — editing a task on the daily page immediately changes what the weekly page shows, because both read and write the same MongoDB document.

## 3. Purpose and Target Users

- **Students** who want to track study goals (the sample content references DSA, Computer Networks, etc.) alongside personal reflection.
- **Journaling hobbyists** who like a scrapbook/stationery look.
- **Anyone** wanting a single private place to both reflect (journal) and organize (planner).

## 4. Features (as actually implemented)

| Feature | Status | Where |
|---|---|---|
| Register / Login with JWT | ✅ Fully implemented | `authController.js`, `AuthContext.jsx` |
| Persistent session (localStorage + `/auth/me` restore) | ✅ | `AuthContext.jsx` |
| Journal CRUD (create, read, update, delete) | ✅ | `journalController.js`, Journal pages |
| Journal search (title/content/tags) | ✅ | `getEntries` + `JournalDashboard` |
| Journal filter by mood & tag | ✅ | `getEntries` query params |
| Journal stats (total + mood counts) | ✅ | `getJournalStats`, shown on Dashboard/Profile |
| Distinct tags list | ✅ | `getJournalTags` |
| Mood / sticker / paper style / weather on entries | ✅ (weather stored but not shown in read view) | `JournalEntry.js`, `JournalEditor.jsx` |
| Weekly planner (7 day cards + self-care + sticky note) | ✅ | `plannerController.js`, `WeeklyPlannerPage.jsx` |
| Daily planner (tasks, goal, reminder, notes) | ✅ | `DailyPlannerPage.jsx` |
| Weekly ↔ Daily real-time sync (shared document) | ✅ | Same `WeeklyPlanner` doc per week |
| Task add / toggle / delete | ✅ | planner routes |
| Self-care checklist + editable weekly quote | ✅ | `updateSelfCare` |
| Daily goal/reminder/notes auto-save (debounced) | ✅ | `DailyPlannerPage` `triggerAutoSave` |
| Profile: name, bio, avatar emoji, password change | ✅ | `updateUserProfile`, `ProfilePage.jsx` |
| Confetti on entry save & task completion | ✅ | `canvas-confetti` |
| Strict per-user authorization | ✅ | ownership checks in controllers |
| In-memory MongoDB fallback (zero-config dev) | ✅ | `config/db.js` |
| Image upload (Cloudinary) | ❌ Not implemented | `imageUrl` field exists but no upload UI |
| `isFavorite` filter | ⚠️ Backend supports it; no UI toggle | `getEntries` reads `favorite` query |
| `startDate`/`endDate` journal filter | ⚠️ Backend supports it; no UI | `getEntries` |
| Priority on tasks | ⚠️ Stored (`normal`/`high`/`low`); not surfaced in UI | `WeeklyPlanner.js` |

Legend: ✅ fully working · ⚠️ partially implemented / backend-only · ❌ not implemented.

## 5. Technology Stack

**Frontend:** React 18, Vite 5, React Router DOM 6, Tailwind CSS 3, Axios, Lucide-React (icons), canvas-confetti, clsx + tailwind-merge (present as deps).
**Backend:** Node.js (ES Modules), Express 4, Mongoose 8, MongoDB (Atlas or `mongodb-memory-server`), jsonwebtoken, bcryptjs, cors, dotenv.

See `SYSTEM_ARCHITECTURE.md` for how each piece is used.

## 6. Project Highlights (talking points)

1. **Shared-document synchronization** — one `WeeklyPlanner` document per user per week holds all 7 days; the daily view is just a lens onto one embedded sub-document, so weekly and daily views are always consistent with no extra sync logic.
2. **Zero-config local development** — if no `MONGO_URI` is set, the backend boots an embedded in-memory MongoDB, so the app runs end-to-end with no external database.
3. **Backend-enforced authorization** — every private resource checks `resource.user === req.user._id` before returning data, so a user can never read another user's entries even with a valid token.
4. **Automated 20-check E2E suite** — `backend/test-flows.js` hits the live API and verifies auth, CRUD, sync, and cross-user isolation.
5. **Debounced auto-save** on the daily planner's text fields for a smooth, "it just saves" UX.

## 7. Current Implementation Status

The core product (auth, journal, weekly/daily planner, profile) is **complete and verified** by the passing E2E suite and a successful production build. Known gaps are the unused `imageUrl`/Cloudinary path, UI toggles for favorites and date-range filtering, and task priority not being surfaced in the interface. See `CODE_REVIEW_AND_IMPROVEMENTS.md` for the full audit.
