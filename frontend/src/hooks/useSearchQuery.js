import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

/**
 * Fetches property search results from the backend API.
 * @param {import('@zillow-roi/types/src/property').SearchQuery & import('@zillow-roi/types/src/roi').ROIConfig} params
 * @param {boolean} enabled
 */
export function useSearchQuery(params, enabled = false) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      const res = await client.get('/search', { params });
      return res.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
