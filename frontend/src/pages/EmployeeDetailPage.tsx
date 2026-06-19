import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, Skeleton } from '@/components/ui/Badge';
import { EmployeeForm } from './EmployeeForm';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingSalary, setEditingSalary] = useState(false);
  const [newSalary, setNewSalary] = useState('');

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.getEmployee(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (salary: number) => api.updateEmployee(id!, { baseSalary: salary }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      setEditingSalary(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteEmployee(id!),
    onSuccess: () => navigate('/employees'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!employee) return <p>Employee not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/employees">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-muted-foreground">{employee.employeeCode}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/employees/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('Delete this employee?')) deleteMutation.mutate();
            }}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{employee.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department</span>
              <span>{employee.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Job Title</span>
              <span>{employee.jobTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country</span>
              <span>{employee.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Employment</span>
              <Badge>{employee.employmentType.replace('_', ' ')}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hire Date</span>
              <span>{formatDate(employee.hireDate)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
          </CardHeader>
          <CardContent>
            {editingSalary ? (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">
                    New Base Salary ({employee.currency})
                  </label>
                  <Input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => updateMutation.mutate(Number(newSalary))}
                  disabled={updateMutation.isPending}
                >
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditingSalary(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(employee.baseSalary, employee.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">Base salary per year</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewSalary(String(employee.baseSalary));
                    setEditingSalary(true);
                  }}
                >
                  Update Salary
                </Button>
              </div>
            )}
            {updateMutation.isSuccess && (
              <p className="mt-2 text-sm text-green-600">Salary updated successfully</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.getEmployee(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof api.updateEmployee>[1]) =>
      api.updateEmployee(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      navigate(`/employees/${id}`);
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!employee) return <p>Employee not found</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Edit Employee</h2>
      <EmployeeForm
        initial={{
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
          jobTitle: employee.jobTitle,
          country: employee.country,
          currency: employee.currency,
          baseSalary: employee.baseSalary,
          employmentType: employee.employmentType,
          hireDate: employee.hireDate.split('T')[0],
        }}
        onSubmit={(data) => mutation.mutate(data)}
        onCancel={() => navigate(`/employees/${id}`)}
        isLoading={mutation.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}
