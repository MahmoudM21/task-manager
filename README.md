# TaskFlow — Mini Task Manager

A full-stack task management app with JWT auth, project CRUD, per-project task tracking, and AI-powered project summaries via the Anthropic Claude API.

**Stack:** Node.js/Express · PostgreSQL · React 18/Vite · Tailwind CSS · Anthropic Claude API

---

## Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- An Anthropic API key (for AI summaries)

---

## Project Structure

```
task-manager/
├── backend/          # Express REST API
│   ├── server.js
│   └── src/
│       ├── config/   # db.js, jwt.js, schema.sql
│       ├── controllers/
│       ├── middleware/
│       └── routes/
└── frontend/         # React + Vite SPA
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── hooks/
        └── pages/
```

---

## Backend Setup

### 1. Install dependencies

```bash
cd task-manager/backend
npm install
```

### 2. Environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow
JWT_SECRET=your-strong-random-secret-min-32-chars
ANTHROPIC_API_KEY=sk-ant-...
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173   # production only
```

> **Required in production:** `JWT_SECRET` — the server throws on startup if this is missing.
> **Change `FRONTEND_URL`** to your deployed frontend URL in production (e.g. `https://app.yourdomain.com`). CORS is restricted to this origin; leaving it as `localhost` in production will block all browser requests.

### 3. Create the database

```bash
node src/config/initDb.js   # creates tables (run once)
createdb taskflow
```

### 4. Run the schema

```bash
psql -d taskflow -f src/config/schema.sql
```

This creates the `users`, `projects`, and `tasks` tables with a `task_status` ENUM, UUID primary keys, and `updated_at` triggers.

### 5. Start the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The API listens on `http://localhost:5000`.

---

## Frontend Setup

### 1. Install dependencies

```bash
cd task-manager/frontend
npm install
```

### 2. Environment variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
# Output: frontend/dist/
```

---

## API Reference

All routes (except auth) require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Get JWT token |
| GET | `/api/auth/me` | — | Current user |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects (with task counts) |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get single project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project + all tasks |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:projectId/tasks` | List tasks (optional `?status=todo\|in_progress\|done`) |
| POST | `/api/projects/:projectId/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task status |
| PUT | `/api/tasks/:id` | Full task update |
| DELETE | `/api/tasks/:id` | Delete task |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/summarize/:projectId` | Get AI summary (5 req/user/hr) |

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds); `password_hash` never returned by any endpoint
- JWT secret **must** be set via environment variable in production
- All project/task queries enforce ownership — users can only access their own data
- SQL injection prevented via parameterized queries throughout
- CORS restricted to `FRONTEND_URL` in production

---

## Known Limitations

- AI rate limiter is in-memory — resets on server restart; use Redis for persistence in production
- No email verification on registration
- No password reset flow
