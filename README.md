# 🌸 TODO: fix my life ♡ Digital Journal & Planner

> A production-quality, aesthetic digital personal journal and weekly/daily planner web application inspired by soft pastel scrapbook diaries, warm sunflowers, and hand-drawn stationery.

![Aesthetic Banner](https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Overview

**TODO: fix my life** is a full-stack personal productivity sanctuary that blends:
1. **Private Digital Diary & Scrapbook**: Write your reflections on grid, lined, or dotted stationery with mood stickers, washi tape, and weather tags.
2. **Weekly To-Do & Study Planner**: Recreated from physical weekly planner aesthetics with 7 day cards, weekly self-care checklists, and inspirational notes.
3. **Detailed Daily Planner**: Click any day from the weekly view to open its dedicated focus page with interactive to-do lists, daily goals, perforated reminder notepads, and freeform notes.
4. **100% Real-Time Synchronization**: The weekly planner and daily planner share the exact same underlying MongoDB records. Updating a task, goal, or reminder in one view immediately reflects in the other.
5. **Secure Authentication & Strict Authorization**: End-to-end user privacy backed by bcryptjs password hashing and JWT authentication. Users can only access, view, modify, or delete their own data.

---

## 🎨 Design Philosophy & Aesthetic Details

Inspired by cozy hand-drawn stationery, vintage scrapbooks, and gentle pastel hues:
- **Palette**: Soft cream paper (`#FFFEFA`), warm butter yellow (`#FEF9C3`), muted terracotta (`#D47A60`), sage green (`#E2ECE9`), dusty rose (`#FCD5CE`), and lavender (`#E5D9F2`).
- **Textures**: Graph paper grids, notebook lined pages, and stitched dashed borders (`border-dashed border-[#E2CE98]`).
- **Hand-drawn Elements**: Custom SVG illustrations including sunflowers, tulip doodles, daisies, woven flower baskets ("keep going ♡"), pencil mugs, and retro alarm clocks.
- **Stationery Accents**: Semi-translucent washi tapes, perforated reminder strips, and celebratory confetti bursts on task completions and entry saves.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS with custom cozy color palette & paper utilities
- **Routing**: React Router DOM (v6)
- **State Management**: React Context (`AuthContext`)
- **HTTP Client**: Axios with Bearer token interceptor
- **Icons & Effects**: Lucide React & Canvas Confetti

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose ORM
- **In-Memory Fallback**: `mongodb-memory-server` (automatic embedded zero-config startup for local development)
- **Security & Auth**: JSON Web Tokens (JWT) + `bcryptjs` password encryption
- **Cross-Origin**: CORS middleware

---

## 📂 Folder Structure

```
cozy-journal-planner/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & Memory Server fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile, me
│   │   ├── journalController.js  # Journal CRUD, search, filter, tags, stats
│   │   └── plannerController.js  # Weekly & daily planner sync, task operations
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT bearer protection
│   │   └── errorMiddleware.js    # 404 & global error handler
│   ├── models/
│   │   ├── User.js               # User schema & bcrypt hashing
│   │   ├── JournalEntry.js       # Journal schema (mood, tags, paper, stickers)
│   │   └── WeeklyPlanner.js      # Weekly planner & 7-day synchronization schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── journalRoutes.js
│   │   └── plannerRoutes.js
│   ├── utils/
│   │   └── generateToken.js      # Signed JWT helper
│   ├── server.js                 # Express app bootstrap
│   ├── test-flows.js             # Automated 20/20 End-to-End test suite
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Doodles.jsx           # SVG hand-drawn botanical & scrapbook doodles
│   │   │   ├── Navbar.jsx            # Responsive cozy header with profile menu
│   │   │   ├── Footer.jsx            # Scrapbook footer
│   │   │   ├── LoadingSpinner.jsx    # Sunflower loading state
│   │   │   ├── EmptyState.jsx        # Illustrated empty state
│   │   │   ├── ConfirmationModal.jsx # Washi tape deletion confirmation modal
│   │   │   └── ProtectedRoute.jsx    # Route guard redirecting to /login
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth provider & persistent session
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx        # App layout shell
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Aesthetic hero & feature previews
│   │   │   ├── LoginPage.jsx         # Diary login notebook
│   │   │   ├── RegisterPage.jsx      # Diary registration notebook
│   │   │   ├── JournalDashboard.jsx  # Cards grid, mood filters, search
│   │   │   ├── JournalEditor.jsx     # Diary writing page with stickers & paper styles
│   │   │   ├── JournalView.jsx       # Sunflower scrapbook reading view
│   │   │   ├── WeeklyPlannerPage.jsx # Reference 2: 7-day cards + self care
│   │   │   ├── DailyPlannerPage.jsx  # Reference 1: To-do pills, goal, reminder, notes
│   │   │   └── ProfilePage.jsx       # Mascot selector & profile customization
│   │   ├── services/
│   │   │   └── api.js                # Axios client & centralized REST endpoints
│   │   ├── App.jsx                   # Route declarations
│   │   ├── index.css                 # Tailwind directives, paper textures & fonts
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- *(Optional)* A **MongoDB Atlas** connection URI. If you do not provide one, the backend will automatically spin up an embedded in-memory MongoDB server for instant plug-and-play development!

---

### 2. Environment Setup

#### Backend `.env`
In `backend/`, copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Default configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=cozy_sunflower_bloom_secret_token_2026

# Optional: paste your MongoDB Atlas URI below.
# If left empty, an embedded MongoDB Memory Server will launch automatically!
MONGO_URI=
```

---

### 3. Installation & Running

#### Start the Backend Server:
```bash
cd backend
npm install
npm start
```
The server will start on `http://localhost:5000` and connect to MongoDB.

#### Start the Frontend Server:
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running the End-to-End Test Suite

An automated test suite tests all 20 critical flows specified in the requirements (Registration, Login, Bad Credentials, Journal CRUD, Search, Weekly & Daily Planner synchronization, Self-Care tracking, and Strict Multi-User Authorization):

```bash
cd backend
node test-flows.js
```

Sample output:
```
🧪 Starting Full-Stack End-to-End Tests...

--- TEST 1: Server Health ---
  ✅ PASS: Health endpoint responds with 200 OK

--- TEST 2: User A Registration ---
  ✅ PASS: User A registered and received JWT token

--- TEST 3: User A Login ---
  ✅ PASS: User A logged in with correct credentials
  ✅ PASS: Bad credentials rejected with 401

--- TEST 4: Journal CRUD for User A ---
  ✅ PASS: Journal entry created successfully
  ✅ PASS: Journal entry fetched by ID
  ✅ PASS: Journal entry updated
  ✅ PASS: Search query returned matching entries

--- TEST 5: Planner Weekly & Daily Synchronization ---
  ✅ PASS: Weekly planner returned with 7 days
  ✅ PASS: Task added to Sunday via Daily Planner API
  ✅ PASS: Task completed status updated
  ✅ PASS: Daily goal, reminder, and notes saved
  ✅ PASS: Weekly planner correctly reflects updated Sunday tasks and goal (full synchronization)

--- TEST 6: Strict Authorization (User B vs User A) ---
  ✅ PASS: User B created
  ✅ PASS: User B CANNOT read User A journal entry (HTTP 403 Forbidden)
  ✅ PASS: User B CANNOT edit User A journal entry (HTTP 403 Forbidden)
  ✅ PASS: User B CANNOT delete User A journal entry (HTTP 403 Forbidden)
  ✅ PASS: User B planner is completely isolated and empty

--- TEST 7: User A Deletes Entry ---
  ✅ PASS: User A deleted their own journal entry
  ✅ PASS: Deleted entry returns 404 Not Found

========================================
✨ Test Results: 20 Passed, 0 Failed
========================================
```

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & return JWT | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Yes |
| `PUT` | `/api/auth/me` | Update name, avatar, bio, or password | Yes |

### 📖 Journal Entries (`/api/entries`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/entries` | Get entries (supports `?search=`, `?mood=`, `?tag=`) | Yes |
| `POST` | `/api/entries` | Create new journal entry | Yes |
| `GET` | `/api/entries/:id` | Get single entry by ID | Yes |
| `PUT` | `/api/entries/:id` | Update journal entry | Yes |
| `DELETE`| `/api/entries/:id` | Delete journal entry | Yes |
| `GET` | `/api/entries/tags` | Get user's distinct tags | Yes |
| `GET` | `/api/entries/stats`| Get total entries & mood breakdown | Yes |

### 🗓️ Planner (`/api/planner`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/planner/week/:date?` | Get weekly planner containing date | Yes |
| `GET` | `/api/planner/day/:date` | Get detailed daily planner for date | Yes |
| `PUT` | `/api/planner/day/:date` | Update tasks, goal, reminder, notes | Yes |
| `POST` | `/api/planner/day/:date/task` | Add task to specific day | Yes |
| `PATCH`| `/api/planner/day/:date/task/:taskId/toggle` | Toggle task completion | Yes |
| `DELETE`| `/api/planner/day/:date/task/:taskId` | Delete task from day | Yes |
| `PUT` | `/api/planner/week/:date/self-care` | Update self-care list & weekly quote | Yes |

---

## 🔒 Security & Authorization

1. **Password Hashing**: Stored passwords are salted and hashed using `bcryptjs` with cost factor 10. Plaintext passwords never touch the database.
2. **JWT Authentication**: Protected API requests require a valid Bearer token in the `Authorization` header.
3. **Backend-Enforced Authorization**: Every private route checks `entry.user.toString() === req.user._id.toString()`. A user cannot view, edit, or delete another user's journal or planner data.
4. **Input Sanitization**: Strings are trimmed, emails normalized to lowercase, and invalid queries safely caught by error middleware.

---

## 🌿 Future Enhancements

- Cloudinary image attachment upload for journal entries
- Monthly calendar heatmap & mood streaks
- PDF scrapbook exporter for printing physical diaries
- Study timer (Pomodoro clock with cute sound effects)
