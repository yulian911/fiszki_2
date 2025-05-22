'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluateCard as evaluateCardService } from '../services/SessionService';
import {
  EvaluateCardCommand,
  EvaluateCardResponseDTO,
  SessionCardDTO,
  SessionSummaryDTO,
} from '@/types'; // Assuming global types, adjust if some are session-specific
import { toast } from 'sonner';
import { SessionViewModel } from '../types'; // For updating query data

export const useEvaluateCard = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    EvaluateCardResponseDTO,
    Error,
    { cardId: string; command: EvaluateCardCommand }
  >({
    mutationFn: ({ cardId, command }) =>
      evaluateCardService(sessionId, cardId, command),
    onSuccess: (data, variables) => {
      // If the response contains a score, the session has ended
      if ('score' in data) {
        toast.success('Session finished!');
        // Update the session query data to reflect completion and summary
        queryClient.setQueryData<SessionViewModel>(
          ['session', sessionId],
          (oldData) => {
            if (!oldData) return undefined;
            return {
              ...oldData,
              isCompleted: true,
              summary: data as SessionSummaryDTO,
              isLoading: false,
              isPaused: true, // Pause timer on completion
            };
          }
        );
        // Potentially invalidate other queries or redirect
      } else {
        toast.info('Card evaluated, next card loaded.');
        // Update the session query data for the next card
        queryClient.setQueryData<SessionViewModel>(
          ['session', sessionId],
          (oldData) => {
            if (!oldData) return undefined;
            // The plan implies server sends next card (SessionCardDTO)
            // or summary (SessionSummaryDTO).
            // We need to update currentCardIndex and potentially the current card details
            // if the new card data is in 'data' (as SessionCardDTO).
            // The plan's useSession hook logic for evaluateMutation.onSuccess was:
            // setState(prev => ({ ...prev, currentCardIndex: prev.currentCardIndex + 1, ... }))
            // This assumes the `cards` array in SessionViewModel is static after initial load.
            // If `data` is the next card, we might want to update a `currentCard` field.
            // For now, just increment index and reset answer visibility as per plan's hook.
            return {
              ...oldData,
              currentCardIndex: oldData.currentCardIndex + 1,
              isAnswerVisible: false,
              isLoading: false,
              // If `data` (which is SessionCardDTO here) contains the next card's question/id
              // we might want to update a specific field for the current card view.
              // currentCard: data as SessionCardDTO // - this would require currentCard in SessionViewModel
            };
          }
        );
      }
      // As per React Query rules, invalidate general list after mutation
      // However, for session evaluation, we might specifically update the current session
      // query or wait for the next card data if not returned directly.
      // The plan's useSession hook handles state updates directly in onSuccess.
      // Invalidating ['session', sessionId] might cause a refetch, which could be redundant
      // if we are manually setting query data.
      // queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
    onError: (error: Error, variables) => {
      toast.error(`Failed to evaluate card: ${error.message}`);
      console.error('Error evaluating card:', error, variables);
      // Optionally, revert optimistic updates if implemented
      // queryClient.setQueryData(['session', sessionId], context?.previousSessionData);
    },
    // onMutate could be used for optimistic updates as per React Query rules
    // onMutate: async (variables) => {
    //   await queryClient.cancelQueries({ queryKey: ['session', sessionId] });
    //   const previousSessionData = queryClient.getQueryData<SessionViewModel>(['session', sessionId]);
    //   // Optimistically update... (complex for card evaluation)
    //   return { previousSessionData };
    // },
  });
}; 