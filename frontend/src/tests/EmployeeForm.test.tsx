import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, userEvent } from './test-utils';
import { EmployeeForm } from '@/pages/EmployeeForm';

function fieldContainer(label: string) {
  return screen.getByText(label).closest('div')!;
}

describe('EmployeeForm', () => {
  it('renders all required fields with defaults', () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} />);

    expect(within(fieldContainer('First Name')).getByRole('textbox')).toHaveValue('');
    expect(within(fieldContainer('Last Name')).getByRole('textbox')).toHaveValue('');
    expect(within(fieldContainer('Email')).getByRole('textbox')).toHaveValue('');
    expect(within(fieldContainer('Department')).getByRole('combobox')).toHaveValue('Engineering');
    expect(within(fieldContainer('Country')).getByRole('combobox')).toHaveValue('US');
    expect(within(fieldContainer('Currency')).getByRole('textbox')).toHaveValue('USD');
    expect(within(fieldContainer('Employment Type')).getByRole('combobox')).toHaveValue('FULL_TIME');
  });

  it('auto-updates currency when country changes', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} />);

    await user.selectOptions(within(fieldContainer('Country')).getByRole('combobox'), 'GB');
    expect(within(fieldContainer('Currency')).getByRole('textbox')).toHaveValue('GBP');
  });

  it('calls onSubmit with form data on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} submitLabel="Create Employee" />);

    await user.type(within(fieldContainer('First Name')).getByRole('textbox'), 'Jane');
    await user.type(within(fieldContainer('Last Name')).getByRole('textbox'), 'Doe');
    await user.type(within(fieldContainer('Email')).getByRole('textbox'), 'jane@acme.com');
    await user.type(within(fieldContainer('Job Title')).getByRole('textbox'), 'Engineer');
    await user.clear(within(fieldContainer('Base Salary')).getByRole('spinbutton'));
    await user.type(within(fieldContainer('Base Salary')).getByRole('spinbutton'), '120000');
    await user.click(screen.getByRole('button', { name: /create employee/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@acme.com',
        jobTitle: 'Engineer',
        baseSalary: 120000,
        country: 'US',
        currency: 'USD',
      })
    );
  });

  it('shows loading state when isLoading is true', () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} isLoading submitLabel="Save Changes" />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('does not show Cancel when onCancel is omitted', () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} />);

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('shows Cancel and calls onCancel when clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
