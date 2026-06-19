import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Badge';

describe('Dashboard KPI Card', () => {
  function KpiCard({
    title,
    value,
    loading,
  }: {
    title: string;
    value: string;
    loading?: boolean;
  }) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>{title}</CardDescription>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-32" data-testid="skeleton" />
          ) : (
            <CardTitle className="text-2xl">{value}</CardTitle>
          )}
        </CardHeader>
      </Card>
    );
  }

  it('renders loading skeleton state', () => {
    render(<KpiCard title="Total Headcount" value="-" loading />);
    expect(screen.getByText('Total Headcount')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders data state', () => {
    render(<KpiCard title="Average Salary" value="$85,000.00" />);
    expect(screen.getByText('Average Salary')).toBeInTheDocument();
    expect(screen.getByText('$85,000.00')).toBeInTheDocument();
  });
});
