import { useQuery } from "@tanstack/react-query";
import type { FlashcardsSetDTO } from "@/types";
import { FLASHCARD_SETS_QUERY_KEY } from "./useGetFlashcardSets";

export const useGetFlashcardSetById = (setId?: string) => {
  return useQuery({
    queryKey: [FLASHCARD_SETS_QUERY_KEY, setId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/flashcards-sets/${setId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch flashcard set (${response.status})`);
        }
        
        return await response.json() as FlashcardsSetDTO;
      } catch (error) {
        console.error("Error fetching flashcard set:", error);
        throw error instanceof Error ? error : new Error("Failed to fetch flashcard set");
      }
    },
    enabled: !!setId,
  });
}; 