import { create, StoreApi, UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  PaginatedResponse,
  FlashcardsSetDTO,
  CreateFlashcardsSetCommand,
  UpdateFlashcardsSetCommand,
  MetaDTO
} from '@/types'; // Zakładamy, że @/types jest poprawnie skonfigurowanym aliasem
import type { FlashcardsSetFiltersViewModel } from '../types'; // Ta ścieżka jest teraz poprawna, bo jesteśmy w features/flashcard-sets/hooks/

// Założenie: Istnieje globalny klient API, np. apiClient
// import apiClient from '@/lib/apiClient';

// Przykładowa implementacja apiClient dla celów demonstracyjnych
const apiClient = {
  get: async (url: string, params?: Record<string, any>): Promise<any> => {
    console.log(`API GET: ${url}`, params);
    if (url === '/flashcards-sets') {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const total = 50;
      const data: FlashcardsSetDTO[] = Array.from({ length: Math.min(limit, total - (page - 1) * limit) > 0 ? Math.min(limit, total - (page - 1) * limit) : 0 }).map((_, i) => ({
        id: `set-${page}-${i}`,
        ownerId: 'user-123',
        name: `Zestaw ${page}-${i} (Status: ${params?.status || 'pending'}, Sort: ${params?.sortBy || 'createdAt'} ${params?.sortOrder || 'desc'})`,
        status: (params?.status as FlashcardsSetDTO['status']) || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      return { data, meta: { page, limit, total } as MetaDTO };
    }
    return Promise.reject(new Error('Not implemented'));
  },
  post: async (url: string, data: CreateFlashcardsSetCommand): Promise<FlashcardsSetDTO> => {
    console.log(`API POST: ${url}`, data);
    if (url === '/flashcards-sets') {
      return {
        id: `new-set-${Date.now()}`,
        ownerId: 'user-123',
        name: data.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as FlashcardsSetDTO;
    }
    return Promise.reject(new Error('Not implemented'));
  },
  put: async (url: string, data: UpdateFlashcardsSetCommand): Promise<FlashcardsSetDTO> => {
    console.log(`API PUT: ${url}`, data);
    const setId = url.split('/').pop();
    return {
      id: setId!,
      ownerId: 'user-123',
      name: data.name || `Zaktualizowany Zestaw ${setId}`,
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as FlashcardsSetDTO;
  },
  delete: async (url: string): Promise<void> => {
    console.log(`API DELETE: ${url}`);
    return Promise.resolve();
  },
};

interface FlashcardSetsState {
  setsData: PaginatedResponse<FlashcardsSetDTO> | null;
  isLoading: boolean;
  isMutating: boolean;
  error: Error | null;
  filters: FlashcardsSetFiltersViewModel;
  initialFiltersState: Readonly<FlashcardsSetFiltersViewModel>;
  fetchSets: (params?: FlashcardsSetFiltersViewModel) => Promise<void>;
  createSet: (command: CreateFlashcardsSetCommand) => Promise<FlashcardsSetDTO | null>;
  updateSet: (setId: string, command: UpdateFlashcardsSetCommand) => Promise<FlashcardsSetDTO | null>;
  deleteSet: (setId: string) => Promise<boolean>;
  setFilters: (newFilters: Partial<FlashcardsSetFiltersViewModel>) => void;
  resetFilters: () => void;
}

export const initialFilters: FlashcardsSetFiltersViewModel = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  status: ''
};

// Typy dla set i get w Zustand z immer
type ImmerSetState = (fn: (state: FlashcardSetsState) => void | FlashcardSetsState) => void;
type GetState = () => FlashcardSetsState;

export const useFlashcardSetsStore: UseBoundStore<StoreApi<FlashcardSetsState>> = create<FlashcardSetsState>()(
  immer((set: ImmerSetState, get: GetState) => ({
    setsData: null,
    isLoading: false,
    isMutating: false,
    error: null,
    filters: { ...initialFilters },
    initialFiltersState: Object.freeze({ ...initialFilters }),

    fetchSets: async (params?: FlashcardsSetFiltersViewModel) => {
      const currentFilters = params || get().filters;
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const response = await apiClient.get('/flashcards-sets', {
          page: currentFilters.page,
          limit: currentFilters.limit,
          sortBy: currentFilters.sortBy,
          sortOrder: currentFilters.sortOrder,
          status: currentFilters.status || undefined,
          name: currentFilters.nameSearch || undefined,
        });
        set((state) => {
          state.setsData = response as PaginatedResponse<FlashcardsSetDTO>;
          state.isLoading = false;
          state.filters = currentFilters;
        });
      } catch (error) {
        set((state) => {
          state.error = error as Error;
          state.isLoading = false;
        });
        console.error("Failed to fetch flashcard sets:", error);
      }
    },

    createSet: async (command: CreateFlashcardsSetCommand) => {
      set((state) => {
        state.isMutating = true;
        state.error = null;
      });
      try {
        const newSet = await apiClient.post('/flashcards-sets', command);
        await get().fetchSets();
        set((state) => {
          state.isMutating = false;
        });
        return newSet;
      } catch (error) {
        set((state) => {
          state.error = error as Error;
          state.isMutating = false;
        });
        console.error("Failed to create flashcard set:", error);
        return null;
      }
    },

    updateSet: async (setId: string, command: UpdateFlashcardsSetCommand) => {
      set((state) => {
        state.isMutating = true;
        state.error = null;
      });
      try {
        const updatedSet = await apiClient.put(`/flashcards-sets/${setId}`, command);
        set((state) => {
          if (state.setsData) {
            const index = state.setsData.data.findIndex(s => s.id === setId);
            if (index !== -1) {
              state.setsData.data[index] = { ...state.setsData.data[index], ...updatedSet };
            }
          }
          state.isMutating = false;
        });
        return updatedSet;
      } catch (error) {
        set((state) => {
          state.error = error as Error;
          state.isMutating = false;
        });
        console.error(`Failed to update flashcard set ${setId}:`, error);
        return null;
      }
    },

    deleteSet: async (setId: string) => {
      let fetchNeeded = false;
      let filtersToFetchWith = get().filters;
      set((state) => {
        state.isMutating = true;
        state.error = null;
      });
      try {
        await apiClient.delete(`/flashcards-sets/${setId}`);
        const currentSetsData = get().setsData;
        const currentFilters = get().filters;
        if (currentSetsData) {
            const newData = currentSetsData.data.filter(s => s.id !== setId);
            const newTotal = Math.max(0, (currentSetsData.meta?.total || 0) - 1);
            
            set((state) => {
                if (state.setsData) {
                    state.setsData.data = newData;
                    if (state.setsData.meta) {
                        state.setsData.meta.total = newTotal;
                    }
                }
            });

            if (newData.length === 0 && currentFilters.page > 1) {
                filtersToFetchWith = { ...currentFilters, page: currentFilters.page - 1 };
                fetchNeeded = true;
            } else if (newData.length === 0 && newTotal > 0) {
                fetchNeeded = true; 
            } else if (newData.length > 0 && currentSetsData.data.length !== newData.length) {
                fetchNeeded = true;
            }
        }
        set((state) => { state.isMutating = false; });

        if (fetchNeeded) {
            await get().fetchSets(filtersToFetchWith);
        }
        return true;
      } catch (error) {
        set((state) => {
          state.error = error as Error;
          state.isMutating = false;
        });
        console.error(`Failed to delete flashcard set ${setId}:`, error);
        return false;
      }
    },

    setFilters: (newFilters: Partial<FlashcardsSetFiltersViewModel>) => {
      const oldFilters = get().filters;
      const resetPage = 
          (newFilters.limit !== undefined && newFilters.limit !== oldFilters.limit) ||
          (newFilters.sortBy !== undefined && newFilters.sortBy !== oldFilters.sortBy) ||
          (newFilters.sortOrder !== undefined && newFilters.sortOrder !== oldFilters.sortOrder) ||
          (newFilters.status !== undefined && newFilters.status !== oldFilters.status) ||
          (newFilters.nameSearch !== undefined && newFilters.nameSearch !== oldFilters.nameSearch);

      const updatedFilters = {
        ...oldFilters,
        ...newFilters,
        page: resetPage && newFilters.page === undefined ? 1 : newFilters.page ?? oldFilters.page,
      };
      set((state) => {
        state.filters = updatedFilters;
      });
      get().fetchSets(updatedFilters);
    },

    resetFilters: () => {
      set((state) => {
        state.filters = { ...state.initialFiltersState }; 
      });
      get().fetchSets({ ...get().initialFiltersState });
    },
  }))
);

// Użycie w komponencie:
// const { setsData, isLoading, error, fetchSets, createSet, updateSet, deleteSet, filters, setFilters } = useFlashcardSetsStore(); 