# Trade-offs & Design Decisions

## Single-table Employee model
**Decision:** One denormalized `Employee` table instead of normalized Department/Country/Title tables.

**Why:** At 10K rows, joins add complexity without meaningful performance gain. HR queries are always employee-centric. Indexes on filter columns keep queries fast.

**Trade-off:** Department/country values are strings, not foreign keys. Acceptable for this scale; would normalize at 100K+ with reference data management needs.

## No authentication
**Decision:** Skip auth/RBAC for the assessment.

**Why:** Focus on data management and analytics. Auth is well-understood; implementing it would consume time without demonstrating unique engineering judgment.

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

**Trade-off:** Less structure for very large teams. Would choose NestJS for a 20+ endpoint enterprise API.

## Vite + React SPA over Next.js
**Decision:** Client-rendered SPA with React Router.

**Why:** Assessment requires ReactJS. No SSR/SSG needed for an internal HR tool. Vite provides fast dev experience.

**Trade-off:** No server-side rendering. Not needed for this use case.
