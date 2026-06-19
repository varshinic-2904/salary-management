import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from './test-utils';
import { Layout } from '@/components/Layout';

describe('Layout', () => {
  it('renders app title and nav links', () => {
    renderWithProviders(
      <Layout>
        <div>Page content</div>
      </Layout>,
      { route: '/dashboard' }
    );

    expect(screen.getByText('ACME Salary Management')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /employees/i })).toBeInTheDocument();
  });

  it('highlights active nav item based on current route', () => {
    const { unmount } = renderWithProviders(
      <Layout>
        <div>Dashboard</div>
      </Layout>,
      { route: '/dashboard' }
    );

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink.className).toContain('text-primary');

    unmount();

    renderWithProviders(
      <Layout>
        <div>Employees</div>
      </Layout>,
      { route: '/employees' }
    );

    const employeesLink = screen.getByRole('link', { name: /employees/i });
    expect(employeesLink.className).toContain('text-primary');
  });

  it('renders children in main content area', () => {
    renderWithProviders(
      <Layout>
        <p>Test page content</p>
      </Layout>,
      { route: '/dashboard' }
    );

    expect(screen.getByText('Test page content')).toBeInTheDocument();
  });
});
