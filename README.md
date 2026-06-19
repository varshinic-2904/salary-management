# ACME Salary Management

Employee salary management software for ACME's HR team. Replaces Excel-based workflows with a web application for managing 10,000 employees across multiple countries and answering compensation questions.

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | _Deploy to Vercel — see instructions below_ |
| API | _Deploy to Render — see instructions below_ |

## Features

- **Employee Directory** — search, filter, sort, and paginate 10,000 employees
- **Salary Management** — create, view, edit, and delete employee records
- **Compensation Dashboard** — KPIs, breakdowns by country/department/title, salary distribution
- **CSV Export** — download filtered employee data
- **10K Seed Data** — deterministic multi-country employee dataset

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | SQLite (local) / PostgreSQL via Neon (production) |
| Frontend | React, TypeScript, Vite, React Router, TanStack Query |
| UI | Tailwind CSS, Recharts |
| Tests | Jest + Supertest (API), Vitest + RTL (UI) |

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed    # Seeds 10,000 employees (~10 seconds)
npm run dev        # http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

### 3. Run Tests

```bash
# From project root
cd backend && npm test   # 18 API tests
cd ../frontend && npm test  # 8 UI tests
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/employees` | List with pagination, search, filters |
| GET | `/api/v1/employees/:id` | Employee detail |
| POST | `/api/v1/employees` | Create employee |
| PATCH | `/api/v1/employees/:id` | Update employee |
| DELETE | `/api/v1/employees/:id` | Delete employee |
| GET | `/api/v1/employees/export` | CSV export |
| GET | `/api/v1/analytics/summary` | Org-wide KPIs |
| GET | `/api/v1/analytics/by-dimension` | Group by country/dept/title |
| GET | `/api/v1/analytics/distribution` | Histogram + percentiles |
| GET | `/api/v1/analytics/filters` | Filter dropdown options |

## Deployment

### Database (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the PostgreSQL connection string
3. Update `backend/prisma/schema.prisma` datasource to `provider = "postgresql"` for production
4. Set `DATABASE_URL` in Render

### Backend (Render)

1. Connect this repo to Render
2. Set root directory to `backend`
3. Build: `npm install && npx prisma generate && npm run build`
4. Start: `npx prisma migrate deploy && npm run db:seed && npm start`
5. Environment variables:
   - `DATABASE_URL` — Neon connection string
   - `CORS_ORIGIN` — your Vercel frontend URL
   - `NODE_ENV=production`

### Frontend (Vercel)

1. Import repo, set root directory to `frontend`
2. Framework preset: Vite
3. Environment variable: `VITE_API_URL=https://your-api.onrender.com/api/v1`
4. Deploy — `vercel.json` handles SPA routing

## Project Structure

```
├── docs/           # Requirements, architecture, trade-offs, AI prompts
├── backend/        # Express API + Prisma + tests
├── frontend/       # React SPA + tests
└── README.md
```

## Assessment Artifacts

- [Requirements](docs/REQUIREMENTS.md) — goal, scope, exclusions
- [Architecture](docs/ARCHITECTURE.md) — system design and data flow
- [Trade-offs](docs/TRADE-OFFS.md) — design decisions and reasoning
- [Performance](docs/PERFORMANCE.md) — indexing, pagination, benchmarks
- [AI Prompts](docs/AI-PROMPTS.md) — how AI tools were used

## Video Demo

Record a 3–5 minute walkthrough covering:
1. Dashboard compensation insights
2. Employee search, filter, and pagination
3. Salary edit with confirmation
4. CSV export
5. Test suite (`npm test`)
