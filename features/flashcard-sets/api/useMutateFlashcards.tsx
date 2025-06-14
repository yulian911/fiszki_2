import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  FlashcardDTO,
  PaginatedResponse,
  CreateBulkFlashcardsCommand,
} from "@/types";
import {
  FLASHCARDS_QUERY_KEY,
  FlashcardsFilters,
} from "@/features/flashcard-sets/api/useGetFlashcards";

// Helper to build list query key used in cache invalidations
const getFlashcardsListQueryKey = (setId: string) => [
  FLASHCARDS_QUERY_KEY,
  setId,
];

export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      command: CreateFlashcardCommand
    ): Promise<FlashcardDTO> => {
      const response = await fetch(`/api/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create flashcard (${response.status})`
        );
      }

      return (await response.json()) as FlashcardDTO;
    },
    onSuccess: (data) => {
      // Optimistically update first page lists in cache
      queryClient.invalidateQueries({
        queryKey: [FLASHCARDS_QUERY_KEY, data.flashcardsSetId],
      });
    },
  });
};

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      flashcardId,
      command,
    }: {
      flashcardId: string;
      command: UpdateFlashcardCommand;
    }): Promise<FlashcardDTO> => {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update flashcard (${response.status})`
        );
      }

      return (await response.json()) as FlashcardDTO;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [FLASHCARDS_QUERY_KEY, data.flashcardsSetId],
      });
    },
  });
};

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flashcardId: string): Promise<void> => {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Use the specific error from the API response
        throw new Error(
          errorData.error || `Failed to delete flashcard (${response.status})`
        );
      }
    },
    onSuccess: (data, variables) => {
      // After successful deletion, invalidate queries to refetch the list
      queryClient.invalidateQueries({ queryKey: [FLASHCARDS_QUERY_KEY] });
    },
  });
};

export const useCreateBulkFlashcards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      command: CreateBulkFlashcardsCommand
    ): Promise<FlashcardDTO[]> => {
      const response = await fetch(`/api/flashcards/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to create flashcards in bulk (${response.status})`
        );
      }

      return (await response.json()) as FlashcardDTO[];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [FLASHCARDS_QUERY_KEY, variables.flashcardsSetId],
      });
    },
  });
};
