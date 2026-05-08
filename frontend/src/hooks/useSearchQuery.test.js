import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSearchQuery } from './useSearchQuery';

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

import client from '../api/client';

function wrapper({ children }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useSearchQuery', () => {
  it('does not fetch when disabled', () => {
    const { result } = renderHook(() => useSearchQuery({ query: '78701', type: 'zip' }, false), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(client.get).not.toHaveBeenCalled();
  });

  it('fetches when enabled', async () => {
    client.get.mockResolvedValue({ data: { success: true, data: [], total: 0, usingFallback: false } });
    const { result } = renderHook(() => useSearchQuery({ query: '78701', type: 'zip' }, true), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.get).toHaveBeenCalledWith('/search', expect.any(Object));
  });
});
