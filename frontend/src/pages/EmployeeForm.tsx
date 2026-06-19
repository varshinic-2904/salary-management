import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CreateEmployeeInput } from '@/types';
import { COUNTRY_CURRENCY, DEPARTMENTS, EMPLOYMENT_TYPES } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface EmployeeFormProps {
  initial?: Partial<CreateEmployeeInput>;
  onSubmit: (data: CreateEmployeeInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const emptyForm: CreateEmployeeInput = {
  firstName: '',
  lastName: '',
  email: '',
  department: 'Engineering',
  jobTitle: '',
  country: 'US',
  currency: 'USD',
  baseSalary: 0,
  employmentType: 'FULL_TIME',
  hireDate: new Date().toISOString().split('T')[0],
};

export function EmployeeForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = 'Save',
}: EmployeeFormProps) {
  const [form, setForm] = useState<CreateEmployeeInput>({
    ...emptyForm,
    ...initial,
  });

  function handleChange(field: keyof CreateEmployeeInput, value: string | number) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'country' && typeof value === 'string') {
        updated.currency = COUNTRY_CURRENCY[value] || prev.currency;
      }
      return updated;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">First Name</label>
            <Input
              required
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Last Name</label>
            <Input
              required
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Department</label>
            <Select
              value={form.department}
              onChange={(e) => handleChange('department', e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Job Title</label>
            <Input
              required
              value={form.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Country</label>
            <Select
              value={form.country}
              onChange={(e) => handleChange('country', e.target.value)}
            >
              {Object.keys(COUNTRY_CURRENCY).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Currency</label>
            <Input value={form.currency} readOnly />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Base Salary</label>
            <Input
              required
              type="number"
              min={0}
              step={0.01}
              value={form.baseSalary || ''}
              onChange={(e) => handleChange('baseSalary', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Employment Type</label>
            <Select
              value={form.employmentType}
              onChange={(e) => handleChange('employmentType', e.target.value)}
            >
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hire Date</label>
            <Input
              required
              type="date"
              value={form.hireDate}
              onChange={(e) => handleChange('hireDate', e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: api.createEmployee,
    onSuccess: (data) => navigate(`/employees/${data.id}`),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Add Employee</h2>
      <EmployeeForm
        onSubmit={(data) => mutation.mutate(data)}
        onCancel={() => navigate('/employees')}
        isLoading={mutation.isPending}
        submitLabel="Create Employee"
      />
      {mutation.isError && (
        <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
      )}
    </div>
  );
}
