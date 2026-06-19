import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, userEvent } from './test-utils';
import { EmployeeListPage } from '@/pages/EmployeeListPage';
import { api } from '@/lib/api';
import {
  mockEmployeeList,
  mockEmployeeListPage2,
  mockFilterOptions,
} from './fixtures';

vi.mock('@/lib/api', () => ({
  api: {
    getEmployees: vi.fn(),
    getFilterOptions: vi.fn(),
    exportEmployees: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('EmployeeListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.getEmployees.mockResolvedValue(mockEmployeeList);
    mockedApi.getFilterOptions.mockResolvedValue(mockFilterOptions);
  });

  it('shows loading skeletons while fetching', () => {
    mockedApi.getEmployees.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<EmployeeListPage />, { route: '/employees' });

    expect(screen.getByText('Employee Directory')).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('renders employee rows with formatted salary and name after load', async () => {
    renderWithProviders(<EmployeeListPage />, { route: '/employees' });

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('EMP001')).toBeInTheDocument();
    expect(screen.getByText('$120,000.00')).toBeInTheDocument();
  });

  it('updates URL when country filter changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EmployeeListPage />, { route: '/employees' });

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    const countrySelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(countrySelect, 'US');

    await waitFor(() => {
      expect(mockedApi.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ country: 'US' })
      );
    });
  });

  it('paginates to next page when Next is clicked', async () => {
    const user = userEvent.setup();
    mockedApi.getEmployees.mockImplementation(async (filters) => {
      if (filters?.page === 2) return mockEmployeeListPage2;
      return { ...mockEmployeeList, totalPages: 2 };
    });

    renderWithProviders(<EmployeeListPage />, { route: '/employees' });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(mockedApi.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('calls exportEmployees when Export CSV is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<EmployeeListPage />, { route: '/employees' });

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /export csv/i }));
    expect(mockedApi.exportEmployees).toHaveBeenCalled();
  });
});
