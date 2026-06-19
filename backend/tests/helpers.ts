import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../src/index';

export const prisma = new PrismaClient();

export async function seedTestEmployees() {
  await prisma.employee.deleteMany();

  const employees = [
    {
      employeeCode: 'EMP-00001',
      firstName: 'Alice',
      lastName: 'Anderson',
      email: 'alice@acme.com',
      department: 'Engineering',
      jobTitle: 'Software Engineer',
      country: 'US',
      currency: 'USD',
      baseSalary: 100000,
      employmentType: 'FULL_TIME',
      hireDate: new Date('2020-01-15'),
    },
    {
      employeeCode: 'EMP-00002',
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob@acme.com',
      department: 'Sales',
      jobTitle: 'Account Executive',
      country: 'US',
      currency: 'USD',
      baseSalary: 80000,
      employmentType: 'FULL_TIME',
      hireDate: new Date('2019-06-01'),
    },
    {
      employeeCode: 'EMP-00003',
      firstName: 'Carol',
      lastName: 'Chen',
      email: 'carol@acme.com',
      department: 'Engineering',
      jobTitle: 'Senior Software Engineer',
      country: 'GB',
      currency: 'GBP',
      baseSalary: 90000,
      employmentType: 'FULL_TIME',
      hireDate: new Date('2018-03-20'),
    },
    {
      employeeCode: 'EMP-00004',
      firstName: 'David',
      lastName: 'Davis',
      email: 'david@acme.com',
      department: 'HR',
      jobTitle: 'HR Generalist',
      country: 'IN',
      currency: 'INR',
      baseSalary: 600000,
      employmentType: 'FULL_TIME',
      hireDate: new Date('2021-09-10'),
    },
    {
      employeeCode: 'EMP-00005',
      firstName: 'Eve',
      lastName: 'Evans',
      email: 'eve@acme.com',
      department: 'Finance',
      jobTitle: 'Financial Analyst',
      country: 'US',
      currency: 'USD',
      baseSalary: 75000,
      employmentType: 'PART_TIME',
      hireDate: new Date('2022-11-05'),
    },
  ];

  for (const emp of employees) {
    await prisma.employee.create({ data: emp });
  }
}

export { request, app };
