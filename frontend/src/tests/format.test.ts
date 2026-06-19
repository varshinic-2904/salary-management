import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, serializeFilters, parseFilters } from '@/utils/format';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(75000, 'USD')).toBe('$75,000.00');
  });

  it('formats GBP correctly', () => {
    const result = formatCurrency(90000, 'GBP');
    expect(result).toContain('90,000');
  });

  it('formats INR without decimals', () => {
    const result = formatCurrency(600000, 'INR');
    expect(result).toContain('6,00,000');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2020-01-15T00:00:00.000Z');
    expect(result).toContain('2020');
    expect(result).toContain('Jan');
  });
});

describe('filter serialization', () => {
  it('serializes filters to query string', () => {
    const result = serializeFilters({ page: 1, country: 'US', search: '' });
    expect(result).toContain('page=1');
    expect(result).toContain('country=US');
    expect(result).not.toContain('search');
  });

  it('parses query string to filters', () => {
    const result = parseFilters('page=2&country=GB&department=Engineering');
    expect(result).toEqual({
      page: '2',
      country: 'GB',
      department: 'Engineering',
    });
  });
});
