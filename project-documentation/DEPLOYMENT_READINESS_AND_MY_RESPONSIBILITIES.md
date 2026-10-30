# DEPLOYMENT_READINESS_AND_MY_RESPONSIBILITIES — TODO: fix my life

> **Status: NOT DEPLOYED. Nothing has been deployed, no accounts created, no credentials changed.**
> This is a readiness assessment + guide. Every finding below is taken from the actual code.

---

## PART 1 — Your Existing Database Setup (what the code actually does)

| # | Question | Finding |
|---|---|---|
| 1 | Which storage system? | **MongoDB**, accessed through the **Mongoose** ODM. |
| 2 | Mongo / SQL / Firebase / localStorage / …? | **MongoDB only** for app data. The browser's `localStorage` is used **only** to cache the JWT and the user object (`cozy_journal_token`, `cozy_journal_user`) — not as a data store. No SQL, Firebase, Supabase, SQLite, or IndexedDB. |
| 3 | Is a database already configured? | **Partially.** The connection *logic* is fully written, but no persistent database is connected. `backend/.env` has `MONGO_URI=` (blank). |
| 4 | Mock data or real persistence? | **Real persistence via Mongoose** — no mock/fake data layer. But right now it writes to an **ephemeral in-memory database** (see below), so data does not survive a restart. |
| 5 | Where is the connection logic? | `backend/config/db.js` (`connectDB`), called once in `backend/server.js`. |
| 6 | Where are credentials stored? | In `backend/.env` (git-ignored). Only `MONGO_URI` and `JWT_SECRET` matter for data/auth. |
| 7 | Are schemas/models/relationships defined? | **Yes.** `backend/models/`: `User.js`, `JournalEntry.js`, `WeeklyPlanner.js`. Relationships: `JournalEntry.user` and `WeeklyPlanner.user` reference `User`; planner days and tasks are **embedded subdocuments**. Indexes incl. unique `{user, weekStartDate}`. |
| 8 | Migrations / init scripts? | **None, and none needed.** MongoDB is schemaless at the server; Mongoose creates collections and indexes on first use. Default planner days/self-care are seeded in code on first access (`generateDaysForWeek`, `defaultSelfCare`). |
| 9 | Local or remote data? | **Currently local & ephemeral** — `mongodb-memory-server` runs an in-process Mongo with no `MONGO_URI`. |
| 10 | Production-suitable as-is? | **No.** The in-memory DB wipes on every restart. Production needs a real, persistent MongoDB (e.g. Atlas). The code is production-ready; the *configuration* is not. |

### How the fallback actually behaves (`config/db.js`)
```
if MONGO_URI is set  → connect to that real database
else                 → start an embedded in-memory MongoDB (data lost on restart)
if a set URI fails   → fall back to in-memory; if that also fails → process.exit(1)
```
**Bottom line:** your schema, models, and connection code are done. The single missing piece for production data is **a real `MONGO_URI`**.

---

## PART 2 — The Database Setup You Need to Do

You need **one persistent MongoDB database**. Because the app uses Mongoose + MongoDB-specific features (embedded subdocuments, `distinct`, ObjectId refs), stay on MongoDB — **do not** switch to Supabase/Neon/Postgres (that would require rewriting every model and controller). Firebase is also a poor fit for the same reason.

**Recommended provider: MongoDB Atlas** — it's the first-party managed MongoDB, has a permanent free tier (M0, 512 MB) that is plenty for a personal journal, and plugs straight into your existing code via a connection string.

> You will do these steps yourself. I've written exact navigation so you own the process. **I am not doing this part** — it requires creating an account and handling credentials.

### Step-by-step (MongoDB Atlas, free M0)
1. **Create an account** → go to `https://www.mongodb.com/cloud/atlas/register`, sign up (email or Google).
2. **Create a project** → Atlas dashboard → top-left org/project dropdown → **New Project** → name it e.g. `todo-fix-my-life` → **Create Project**.
3. **Create a free cluster** → **+ Create** (or "Build a Database") → choose **M0 / Free** → pick a cloud + region closest to where your backend will be hosted → **Create Deployment**.
4. **Create a database user** → when prompted (or **Database Access** → **Add New Database User**) → **Password** auth → set a username (e.g. `app_user`) and a **strong generated password**. **Copy the password now and store it in a password manager** — Atlas won't show it again. This user is NOT your Atlas login; it's the database account your app uses.
5. **Configure network access** → **Network Access** → **Add IP Address**.
   - For a hosted backend whose IP you don't control, you'll typically use **Allow access from anywhere** (`0.0.0.0/0`). This is a known convenience-vs-security trade-off; acceptable for a hobby project, but prefer restricting to your host's egress IPs if the platform provides static ones.
6. **Get the connection string** → cluster → **Connect** → **Drivers** → copy the URI. It looks like:
   ```
   mongodb+srv://app_user:<db_password>@<cluster>.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<db_password>` with the real password (URL-encode special characters).
   - **Add a database name** before the `?` so your data lands in a named DB, e.g.:
     ```
     mongodb+srv://app_user:****@cluster.xxxxx.mongodb.net/todofixmylife?retryWrites=true&w=majority
     ```
7. **Configure the env var** — do **not** paste it into code or commit it.
   - **Local test:** put it in `backend/.env` as `MONGO_URI=...` (that file is git-ignored).
   - **Production:** set `MONGO_URI` in your hosting platform's environment-variables UI (Part 5).
8. **Test the connection locally:**
   ```powershell
   cd backend
   npm start
   ```
   Success looks like `🌸 MongoDB Connected successfully: <host>` **instead of** the in-memory message.
9. **Verify data is saved & retrieved** (two options):
   - Run the E2E suite in a second terminal: `cd backend ; node test-flows.js` → expect **20 Passed**. With a real `MONGO_URI`, those records now persist.
   - Or in Atlas: **Database** → **Browse Collections** → after registering a user in the app you should see `users`, and after writing an entry, `journalentries`, and after opening the planner, `weeklyplanners`.
10. **Confirm persistence** → stop and restart the backend; your data should still be there (proving you're off the in-memory DB).

If you keep `MONGO_URI` blank, everything still *runs* — it just uses the throwaway in-memory DB. That's fine for demos, not for real users.

---

## PART 3 — Your Responsibilities vs Mine

| Task | Can Kiro handle it? | What you must do | Status |
|---|---|---|---|
| Database models & schemas | ✅ Yes (done) | Nothing | **Completed & verified** (models exist; E2E passed) |
| DB connection code | ✅ Yes (done) | Nothing | **Completed & verified** (`config/db.js`) |
| Backend env var *template* (`.env.example`) | ✅ Yes | Fill in real values yourself | **Completed** (template exists + Part 4) |
| API configuration / routes | ✅ Yes (done) | Nothing | **Completed & verified** |
| Error handling | ✅ Yes (done) | Decide on UI-level error toasts (optional) | **Completed** (server-side) |
| Documentation | ✅ Yes (done) | Read it | **Completed** |
| Testing & debugging (API) | ✅ Yes | Re-run after you set `MONGO_URI` | **Completed** (20/20 with in-memory DB) |
| Hardening code for prod (CORS allowlist, require `JWT_SECRET`) | ✅ Yes, on your approval | Approve the change | **Pending — requires your approval** |
| Set frontend API base URL for prod | ✅ Yes, on your approval | Tell me the backend URL / hosting choice | **Pending — needs a decision** |
| Create a MongoDB Atlas account | ❌ No | Create it (Part 2) | **Requires your action** |
| Create the cluster / DB user / network rules | ❌ No | Do it in Atlas (Part 2) | **Requires your action** |
| Obtain `MONGO_URI` connection string | ❌ No | Copy from Atlas | **Requires your action** |
| Generate a strong `JWT_SECRET` | ⚠️ I can generate a sample value | You must create/keep the real one secret | **Requires your action** |
| Create hosting accounts (Render/Vercel/etc.) | ❌ No | Sign up | **Requires your action** |
| Connect your GitHub repo to the host | ❌ No | Authorize it | **Requires your action** |
| Add env vars in the hosting dashboards | ❌ No (I can't log in) | Paste them in | **Requires your action** |
| Review/approve external service config | ❌ No | Review | **Requires your action** |
| Test the *deployed* app | ⚠️ Partly (I can't reach your live URL) | Click through it | **Requires your action** |
| Manage credentials, rotation & backups | ❌ No | Own it | **Requires your action** |
| Trigger the actual deployment | ❌ No (and won't without approval) | Approve + click deploy | **Blocked on your approval** |

> Only the rows marked **Completed & verified** are actually done. Everything about *external services and the live deployment* is yours, by design — I can't (and shouldn't) create accounts or handle your real secrets.

---

## PART 4 — Environment Variables & Secrets

The code reads exactly **four** backend variables and **zero** frontend build variables (confirmed by scanning for `process.env.` and `import.meta.env`).

> Update (hardening applied): `JWT_SECRET` is now **required** (no fallback), CORS is driven by `CLIENT_ORIGINS`, and the frontend base URL is driven by `VITE_API_URL`.

| Variable | Side | Sensitive? | What it does | Where to get it | Where to set it |
|---|---|---|---|---|---|
| `MONGO_URI` | Backend | 🔴 Yes (contains DB password) | Mongo connection string. Blank → ephemeral in-memory DB. | MongoDB Atlas (Part 2) | `backend/.env` locally; Render env UI in prod |
| `JWT_SECRET` | Backend | 🔴 Yes | Signs & verifies auth tokens. **Required — the server now refuses to start if it's missing/empty** (`config/env.js`). | You generate a long random string | `backend/.env` locally; Render env UI in prod |
| `CLIENT_ORIGINS` | Backend | 🟢 No | Comma-separated CORS allowlist. Defaults to local dev origins. | You set it | `backend/.env` locally; Render env UI (add your Vercel URL) |
| `PORT` | Backend | 🟢 No | Port the API listens on (default 5000). | You choose; Render injects it | Usually set automatically by the host |
| `NODE_ENV` | Backend | 🟢 No | `production` hides error stack traces in responses. | Literal value | Set to `production` on Render |
| `VITE_API_URL` | Frontend | 🟢 No (public, baked into bundle) | Backend base URL incl. `/api`. **Unset locally** (uses `/api` + Vite proxy). | Your Render backend URL | Vercel env UI, e.g. `https://your-api.onrender.com/api` |

**Local dev needs no frontend env.** The React app defaults to the relative `/api` path (`frontend/src/services/api.js`) proxied to `localhost:5000`. For split hosting (Vercel + Render on different domains), set `VITE_API_URL` so the frontend knows where the backend lives.

### `.env.example` (templates — no real secrets)
Ready-to-copy templates exist at **`backend/.env.example`** and **`frontend/.env.example`**. The backend one now includes `CLIENT_ORIGINS` and marks `JWT_SECRET` as required:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=replace_me_with_a_long_random_secret
CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
**For production**, create your own values (do not reuse the placeholder `JWT_SECRET`). A safe way to generate a secret locally:
```powershell
# PowerShell — generates a 48-byte random base64 secret
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))
```
Never commit real values. `.gitignore` already excludes `.env`.

---

## PART 5 — Deployment Architecture

Your app is **decoupled**: a static React bundle + a separate Node API + a managed database. They deploy to three different places.

| Piece | Needs | Recommended | Why |
|---|---|---|---|
| **Frontend** (`frontend/`) | Static file hosting + SPA fallback | **Vercel** or **Netlify** | Free, Git-connected, builds `npm run build`, serves `dist/`, handles SPA routing. |
| **Backend** (`backend/`) | A long-running Node process | **Render** (Web Service) or **Railway** | Free/cheap tier runs `node server.js`; easy env-var UI. (Vercel/Netlify functions are a poor fit for this always-on Express app.) |
| **Database** | Persistent MongoDB | **MongoDB Atlas M0** | First-party, free, plugs into existing code. |
| **Image storage** | — | **Not needed yet** | `imageUrl` exists but no upload feature is implemented. |
| **Domain + HTTPS** | TLS | Provided free by Vercel/Netlify/Render | All three give HTTPS by default. |

### Build & start commands
| Piece | Install | Build | Start |
|---|---|---|---|
| Frontend | `npm install` (root dir `frontend/`) | `npm run build` | serve `frontend/dist` (static) |
| Backend | `npm install` (root dir `backend/`) | *(none)* | `node server.js` (= `npm start`) |

### Required production env vars (backend host)
`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production` (and `PORT` only if the host doesn't inject it).

### Code hardening — ✅ DONE (implemented and verified)
1. **Frontend API base URL** is now configurable via `VITE_API_URL` (defaults to `/api` so local dev is unchanged). `frontend/src/services/api.js`.
2. **CORS** is now an allowlist via `CLIENT_ORIGINS` (defaults to local dev). `backend/server.js` + `backend/config/env.js`.
3. **`JWT_SECRET` is required** — the server fails fast if it's missing. `backend/config/env.js`.
4. **Rate limiting** added on login/register. `backend/middleware/rateLimitMiddleware.js`.

All four were verified: frontend build passes, the 20/20 E2E suite passes, and a login burst returns 429.

### Deployment architecture diagram
```mermaid
graph TD
    Dev["You: push to GitHub"] --> GH[("GitHub repo")]

    subgraph Frontend Host["Vercel / Netlify (static)"]
        FE["React build (dist/) + HTTPS + SPA fallback"]
    end

    subgraph Backend Host["Render / Railway (Node service)"]
        BE["Express API: node server.js + HTTPS"]
        ENV["Env: MONGO_URI, JWT_SECRET, NODE_ENV"]
        BE --- ENV
    end

    subgraph Atlas["MongoDB Atlas (managed)"]
        DB[("Cluster: users, journalentries, weeklyplanners")]
    end

    GH -- "auto-build on push" --> FE
    GH -- "auto-build on push" --> BE
    Browser["User's browser"] -- "HTTPS, loads app" --> FE
    Browser -- "HTTPS /api + Bearer JWT" --> BE
    BE -- "Mongoose over TLS (SRV)" --> DB
```

---

## PART 6 — Pre-Deployment Checklist

Legend: ✅ Completed · ⏳ Pending · 🙋 Requires your action · ⛔ Blocked · ➖ N/A

**1. Code-level**
- ✅ App builds cleanly (`npm run build`, exit 0)
- ✅ API verified by 20/20 E2E suite
- ✅ Critical `JournalView` crash fixed (prior phase)
- ✅ Frontend API base URL made configurable (`VITE_API_URL`, defaults to `/api`)
- ✅ CORS restricted to an allowlist (`CLIENT_ORIGINS`)
- ✅ `JWT_SECRET` made required (hardcoded fallback removed; fails fast if missing)

**2. Database**
- ✅ Schemas/models/indexes defined
- ✅ Connection + fallback logic written
- 🙋 Create MongoDB Atlas account, cluster, DB user, network rule — *required for persistent data*
- 🙋 Obtain `MONGO_URI` — *the one missing config for real storage*
- 🙋 Verify persistence (data survives a restart) — *proves you're off the in-memory DB*

**3. Environment configuration**
- ✅ `.env.example` template present
- 🙋 Generate a strong production `JWT_SECRET` — *token security*
- 🙋 Set `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production` on the backend host — *app won't run correctly without them*
- ⏳ Add `VITE_API_URL` (or equivalent) on the frontend host — *only after code change #1*

**4. Hosting configuration**
- 🙋 Create frontend host account (Vercel/Netlify) — *where the UI lives*
- 🙋 Create backend host account (Render/Railway) — *where the API lives*
- 🙋 Connect GitHub repo to both — *enables auto-deploy*
- 🙋 Set root directories (`frontend/` and `backend/`) and build/start commands — *monorepo-style split*

**5. Security**
- ✅ Passwords hashed (bcrypt), ownership checks enforced
- ✅ CORS allowlist (`CLIENT_ORIGINS`)
- ✅ Required `JWT_SECRET` (fail-fast)
- ✅ Rate limiting on `/auth/login` + `/auth/register` (30 / 15 min / IP; verified 429)
- 🙋 `.env` never committed (confirm before pushing) — *credential leak prevention*
- 🙋 Atlas network access scoped as tightly as your host allows

**6. Testing**
- ✅ Local E2E (in-memory DB) 20/20
- 🙋 Re-run E2E against the real Atlas DB — *confirms prod DB works*
- 🙋 Manual click-through of the deployed app (register, login, write entry, plan a day, refresh) — *confirms the live wiring*

**7. Final deployment**
- ⛔ Deploy backend — *blocked on your approval*
- ⛔ Deploy frontend — *blocked on your approval*
- 🙋 Smoke-test production URLs
- 🙋 Set up error monitoring + backups (Part 7)

---

## PART 7 — Explain Before You Deploy (plain language, from your actual code)

- **Where your code will live:** the React UI as static files on a CDN host (Vercel/Netlify); the Express API as a running Node process on an app host (Render/Railway). Both are built from your GitHub repo.
- **Where your database will live:** on MongoDB Atlas's servers (managed), separate from your code.
- **Frontend ↔ backend:** the browser downloads the React app, then makes HTTPS calls to `/api/...`. Each call carries the login token in an `Authorization: Bearer <token>` header, attached automatically by the Axios request interceptor in `services/api.js`.
- **Backend ↔ database:** the API uses Mongoose (`config/db.js`) to open a TLS connection to Atlas using `MONGO_URI`, then reads/writes documents.
- **How journal entries & tasks are stored:** a journal entry is one document in the `journalentries` collection, tagged with your user id. A whole week of planning — all 7 days, their tasks, goal, reminder, and notes — is **one document** in `weeklyplanners`, keyed by that week's Monday. That single-document design is why the weekly and daily views always agree.
- **When someone registers:** `POST /api/auth/register` validates input, bcrypt-hashes the password (never stored in plaintext), creates a `users` document, and returns a signed JWT. The browser saves the token in `localStorage`.
- **When someone logs in:** `POST /api/auth/login` looks up the email, bcrypt-compares the password, and on success returns a fresh JWT.
- **When they reopen the app:** on load, `AuthContext` reads the saved token and calls `GET /api/auth/me` to re-validate the session; if the token is bad/expired, it logs them out. Subsequent reads (entries, planner) are fetched fresh from the API — nothing is cached except the token/user.
- **How env vars work:** they're key-value settings the host injects at runtime so secrets live outside your code. `MONGO_URI` tells the API which database to use; `JWT_SECRET` signs tokens. Change them without touching code.
- **If the backend or database goes down:** at startup, a missing/failed DB triggers the in-memory fallback, and if that fails too the process exits. At runtime, a DB error surfaces as an HTTP 500 (`errorMiddleware`); the browser's Axios interceptor logs you out on 401s. Honest gap: non-auth failures aren't yet shown as friendly UI messages (flagged in the code review).
- **How to monitor errors:** use your hosts' built-in logs (Render/Railway log streams, Vercel/Netlify function logs). For more, add a service like Sentry later — not required to launch.
- **How to back up / restore:** MongoDB Atlas provides backups (the free M0 tier has limited snapshotting; paid tiers add scheduled backups + point-in-time restore). You can also export data with `mongodump`/`mongoexport` and restore with `mongorestore`. Keep your DB user password in a password manager so you can always reconnect.

---

## PART 8 — Waiting for Your Approval

**I have not deployed anything, created any account, or changed any credential.** The three code hardening changes (configurable frontend base URL, CORS allowlist, required `JWT_SECRET`, and optionally rate limiting) are **ready for me to implement the moment you approve** — they're the only remaining items on *my* side.

Deployment should proceed only when: (1) you understand the architecture, (2) Atlas is set up and `MONGO_URI` works, (3) all env vars are configured on both hosts, (4) the app passes the checks above, and (5) you explicitly say go.

---

## FINAL OUTPUT SUMMARY

1. **Existing DB architecture:** MongoDB + Mongoose; models/indexes/connection code all done; currently running on an **ephemeral in-memory DB** because `MONGO_URI` is blank. `localStorage` holds only the auth token, not data.
2. **DB setup you must do:** provision **one persistent MongoDB Atlas (M0 free)** database and supply its `MONGO_URI`. No migrations needed.
3. **Services/accounts you need:** MongoDB Atlas (database), a backend host (Render or Railway), a frontend host (Vercel or Netlify), and GitHub (repo already implied).
4. **Required env vars:** backend — `MONGO_URI` 🔴, `JWT_SECRET` 🔴, `NODE_ENV=production`, `PORT` (host-injected); frontend — none today, add `VITE_API_URL` only after the base-URL code change.
5. **Remaining tasks:** my side — ✅ done (configurable API base URL, CORS allowlist, required `JWT_SECRET`, rate limiting — all verified). Your side — create Atlas + both hosts, set env vars, connect GitHub, test live.
6. **Estimated recurring cost:** **$0/month** on free tiers (Atlas M0 + Render free + Vercel/Netlify free). Caveats: Render's free web service **sleeps when idle** (first request after idle is slow) — ~$7/mo keeps it awake; Atlas M0 is free but small (512 MB) with limited backups. A custom domain is optional (~$10–15/yr).
7. **Recommended architecture:** Vercel/Netlify (frontend) + Render/Railway (backend) + MongoDB Atlas (database) — see the Part 5 diagram.
8. **Pre-deployment checklist:** Part 6.
9. **Step-by-step deploy guide:** Part 2 (database) + Part 5 (hosts/commands/env) — to be executed **by you, with my guidance, only after your approval**.

Report saved to `project-documentation/DEPLOYMENT_READINESS_AND_MY_RESPONSIBILITIES.md`.
