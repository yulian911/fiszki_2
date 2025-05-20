import { useQuery } from "@tanstack/react-query";
import { FLASHCARD_SETS_QUERY_KEY } from "./useGetFlashcardSets";



type FlashCardsSetProps = {
  flashcardSetId: string;
};

export const useGetFlashCardsSetId = ({ flashcardSetId }: FlashCardsSetProps) => {
  // const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [FLASHCARD_SETS_QUERY_KEY, flashcardSetId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/flashcards-sets/${flashcardSetId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch flashcard set (${response.status})`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        return data;
      } catch (error) {
        console.error("Error fetching flashcard set:", error);
        throw error instanceof Error ? error : new Error("Failed to fetch flashcard set");
      }
    },
    enabled: !!flashcardSetId,
  });
  
  console.log('Query result:', query.data);
  return query;
};
