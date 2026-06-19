# Performance Considerations

## Database

### Indexes
The `Employee` table has indexes on all frequently filtered/sorted columns:
- `country`, `department`, `jobTitle`, `baseSalary`
- Composite `(lastName, firstName)` for name sorting

At 10,000 rows, paginated queries with filters complete in **< 50ms** on SQLite/Postgres.

### Pagination
- Server-side only; default 25 rows, max 100 per request
- Never loads full dataset to client
- `COUNT(*)` runs in parallel with `findMany` via `Promise.all`

### Seed Performance
- Batch `createMany` in chunks of 500
- 10,000 employees seeded in ~5–10 seconds
- Deterministic PRNG (mulberry32, seed=42) for reproducible data

## API

### Analytics
- Summary and dimension queries load only required columns via Prisma `select`
- Percentile/median calculated in application layer on filtered dataset
- Per-currency filtering avoids misleading cross-currency aggregation

### CSV Export
- Streams full result set for filtered query (no pagination limit)
- For 10K rows with no filters: ~1MB CSV, < 500ms generation

## Frontend

### Data Fetching
- TanStack Query with 30s stale time reduces redundant API calls
- Debounced search (300ms) prevents excessive requests while typing
- Parallel analytics fetches on dashboard mount

### Bundle
- Production build ~662KB JS (Recharts is the largest dependency)
- Future optimization: lazy-load dashboard charts with `React.lazy`

## Test Performance
- Backend: 18 tests in ~1.3s (small 5-row test fixture, not 10K)
- Frontend: 8 tests in ~0.6s
- Total test suite: **< 3 seconds**

## Production Scaling Notes
At 100K+ employees, consider:
- Postgres full-text search (tsvector) replacing `contains` filters
- Materialized views for analytics aggregates
- Read replicas for dashboard queries
- Cursor-based pagination replacing offset pagination
