# INTERVIEW_PREPARATION.md — TODO: fix my life

Everything here is grounded in the real code. Use it to explain and defend the project confidently.

---

## A. Project Introduction

**30-second version:**
"TODO: fix my life is a full-stack MERN app that combines a private digital journal with a weekly and daily planner. Users register, log in with JWT auth, write dated journal entries with moods and tags, and plan their week day by day. The neat part is the weekly and daily planner views are the same underlying MongoDB document, so edits stay in sync automatically."

**1-minute version:**
Add: "The backend is Express + Mongoose with three resources — auth, journal entries, and planner. Every private route is protected by JWT middleware, and every resource enforces per-user ownership, so you can never read someone else's data. The frontend is React with Vite, React Router for navigation, React Context for auth state, and Axios with an interceptor that attaches the token. For local development it even spins up an in-memory MongoDB so there's zero setup, and there's a 20-check end-to-end test suite that verifies auth, CRUD, planner sync, and cross-user isolation."

**2-minute version:**
Add the data-model insight and a feature tour: "The core design decision is embedding all seven days — and each day's tasks, goal, reminder, and notes — inside one weekly-planner document keyed by the Monday of that week. Because the daily page and the weekly page both resolve to that same document, synchronization isn't a feature I had to build; it's a property of the schema. On the journal side I have full CRUD plus server-side search across title/content/tags, mood and tag filtering, and a stats endpoint for mood breakdowns. The UX has debounced search, debounced auto-save on the daily planner, optimistic local updates, and confetti on wins. I know its limits too: JWTs live in localStorage, CORS is open in dev, and a few fields like image upload are scaffolded but not wired up — all things I can talk through and would harden for production."

---

## B. Technical Explanation (plain language)
- **Frontend:** React builds the screen from components. React Router decides which page shows based on the URL. React Context (`AuthContext`) is a shared box holding "who's logged in" so any component can read it. Axios is the messenger that sends requests to the backend and automatically clips the login token onto each one.
- **Backend:** Express is a receptionist that routes each incoming request to the right handler. Before private handlers run, a bouncer (`protect`) checks the token. Handlers (controllers) do the thinking, then ask Mongoose to read/write MongoDB.
- **Database:** MongoDB stores JSON-like documents. Instead of many tables joined together, a whole week of planning lives in one document.
- **Auth:** Passwords are scrambled with bcrypt (one-way). On login the server re-scrambles your input and compares. If it matches, you get a signed token (JWT) that proves who you are on later requests.

---

## C. Feature Explanation (how to narrate each)
- **Auth & session:** "Register/login return a JWT; I store it in localStorage and re-validate on page load via `/auth/me`. `ProtectedRoute` gates private pages."
- **Journal CRUD + search:** "`JournalDashboard` fetches entries, tags, and stats in parallel; search is debounced and runs server-side as a case-insensitive regex across title, content, and tags."
- **Weekly/Daily planner:** "One document per week. The daily page is a lens on one embedded day; toggling a task or editing the goal writes back to the same document, so the weekly view reflects it."
- **Auto-save:** "Goal/Reminder/Notes use a 600 ms debounce — I store a timeout in a ref, clear it on each keystroke, and only PATCH the changed fields."

---

## D. Technical Interview Questions (codebase-specific)

> Format per question: **Answer → Explanation → Code reference → Follow-ups.**

### Architecture

**1. What architecture does this project use?**
A decoupled MERN SPA + REST API. **Explanation:** React SPA in the browser, Express REST API server, MongoDB store, JSON over HTTP, stateless JWT auth. **Ref:** `frontend/` vs `backend/`, `server.js`. **Follow-ups:** Why decouple? How would you deploy each half?

**2. How does a request flow from a button click to the database?**
UI handler → `services/api.js` (Axios) → Express router → `protect` → controller → Mongoose model → MongoDB, then back as JSON. **Ref:** e.g. `JournalDashboard.fetchEntries` → `journalAPI.getEntries` → `journalRoutes` → `getEntries`. **Follow-up:** Where is the token added? (request interceptor).

**3. Why two separate npm projects?**
Independent concerns, independent deploys, and the frontend can be a pure static bundle. **Ref:** two `package.json`s, `vite.config.js` proxy. **Follow-up:** How do they talk in dev vs prod?

**4. What does `server.js` set up and in what order?**
env → DB connect → CORS → JSON parsers → health route → 3 routers → notFound → errorHandler → listen. **Ref:** `server.js`. **Follow-up:** Why must error middleware be last?

### Frontend / React

**5. How is global auth state managed?**
React Context via `AuthProvider`, exposing `user`, `token`, `isAuthenticated`, and actions. **Ref:** `context/AuthContext.jsx`, consumed by `useAuth()`. **Follow-up:** Why Context over Redux here? (small, mostly-auth state).

**6. How does `useAuth` prevent misuse?**
It throws if used outside `AuthProvider`. **Ref:** the `if (!context) throw` guard. **Follow-up:** What error would you see otherwise?

**7. How does protected routing work?**
`ProtectedRoute` reads `isAuthenticated`/`loading`; spinner while loading, redirect to `/login` (preserving intended path via `state.from`) if unauthenticated. **Ref:** `components/ProtectedRoute.jsx`, `LoginPage` uses `location.state.from`. **Follow-up:** Is this real security? (No — it's UX; the server enforces real auth.)

**8. How are dynamic routes defined?**
`/journal/:id`, `/journal/:id/edit`, `/planner/:date`. Read via `useParams`. **Ref:** `App.jsx`, `JournalView`/`JournalEditor`/`DailyPlannerPage`. **Follow-up:** How does the editor know create vs edit? (`isEditing = Boolean(id)`).

**9. How is search debounced?**
A `useEffect` on `search` sets a 350 ms `setTimeout` and clears it on change. **Ref:** `JournalDashboard` second `useEffect`. **Follow-up:** Why debounce? (fewer API calls while typing).

**10. How does daily auto-save work?**
`triggerAutoSave` stores a timeout in a `useRef`, clears it each keystroke, then PATCHes after 600 ms; a status pill shows saving/saved. **Ref:** `DailyPlannerPage.triggerAutoSave`, `handleFieldChange`. **Follow-up:** Why a ref instead of state for the timer? (avoid re-renders / stale closures).

**11. How does the UI update after a task toggle without a refetch?**
It maps local state and flips `completed`, or uses the returned `day` from the API. **Ref:** `WeeklyPlannerPage.handleToggleTask`, `DailyPlannerPage.handleToggleTask`. **Follow-up:** What's the risk of optimistic updates? (UI/server divergence on error).

**12. How are different "paper" textures rendered?**
A ternary maps `paperStyle` to a CSS class (`bg-grid-paper`, etc.) defined in `index.css`. **Ref:** `JournalEditor`, `JournalView`, `JournalDashboard`. **Follow-up:** Where would you de-duplicate this? (a helper).

**13. How are icons and the confetti effect done?**
`lucide-react` for icons; `canvas-confetti` fired on entry create and task completion. **Ref:** `JournalEditor.handleSubmit`, `DailyPlannerPage.handleToggleTask`. **Follow-up:** Any performance concern? (negligible, short bursts).

**14. How is styling implemented?**
Tailwind utilities + a custom `cozy` palette/fonts/shadows in `tailwind.config.js`, plus `index.css` for paper/washi/scrollbar. **Ref:** `tailwind.config.js`, `index.css`. **Follow-up:** Pros/cons of utility CSS?

**15. What does `main.jsx` wrap the app in and why order matters?**
`BrowserRouter` → `AuthProvider` → `App`, inside `StrictMode`. Router must be outside components using routing hooks; provider must wrap consumers of `useAuth`. **Ref:** `main.jsx`.

### Backend / Node / Express

**16. How is authentication middleware implemented?**
`protect` reads the Bearer token, `jwt.verify`s it, loads the user minus password into `req.user`, else 401. **Ref:** `middleware/authMiddleware.js`. **Follow-up:** What if the user was deleted after the token was issued? (401 "user not found").

**17. How is authorization (not just authentication) enforced?**
Controllers compare `resource.user.toString() === req.user._id.toString()` (journal → 403), and planner queries are scoped by `user`. **Ref:** `getEntryById/updateEntry/deleteEntry`, planner `findOne({user,...})`. **Follow-up:** Why `.toString()`? (ObjectId vs string comparison).

**18. How are errors handled centrally?**
Controllers `try/catch → next(error)`; `errorHandler` returns uniform JSON and hides the stack in production. **Ref:** `middleware/errorMiddleware.js`. **Follow-up:** Why check `res.statusCode === 200` there? (so a thrown error after a set status keeps it, else 500).

**19. How does route ordering avoid conflicts?**
`/entries/tags` and `/entries/stats` are declared before `/entries/:id`. **Ref:** `journalRoutes.js`. **Follow-up:** What breaks if reversed? (`:id` captures "tags").

**20. How do you protect an entire router at once?**
`router.use(protect)` at the top of `journalRoutes`/`plannerRoutes`. **Ref:** those files. **Follow-up:** Why is `/auth/me` protected individually instead?

**21. How is the JWT generated?**
`jwt.sign({ id }, SECRET, { expiresIn: '30d' })`. **Ref:** `utils/generateToken.js`. **Follow-up:** Why store only the id? (keep tokens small; fetch fresh user each request).

**22. What's the body size limit and why?**
`express.json({ limit: '10mb' })`. **Ref:** `server.js`. **Follow-up:** Why cap it? (DoS protection).

### Database / Mongoose

**23. Describe the data model.**
`User`, `JournalEntry` (refs user), `WeeklyPlanner` (refs user, embeds 7 days each embedding tasks). **Ref:** `models/`. **Follow-up:** Why embed days instead of a `Day` collection? (atomic weekly read/write + sync).

**24. How does password hashing work and when does it run?**
`pre('save')` bcrypt-hashes only when `password` is modified. **Ref:** `User.js`. **Follow-up:** What bug would removing the `isModified` guard cause? (double-hash on profile updates → broken login).

**25. What indexes exist and why?**
`JournalEntry`: `user`, `entryDate`, compound `{user:1, entryDate:-1}`. `WeeklyPlanner`: unique `{user:1, weekStartDate:1}`. **Ref:** model files. **Follow-up:** What does the unique index guarantee? (one planner per user per week).

**26. How are subdocuments (tasks) manipulated?**
`day.tasks.push(...)`, `day.tasks.id(taskId)`, `day.tasks.pull(taskId)`, then `planner.save()`. **Ref:** `plannerController` task handlers. **Follow-up:** Where do task `_id`s come from? (Mongoose auto-assigns to array subdocs).

**27. How does "find or create a week" work?**
`findOne({user, weekStartDate})`; if null, `create(...)` with default days/self-care. **Ref:** `getWeeklyPlanner` etc. **Follow-up:** What's the race condition? (two creates → unique-index error).

**28. How are dates represented in the planner and why strings?**
`weekStartDate` and each `day.date` are `YYYY-MM-DD` strings for exact-match lookups and stable day keys. **Ref:** `WeeklyPlanner.js`, `formatDateOnly`. **Follow-up:** Downside? (no native range queries; timezone care needed).

**29. How is the Monday of a week computed?**
`getMondayOfWeek`: JS `getDay()` where Sunday=0 is treated as offset −6, else `1 - day`. **Ref:** `plannerController`. **Follow-up:** Walk through a Sunday input.

### State / Data Flow

**30. Where does journal data live and how does it reach the UI?**
MongoDB → controller → JSON → Axios → component state (`entries`). **Ref:** `JournalDashboard`. **Follow-up:** Is any journal data cached? (no, refetched).

**31. How is the token shared across requests?**
Axios request interceptor reads `localStorage` and sets the header. **Ref:** `services/api.js`. **Follow-up:** What if you open two tabs? (both read the same localStorage token).

**32. How does logout work end to end?**
`AuthContext.logout` clears state + localStorage; `Navbar` then navigates to `/login`. The server does nothing (stateless). **Ref:** `AuthContext`, `Navbar.handleLogout`. **Follow-up:** Can a stolen token still be used after logout? (yes until expiry — a known JWT trade-off).

### Auth / Security

**33. Why JWT over server sessions?**
Stateless, scales horizontally, no session store. **Ref:** `generateToken`, `protect`. **Follow-up:** The downsides? (can't easily revoke; storage XSS risk).

**34. What are the security weaknesses you know about?**
Hardcoded JWT fallback secret, `localStorage` token (XSS), open CORS, no rate limiting. **Ref:** `generateToken.js`/`authMiddleware.js`, `server.js`. **Follow-up:** How would you fix each? (require env secret, httpOnly cookie, restrict CORS, `express-rate-limit`).

**35. How do you prevent one user reading another's data?**
Ownership checks + user-scoped queries; proven by the E2E 403 tests. **Ref:** controllers, `test-flows.js` TEST 6. **Follow-up:** Could a user guess IDs? (yes, but 403 blocks access).

**36. Is input validated? Where?**
Schema (required, enums, regex, unique), controllers (presence, length, normalization), and client forms. **Ref:** models + controllers + `RegisterPage`. **Follow-up:** Is regex search injectable? (it's used as a RegExp; discuss ReDoS risk).

### Performance / Scalability

**37. What would slow down with many entries?**
`GET /entries` returns everything (no pagination). **Ref:** `getEntries`. **Fix:** limit/skip or cursor pagination.

**38. How would you handle 10,000 users?**
Stateless API scales horizontally behind a load balancer; MongoDB with proper indexes (already present) + read replicas; add pagination, caching, and rate limiting. **Ref:** indexes in models. **Follow-up:** Bottleneck first? (DB + large responses).

**39. What's the concurrency risk in the planner?**
Read-modify-write on the whole weekly doc → last-write-wins. **Ref:** planner handlers. **Fix:** atomic `$set`/`$push` with array filters or a version key.

**40. How big is the frontend bundle and would you optimize it?**
~335 KB JS (~100 KB gzip), single chunk. **Ref:** build output. **Fix:** route-based code splitting / lazy loading.

### Error Handling / Debugging

**41. What happens if the DB connection fails at startup?**
`connectDB` tries the memory-server fallback; if that fails too, `process.exit(1)`. **Ref:** `config/db.js`. **Follow-up:** Good idea in prod? (you'd rather crash loudly / alert).

**42. How are failed API calls shown to the user?**
Auth pages show banners; dashboard/planner mostly `console.error` (a gap). **Ref:** `LoginPage` vs `JournalDashboard`. **Fix:** toasts.

**43. Describe a real bug you found and fixed here.**
`JournalView` passed an undefined `handleConfirmDelete` to the modal, crashing the entry-detail page; fixed to `handleDelete`. Vite's build didn't catch it because it's a runtime error. **Ref:** `JournalView.jsx`. **Follow-up:** How would you prevent this class of bug? (ESLint `no-undef`, a test that renders the page).

**44. How would you debug "my changes aren't saving" on the daily planner?**
Check the `saving/saved/dirty` status pill, then the Network tab for the PATCH, then server logs, then confirm the right `weekStartDate`/`date`. **Ref:** `triggerAutoSave`.

### Design Decisions

**45. Why embed the week instead of normalizing?**
Atomic weekly reads/writes and free weekly/daily sync; a personal week is small and bounded. **Ref:** `WeeklyPlanner.js`. **Trade-off:** concurrency + doc growth.

**46. Why does a GET create data?**
So the UI never needs a "create week" step. **Ref:** `getWeeklyPlanner`. **Trade-off:** violates GET purity.

**47. Why the `{ success, ... }` response convention?**
Uniform client branching regardless of endpoint. **Ref:** every controller. **Follow-up:** Redundant with status codes? (somewhat).

**48. Why store dates as strings?**
Stable exact-match day keys and timezone-independent day identity. **Ref:** planner model. **Trade-off:** no range queries.

**49. Why in-memory MongoDB for dev?**
Zero setup — clone and run. **Ref:** `config/db.js`. **Trade-off:** data wiped on restart.

**50. Why Tailwind?**
Fast iteration on a highly custom aesthetic without separate CSS files; the palette is centralized in config. **Ref:** `tailwind.config.js`.

**51. Why React Context instead of a state library?**
The shared state is small (mostly auth). Context avoids extra dependencies. **Ref:** `AuthContext`.

**52. How is "edit" vs "create" unified in one component?**
`JournalEditor` branches on `isEditing = Boolean(id)`: loads existing data if editing, chooses `updateEntry` vs `createEntry` on submit. **Ref:** `JournalEditor.jsx`.

---

## E. Difficult Interview Questions

**Why this stack?** "MERN is cohesive — JavaScript end to end lowers context-switching. MongoDB's document model fits my embedded weekly planner perfectly; a relational model would need day and task tables plus joins to achieve the same sync. React + Vite gives fast, component-driven UI."

**Why this design?** "I optimized for the product's defining feature: weekly/daily consistency. Embedding the week makes sync a data property, not code I maintain. I accepted last-write-wins concurrency as a reasonable trade-off for a single-user personal tool and I know how to fix it (atomic ops)."

**How does data move through the app?** Walk the pipeline: component → Axios (token attached) → router → `protect` → controller (validate + authorize) → Mongoose → MongoDB → JSON → state → re-render. Cite `getEntries`/`toggleTask`.

**How do you handle concurrent updates?** "Honestly, today it's last-write-wins on the weekly document. To handle it properly I'd switch task/field mutations to atomic MongoDB updates (`$set`/`$push` with array filters) or add a version key for optimistic concurrency so a stale write is rejected."

**How would you scale this?** "The API is stateless (JWT), so I scale it horizontally behind a load balancer. MongoDB already has the right indexes; I'd add pagination to `GET /entries`, response caching, and rate limiting. For 10,000 active users the first wins are pagination and locking CORS/secrets down."

**How would you improve security?** "Require `JWT_SECRET` from env and drop the hardcoded fallback; move the token to an httpOnly cookie with CSRF protection; restrict CORS to the real origin; add rate limiting and account-lockout on auth; and add refresh-token rotation."

**What if the database or API fails?** "On boot, `connectDB` falls back to the memory server, else exits. At runtime, a DB error bubbles to `errorHandler` as a 500; the client's Axios interceptor handles 401s by logging out. The gap is user-facing messaging on non-auth failures — I'd add that. For resilience I'd add health checks, retries with backoff, and monitoring."

**Most challenging implementation?** "Getting weekly/daily sync and week boundaries right — especially `getMondayOfWeek` where JS treats Sunday as 0, so I map Sunday to the end of the week (offset −6). Embedding the data so both views stay consistent was the key insight."

**What would you change if rebuilding?** "Atomic planner updates from day one; TypeScript for safety (the `handleConfirmDelete` crash would've been caught); httpOnly-cookie auth; pagination; a shared source of enums between client and server; and tests for the React pages, not just the API."

**How would you handle 10,000 active users?** "Multiple stateless API instances behind a load balancer; MongoDB Atlas with replicas and the existing indexes; pagination + projection to shrink payloads; a CDN for the static frontend; rate limiting; and metrics/tracing to find the real bottleneck before optimizing."

---

## F. Project Defense — 10 likely challenges + responses

1. **"Your `GET` creates data — that's a side effect on a safe method."** → "True, it's a deliberate UX trade-off so the UI never needs a separate 'create week' call. I'd document it or move creation to an explicit POST if purity matters."
2. **"JWT in localStorage is XSS-vulnerable."** → "Correct. For production I'd use an httpOnly cookie plus CSRF protection. localStorage was the pragmatic choice for a demo."
3. **"Your JWT secret has a hardcoded fallback."** → "A real weakness I've flagged. Fix is to require the env var at boot and remove the literals."
4. **"No pagination — this won't scale."** → "Right for large datasets. For a personal diary it's bounded, but I'd add limit/skip or cursor pagination."
5. **"Concurrent edits can clobber the week."** → "Yes, last-write-wins. I'd move to atomic `$set`/`$push` with array filters or optimistic concurrency."
6. **"CORS is wide open."** → "Dev convenience; in production I'd restrict to the frontend origin via env config."
7. **"Errors are swallowed on the client."** → "Auth pages show messages, but dashboard/planner mostly log to console. I'd add toasts and render the daily planner's `dirty` save state."
8. **"There are unused fields (imageUrl, weather, priority)."** → "Scaffolding for planned features. I'd either wire them into the UI or remove them to avoid dead code."
9. **"No frontend tests."** → "The API has a 20-check E2E suite; the UI doesn't. The `JournalView` crash shows why I'd add React Testing Library + ESLint `no-undef`."
10. **"Timezone handling looks fragile."** → "Day keys are local-time strings, which can drift for users in other zones or a UTC server. I'd standardize on one timezone strategy (store UTC, convert at the edge)."

---

### Top things to rehearse out loud
The embedded-week sync story, the auth+authorization pipeline, the request lifecycle, and an honest list of the trade-offs above. Interviewers reward candidates who know their project's weaknesses as well as its features.
