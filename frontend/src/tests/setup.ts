import '@testing-library/jest-dom';
import { createElement } from 'react';
import { vi } from 'vitest';

vi.stubGlobal('confirm', vi.fn(() => true));
vi.stubGlobal('open', vi.fn());

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  BarChart: ({ children }: { children: React.ReactNode }) =>
    createElement('div', { 'data-testid': 'bar-chart' }, children),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));
