import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';
import { formatCurrency } from '@/utils/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Badge';
import { useState } from 'react';

function KpiCard({
  title,
  value,
  subtitle,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-32" />
        ) : (
          <CardTitle className="text-2xl">{value}</CardTitle>
        )}
        {subtitle && !loading && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
    </Card>
  );
}

export function DashboardPage() {
  const [currency, setCurrency] = useState('USD');
  const [dimension, setDimension] = useState<'country' | 'department' | 'jobTitle'>('country');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics', 'summary', currency],
    queryFn: () => api.getAnalyticsSummary(currency),
  });

  const { data: byDimension, isLoading: dimensionLoading } = useQuery({
    queryKey: ['analytics', 'dimension', dimension, currency],
    queryFn: () => api.getAnalyticsByDimension(dimension, currency),
  });

  const { data: distribution, isLoading: distLoading } = useQuery({
    queryKey: ['analytics', 'distribution', currency],
    queryFn: () => api.getDistribution(currency),
  });

  const { data: filters } = useQuery({
    queryKey: ['filters'],
    queryFn: api.getFilterOptions,
  });

  const overall = summary?.overall;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compensation Insights</h2>
          <p className="text-muted-foreground">
            How ACME pays people across {summary?.totalEmployees?.toLocaleString() ?? '...'} employees
          </p>
        </div>
        <Select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-32"
        >
          {(filters?.currencies ?? ['USD']).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Headcount"
          value={summary?.totalEmployees?.toLocaleString() ?? '-'}
          loading={summaryLoading}
        />
        <KpiCard
          title={`Average Salary (${currency})`}
          value={overall ? formatCurrency(overall.avg, currency) : '-'}
          loading={summaryLoading}
        />
        <KpiCard
          title={`Median Salary (${currency})`}
          value={overall ? formatCurrency(overall.median, currency) : '-'}
          loading={summaryLoading}
        />
        <KpiCard
          title={`Salary Range (${currency})`}
          value={
            overall
              ? `${formatCurrency(overall.min, currency)} – ${formatCurrency(overall.max, currency)}`
              : '-'
          }
          loading={summaryLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Breakdown by {dimension}</CardTitle>
              <Select
                value={dimension}
                onChange={(e) =>
                  setDimension(e.target.value as 'country' | 'department' | 'jobTitle')
                }
                className="w-36"
              >
                <option value="country">Country</option>
                <option value="department">Department</option>
                <option value="jobTitle">Job Title</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {dimensionLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byDimension?.slice(0, 10) ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value), currency)}
                  />
                  <Bar dataKey="avgSalary" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Distribution</CardTitle>
            <CardDescription>Histogram of base salaries in {currency}</CardDescription>
          </CardHeader>
          <CardContent>
            {distLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={distribution?.histogram ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {distribution && (
        <Card>
          <CardHeader>
            <CardTitle>Percentile Bands ({currency})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {(['p25', 'p50', 'p75', 'p90'] as const).map((p) => (
                <div key={p} className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground uppercase">{p}</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(distribution.percentiles[p], currency)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
