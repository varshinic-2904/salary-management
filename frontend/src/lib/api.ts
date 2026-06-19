import type {
  AnalyticsSummary,
  CreateEmployeeInput,
  DimensionStat,
  DistributionData,
  Employee,
  EmployeeFilters,
  FilterOptions,
  PaginatedResponse,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

function buildEmployeeQuery(params: EmployeeFilters): string {
  return buildQuery({
    page: params.page,
    limit: params.limit,
    search: params.search,
    country: params.country,
    department: params.department,
    jobTitle: params.jobTitle,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getEmployees: (filters: EmployeeFilters = {}) =>
    request<PaginatedResponse<Employee>>(`/employees${buildEmployeeQuery(filters)}`),

  getEmployee: (id: string) => request<Employee>(`/employees/${id}`),

  createEmployee: (data: CreateEmployeeInput) =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),

  updateEmployee: (id: string, data: Partial<CreateEmployeeInput>) =>
    request<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteEmployee: (id: string) =>
    request<void>(`/employees/${id}`, { method: 'DELETE' }),

  getAnalyticsSummary: (currency?: string) =>
    request<AnalyticsSummary>(`/analytics/summary${buildQuery({ currency })}`),

  getAnalyticsByDimension: (dimension: string, currency?: string) =>
    request<DimensionStat[]>(
      `/analytics/by-dimension${buildQuery({ dimension, currency })}`
    ),

  getDistribution: (currency?: string) =>
    request<DistributionData>(`/analytics/distribution${buildQuery({ currency })}`),

  getFilterOptions: () => request<FilterOptions>('/analytics/filters'),

  exportEmployees: (filters: EmployeeFilters = {}) => {
    const url = `${API_BASE}/employees/export${buildEmployeeQuery(filters)}`;
    window.open(url, '_blank');
  },
};
