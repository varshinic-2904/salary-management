import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, Skeleton } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export function EmployeeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 25);
  const country = searchParams.get('country') || '';
  const department = searchParams.get('department') || '';
  const jobTitle = searchParams.get('jobTitle') || '';
  const sortBy = searchParams.get('sortBy') || 'lastName';
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) params.set('search', search);
      else params.delete('search');
      params.set('page', '1');
      setSearchParams(params);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', { page, limit, search: searchParams.get('search'), country, department, jobTitle, sortBy, sortOrder }],
    queryFn: () =>
      api.getEmployees({
        page,
        limit,
        search: searchParams.get('search') || undefined,
        country: country || undefined,
        department: department || undefined,
        jobTitle: jobTitle || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const { data: filters } = useQuery({
    queryKey: ['filters'],
    queryFn: api.getFilterOptions,
  });

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  }

  const activeFilters = [country, department, jobTitle].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Directory</h2>
          <p className="text-muted-foreground">
            {data?.total?.toLocaleString() ?? '...'} employees
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              api.exportEmployees({
                search: searchParams.get('search') || undefined,
                country: country || undefined,
                department: department || undefined,
                jobTitle: jobTitle || undefined,
              })
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link to="/employees/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={country}
              onChange={(e) => updateFilter('country', e.target.value)}
              className="w-36"
            >
              <option value="">All Countries</option>
              {filters?.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select
              value={department}
              onChange={(e) => updateFilter('department', e.target.value)}
              className="w-40"
            >
              <option value="">All Departments</option>
              {filters?.departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Select
              value={jobTitle}
              onChange={(e) => updateFilter('jobTitle', e.target.value)}
              className="w-48"
            >
              <option value="">All Job Titles</option>
              {filters?.jobTitles.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </Select>
            <Select
              value={String(limit)}
              onChange={(e) => updateFilter('limit', e.target.value)}
              className="w-28"
            >
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </Select>
          </div>
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {country && <Badge>Country: {country}</Badge>}
              {department && <Badge>Dept: {department}</Badge>}
              {jobTitle && <Badge>Title: {jobTitle}</Badge>}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Code</th>
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Department</th>
                  <th className="pb-3 pr-4 font-medium">Job Title</th>
                  <th className="pb-3 pr-4 font-medium">Country</th>
                  <th className="pb-3 pr-4 font-medium">Salary</th>
                  <th className="pb-3 font-medium">Hired</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="py-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : data?.data.map((emp) => (
                      <tr
                        key={emp.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="py-3 pr-4">
                          <Link
                            to={`/employees/${emp.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {emp.employeeCode}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="py-3 pr-4">{emp.department}</td>
                        <td className="py-3 pr-4">{emp.jobTitle}</td>
                        <td className="py-3 pr-4">{emp.country}</td>
                        <td className="py-3 pr-4 font-medium">
                          {formatCurrency(emp.baseSalary, emp.currency)}
                        </td>
                        <td className="py-3">{formatDate(emp.hireDate)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
