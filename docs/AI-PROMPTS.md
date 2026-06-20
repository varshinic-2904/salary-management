# AI Prompts & Instructions Log

This document records key prompts and instructions used with Cursor AI during the assessment.

## Initial Planning

**Prompt:** Assessment requirements for employee salary management software — 10,000 employees, HR Manager persona, React frontend, Node.js backend, incremental commits, tests, and artifacts.

**AI Contribution:**
Used AI to brainstorm possible architecture options and generate an initial implementation plan.

**Human Decision:**
Selected Express + Prisma + React/Vite based on familiarity, maintainability, and assessment requirements.

## Stack Decisions

**Prompt:** Use Node.js Express backend and React TypeScript frontend (not Next.js).

**AI Contribution:**
Provided alternative frontend and deployment approaches.

**Human Decision:**
Chose React + Vite and separate deployments for simplicity and faster iteration.

## Implementation Prompts

1. **Requirements first:** "Write one-page requirements document before building, outlining goal, scope, features, and deliberate exclusions."

2. **Seed data:** "Generate deterministic 10,000 employee seed with 10 countries, realistic salary bands per department, batch insert in chunks of 500."

3. **API:** "Build CRUD + analytics endpoints with Zod validation, server-side pagination, CSV export, per-currency analytics without FX conversion."

4. **Tests:** "Meaningful unit tests — fast, deterministic, easy to understand. Test against 5-row fixture, not full 10K."

5. **Frontend:** "HR Manager dashboard with KPI cards, bar charts, employee list with search/filter/pagination, inline salary edit."

## AI Usage Principles Applied

- Used AI to scaffold boilerplate (Prisma schema, route structure, UI components) quickly
- Manually reviewed all business logic (analytics calculations, seed salary ranges, validation rules)
- Ran tests after each major phase to verify correctness
- Kept scope disciplined per requirements doc (no auth, no payroll, no FX conversion)

## Corrections Made Post-AI

- Fixed Express `req.params.id` TypeScript typing for @types/express v5
- Fixed React `verbatimModuleSyntax` type-only import errors
- Fixed Recharts Tooltip formatter type compatibility
- Separated test database (`test.db`) from dev database (`dev.db`)

## Overall Approach

- AI was used as an accelerator for repetitive tasks, brainstorming, and code scaffolding.
- Final responsibility for architecture, business logic, testing, and trade-off decisions remained with the developer.