# COMPLETE_CODEBASE_GUIDE.md — TODO: fix my life

A file-by-file and module-by-module tour of the codebase. For every important file: what it does, why it exists, what it interacts with, and what breaks if it's removed or changed.

---

## 1. Top-Level Folder Structure

```
cozy-journal-planner/
├── backend/        # Express + Mongoose REST API (Node, ES Modules)
├── frontend/       # React + Vite single-page app
├── README.md       # Product + setup docs
└── .gitignore      # ignores node_modules, .env, dist, logs
```

The backend and frontend are **two independent npm projects**. In development they run on different ports (API on 5000, UI on 5173) and the Vite dev server proxies `/api` to the backend.

---

## 2. Backend (`backend/`)

```
backend/
├── server.js              # App entry point
├── config/db.js           # Mongo connection + memory-server fallback
├── controllers/           # Request handlers (business logic)
│   ├── authController.js
│   ├── journalController.js
│   └── plannerController.js
├── middleware/
│   ├── authMiddleware.js   # JWT "protect" guard
│   └── errorMiddleware.js  # 404 + global error handler
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── JournalEntry.js
│   └── WeeklyPlanner.js
├── routes/                 # Express routers (URL → controller mapping)
│   ├── authRoutes.js
│   ├── journalRoutes.js
│   └── plannerRoutes.js
├── utils/generateToken.js  # JWT signing helper
├── test-flows.js           # 20-check E2E test script
├── .env / .env.example     # environment config
└── package.json
```

### `server.js` — application bootstrap
- **Does:** loads env vars (`dotenv`), connects to MongoDB (`connectDB`), configures `cors` and JSON body parsing (10 MB limit), defines `GET /api/health`, mounts the three routers (`/api/auth`, `/api/entries`, `/api/planner`), then the `notFound` + `errorHandler` middleware, and starts listening on `PORT`.
- **Interacts with:** every router, both middleware, and `config/db.js`.
- **If removed/broken:** the entire API fails to start. Order matters — error middleware must be mounted **after** routes, or errors won't be caught.

### `config/db.js` — database connection
- **Does:** if `MONGO_URI` is set, connects to that (e.g. Atlas). Otherwise it starts an embedded `MongoMemoryServer` and connects to it. If an external URI fails, it falls back to the memory server; if that also fails, `process.exit(1)`.
- **Interacts with:** `mongoose`, `mongodb-memory-server`, and indirectly every model.
- **If removed:** no DB connection; all data operations throw. The memory-server fallback is what makes the app run with zero setup.
- **Note:** the memory server is ephemeral — **data is wiped on every restart** unless you point `MONGO_URI` at a persistent database.

### `models/User.js`
- **Does:** defines the `User` schema (`name`, unique lowercase `email` with regex validation, `password`, `avatar` emoji default `🌸`, `bio`, timestamps). A `pre('save')` hook hashes the password with bcrypt (salt rounds 10) **only when the password field changed**. Adds a `matchPassword(plain)` instance method using `bcrypt.compare`.
- **Interacts with:** `authController` (register/login/profile) and `authMiddleware` (user lookup).
- **If the hashing hook is removed:** passwords would be stored in plaintext — a critical security regression. If `isModified` check is removed, re-saving a user would double-hash the password and break login.

### `models/JournalEntry.js`
- **Does:** defines a journal entry: `user` (ObjectId ref, indexed), `title`, `content`, `mood` (enum of 10 moods), `tags` (array of lowercased strings), `entryDate` (indexed), `imageUrl`, `sticker`, `paperStyle` (enum), `weather` (enum), `isFavorite`. Adds a **compound index** `{ user: 1, entryDate: -1 }` for fast per-user chronological queries.
- **Interacts with:** `journalController`.
- **If the compound index is removed:** queries still work but get slower as entries grow.

### `models/WeeklyPlanner.js`
- **Does:** the heart of the planner. Three nested schemas:
  - `taskSchema`: `title`, `completed`, `priority` enum, `createdAt`. Each task gets its own `_id` (used for toggle/delete).
  - `dayPlannerSchema`: `date` (string `YYYY-MM-DD`), `dayName` enum, `tasks[]`, `goal`, `reminder`, `notes`.
  - `weeklyPlannerSchema`: `user` ref, `weekStartDate` (Monday, string), `days[]` (7 embedded days), `selfCare[]` (title+completed), `stickyNote`.
  - A **unique compound index** `{ user: 1, weekStartDate: 1 }` enforces one document per user per week.
- **Interacts with:** `plannerController`.
- **Why this design:** embedding all 7 days in one document is exactly why the weekly and daily views stay in sync — they read/write the same document.
- **If the unique index is removed:** concurrent requests for a brand-new week could create duplicate weekly documents.

### `controllers/authController.js`
- **Functions:** `registerUser`, `loginUser`, `getUserProfile`, `updateUserProfile`.
- **Does:** validates input, checks for existing email, creates users, issues JWTs (via `generateToken`), returns a safe user object (never the password hash). `updateUserProfile` updates name/bio/avatar and optionally the password (re-validated for length ≥ 6).
- **Interacts with:** `User` model, `generateToken`, `authRoutes`.

### `controllers/journalController.js`
- **Functions:** `getEntries`, `getEntryById`, `createEntry`, `updateEntry`, `deleteEntry`, `getJournalTags`, `getJournalStats`.
- **Does:** `getEntries` builds a Mongo query from `search` (regex across title/content/tags), `mood`, `tag`, `favorite`, and `startDate`/`endDate`. Every single-entry operation does an **ownership check** (`entry.user.toString() !== req.user._id.toString()` → 403). Tags are normalized (trimmed, lowercased, de-blanked) whether sent as array or comma string.
- **Interacts with:** `JournalEntry`, `authMiddleware`, `journalRoutes`.
- **If the ownership checks are removed:** any logged-in user could read/edit/delete any entry by ID — a critical authorization hole.

### `controllers/plannerController.js`
- **Date helpers:** `formatDateOnly`, `parseDateOnly`, `getMondayOfWeek` (maps any date to its Monday — Sunday is treated as the end of the week, offset `-6`), `generateDaysForWeek` (builds 7 default day objects Mon→Sun).
- **Functions:** `getWeeklyPlanner`, `getDailyPlanner`, `updateDailyPlanner`, `addTaskToDay`, `toggleTask`, `deleteTask`, `updateSelfCare`.
- **Does:** all planner reads **upsert** — if no document exists for the requested week, it's created with default days + default self-care list. Task mutation uses Mongoose subdocument helpers (`day.tasks.push`, `day.tasks.id(taskId)`, `day.tasks.pull(taskId)`).
- **Interacts with:** `WeeklyPlanner`, `authMiddleware`, `plannerRoutes`.

### `middleware/authMiddleware.js` — `protect`
- **Does:** reads `Authorization: Bearer <token>`, verifies the JWT, loads the user (minus password) into `req.user`. Returns 401 if the token is missing, invalid, expired, or the user no longer exists.
- **Interacts with:** `jwt`, `User`, and every protected route.
- **If removed:** all "private" routes become public.

### `middleware/errorMiddleware.js`
- **`notFound`:** turns any unmatched route into a 404 Error passed to the handler.
- **`errorHandler`:** returns JSON `{ success, message, stack }`; the stack is hidden when `NODE_ENV === 'production'`.
- **Why it exists:** controllers use `try/catch … next(error)`, so this is the single place errors are formatted.

### `utils/generateToken.js`
- **Does:** `jwt.sign({ id }, SECRET, { expiresIn: '30d' })`.
- **Note:** it falls back to a hardcoded secret if `JWT_SECRET` is unset — see the security notes in `CODE_REVIEW_AND_IMPROVEMENTS.md`.

### `routes/*.js`
- Map URLs to controllers. `journalRoutes` and `plannerRoutes` call `router.use(protect)` so **every** route in them is authenticated. `authRoutes` protects only `/me`.
- **Ordering gotcha:** in `journalRoutes`, `/tags` and `/stats` are declared **before** `/:id` so they aren't swallowed by the dynamic `:id` route.

### `test-flows.js`
- A standalone Node script (uses global `fetch`) that runs 20 assertions against a **running** server on `localhost:5000`: health, registration, login, bad-credential rejection, journal CRUD + search, weekly/daily sync, cross-user 403 isolation, and delete→404. Run it with the server already up.

---

## 3. Frontend (`frontend/`)

```
frontend/
├── index.html              # HTML shell, <title>, Google Fonts, favicon
├── vite.config.js          # Vite + React plugin + /api proxy
├── tailwind.config.js      # cozy color palette, fonts, shadows
├── postcss.config.js       # Tailwind/autoprefixer
├── src/
│   ├── main.jsx            # React root; wraps App in Router + AuthProvider
│   ├── App.jsx             # Route table
│   ├── index.css           # Tailwind layers + paper/washi/scrollbar styles
│   ├── services/api.js     # Axios instance + endpoint functions + interceptors
│   ├── context/AuthContext.jsx   # global auth state
│   ├── layouts/MainLayout.jsx    # Navbar + <Outlet/> + Footer
│   ├── components/         # reusable UI
│   └── pages/              # one component per route
└── package.json
```

### `main.jsx`
- **Does:** mounts React, wrapping `<App/>` in `<BrowserRouter>` then `<AuthProvider>` inside `<React.StrictMode>`.
- **If the provider order changes:** `useAuth()` or routing hooks would fail if used outside their providers.

### `App.jsx` — routing
- **Does:** declares all routes inside one `MainLayout` parent route. Public: `/`, `/login`, `/register`. Protected (wrapped in `<ProtectedRoute>`): `/journal`, `/journal/new`, `/journal/:id`, `/journal/:id/edit`, `/planner`, `/planner/:date`, `/profile`. `*` redirects to `/`.
- **Interacts with:** every page, `MainLayout`, `ProtectedRoute`.

### `services/api.js`
- **Does:** creates an Axios instance with `baseURL: '/api'`. A **request interceptor** attaches `Authorization: Bearer <token>` from `localStorage`. A **response interceptor** clears the stored token/user on any 401 (unless you're on login/register). Exports grouped endpoint objects: `authAPI`, `journalAPI`, `plannerAPI`.
- **Interacts with:** every page/component that talks to the backend, and `AuthContext`.
- **If removed:** no component can reach the API. This is the single integration seam between UI and backend.

### `context/AuthContext.jsx`
- **Does:** holds `user`, `token`, `loading`, `error`. Initializes from `localStorage` (keys `cozy_journal_user` / `cozy_journal_token` — internal identifiers, unchanged by the rebrand). On mount it calls `authAPI.getMe()` to validate/refresh the session. Exposes `login`, `register`, `logout`, `updateProfile`, `clearError`, and a derived `isAuthenticated`.
- **Interacts with:** `authAPI`, `ProtectedRoute`, `Navbar`, auth pages, `ProfilePage`.
- **If removed:** no shared login state; every page would re-implement auth.

### `layouts/MainLayout.jsx`
- **Does:** page frame — `Navbar` on top, routed page in the middle (`<Outlet/>`), `Footer` at the bottom, flex column so the footer sticks to the bottom.

### Components (`src/components/`)
| Component | Responsibility |
|---|---|
| `Navbar.jsx` | Brand logo ("TODO: fix my life"), nav links (Journal / Weekly / Daily), New Entry button, profile dropdown + mobile drawer. Reads `useAuth`. |
| `Footer.jsx` | Static scrapbook footer with brand name. |
| `ProtectedRoute.jsx` | Reads `useAuth`; shows a spinner while `loading`, redirects to `/login` if not authenticated, otherwise renders children. |
| `LoadingSpinner.jsx` | Spinning sunflower + message. |
| `EmptyState.jsx` | Illustrated empty state with optional action button. |
| `ConfirmationModal.jsx` | Reusable yes/no modal (used for deletes). Controlled via `isOpen`, `onConfirm`, `onCancel`. |
| `Doodles.jsx` | 11 inline SVG doodle components (SunflowerDoodle, TulipDoodle, DaisyDoodle, etc.) used as decorations across pages. |

### Pages (`src/pages/`)
| Page | Route | Responsibility |
|---|---|---|
| `LandingPage.jsx` | `/` | Marketing hero + 3 feature preview cards + motivational note. |
| `LoginPage.jsx` | `/login` | Email/password form → `login()` → redirect to intended page or `/journal`. |
| `RegisterPage.jsx` | `/register` | Name/email/password/confirm form with client validation → `register()`. |
| `JournalDashboard.jsx` | `/journal` | Entry grid, debounced search, mood pills, tag filter, stats ticker, delete modal. Fetches entries+tags+stats in parallel. |
| `JournalEditor.jsx` | `/journal/new`, `/journal/:id/edit` | Create/edit form (title, content, mood, sticker, paper, weather, date, tags). Confetti on create. |
| `JournalView.jsx` | `/journal/:id` | Read-only entry view with edit/delete actions and a confirm modal. |
| `WeeklyPlannerPage.jsx` | `/planner` | 7-day board (Mon–Sat grid + wide Sunday card), inline task add, toggle, self-care checklist, editable sticky note, week navigation via `?date=`. |
| `DailyPlannerPage.jsx` | `/planner/:date` | Single-day focus: to-do list, goal, reminder, notes with debounced auto-save, S-M-T-W-T-F-S day switcher, confetti on task complete. |
| `ProfilePage.jsx` | `/profile` | Avatar emoji picker, name/bio edit, optional password change, journal count stat. |

---

## 4. Module Dependency Summary

```
main.jsx → App.jsx → pages/* → services/api.js → (HTTP /api) → routes/* → controllers/* → models/* → MongoDB
                      ↘ context/AuthContext.jsx ↗ (consumed by Navbar, ProtectedRoute, auth pages, Profile)
```

- The **only** way the frontend reaches the backend is through `services/api.js`.
- The **only** source of auth state is `AuthContext`.
- The **only** way a protected controller runs is after `protect` middleware populates `req.user`.
