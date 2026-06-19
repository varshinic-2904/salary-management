import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/App';
import { api } from '@/lib/api';
import {
  mockEmployee,
  mockEmployeeList,
  mockFilterOptions,
  mockAnalyticsSummary,
  mockDimensionStats,
  mockDistribution,
} from './fixtures';

vi.mock('@/lib/api', () => ({
  api: {
    getEmployees: vi.fn(),
    getEmployee: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    getAnalyticsSummary: vi.fn(),
    getAnalyticsByDimension: vi.fn(),
    getDistribution: vi.fn(),
    getFilterOptions: vi.fn(),
    exportEmployees: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

function renderAppAt(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('App routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.getEmployees.mockResolvedValue(mockEmployeeList);
    mockedApi.getEmployee.mockResolvedValue(mockEmployee);
    mockedApi.getFilterOptions.mockResolvedValue(mockFilterOptions);
    mockedApi.getAnalyticsSummary.mockResolvedValue(mockAnalyticsSummary);
    mockedApi.getAnalyticsByDimension.mockResolvedValue(mockDimensionStats);
    mockedApi.getDistribution.mockResolvedValue(mockDistribution);
  });

  it('redirects / to dashboard', async () => {
    renderAppAt('/');
    await waitFor(() => {
      expect(screen.getByText('Compensation Insights')).toBeInTheDocument();
    });
  });

  it('renders dashboard at /dashboard', async () => {
    renderAppAt('/dashboard');
    await waitFor(() => {
      expect(screen.getByText('Compensation Insights')).toBeInTheDocument();
    });
    expect(screen.getByText('Total Headcount')).toBeInTheDocument();
  });

  it('renders employee list at /employees', async () => {
    renderAppAt('/employees');
    await waitFor(() => {
      expect(screen.getByText('Employee Directory')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('renders create form at /employees/new', async () => {
    renderAppAt('/employees/new');
    await waitFor(() => {
      expect(screen.getByText('Add Employee')).toBeInTheDocument();
    });
    expect(screen.getByText('Employee Details')).toBeInTheDocument();
  });

  it('renders employee detail at /employees/:id', async () => {
    renderAppAt('/employees/emp-1');
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('EMP001')).toBeInTheDocument();
  });

  it('renders edit form at /employees/:id/edit', async () => {
    renderAppAt('/employees/emp-1/edit');
    await waitFor(() => {
      expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});
