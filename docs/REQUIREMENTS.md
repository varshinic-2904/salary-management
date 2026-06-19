# ACME Salary Management — Requirements

## Goal

Replace Excel-based salary management for ACME's 10,000 employees with a web application that lets the HR Manager maintain salary data and answer compensation questions about how the organization pays people.

## Persona

**HR Manager** — manages employee salary records across multiple countries, needs fast search/filter over large datasets, and wants aggregate insights without exporting spreadsheets.

## Scope & Features (In)

### 1. Employee Directory
- Paginated list of all employees (25/50/100 per page)
- Search by name or email (server-side, debounced)
- Filter by country, department, and job title
- Sort by salary, name, or hire date

### 2. Salary Management
- View individual employee detail
- Create new employees
- Update salary fields: base salary, currency, employment type, and related profile fields

### 3. Compensation Insights (Dashboard)
Answer "how does the org pay people?" with:
- Summary KPIs: headcount, average/median salary (org-wide and per country)
- Breakdowns by country, department, and job title
- Salary distribution histogram with percentile bands (p25, p50, p75, p90)
- Top/bottom salary outliers for HR review

### 4. Data Export
- CSV export of filtered employee/salary data (replaces Excel workflow)

### 5. Seed Data
- 10,000 realistic employees across 10 countries with country-appropriate currencies and salary ranges

## Deliberately Out of Scope

| Excluded | Reason |
|----------|--------|
| Authentication / RBAC | Assessment focus is data management and analytics; auth adds complexity without demonstrating core value |
| Payroll processing & tax | Different domain; out of "salary data management" scope |
| Salary change approval workflows | HR Manager persona needs direct edit capability for this exercise |
| Employee self-service portal | Persona is HR Manager only |
| Full audit history / versioning | Keeps schema simple; noted as future work |
| Real-time multi-user sync | Not required for demo; Postgres handles concurrent reads |
| Integration with external HRIS | Out of assessment scope |
| Multi-currency FX conversion | Analytics aggregate per-currency separately; converting without real rates would be misleading |

## Technical Constraints

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Neon in production)
- **Frontend:** React, TypeScript, Vite, React Router, shadcn/ui
- **Tests:** Meaningful unit/integration tests for core API and UI utilities
- **Deployment:** Vercel (frontend), Render (API), Neon (database)

## Success Criteria

1. HR Manager can browse, search, and filter 10,000 employees responsively
2. HR Manager can create, edit, and delete employee salary records
3. Dashboard surfaces actionable compensation insights
4. CSV export works with active filters applied
5. Seed script populates 10,000 employees deterministically
6. Tests pass and are fast (< 10 seconds total)
