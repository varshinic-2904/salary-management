import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED = 42;
const TOTAL_EMPLOYEES = 10000;

// Simple seeded PRNG (mulberry32)
function createRng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COUNTRIES = [
  { code: 'US', currency: 'USD', salaryMultiplier: 1 },
  { code: 'GB', currency: 'GBP', salaryMultiplier: 0.75 },
  { code: 'IN', currency: 'INR', salaryMultiplier: 0.012 },
  { code: 'DE', currency: 'EUR', salaryMultiplier: 0.85 },
  { code: 'FR', currency: 'EUR', salaryMultiplier: 0.82 },
  { code: 'CA', currency: 'CAD', salaryMultiplier: 0.72 },
  { code: 'AU', currency: 'AUD', salaryMultiplier: 0.65 },
  { code: 'SG', currency: 'SGD', salaryMultiplier: 0.74 },
  { code: 'JP', currency: 'JPY', salaryMultiplier: 0.0067 },
  { code: 'BR', currency: 'BRL', salaryMultiplier: 0.18 },
] as const;

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'] as const;

const JOB_TITLES: Record<string, { title: string; baseMin: number; baseMax: number }[]> = {
  Engineering: [
    { title: 'Software Engineer', baseMin: 80000, baseMax: 150000 },
    { title: 'Senior Software Engineer', baseMin: 120000, baseMax: 200000 },
    { title: 'Staff Engineer', baseMin: 160000, baseMax: 250000 },
    { title: 'Engineering Manager', baseMin: 140000, baseMax: 220000 },
    { title: 'DevOps Engineer', baseMin: 90000, baseMax: 160000 },
  ],
  Sales: [
    { title: 'Account Executive', baseMin: 60000, baseMax: 120000 },
    { title: 'Senior Account Executive', baseMin: 90000, baseMax: 160000 },
    { title: 'Sales Manager', baseMin: 100000, baseMax: 180000 },
    { title: 'Business Development Rep', baseMin: 45000, baseMax: 80000 },
  ],
  Marketing: [
    { title: 'Marketing Manager', baseMin: 70000, baseMax: 130000 },
    { title: 'Content Strategist', baseMin: 55000, baseMax: 95000 },
    { title: 'Growth Marketing Lead', baseMin: 90000, baseMax: 150000 },
    { title: 'Brand Manager', baseMin: 75000, baseMax: 125000 },
  ],
  HR: [
    { title: 'HR Generalist', baseMin: 50000, baseMax: 85000 },
    { title: 'HR Business Partner', baseMin: 75000, baseMax: 120000 },
    { title: 'Talent Acquisition Specialist', baseMin: 55000, baseMax: 95000 },
    { title: 'Compensation Analyst', baseMin: 70000, baseMax: 110000 },
  ],
  Finance: [
    { title: 'Financial Analyst', baseMin: 65000, baseMax: 110000 },
    { title: 'Senior Financial Analyst', baseMin: 90000, baseMax: 140000 },
    { title: 'Controller', baseMin: 110000, baseMax: 170000 },
    { title: 'Accountant', baseMin: 50000, baseMax: 85000 },
  ],
  Operations: [
    { title: 'Operations Manager', baseMin: 70000, baseMax: 120000 },
    { title: 'Supply Chain Analyst', baseMin: 60000, baseMax: 100000 },
    { title: 'Project Manager', baseMin: 80000, baseMax: 140000 },
    { title: 'Operations Coordinator', baseMin: 45000, baseMax: 75000 },
  ],
};

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Priya', 'Raj', 'Ananya', 'Vikram',
  'Hans', 'Marie', 'Pierre', 'Sophie', 'Yuki', 'Hana', 'Carlos', 'Ana',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Patel', 'Singh', 'Kumar',
  'Mueller', 'Schmidt', 'Dubois', 'Tanaka', 'Santos', 'Chen', 'Wong',
];

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT'] as const;

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randomSalary(rng: () => number, min: number, max: number, multiplier: number): number {
  const base = min + rng() * (max - min);
  const salary = base * multiplier;
  return Math.round(salary * 100) / 100;
}

function randomHireDate(rng: () => number): Date {
  const start = new Date('2015-01-01').getTime();
  const end = new Date('2025-06-01').getTime();
  return new Date(start + rng() * (end - start));
}

async function main() {
  console.log('Clearing existing employees...');
  await prisma.employee.deleteMany();

  const rng = createRng(SEED);
  const employees = [];

  for (let i = 1; i <= TOTAL_EMPLOYEES; i++) {
    const country = pick(rng, COUNTRIES);
    const department = pick(rng, DEPARTMENTS);
    const jobPool = JOB_TITLES[department];
    const job = pick(rng, jobPool);
    const firstName = pick(rng, FIRST_NAMES);
    const lastName = pick(rng, LAST_NAMES);
    const employmentType =
      rng() < 0.85 ? 'FULL_TIME' : rng() < 0.7 ? 'PART_TIME' : 'CONTRACT';

    employees.push({
      employeeCode: `EMP-${String(i).padStart(5, '0')}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@acme.com`,
      department,
      jobTitle: job.title,
      country: country.code,
      currency: country.currency,
      baseSalary: randomSalary(rng, job.baseMin, job.baseMax, country.salaryMultiplier),
      employmentType,
      hireDate: randomHireDate(rng),
    });
  }

  console.log(`Seeding ${TOTAL_EMPLOYEES} employees...`);
  const CHUNK_SIZE = 500;
  for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
    const chunk = employees.slice(i, i + CHUNK_SIZE);
    await prisma.employee.createMany({ data: chunk });
    console.log(`  Inserted ${Math.min(i + CHUNK_SIZE, employees.length)} / ${TOTAL_EMPLOYEES}`);
  }

  const count = await prisma.employee.count();
  console.log(`Done. Total employees: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
