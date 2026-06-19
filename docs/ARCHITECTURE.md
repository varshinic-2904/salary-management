# Architecture

## System Overview

```
HR Manager (Browser)
       │
       ▼
React SPA (Vercel) ──HTTP──► Express API (Render) ──Prisma──► PostgreSQL (Neon)
```

## Components

### Frontend (`frontend/`)
- **React + TypeScript** SPA built with Vite
- **React Router** for client-side navigation
- **TanStack Query** for server state, caching, and loading states
- **shadcn/ui + Tailwind** for accessible UI components
- **Recharts** for compensation visualizations

### Backend (`backend/`)
- **Node.js + Express + TypeScript** REST API
- **Prisma ORM** for type-safe database access and migrations
- **Zod** for request validation
- Layered structure: routes → services → Prisma

### Database
- **PostgreSQL** (Neon in production, local Postgres or SQLite for dev)
- Single `Employee` table with indexes on filter/sort columns
- Optimized for paginated reads at 10K row scale

## Data Flow

### Employee List
1. User applies search/filter/sort in UI
2. React Query fetches `GET /api/v1/employees?page=1&limit=25&country=US`
3. Express validates query params, builds Prisma `where` clause
4. Returns paginated JSON: `{ data, total, page, limit, totalPages }`

### Analytics Dashboard
1. Dashboard mounts, parallel fetches to `/analytics/summary`, `/analytics/by-dimension`, `/analytics/distribution`
2. Analytics service runs aggregation queries (groupBy, raw SQL for percentiles)
3. Results rendered as KPI cards and charts

### CSV Export
1. User clicks Export with active filters
2. `GET /api/v1/employees/export?country=US&department=Engineering`
3. Server streams CSV response with appropriate headers

## API Conventions

- Base path: `/api/v1`
- Error shape: `{ error: string, details?: object }`
- Pagination: `page` (1-based), `limit` (max 100)
- Multi-currency: analytics grouped per currency, no FX conversion

## Deployment

| Service | Platform | Env Vars |
|---------|----------|----------|
| Frontend | Vercel | `VITE_API_URL` |
| API | Render | `DATABASE_URL`, `CORS_ORIGIN`, `PORT` |
| Database | Neon | Connection string in `DATABASE_URL` |
