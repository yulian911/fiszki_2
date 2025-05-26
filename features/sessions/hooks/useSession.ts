'use client';

import { useState, useEffect, useCallback } from 'react';
// Direct imports for API hooks
import { useGetSession } from '../api/useGetSession';
import { useEvaluateCard } from '../api/useEvaluateCard';
import { useEndSession } from '../api/useEndSession';
import {
  SessionViewModel,
  SessionContextCardDTO,
  SessionSummaryDTO,
  EndSessionResponseDTO,
  SessionContextCardRating,
} from '../types';
import { toast } from 'sonner';
import { EvaluateCardResponseDTO, StartSessionResponseDTO, SessionCardDTO as GlobalSessionCardDTO } from '@/types'; // For explicit typing of mutation data

export const useSession = (sessionId: string) => {
  const [viewModel, setViewModel] = useState<SessionViewModel>(() => ({
    sessionId,
    cards: [],
    currentCardIndex: 0,
    isAnswerVisible: false,
    isLoading: true,
    isCompleted: false,
    startTime: new Date(), // Set initial start time
    sessionDuration: 0,
    isPaused: false,
    currentAnswer: undefined, // From plan
    summary: undefined, // From plan
    endSessionResult: undefined, // From plan
    // Add session metadata
    flashcardsSetId: '',
    tags: [],
    sessionCreatedAt: '',
  }));

  // API Hooks
  const getSessionQuery = useGetSession(sessionId, {
    enabled: !!sessionId && !viewModel.isCompleted, // Fetch only if sessionId is valid and session not completed
  });
  const evaluateCardMutation = useEvaluateCard(sessionId);
  const endSessionMutation = useEndSession(sessionId);

  // Effect to update viewModel when session data is fetched
  useEffect(() => {
    if (getSessionQuery.data) {
      setViewModel((prev) => ({
        ...prev,
        cards: getSessionQuery.data.cards, // Direct assignment since types are now the same
        isLoading: false,
        // Only set startTime if it's not already set (first time loading)
        startTime: prev.cards.length === 0 ? new Date() : prev.startTime,
        // Only reset duration if we're loading cards for the first time
        sessionDuration: prev.cards.length === 0 ? 0 : prev.sessionDuration,
        // Set session metadata
        flashcardsSetId: getSessionQuery.data.flashcardsSetId || '',
        tags: getSessionQuery.data.tags || [],
        sessionCreatedAt: getSessionQuery.data.createdAt || '',
      }));
    }
    if (getSessionQuery.isLoading) {
      setViewModel((prev) => ({ ...prev, isLoading: true }));
    }
    // No explicit toast here for error, as useGetSession handles it in queryFn
  }, [getSessionQuery.data, getSessionQuery.isLoading, getSessionQuery.error]);

  // Effect for session timer
  useEffect(() => {
    if (viewModel.isCompleted || viewModel.isPaused || !viewModel.startTime) return;

    const intervalId = setInterval(() => {
      setViewModel((prev) => ({
        ...prev,
        sessionDuration: prev.startTime
          ? Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
          : 0,
      }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [viewModel.isCompleted, viewModel.isPaused, viewModel.startTime]);

  const showAnswer = useCallback(() => {
    const currentCard = viewModel.cards[viewModel.currentCardIndex]; // This is SessionContextCardDTO
    if (currentCard) {
        setViewModel(prev => ({ 
            ...prev, 
            isAnswerVisible: true, 
            currentAnswer: currentCard.answer // Now answer is available in the card
        }));
    } else {
        toast.error("No current card to show answer for.");
    }
  }, [viewModel.cards, viewModel.currentCardIndex]);

  const rateCard = useCallback((rating: SessionContextCardRating) => { // Use SessionContextCardRating
    const currentCard = viewModel.cards[viewModel.currentCardIndex];
    if (!currentCard) {
      toast.error('No card to rate.');
      return;
    }
    if (!viewModel.isAnswerVisible) {
        toast.info('Please show the answer before rating.');
        return;
    }

    setViewModel((prev) => ({ ...prev, isLoading: true }));
    // The command for evaluateCard expects `rating: CardRating` (the global one if not specified otherwise in command type)
    // Global `EvaluateCardCommand` uses global `CardRating`. This is a point of potential friction.
    // For now, we assume the API endpoint for evaluate is flexible or `SessionContextCardRating` values are compatible.
    // If not, a mapping or API adjustment is needed.
    evaluateCardMutation.mutate(
      { cardId: currentCard.id, command: { rating: rating as any } }, // Cast rating if EvaluateCardCommand expects global CardRating
      {
        onSuccess: (data: EvaluateCardResponseDTO) => {
          setViewModel((prev) => ({ ...prev, isLoading: false, isAnswerVisible: false, currentAnswer: undefined }));
          if ('score' in data) {
            setViewModel((prev) => ({
              ...prev,
              isCompleted: true,
              summary: data,
              isPaused: true,
            }));
            toast.success('Session completed!');
          } else { 
            const nextCardIndex = viewModel.currentCardIndex + 1;
            // The `data` here is the next card, but it's GlobalSessionCardDTO.
            // We don't directly put it into `cards` array as `cards` are already SessionContextCardDTO.
            // The flow assumes `cards` array is complete from the start.
            // If API returns next card details, we might update a `currentViewingCard` separate state if needed.
            // For now, just advance index.
            setViewModel((prev) => ({
              ...prev,
              currentCardIndex: nextCardIndex,
            }));
            if (nextCardIndex >= viewModel.cards.length) {
                 setViewModel(prev => ({...prev, isCompleted: true, isPaused: true}));
                 toast.info("All cards reviewed! Session ending.");
            }
          }
        },
        onError: (error: Error) => {
          setViewModel((prev) => ({ ...prev, isLoading: false }));
          toast.error(`Failed to evaluate card: ${error.message}`);
        },
      }
    );
  }, [viewModel.cards, viewModel.currentCardIndex, viewModel.isAnswerVisible, evaluateCardMutation]);

  const endCurrentSession = useCallback((calledFromSummary: boolean = false) => {
    if (!calledFromSummary && viewModel.isCompleted && viewModel.endSessionResult) {
      // If already completed and has result, and not forced from summary, don't re-trigger
       toast.info("Session is already completed.");
       return;
    }
    setViewModel((prev) => ({ ...prev, isLoading: true }));
    endSessionMutation.mutate(
      { durationSeconds: viewModel.sessionDuration }, 
      {
        onSuccess: (data: EndSessionResponseDTO | undefined) => { // Explicitly type data
          setViewModel((prev) => ({
            ...prev,
            isLoading: false,
            isCompleted: true,
            isPaused: true,
            endSessionResult: data,
          }));
          toast.success('Session ended.');
        },
        onError: (error: Error) => { // Explicitly type error
          setViewModel((prev) => ({ ...prev, isLoading: false }));
          toast.error(`Failed to end session: ${error.message}`);
        },
      }
    );
  }, [endSessionMutation, viewModel.sessionDuration, viewModel.isCompleted, viewModel.endSessionResult]);

  const toggleTimer = useCallback(() => {
    setViewModel((prev) => ({ ...prev, isPaused: !prev.isPaused }));
    toast.info(viewModel.isPaused ? 'Timer resumed.' : 'Timer paused.');
  }, [viewModel.isPaused]);
  
  // Derived state for easier consumption by components
  const currentCardData = viewModel.cards[viewModel.currentCardIndex]; // This is now SessionContextCardDTO | undefined
  const totalCards = viewModel.cards.length;
  const isLoadingOverall = viewModel.isLoading || getSessionQuery.isLoading || evaluateCardMutation.isPending || endSessionMutation.isPending;
  const mutationError = evaluateCardMutation.error || endSessionMutation.error;

  return {
    ...viewModel,
    currentCardData,
    totalCards,
    isLoading: isLoadingOverall, // Consolidated loading state
    error: getSessionQuery.error || mutationError,
    showAnswer,
    rateCard,
    endCurrentSession,
    toggleTimer,
    // Expose refetch if needed, e.g. for a retry button on initial load fail
    // refetchSession: getSessionQuery.refetch, 
  };
}; 