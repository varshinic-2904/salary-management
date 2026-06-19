import { z } from 'zod';

export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT'] as const;
export const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'] as const;

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  department: z.enum(DEPARTMENTS),
  jobTitle: z.string().min(1).max(100),
  country: z.string().length(2),
  currency: z.string().length(3),
  baseSalary: z.number().positive(),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  hireDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const listEmployeesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().optional(),
  country: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  sortBy: z.enum(['baseSalary', 'lastName', 'hireDate', 'employeeCode']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const analyticsByDimensionSchema = z.object({
  dimension: z.enum(['country', 'department', 'jobTitle']).default('country'),
  currency: z.string().length(3).optional(),
});

export const distributionSchema = z.object({
  currency: z.string().length(3).optional(),
  buckets: z.coerce.number().int().min(5).max(20).default(10),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesInput = z.infer<typeof listEmployeesSchema>;
