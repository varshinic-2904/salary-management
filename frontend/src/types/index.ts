export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  country: string;
  currency: string;
  baseSalary: number;
  employmentType: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsSummary {
  totalEmployees: number;
  overall: {
    currency: string;
    count: number;
    avg: number;
    median: number;
    min: number;
    max: number;
  } | null;
  byCurrency: Record<
    string,
    { count: number; avg: number; median: number; min: number; max: number }
  >;
  byCountry: Record<string, { count: number; currencies: string[] }>;
}

export interface DimensionStat {
  name: string;
  count: number;
  avgSalary: number;
  medianSalary: number;
  currency: string;
}

export interface DistributionData {
  currency: string;
  histogram: { range: string; min: number; max: number; count: number }[];
  percentiles: { p25: number; p50: number; p75: number; p90: number };
}

export interface FilterOptions {
  countries: string[];
  departments: string[];
  jobTitles: string[];
  currencies: string[];
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  department?: string;
  jobTitle?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  country: string;
  currency: string;
  baseSalary: number;
  employmentType: string;
  hireDate: string;
}
