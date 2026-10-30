# SETUP_AND_DEPLOYMENT_GUIDE.md — TODO: fix my life

## 1. Prerequisites
- **Node.js** v18+ (`node -v`) — required for native `fetch` in `test-flows.js` and `node --watch`.
- **npm** v9+ (`npm -v`).
- *(Optional)* A **MongoDB Atlas** URI. Without one, the backend runs an embedded in-memory MongoDB automatically (data is not persisted across restarts).

## 2. Project Layout
Two independent npm packages: `backend/` (Express API) and `frontend/` (React/Vite).

## 3. Environment Variables (backend)
Create `backend/.env` (copy from `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=            # leave blank to use the in-memory DB; set to your Atlas URI for persistence
JWT_SECRET=<a-long-random-secret>   # REQUIRED — server refuses to start if missing/empty
CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173   # CORS allowlist
```

- **`JWT_SECRET`** signs auth tokens. **Required** — `backend/config/env.js` validates it at boot and exits with a clear error if it's missing or empty. Use a long random value. Never commit a real secret (`.gitignore` already ignores `.env`).
- **`MONGO_URI`** blank → embedded dev DB. Set it to a real connection string to persist data.
- **`CLIENT_ORIGINS`** comma-separated browser origins allowed by CORS. Defaults to local dev if unset; add your Vercel URL in production (e.g. `https://your-app.vercel.app`).

> **Frontend env (optional):** copy `frontend/.env.example` to `frontend/.env` only for production. Local dev needs **no** frontend env — the app uses the relative `/api` path and Vite proxies it to `http://localhost:5000` (see `frontend/vite.config.js`). For split hosting, set `VITE_API_URL` to the deployed backend base URL incl. `/api` (e.g. `https://your-api.onrender.com/api`). `VITE_API_URL` is public (baked into the bundle), not a secret.

## 4. Installation

```powershell
# from the project root
cd backend
npm install

cd ..\frontend
npm install
```

## 5. Running Locally (two terminals)

**Terminal 1 — API**
```powershell
cd backend
npm start        # or: npm run dev   (restarts on file changes via node --watch)
```
Expected log: `🌸 Server running ... on port 5000` and either an Atlas host or `MongoDB Memory Server running at ...`.

**Terminal 2 — UI**
```powershell
cd frontend
npm run dev
```
Open **http://localhost:5173**.

> On Windows PowerShell, run each server in its own terminal. Do not chain long-running servers with `&&`.

## 6. Build Commands

**Frontend production build:**
```powershell
cd frontend
npm run build        # outputs to frontend/dist
npm run preview      # serve the built bundle locally to sanity-check
```

**Backend:** no build step — it runs Node directly (`npm start`).

## 7. Running the E2E Test Suite
The suite hits a **running** server, so start the backend first:
```powershell
# Terminal 1
cd backend ; npm start
# Terminal 2
cd backend ; node test-flows.js
```
Expected: `✨ Test Results: 20 Passed, 0 Failed`.

## 8. Deployment Notes
This is a decoupled app, so the two halves deploy separately.

**Backend (Render / Railway / Fly / any Node host):**
1. Deploy the `backend/` folder; start command `node server.js`.
2. Set env vars `MONGO_URI` (a **real** persistent DB — not the memory server), `JWT_SECRET`, `NODE_ENV=production`, and `PORT` (often injected by the host).
3. Lock CORS down to your frontend's real origin (currently `origin: '*'` in `server.js`).

**Frontend (Vercel / Netlify / static host):**
1. Build with `npm run build`; publish `frontend/dist`.
2. The app calls `/api/...` with a relative base URL. In production you must either:
   - host the API under the same domain at `/api` (reverse proxy), or
   - change `baseURL` in `frontend/src/services/api.js` to the deployed API URL (e.g. via an env-driven value), and configure CORS accordingly.
3. Add an SPA fallback so deep links (`/journal/:id`, `/planner/:date`) serve `index.html`.

## 9. Common Errors & Troubleshooting
| Symptom | Likely cause | Fix |
|---|---|---|
| UI loads but all API calls 404/Network error | Backend not running or proxy target wrong | Start backend on 5000; check `vite.config.js` proxy |
| `MongoMemoryServer` download hangs on first run | It downloads a Mongo binary once | Ensure internet access on first `npm start`, or set `MONGO_URI` |
| Logged in, but refresh logs me out | `GET /auth/me` failing (bad/expired token) | Check `JWT_SECRET` matches the one used to sign; re-login |
| Data disappears after restart | Using the in-memory DB | Set a real `MONGO_URI` |
| 401 on protected calls | Missing/expired Bearer token | Re-login; confirm the request interceptor attaches the token |
| 403 fetching an entry | Entry belongs to another user | Expected authorization behavior |
| Port 5000 in use | Another process | Change `PORT` in `.env` and the Vite proxy target |

> Security reminder: never put real credentials or secrets in documentation, commits, or screenshots. Use environment variables.
