import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  CreateFlashcardsSetCommand, 
  UpdateFlashcardsSetCommand, 
  FlashcardsSetDTO,
  PaginatedResponse
} from '@/types';
import { FLASHCARD_SETS_QUERY_KEY, getFlashcardSetsQueryKey } from './useGetFlashcardSets';

export const useCreateFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (command: CreateFlashcardsSetCommand): Promise<FlashcardsSetDTO> => {
      const response = await fetch(`/api/flashcards-sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || errorData.error || `Failed to create flashcard set (${response.status})`);
        (error as any).status = response.status;
        throw error;
      }
      
      return await response.json();
    },
    onSuccess: async (data) => {
      // Najpierw próbujemy zaktualizować cache bezpośrednio
      try {
        // Pobierz aktualny stan dla pierwszej strony
        const queryKey = getFlashcardSetsQueryKey({ page: 1, limit: 10 });
        const currentData = queryClient.getQueryData<PaginatedResponse<FlashcardsSetDTO>>(queryKey);
        
        if (currentData) {
          // Aktualizuj cache bezpośrednio
          queryClient.setQueryData<PaginatedResponse<FlashcardsSetDTO>>(
            queryKey, 
            {
              ...currentData,
              data: [data, ...currentData.data].slice(0, currentData.meta.limit),
              meta: {
                ...currentData.meta,
                total: currentData.meta.total + 1
              }
            }
          );
        }
      } catch (error) {
        console.error("Błąd podczas aktualizacji cache:", error);
      }
      
      // Następnie wymuszamy pełne odświeżenie wszystkich zapytań o zestawy
      await queryClient.invalidateQueries({ 
        queryKey: [FLASHCARD_SETS_QUERY_KEY],
        refetchType: 'all'
      });
      
      // Wymuś natychmiastowe odświeżenie
      const queries = queryClient.getQueriesData({ 
        queryKey: [FLASHCARD_SETS_QUERY_KEY]
      });
      
      for (const [queryKey] of queries) {
        await queryClient.refetchQueries({ queryKey, exact: true });
      }
    },
  });
};

export const useUpdateFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      setId, 
      command 
    }: { 
      setId: string; 
      command: UpdateFlashcardsSetCommand;
    }): Promise<FlashcardsSetDTO> => {
      const response = await fetch(`/api/flashcards-sets/${setId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || errorData.error || `Failed to update flashcard set (${response.status})`);
        (error as any).status = response.status;
        throw error;
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Aktualizuj dane w cache dla tego konkretnego zestawu
      queryClient.setQueryData([FLASHCARD_SETS_QUERY_KEY, data.id], data);
      
      // Unieważnij wszystkie zapytania związane z listami zestawów
      queryClient.invalidateQueries({ 
        queryKey: [FLASHCARD_SETS_QUERY_KEY],
        predicate: (query) => query.queryKey.length > 1 && typeof query.queryKey[1] === 'object'
      });
    },
  });
};

export const useDeleteFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (setId: string): Promise<void> => {
      const response = await fetch(`/api/flashcards-sets/${setId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || errorData.error || `Failed to delete flashcard set (${response.status})`);
        (error as any).status = response.status;
        throw error;
      }
    },
    onSuccess: (_, setId) => {
      // Unieważnij wszystkie zapytania związane z zestawami fiszek
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
      
      // Usuń konkretny zestaw z cache
      queryClient.removeQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY, setId] });
    },
  });
}; 