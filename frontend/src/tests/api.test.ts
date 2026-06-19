import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '@/lib/api';
import { mockEmployee } from './fixtures';

describe('api', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('getEmployees builds correct query string', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 25, totalPages: 0 }),
    });

    await api.getEmployees({ page: 2, country: 'US', search: 'jane' });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('page=2');
    expect(url).toContain('country=US');
    expect(url).toContain('search=jane');
  });

  it('parses successful JSON response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockEmployee),
    });

    const result = await api.getEmployee('emp-1');
    expect(result).toEqual(mockEmployee);
  });

  it('throws with server error message on non-OK response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error: 'Invalid employee data' }),
    });

    await expect(api.getEmployee('bad-id')).rejects.toThrow('Invalid employee data');
  });

  it('deleteEmployee handles 204 No Content', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      json: () => Promise.reject(new Error('No body')),
    });

    await expect(api.deleteEmployee('emp-1')).resolves.toBeUndefined();
  });
});
