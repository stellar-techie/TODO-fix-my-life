# DATABASE_AND_API_GUIDE.md — TODO: fix my life

## 1. Database Overview

- **Engine:** MongoDB, accessed via **Mongoose 8**.
- **Connection:** `backend/config/db.js`. Uses `MONGO_URI` if provided; otherwise boots an embedded `mongodb-memory-server` (ephemeral).
- **Collections:** `users`, `journalentries`, `weeklyplanners` (Mongoose pluralizes/lowercases model names).

## 2. Collections / Schemas

### `users` (`models/User.js`)
| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | auto |
| `name` | String | required, trimmed, ≤ 50 chars |
| `email` | String | required, **unique**, lowercased, regex-validated |
| `password` | String | required, ≥ 6 chars, **stored as bcrypt hash** |
| `avatar` | String | default `🌸` |
| `bio` | String | default motto, ≤ 160 chars |
| `createdAt`, `updatedAt` | Date | timestamps |

- **Hooks:** `pre('save')` hashes `password` (bcrypt, 10 salt rounds) only when modified.
- **Methods:** `matchPassword(plain)` → bcrypt compare.

### `journalentries` (`models/JournalEntry.js`)
| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | auto |
| `user` | ObjectId → User | required, indexed |
| `title` | String | required, ≤ 120 chars |
| `content` | String | required |
| `mood` | String | enum: happy, peaceful, productive, reflective, cozy, loved, tired, anxious, grateful, creative; default `peaceful` |
| `tags` | [String] | trimmed, lowercased |
| `entryDate` | Date | default now, indexed |
| `imageUrl` | String | default `''` (reserved, no upload UI yet) |
| `sticker` | String | default `sunflower` |
| `paperStyle` | String | enum: grid, lined, plain, dots; default `grid` |
| `weather` | String | enum: sunny, cloudy, rainy, breezy, starlit, rainbow; default `sunny` |
| `isFavorite` | Boolean | default false |
| `createdAt`, `updatedAt` | Date | timestamps |

- **Indexes:** `user`, `entryDate`, and compound `{ user: 1, entryDate: -1 }`.

### `weeklyplanners` (`models/WeeklyPlanner.js`)
| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | auto |
| `user` | ObjectId → User | required, indexed |
| `weekStartDate` | String | Monday as `YYYY-MM-DD`, required |
| `days` | [dayPlanner] | 7 embedded subdocuments |
| `selfCare` | [{ title, completed }] | defaults seeded on creation |
| `stickyNote` | String | default motivational quote |
| `createdAt`, `updatedAt` | Date | timestamps |

**Embedded `dayPlanner`:** `date` (String `YYYY-MM-DD`), `dayName` (enum Mon–Sun), `tasks` [task], `goal`, `reminder`, `notes`.
**Embedded `task`:** `title` (required), `completed` (bool), `priority` (enum normal/high/low), `createdAt`. Each task has its own `_id`.

- **Indexes:** unique compound `{ user: 1, weekStartDate: 1 }` → one document per user per week.

## 3. Relationships

```
User (1) ──< (many) JournalEntry      via JournalEntry.user
User (1) ──< (many) WeeklyPlanner      via WeeklyPlanner.user  (one per week)
WeeklyPlanner (1) ──< (7) day subdocs ──< (many) task subdocs   [embedded, not refs]
```

Journal entries and planners reference the user by ObjectId. Days and tasks are **embedded** inside the weekly document (no separate collection, no joins).

## 4. Authentication & Authorization

- **Authentication:** `POST /auth/register` and `POST /auth/login` return a JWT signed with `JWT_SECRET` (`{ id }`, 30-day expiry). Clients send `Authorization: Bearer <token>`. `middleware/authMiddleware.js` (`protect`) verifies it and loads `req.user`.
- **Authorization:** controllers compare `resource.user.toString() === req.user._id.toString()`. Journal single-entry ops return **403** on mismatch. Planner ops scope every query by `user: req.user._id`, so another user's data is simply never found.

## 5. REST API Reference

Base URL: `/api`. All `/entries` and `/planner` routes require a Bearer token. ✅ = auth required.

### Auth — `/api/auth`
| Method | Endpoint | Body | Auth | Success | Notes |
|---|---|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | — | 201 `{ success, user, token }` | 400 if email taken or password < 6 |
| POST | `/auth/login` | `{ email, password }` | — | 200 `{ success, user, token }` | 401 on bad credentials |
| GET | `/auth/me` | — | ✅ | 200 `{ success, user }` | used for session restore |
| PUT | `/auth/me` | `{ name?, bio?, avatar?, password? }` | ✅ | 200 `{ success, user, token }` | returns a fresh token |

> **Doc note:** the old README listed `PUT /api/auth/profile`; the actual route is `PUT /api/auth/me` (matching `services/api.js` `updateProfile`). This guide reflects the real code.

### Journal — `/api/entries`
| Method | Endpoint | Body / Query | Auth | Success |
|---|---|---|---|---|
| GET | `/entries` | query: `search, mood, tag, favorite, startDate, endDate` | ✅ | 200 `{ success, count, entries }` |
| POST | `/entries` | `{ title, content, mood?, tags?, entryDate?, sticker?, paperStyle?, weather?, imageUrl?, isFavorite? }` | ✅ | 201 `{ success, entry }` |
| GET | `/entries/tags` | — | ✅ | 200 `{ success, tags }` |
| GET | `/entries/stats` | — | ✅ | 200 `{ success, total, moodCounts }` |
| GET | `/entries/:id` | — | ✅ | 200 `{ success, entry }` (404/403 otherwise) |
| PUT | `/entries/:id` | any updatable fields | ✅ | 200 `{ success, entry }` |
| DELETE | `/entries/:id` | — | ✅ | 200 `{ success, message }` |

> **Route-order note:** `/tags` and `/stats` are registered before `/:id` so they resolve correctly.

### Planner — `/api/planner`
| Method | Endpoint | Body | Auth | Success |
|---|---|---|---|---|
| GET | `/planner/` | — | ✅ | 200 `{ success, planner }` (current week) |
| GET | `/planner/week/:date` | — | ✅ | 200 `{ success, planner }` (creates week if absent) |
| PUT | `/planner/week/:date/self-care` | `{ selfCare?, stickyNote? }` | ✅ | 200 `{ success, planner }` |
| GET | `/planner/day/:date` | — | ✅ | 200 `{ success, weekStartDate, day }` |
| PUT | `/planner/day/:date` | `{ tasks?, goal?, reminder?, notes? }` | ✅ | 200 `{ success, day, weekStartDate }` |
| POST | `/planner/day/:date/task` | `{ title, priority? }` | ✅ | 201 `{ success, day }` |
| PATCH | `/planner/day/:date/task/:taskId/toggle` | — | ✅ | 200 `{ success, task, day }` |
| DELETE | `/planner/day/:date/task/:taskId` | — | ✅ | 200 `{ success, day }` |

### Health — `/api/health`
`GET /api/health` → 200 `{ status:'ok', message, timestamp }` (no auth).

## 6. Example Request / Response

**Create entry**
```http
POST /api/entries
Authorization: Bearer <token>
Content-Type: application/json

{ "title": "A calm Sunday", "content": "Tea and a long walk.", "mood": "peaceful", "tags": ["calm","tea"] }
```
```json
{
  "success": true,
  "entry": {
    "_id": "6700...", "user": "66ff...", "title": "A calm Sunday",
    "content": "Tea and a long walk.", "mood": "peaceful",
    "tags": ["calm","tea"], "sticker": "sunflower", "paperStyle": "grid",
    "weather": "sunny", "isFavorite": false, "entryDate": "2026-10-11T...",
    "createdAt": "...", "updatedAt": "..."
  }
}
```

**Unauthorized access to another user's entry**
```json
// GET /api/entries/<someone-elses-id>  → HTTP 403
{ "success": false, "message": "Not authorized to access this journal entry" }
```

## 7. Data Validation Summary
- **Schema-level (Mongoose):** required fields, string lengths, enums, email regex, uniqueness.
- **Controller-level:** presence checks (title+content, task title), password length, email normalization, tag normalization.
- **Client-level:** form validation in `RegisterPage`, `LoginPage`, `JournalEditor`, `ProfilePage`.
