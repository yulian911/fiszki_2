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
    onSuccess: async (data) => {
      // Aktualizuj dane w cache dla tego konkretnego zestawu
      queryClient.setQueryData([FLASHCARD_SETS_QUERY_KEY, data.id], data);
      
      // Próba aktualizacji list zestawów w cache
      try {
        // Pobierz wszystkie zapytania o listy zestawów
        const queries = queryClient.getQueriesData({ 
          queryKey: [FLASHCARD_SETS_QUERY_KEY]
        });
        
        // Aktualizuj wszystkie listy zawierające ten zestaw
        for (const [queryKey, queryData] of queries) {
          if (Array.isArray(queryKey) && queryKey.length > 1 && typeof queryKey[1] === 'object') {
            const currentData = queryData as PaginatedResponse<FlashcardsSetDTO> | undefined;
            
            if (currentData && currentData.data) {
              // Znajdź zestaw i zaktualizuj go
              const updatedData = {
                ...currentData,
                data: currentData.data.map(set => 
                  set.id === data.id ? data : set
                )
              };
              
              // Aktualizuj cache
              queryClient.setQueryData(queryKey, updatedData);
            }
          }
        }
      } catch (error) {
        console.error("Błąd podczas aktualizacji cache list zestawów:", error);
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
    onError: (error, __, context: any) => {
      console.error('Error in delete mutation:', error);
      
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
    onSuccess: (_, setId) => {
      console.log('Delete successful for setId:', setId);
      
      try {
        // Usuń wszystkie zapytania dotyczące konkretnego zestawu
        queryClient.removeQueries({ 
          queryKey: [FLASHCARD_SETS_QUERY_KEY, setId], 
          exact: false 
        });
        
        // Usuń konkretny zestaw z wszystkich list
        const allQueryKeys = queryClient.getQueriesData({ queryKey: [FLASHCARD_SETS_QUERY_KEY] });
        console.log(`Updating ${allQueryKeys.length} query caches to remove item`);
        
        for (const [queryKey, queryData] of allQueryKeys) {
          if (!queryData) continue;
          
          try {
            queryClient.setQueryData(queryKey, (oldData: PaginatedResponse<FlashcardsSetDTO> | undefined) => {
              if (!oldData) return oldData;
              
              return {
                ...oldData,
                data: oldData.data.filter(set => set.id !== setId),
                meta: {
                  ...oldData.meta,
                  total: Math.max(0, oldData.meta.total - 1)
                }
              };
            });
          } catch (updateError) {
            console.error(`Error updating query cache for key ${JSON.stringify(queryKey)}:`, updateError);
          }
        }
        
        // Wymuś ponowne pobranie danych po usunięciu
        queryClient.refetchQueries({ queryKey: [FLASHCARD_SETS_QUERY_KEY], exact: false });
      } catch (cacheError) {
        console.error('Error during cache update in onSuccess:', cacheError);
      }
    },
    
    // Po zakończeniu (success/error) odśwież dane
    onSettled: (_, error, variables, context: any) => {
      const setId = context?.setId;
      console.log('Settled delete operation for setId:', setId, 'Error:', !!error);
      
      if (error) {
        console.error('Error details:', error);
      }
      
      // Wymuszenie odświeżenia danych z serwera
      setTimeout(() => {
        console.log('Performing delayed refetch after settle');
        queryClient.invalidateQueries({ 
          queryKey: [FLASHCARD_SETS_QUERY_KEY],
          exact: false
        });
        
        queryClient.refetchQueries({
          queryKey: [FLASHCARD_SETS_QUERY_KEY],
          exact: false,
          type: 'all'
        });
      }, 1000);
    },
  });
}; 