'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endSession as endSessionService } from '../services/SessionService';
import { EndSessionResponseDTO, SessionViewModel } from '../types'; // Session-specific types
import { toast } from 'sonner';

export const useEndSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    EndSessionResponseDTO | undefined, // Service function can return undefined for 204
    Error,
    { durationSeconds?: number } // Variables for the mutation
  >({
    mutationFn: ({ durationSeconds }) =>
      endSessionService(sessionId, durationSeconds),
    onSuccess: (data) => {
      toast.success('Session ended successfully.');
      // Update the session query data to reflect completion and end session result
      queryClient.setQueryData<SessionViewModel>(
        ['session', sessionId],
        (oldData) => {
          if (!oldData) return undefined;
          return {
            ...oldData,
            isCompleted: true,
            endSessionResult: data, // This can be undefined if API returned 204
            isLoading: false,
            isPaused: true, // Ensure timer logic respects this
          };
        }
      );
      // As per plan, optionally update state. Here we update the query cache.
      // No explicit query invalidation mentioned for endSession in the plan, direct update is fine.
      // queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to end session: ${error.message}`);
      console.error('Error ending session:', error);
    },
  });
}; 