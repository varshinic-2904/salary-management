import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, userEvent } from './test-utils';
import { DashboardPage } from '@/pages/DashboardPage';
import { api } from '@/lib/api';
import {
  mockAnalyticsSummary,
  mockDimensionStats,
  mockDistribution,
  mockFilterOptions,
} from './fixtures';

vi.mock('@/lib/api', () => ({
  api: {
    getAnalyticsSummary: vi.fn(),
    getAnalyticsByDimension: vi.fn(),
    getDistribution: vi.fn(),
    getFilterOptions: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.getAnalyticsSummary.mockResolvedValue(mockAnalyticsSummary);
    mockedApi.getAnalyticsByDimension.mockResolvedValue(mockDimensionStats);
    mockedApi.getDistribution.mockResolvedValue(mockDistribution);
    mockedApi.getFilterOptions.mockResolvedValue(mockFilterOptions);
  });

  it('shows KPI loading skeletons initially', () => {
    mockedApi.getAnalyticsSummary.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<DashboardPage />, { route: '/dashboard' });

    expect(screen.getByText('Compensation Insights')).toBeInTheDocument();
    expect(screen.getByText('Total Headcount')).toBeInTheDocument();
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders headcount and formatted average salary after data loads', async () => {
    renderWithProviders(<DashboardPage />, { route: '/dashboard' });

    await waitFor(() => {
      expect(screen.getByText('10,000')).toBeInTheDocument();
    });
    expect(screen.getByText('$85,000.00')).toBeInTheDocument();
  });

  it('refetches summary when currency changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { route: '/dashboard' });

    await waitFor(() => {
      expect(screen.getByText('10,000')).toBeInTheDocument();
    });

    const currencySelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(currencySelect, 'GBP');

    await waitFor(() => {
      expect(mockedApi.getAnalyticsSummary).toHaveBeenCalledWith('GBP');
    });
  });

  it('renders percentile bands when distribution data is present', async () => {
    renderWithProviders(<DashboardPage />, { route: '/dashboard' });

    await waitFor(() => {
      expect(screen.getByText('Percentile Bands (USD)')).toBeInTheDocument();
    });
    expect(screen.getByText('p25')).toBeInTheDocument();
    expect(screen.getByText('p50')).toBeInTheDocument();
    expect(screen.getByText('p75')).toBeInTheDocument();
    expect(screen.getByText('p90')).toBeInTheDocument();
    expect(screen.getByText('$55,000.00')).toBeInTheDocument();
  });
});
