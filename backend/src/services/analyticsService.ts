import { prisma } from '../lib/prisma';

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export async function getAnalyticsSummary(currency?: string) {
  const where = currency ? { currency } : {};
  const employees = await prisma.employee.findMany({
    where,
    select: { baseSalary: true, currency: true, country: true },
  });

  const salaries = employees.map((e) => Number(e.baseSalary));

  const byCurrency: Record<
    string,
    { count: number; avg: number; median: number; min: number; max: number }
  > = {};

  for (const emp of employees) {
    const salary = Number(emp.baseSalary);
    if (!byCurrency[emp.currency]) {
      byCurrency[emp.currency] = { count: 0, avg: 0, median: 0, min: Infinity, max: -Infinity };
    }
    const bucket = byCurrency[emp.currency];
    bucket.count++;
    bucket.min = Math.min(bucket.min, salary);
    bucket.max = Math.max(bucket.max, salary);
  }

  for (const [curr, bucket] of Object.entries(byCurrency)) {
    const currSalaries = employees
      .filter((e) => e.currency === curr)
      .map((e) => Number(e.baseSalary));
    bucket.avg = currSalaries.reduce((a, b) => a + b, 0) / currSalaries.length;
    bucket.median = median(currSalaries);
    if (bucket.min === Infinity) bucket.min = 0;
    if (bucket.max === -Infinity) bucket.max = 0;
  }

  const byCountry: Record<string, { count: number; currencies: string[] }> = {};
  for (const emp of employees) {
    if (!byCountry[emp.country]) {
      byCountry[emp.country] = { count: 0, currencies: [] };
    }
    byCountry[emp.country].count++;
    if (!byCountry[emp.country].currencies.includes(emp.currency)) {
      byCountry[emp.country].currencies.push(emp.currency);
    }
  }

  return {
    totalEmployees: employees.length,
    overall: currency
      ? {
          currency,
          count: salaries.length,
          avg: salaries.length ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0,
          median: median(salaries),
          min: salaries.length ? Math.min(...salaries) : 0,
          max: salaries.length ? Math.max(...salaries) : 0,
        }
      : null,
    byCurrency,
    byCountry,
  };
}

export async function getAnalyticsByDimension(
  dimension: 'country' | 'department' | 'jobTitle',
  currency?: string
) {
  const where = currency ? { currency } : {};
  const employees = await prisma.employee.findMany({
    where,
    select: {
      baseSalary: true,
      currency: true,
      country: true,
      department: true,
      jobTitle: true,
    },
  });

  const groups: Record<
    string,
    { count: number; avgSalary: number; medianSalary: number; currency: string }
  > = {};

  const grouped: Record<string, typeof employees> = {};
  for (const emp of employees) {
    const key = emp[dimension];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(emp);
  }

  for (const [key, emps] of Object.entries(grouped)) {
    const salaries = emps.map((e) => Number(e.baseSalary));
    const curr = currency || emps[0].currency;
    groups[key] = {
      count: emps.length,
      avgSalary: salaries.reduce((a, b) => a + b, 0) / salaries.length,
      medianSalary: median(salaries),
      currency: curr,
    };
  }

  return Object.entries(groups)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count);
}

export async function getSalaryDistribution(currency?: string, buckets = 10) {
  const where = currency ? { currency } : {};
  const employees = await prisma.employee.findMany({
    where,
    select: { id: true, baseSalary: true, currency: true },
    orderBy: { baseSalary: 'asc' },
  });

  if (employees.length === 0) {
    return { histogram: [], percentiles: { p25: 0, p50: 0, p75: 0, p90: 0 }, currency: currency || 'ALL' };
  }

  const salaries = employees.map((e) => Number(e.baseSalary));
  const curr = currency || employees[0].currency;
  const min = Math.min(...salaries);
  const max = Math.max(...salaries);
  const range = max - min || 1;
  const bucketSize = range / buckets;

  const histogram = Array.from({ length: buckets }, (_, i) => {
    const bucketMin = min + i * bucketSize;
    const bucketMax = i === buckets - 1 ? max : min + (i + 1) * bucketSize;
    const count = salaries.filter(
      (s) => s >= bucketMin && (i === buckets - 1 ? s <= bucketMax : s < bucketMax)
    ).length;
    return {
      range: `${Math.round(bucketMin).toLocaleString()}-${Math.round(bucketMax).toLocaleString()}`,
      min: bucketMin,
      max: bucketMax,
      count,
    };
  });

  const sorted = [...employees].sort(
    (a, b) => Number(b.baseSalary) - Number(a.baseSalary)
  );

  return {
    currency: curr,
    histogram,
    percentiles: {
      p25: percentile(salaries, 25),
      p50: percentile(salaries, 50),
      p75: percentile(salaries, 75),
      p90: percentile(salaries, 90),
    },
    outliers: {
      top: sorted.slice(0, 5).map((e) => ({
        id: e.id,
        baseSalary: Number(e.baseSalary),
        currency: e.currency,
      })),
      bottom: sorted
        .slice(-5)
        .reverse()
        .map((e) => ({
          id: e.id,
          baseSalary: Number(e.baseSalary),
          currency: e.currency,
        })),
    },
  };
}

export async function getFilterOptions() {
  const [countries, departments, jobTitles, currencies] = await Promise.all([
    prisma.employee.findMany({ select: { country: true }, distinct: ['country'], orderBy: { country: 'asc' } }),
    prisma.employee.findMany({ select: { department: true }, distinct: ['department'], orderBy: { department: 'asc' } }),
    prisma.employee.findMany({ select: { jobTitle: true }, distinct: ['jobTitle'], orderBy: { jobTitle: 'asc' } }),
    prisma.employee.findMany({ select: { currency: true }, distinct: ['currency'], orderBy: { currency: 'asc' } }),
  ]);

  return {
    countries: countries.map((c) => c.country),
    departments: departments.map((d) => d.department),
    jobTitles: jobTitles.map((j) => j.jobTitle),
    currencies: currencies.map((c) => c.currency),
  };
}
