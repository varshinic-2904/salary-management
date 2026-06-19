import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRoute, screen, waitFor, userEvent } from './test-utils';
import { EmployeeDetailPage, EmployeeEditPage } from '@/pages/EmployeeDetailPage';
import { api } from '@/lib/api';
import { mockEmployee } from './fixtures';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/lib/api', () => ({
  api: {
    getEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('EmployeeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.getEmployee.mockResolvedValue(mockEmployee);
    mockedApi.updateEmployee.mockResolvedValue({ ...mockEmployee, baseSalary: 130000 });
    mockedApi.deleteEmployee.mockResolvedValue(undefined);
  });

  it('shows loading skeletons while fetching', () => {
    mockedApi.getEmployee.mockReturnValue(new Promise(() => {}));
    renderWithRoute('/employees/:id', <EmployeeDetailPage />, {
      route: '/employees/emp-1',
    });

    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders profile and compensation for loaded employee', async () => {
    renderWithRoute('/employees/:id', <EmployeeDetailPage />, {
      route: '/employees/emp-1',
    });

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('EMP001')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@acme.com')).toBeInTheDocument();
    expect(screen.getByText('$120,000.00')).toBeInTheDocument();
  });

  it('shows not found when employee is missing', async () => {
    mockedApi.getEmployee.mockResolvedValue(undefined as unknown as typeof mockEmployee);
    renderWithRoute('/employees/:id', <EmployeeDetailPage />, {
      route: '/employees/missing',
    });

    await waitFor(() => {
      expect(screen.getByText('Employee not found')).toBeInTheDocument();
    });
  });

  it('updates salary via inline edit', async () => {
    const user = userEvent.setup();
    renderWithRoute('/employees/:id', <EmployeeDetailPage />, {
      route: '/employees/emp-1',
    });

    await waitFor(() => {
      expect(screen.getByText('$120,000.00')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /update salary/i }));
    const salaryInput = screen.getByRole('spinbutton');
    await user.clear(salaryInput);
    await user.type(salaryInput, '130000');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockedApi.updateEmployee).toHaveBeenCalledWith('emp-1', { baseSalary: 130000 });
    });
  });

  it('deletes employee after confirm', async () => {
    const user = userEvent.setup();
    renderWithRoute('/employees/:id', <EmployeeDetailPage />, {
      route: '/employees/emp-1',
    });

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockedApi.deleteEmployee).toHaveBeenCalledWith('emp-1');
      expect(mockNavigate).toHaveBeenCalledWith('/employees');
    });
  });
});

describe('EmployeeEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.getEmployee.mockResolvedValue(mockEmployee);
  });

  it('navigates to employee detail when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithRoute('/employees/:id/edit', <EmployeeEditPage />, {
      route: '/employees/emp-1/edit',
    });

    await waitFor(() => {
      expect(screen.getByText('Edit Employee')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/employees/emp-1');
  });
});
