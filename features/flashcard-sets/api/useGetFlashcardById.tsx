import { useQuery } from "@tanstack/react-query";
import type { FlashcardDTO } from "@/types";
import { FLASHCARDS_QUERY_KEY } from "@/features/flashcard-sets/api/useGetFlashcards";

export const useGetFlashcardById = (flashcardId?: string) => {
  return useQuery<FlashcardDTO>({
    queryKey: [FLASHCARDS_QUERY_KEY, flashcardId],
    enabled: !!flashcardId,
    queryFn: async () => {
      const response = await fetch(`/api/flashcards/${flashcardId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch flashcard (${response.status})`);
      }
      return (await response.json()) as FlashcardDTO;
    },
  });
}; 