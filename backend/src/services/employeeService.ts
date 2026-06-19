import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import {
  CreateEmployeeInput,
  ListEmployeesInput,
  UpdateEmployeeInput,
} from '../validators/employee';

function buildWhereClause(params: ListEmployeesInput): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = {};

  if (params.country) where.country = params.country;
  if (params.department) where.department = params.department;
  if (params.jobTitle) where.jobTitle = params.jobTitle;

  if (params.search) {
    const search = params.search.trim();
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { employeeCode: { contains: search } },
    ];
  }

  return where;
}

export async function listEmployees(params: ListEmployeesInput) {
  const where = buildWhereClause(params);
  const skip = (params.page - 1) * params.limit;

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: params.limit,
      orderBy: { [params.sortBy]: params.sortOrder },
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    data: data.map(serializeEmployee),
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) throw new AppError(404, 'Employee not found');
  return serializeEmployee(employee);
}

export async function createEmployee(input: CreateEmployeeInput) {
  const count = await prisma.employee.count();
  const employeeCode = `EMP-${String(count + 1).padStart(5, '0')}`;

  const employee = await prisma.employee.create({
    data: {
      employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      department: input.department,
      jobTitle: input.jobTitle,
      country: input.country,
      currency: input.currency,
      baseSalary: input.baseSalary,
      employmentType: input.employmentType,
      hireDate: new Date(input.hireDate),
    },
  });

  return serializeEmployee(employee);
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  await getEmployeeById(id);

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...input,
      ...(input.hireDate ? { hireDate: new Date(input.hireDate) } : {}),
    },
  });

  return serializeEmployee(employee);
}

export async function deleteEmployee(id: string) {
  await getEmployeeById(id);
  await prisma.employee.delete({ where: { id } });
}

export async function exportEmployees(params: ListEmployeesInput) {
  const where = buildWhereClause(params);
  return prisma.employee.findMany({
    where,
    orderBy: { [params.sortBy]: params.sortOrder },
  });
}

function serializeEmployee(employee: {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  country: string;
  currency: string;
  baseSalary: Prisma.Decimal;
  employmentType: string;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...employee,
    baseSalary: Number(employee.baseSalary),
    hireDate: employee.hireDate.toISOString(),
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
  };
}

export function employeesToCsv(
  employees: Awaited<ReturnType<typeof exportEmployees>>
): string {
  const headers = [
    'employeeCode',
    'firstName',
    'lastName',
    'email',
    'department',
    'jobTitle',
    'country',
    'currency',
    'baseSalary',
    'employmentType',
    'hireDate',
  ];

  const rows = employees.map((e) =>
    [
      e.employeeCode,
      e.firstName,
      e.lastName,
      e.email,
      e.department,
      e.jobTitle,
      e.country,
      e.currency,
      Number(e.baseSalary),
      e.employmentType,
      e.hireDate.toISOString().split('T')[0],
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
