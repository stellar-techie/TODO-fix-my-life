# FEATURE_IMPLEMENTATION_GUIDE.md — TODO: fix my life

Each feature is traced end to end: **user action → UI component → event handler → service layer → API route → controller → model/DB → response → UI update**. File paths and function names are real.

---

## 1. Registration

- **User view:** fills name/email/password/confirm on `/register`, clicks "Create My Notebook".
- **Flow:**
  1. `frontend/src/pages/RegisterPage.jsx` → `handleSubmit` validates client-side (name present, email regex, password ≥ 6, passwords match).
  2. Calls `register(name, email, password)` from `AuthContext` (`context/AuthContext.jsx`).
  3. `register` → `authAPI.register(...)` in `services/api.js` → `POST /api/auth/register`.
  4. `routes/authRoutes.js` → `controllers/authController.js` → `registerUser`: validates, checks the email isn't taken, `User.create(...)`.
  5. `models/User.js` `pre('save')` hook **hashes the password** with bcrypt before storing.
  6. Controller returns `{ success, user, token }` where `token = generateToken(user._id)`.
  7. `AuthContext` stores token + user in `localStorage` (`cozy_journal_token` / `cozy_journal_user`), sets context, navigates to `/journal`.
- **Errors:** duplicate email → 400 "An account with this email already exists"; short password → 400. The message is surfaced in the red banner.

## 2. Login & Persistent Session

- **User view:** `/login` form → "Sign In".
- **Flow:** `LoginPage.handleSubmit` → `AuthContext.login` → `authAPI.login` → `POST /api/auth/login` → `loginUser` finds the user, `user.matchPassword(password)` (bcrypt compare). On success returns user + JWT; `AuthContext` stores them and redirects to the originally requested page (`location.state.from`) or `/journal`.
- **Session restore:** on app load, `AuthContext`'s `useEffect` reads the saved token and calls `authAPI.getMe()` (`GET /api/auth/me`, protected). If valid, it refreshes the user; if it throws, it calls `logout()`. While this runs, `loading` is true and `ProtectedRoute` shows the spinner.
- **Errors:** wrong credentials → 401 "Invalid email or password".

## 3. Route Protection

- **User view:** navigating to `/journal` while logged out bounces to `/login`.
- **Flow:** `components/ProtectedRoute.jsx` reads `useAuth()`. If `loading` → `LoadingSpinner`. If `!isAuthenticated` → `<Navigate to="/login" state={{from: location}} />`. Otherwise renders the page. A second line of defense: `services/api.js`'s response interceptor clears the token on any 401.

## 4. Create a Journal Entry

- **User view:** `/journal/new`, fills title/content, picks mood/sticker/paper/weather/date, adds tags (Enter or comma), clicks "Save to Diary".
- **Flow:**
  1. `pages/JournalEditor.jsx` holds all fields in one `formData` state object. `handleAddTag` normalizes tags (lowercase, strip leading `#`, dedupe).
  2. `handleSubmit` validates title+content, then (create mode) `journalAPI.createEntry(formData)` → `POST /api/entries`.
  3. `protect` authenticates; `journalController.createEntry` validates, normalizes tags, applies defaults (mood `peaceful`, sticker `sunflower`, paper `grid`, weather `sunny`), `JournalEntry.create({ user: req.user._id, ... })`.
  4. Returns `201 { success, entry }`.
  5. UI fires `canvas-confetti` and navigates to `/journal`.
- **Data stored:** one `journalentries` document owned by the user.
- **Errors:** missing title/content → 400 (handled both client and server side).

## 5. List / Search / Filter Entries

- **User view:** `/journal` shows a card grid; typing in search filters live; mood pills and tag chips filter.
- **Flow:**
  1. `pages/JournalDashboard.jsx` `fetchEntries()` runs `Promise.all([getEntries(params), getTags(), getStats()])`.
  2. Search is **debounced 350 ms** (separate `useEffect` on `search`); mood/tag changes refetch immediately.
  3. `journalController.getEntries` builds the Mongo query: `search` → case-insensitive regex `$or` across title/content/tags; `mood`/`tag` exact match; results sorted by `entryDate` then `createdAt` descending.
  4. `getJournalTags` returns `distinct('tags')`; `getJournalStats` returns `{ total, moodCounts }`.
- **UI update:** entries render as cards (paper texture based on `paperStyle`, sticker SVG based on `sticker`). Empty results show `EmptyState`.

## 6. View a Single Entry

- **User view:** click a card → `/journal/:id`, read the full entry; edit or delete.
- **Flow:** `pages/JournalView.jsx` `useEffect` → `journalAPI.getEntryById(id)` → `GET /api/entries/:id` → `getEntryById` does a **404 if missing, 403 if not the owner**, else returns the entry. Delete opens `ConfirmationModal`; confirming calls `handleDelete` → `deleteEntry(id)` → navigate back to `/journal`.
- **Bug fixed during this audit:** the modal's `onConfirm` previously referenced an **undefined `handleConfirmDelete`**, which crashed this page on render. It now correctly calls `handleDelete`. (See `CODE_REVIEW_AND_IMPROVEMENTS.md`, CRITICAL-1.)

## 7. Update / Delete an Entry

- **Update:** `/journal/:id/edit` reuses `JournalEditor` (`isEditing = Boolean(id)`). It loads the entry, then `handleSubmit` → `journalAPI.updateEntry(id, formData)` → `PUT /api/entries/:id` → `updateEntry` (ownership check, field-by-field apply, `entry.save()`).
- **Delete:** from the dashboard card or the view page → `deleteEntry(id)` → `DELETE /api/entries/:id` → `deleteEntry` (ownership check → `entry.deleteOne()`), removed from the grid locally.

## 8. Weekly Planner

- **User view:** `/planner` shows Mon–Sat cards + a wide Sunday card + a Self-Care card + an editable sticky note; navigate weeks with Previous/Next/Today.
- **Flow:**
  1. `pages/WeeklyPlannerPage.jsx` reads `?date=` (defaults today) and calls `plannerAPI.getWeeklyPlanner(date)` → `GET /api/planner/week/:date`.
  2. `plannerController.getWeeklyPlanner` → `getMondayOfWeek(date)` → `findOne({ user, weekStartDate })`; **if none, it creates** the week with `generateDaysForWeek` + default self-care + default sticky note.
  3. Inline **add task**: `handleAddTask` → `addTask(date, {title})` → `POST /planner/day/:date/task` → `addTaskToDay` pushes a subdocument; response's updated `day` is merged into local state.
  4. **Toggle task**: `handleToggleTask` → `toggleTask` → `PATCH …/task/:taskId/toggle`; local state updated optimistically-ish from the response.
  5. **Self-care toggle** and **sticky note save** → `updateSelfCare` → `PUT /planner/week/:date/self-care`. The UI updates self-care state *before* the request for snappy feedback.
- **Week math:** `getMondayOfWeek` treats Sunday (JS day 0) as the week's end (offset −6) so Mon–Sun groups correctly.

## 9. Daily Planner (with Auto-Save + Sync)

- **User view:** `/planner/:date` focuses one day: a to-do list (add/toggle/delete), "Goal for today", "Reminder", and "Note"; a S-M-T-W-T-F-S switcher jumps between days of the same week. A status pill shows "Saving…/Saved".
- **Flow:**
  1. `pages/DailyPlannerPage.jsx` `fetchDayData` → `getDailyPlanner(date)` → `GET /planner/day/:date` → controller resolves the week, upserts if needed, finds the specific day, returns `{ day, weekStartDate }`.
  2. **Tasks:** add → `addTask`; toggle → `toggleTask` (confetti on completion); delete → `deleteTask`. Each returns the updated `day`.
  3. **Goal / Reminder / Notes:** `handleFieldChange` updates local state and calls `triggerAutoSave`, which **debounces 600 ms** then `PUT /planner/day/:date` with only the changed fields. Status pill reflects `saving` → `saved` (or `dirty` on failure).
  4. **Day switch:** `handleSelectDayOfWeek(index)` computes the target date from `weekStartDate` and navigates to `/planner/<date>`.
- **Sync:** because this writes the same weekly document the weekly page reads, changes appear there on next load. See the sequence diagram in `SYSTEM_ARCHITECTURE.md` §8.

## 10. Profile Management

- **User view:** `/profile` — pick an avatar emoji, edit name/bio, optionally change password, view "Stories Written" count.
- **Flow:** `pages/ProfilePage.jsx` loads the journal count via `getStats()`. `handleSubmit` validates the optional password, calls `AuthContext.updateProfile` → `authAPI.updateProfile` → `PUT /api/auth/me` → `updateUserProfile` (updates name/bio/avatar, re-hashes password if provided via the model hook) and returns a fresh token. `AuthContext` updates the stored user.

## 11. Cross-Cutting: Error Handling

- **Backend:** controllers wrap logic in `try/catch` and forward to `next(error)`; `errorMiddleware.errorHandler` returns uniform JSON (`success:false, message, stack`), hiding the stack in production. Known bad input returns explicit 400/401/403/404 before reaching the catch.
- **Frontend:** API errors surface via `err.response?.data?.message`. Auth pages show a red banner; dashboard/planner failures are mostly `console.error`'d (a known gap — see review). The Axios 401 interceptor auto-logs-out expired sessions.
