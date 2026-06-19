import type {
  AnalyticsSummary,
  DimensionStat,
  DistributionData,
  Employee,
  FilterOptions,
  PaginatedResponse,
} from '@/types';

export const mockEmployee: Employee = {
  id: 'emp-1',
  employeeCode: 'EMP001',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@acme.com',
  department: 'Engineering',
  jobTitle: 'Software Engineer',
  country: 'US',
  currency: 'USD',
  baseSalary: 120000,
  employmentType: 'FULL_TIME',
  hireDate: '2020-01-15T00:00:00.000Z',
  createdAt: '2020-01-15T00:00:00.000Z',
  updatedAt: '2020-01-15T00:00:00.000Z',
};

export const mockEmployee2: Employee = {
  ...mockEmployee,
  id: 'emp-2',
  employeeCode: 'EMP002',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@acme.com',
  country: 'GB',
  currency: 'GBP',
  baseSalary: 90000,
};

export const mockEmployeeList: PaginatedResponse<Employee> = {
  data: [mockEmployee, mockEmployee2],
  total: 2,
  page: 1,
  limit: 25,
  totalPages: 1,
};

export const mockEmployeeListPage2: PaginatedResponse<Employee> = {
  ...mockEmployeeList,
  page: 2,
  totalPages: 2,
};

export const mockFilterOptions: FilterOptions = {
  countries: ['US', 'GB', 'IN'],
  departments: ['Engineering', 'Sales', 'Marketing'],
  jobTitles: ['Software Engineer', 'Account Executive'],
  currencies: ['USD', 'GBP', 'INR'],
};

export const mockAnalyticsSummary: AnalyticsSummary = {
  totalEmployees: 10000,
  overall: {
    currency: 'USD',
    count: 10000,
    avg: 85000,
    median: 78000,
    min: 30000,
    max: 250000,
  },
  byCurrency: {
    USD: { count: 5000, avg: 85000, median: 78000, min: 30000, max: 250000 },
  },
  byCountry: {
    US: { count: 5000, currencies: ['USD'] },
  },
};

export const mockDimensionStats: DimensionStat[] = [
  { name: 'US', count: 5000, avgSalary: 85000, medianSalary: 78000, currency: 'USD' },
  { name: 'GB', count: 2000, avgSalary: 72000, medianSalary: 68000, currency: 'GBP' },
];

export const mockDistribution: DistributionData = {
  currency: 'USD',
  histogram: [
    { range: '30k-50k', min: 30000, max: 50000, count: 1000 },
    { range: '50k-75k', min: 50000, max: 75000, count: 3000 },
  ],
  percentiles: { p25: 55000, p50: 78000, p75: 105000, p90: 140000 },
};
