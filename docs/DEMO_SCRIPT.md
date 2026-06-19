# Video Demo Script (~3–5 minutes)

## 1. Problem Framing (30s)
- ACME manages 10,000 employees across 10 countries via Excel
- Pain points: no search, no analytics, error-prone manual updates
- Solution: web-based salary management for HR Managers

## 2. Dashboard (60s)
- Open `/dashboard`
- Show total headcount KPI
- Switch currency filter (USD → GBP)
- Point out average/median salary cards
- Show breakdown chart by country
- Show salary distribution histogram
- Highlight percentile bands (p25, p50, p75, p90)

## 3. Employee Directory (90s)
- Navigate to `/employees`
- Show 10,000 employees with pagination
- Search for an employee by name
- Filter by country (e.g., US) and department (Engineering)
- Show filter badges and page navigation
- Click into an employee detail page

## 4. Salary Edit (45s)
- On employee detail, click "Update Salary"
- Change base salary, save
- Show success confirmation
- Navigate to full edit form, update a field

## 5. CSV Export (20s)
- Return to employee list with filters active
- Click "Export CSV"
- Show downloaded file opens in spreadsheet app

## 6. Engineering Quality (30s)
- Run `cd backend && npm test` — 18 tests pass
- Run `cd frontend && npm test` — 8 tests pass
- Briefly show `docs/` folder: requirements, architecture, trade-offs

## Recording Tips
- Use localhost with backend seeded (`npm run db:seed`)
- Browser at 1280×720 or 1920×1080
- Keep mouse movements deliberate and slow
