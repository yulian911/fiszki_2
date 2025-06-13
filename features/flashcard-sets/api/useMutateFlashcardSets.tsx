import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  CreateFlashcardsSetCommand, 
  UpdateFlashcardsSetCommand, 
  FlashcardsSetDTO,
  PaginatedResponse
} from '@/types';
import { FLASHCARD_SETS_QUERY_KEY, getFlashcardSetsQueryKey } from './useGetFlashcardSets';
import { toast } from "sonner";

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
    onSuccess: (data) => {
      toast.success(`Zestaw "${data.name}" został utworzony.`);
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error("Błąd zapisu", {
          description: "Zestaw o tej nazwie już istnieje. Wybierz inną nazwę.",
        });
      } else {
        toast.error("Wystąpił błąd", {
          description: error.message || "Nie udało się utworzyć zestawu.",
        });
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
      toast.success(`Zestaw "${data.name}" został zaktualizowany.`);
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY, data.id] });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error("Błąd zapisu", {
          description: "Zestaw o tej nazwie już istnieje. Wybierz inną nazwę.",
        });
      } else {
        toast.error("Wystąpił błąd", {
          description: error.message || "Nie udało się zaktualizować zestawu.",
        });
      }
    },
  });
};

export const useDeleteFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (setId: string): Promise<void> => {
      console.log(`Attempting to delete set with ID: ${setId}`);
      
      try {
        const response = await fetch(`/api/flashcards-sets/${setId}`, {
          method: 'DELETE',
        });
        
        console.log('Delete response status:', response.status);
        console.log('Delete response headers:', Object.fromEntries(Array.from(response.headers)));
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response data:', errorData);
          const error = new Error(errorData.message || errorData.error || `Failed to delete flashcard set (${response.status})`);
          (error as any).status = response.status;
          throw error;
        }
        
        // Dodatkowe opóźnienie aby upewnić się, że serwer zakończył operację
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Natychmiast po usunięciu wyczyść cache, aby wymóc ponowne pobranie danych
        queryClient.resetQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY], exact: false });
      } catch (error) {
        console.error('Error in delete fetch:', error);
        throw error;
      }
    },
    
    // Wykonaj optimistic update przed faktycznym API call
    onMutate: async (setId) => {
      console.log('Starting optimistic delete for setId:', setId);
      
      // Zatrzymaj wszystkie zapytania, aby nie nadpisały optimistic update
      await queryClient.cancelQueries();
      
      // Zapisz poprzedni stan, aby móc przywrócić w przypadku błędu
      const previousQueries = queryClient.getQueriesData({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
      
      console.log('Previous queries to restore in case of error:', previousQueries.length);
      
      try {
        // Wykonaj optimistic update dla wszystkich powiązanych zapytań
        queryClient.setQueriesData(
          { queryKey: [FLASHCARD_SETS_QUERY_KEY] },
          (oldData: PaginatedResponse<FlashcardsSetDTO> | undefined) => {
            if (!oldData) {
              console.log('No data to update for optimistic delete');
              return oldData;
            }
            
            const newData = {
              ...oldData,
              data: oldData.data.filter(set => set.id !== setId),
              meta: {
                ...oldData.meta,
                total: Math.max(0, oldData.meta.total - 1)
              }
            };
            
            console.log('Optimistic update - removed set:', setId);
            console.log('Original data count:', oldData.data.length);
            console.log('Updated data count:', newData.data.length);
            
            return newData;
          }
        );
      } catch (error) {
        console.error('Error during optimistic update:', error);
      }
      
      // Zwróć poprzedni stan, aby móc przywrócić w przypadku błędu
      return { previousQueries, setId };
    },
    
    // W przypadku błędu przywróć poprzedni stan
    onError: (error: any, setId: string, context: any) => {
      toast.error("Wystąpił błąd", {
        description: `Nie udało się usunąć zestawu. ${error.message}`,
      });
      if (context?.previousQueries) {
        console.log('Restoring previous state due to error');
        try {
          for (const [queryKey, queryData] of context.previousQueries) {
            queryClient.setQueryData(queryKey, queryData);
          }
        } catch (restoreError) {
          console.error('Error restoring previous state:', restoreError);
        }
      }
    },
    
    // Po udanym wykonaniu
    onSuccess: () => {
      toast.success("Zestaw został pomyślnie usunięty.");
      queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
    },
    
    // Po zakończeniu (success/error) odśwież dane
    onSettled: () => {
       queryClient.invalidateQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
    }
  });
}; 