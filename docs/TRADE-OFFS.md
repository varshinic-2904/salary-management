# Trade-offs & Design Decisions

## Single-table Employee model
**Decision:** One denormalized `Employee` table instead of normalized Department/Country/Title tables.

**Why:** At 10K rows, joins add complexity without meaningful performance gain. HR queries are always employee-centric. Indexes on filter columns keep queries fast.

**Trade-off:** Department/country values are strings, not foreign keys. Acceptable for this scale; would consider normalization if additional reference data, validation requirements, or increased complexity justified it.

## No authentication
**Decision:** Skip auth/RBAC for the assessment.

**Why:** Focus on data management and analytics. Authentication and role-based access were intentionally excluded to keep the assessment focused on salary management and compensation analytics.

**Trade-off:** Not production-ready. Documented as first priority for a real deployment.

## Per-currency analytics (no FX conversion)
**Decision:** Aggregate salaries within each currency separately.

**Why:** Converting 10 currencies to a single base without real exchange rates produces misleading numbers. Honest limitation is better than fake precision.

**Trade-off:** HR Manager cannot see a single "global average salary" across currencies. Dashboard shows per-currency breakdowns instead.

## SQLite for local dev, PostgreSQL for production
**Decision:** Prisma supports both via `DATABASE_URL`. Local dev uses SQLite for zero-setup; production uses Neon PostgreSQL.

**Why:** Assessment mentions SQLite; Neon is better for deployed demo. Prisma abstracts the difference.

**Trade-off:** Minor dialect differences (e.g., `Decimal` handling). Tests run against SQLite; production validated separately.

## Server-side pagination only
**Decision:** Never load all 10K employees client-side.

**Why:** Keeps UI responsive and memory usage low. Standard pattern for large datasets.

**Trade-off:** Client cannot do instant client-side re-sort without a round-trip. Acceptable for HR workflows.

## Express over NestJS
**Decision:** Lightweight Express with manual route organization.

**Why:** Faster to scaffold, easier to test with Supertest, sufficient for a focused CRUD + analytics API.

**Trade-off:** Less structure for very large teams. Express was sufficient for the current scope. For larger systems requiring additional structure and conventions, frameworks such as NestJS could be considered.

## Vite + React SPA over Next.js
**Decision:** Client-rendered SPA with React Router.

**Why:** Assessment requires ReactJS. No SSR/SSG needed for an internal HR tool. Vite provides fast dev experience.

**Trade-off:** No server-side rendering. Not needed for this use case.

## Layered Architecture

**Decision:** Use routes → services → Prisma separation.

**Why:** Keeps HTTP concerns separate from business logic and improves maintainability and testability.

**Trade-off:** Slightly more files compared to placing logic directly inside route handlers, but easier to scale and test.
