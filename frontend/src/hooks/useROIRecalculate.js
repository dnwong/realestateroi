import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

export function useROIRecalculate(searchParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ properties, roiConfig }) => {
      const res = await client.post('/roi/calculate', { properties, roiConfig });
      return res.data.data;
    },
    onSuccess: (updatedResults) => {
      // Update the search cache with recalculated scores
      queryClient.setQueryData(['search', searchParams], (old) => {
        if (!old) return old;
        return { ...old, data: updatedResults };
      });
    },
  });
}
