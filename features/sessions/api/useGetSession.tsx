'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSession } from '../services/SessionService';
import { StartSessionResponseDTO } from '@/types'; // Assuming global type
import { toast } from 'sonner'; // Re-adding toast

export const useGetSession = (
  sessionId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<
    StartSessionResponseDTO,
    Error, // React Query expects Error type here
    StartSessionResponseDTO,
    readonly [string, string]
  >({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      try {
        // Service function fetchSession already handles try/catch and throws an error
        // We rely on that error to be caught by React Query and put into the 'error' state.
        // However, the service function throws a generic error.
        // If we want to use toast here specifically for UI feedback on fetch error,
        // we need to catch it here before React Query does.
        const data = await fetchSession(sessionId);
        return data;
      } catch (error) {
        // Log the error for debugging
        console.error('Error fetching session in queryFn:', error);

        // Show toast notification
        let errorMessage = 'Failed to load session.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);

        // Re-throw the error so React Query can set the error state
        throw error; 
      }
    },
    enabled: options?.enabled ?? !!sessionId, // Fetch only if sessionId is present
    staleTime: 1000 * 60 * 5, // 5 minutes, as per React Query rules
    placeholderData: keepPreviousData, // Use placeholderData with keepPreviousData utility
    refetchOnWindowFocus: false, // As per React Query rules
    retry: 1, // As per React Query rules
  });
}; 