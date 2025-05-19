import { create, StoreApi, UseBoundStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  PaginatedResponse,
  FlashcardsSetDTO,
  CreateFlashcardsSetCommand,
  UpdateFlashcardsSetCommand,
  MetaDTO,
} from "@/types"; // Zakładamy, że @/types jest poprawnie skonfigurowanym aliasem
import type { FlashcardsSetFiltersViewModel } from "../types"; // Ta ścieżka jest teraz poprawna, bo jesteśmy w features/flashcard-sets/hooks/

// Założenie: Istnieje globalny klient API, np. apiClient
// import apiClient from '@/lib/apiClient';

// Implementacja klienta API korzystającego z Next.js API
const apiClient = {
  get: async (url: string, params?: Record<string, any>): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(`/api${url}?${queryParams.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.details ||
          error.error ||
          "Wystąpił błąd podczas pobierania danych"
      );
    }
    return response.json();
  },

  post: async (
    url: string,
    data: CreateFlashcardsSetCommand
  ): Promise<FlashcardsSetDTO> => {
    const response = await fetch(`/api${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.details ||
          error.error ||
          "Wystąpił błąd podczas tworzenia zestawu"
      );
    }
    return response.json();
  },

  put: async (
    url: string,
    data: UpdateFlashcardsSetCommand
  ): Promise<FlashcardsSetDTO> => {
    const response = await fetch(`/api${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.details ||
          error.error ||
          "Wystąpił błąd podczas aktualizacji zestawu"
      );
    }
    return response.json();
  },

  delete: async (url: string): Promise<void> => {
    const response = await fetch(`/api${url}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.details || error.error || "Wystąpił błąd podczas usuwania zestawu"
      );
    }
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
  createSet: (
    command: CreateFlashcardsSetCommand
  ) => Promise<FlashcardsSetDTO | null>;
  updateSet: (
    setId: string,
    command: UpdateFlashcardsSetCommand
  ) => Promise<FlashcardsSetDTO | null>;
  deleteSet: (setId: string) => Promise<boolean>;
  setFilters: (newFilters: Partial<FlashcardsSetFiltersViewModel>) => void;
  resetFilters: () => void;
  resetError: () => void;
  resetState: () => void;
}

export const initialFilters: FlashcardsSetFiltersViewModel = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
  status: "",
};

// Typy dla set i get w Zustand z immer
type ImmerSetState = (
  fn: (state: FlashcardSetsState) => void | FlashcardSetsState
) => void;
type GetState = () => FlashcardSetsState;

export const useFlashcardSetsStore: UseBoundStore<
  StoreApi<FlashcardSetsState>
> = create<FlashcardSetsState>()(
  immer((set: ImmerSetState, get: GetState) => ({
    setsData: null,
    isLoading: false,
    isMutating: false,
    error: null,
    filters: { ...initialFilters },
    initialFiltersState: Object.freeze({ ...initialFilters }),

    resetError: () => {
      set((state) => {
        state.error = null;
      });
    },

    resetState: () => {
      set((state) => {
        state.isMutating = false;
        state.error = null;
      });
    },

    fetchSets: async (params?: FlashcardsSetFiltersViewModel) => {
      const currentFilters = params || get().filters;
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const response = await apiClient.get("/flashcards-sets", {
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
        throw error;
      }
    },

    createSet: async (command: CreateFlashcardsSetCommand) => {
      set((state) => {
        state.isMutating = true;
        state.error = null;
      });
      try {
        const newSet = await apiClient.post("/flashcards-sets", command);
        return newSet;
      } catch (error) {
        set((state) => {
          state.error = error as Error;
        });
        console.error("Failed to create flashcard set:", error);
        throw error;
      } finally {
        set((state) => {
          state.isMutating = false;
        });
      }
    },

    updateSet: async (setId: string, command: UpdateFlashcardsSetCommand) => {
      set((state) => {
        state.isMutating = true;
        state.error = null;
      });
      try {
        const updatedSet = await apiClient.put(
          `/flashcards-sets/${setId}`,
          command
        );
        return updatedSet;
      } catch (error) {
        set((state) => {
          state.error = error as Error;
        });
        console.error(`Failed to update flashcard set ${setId}:`, error);
        throw error;
      } finally {
        set((state) => {
          state.isMutating = false;
        });
      }
    },

    deleteSet: async (setId: string) => {
      set((state) => {
        state.isMutating = true;
        state.error = null;
      });
      try {
        await apiClient.delete(`/flashcards-sets/${setId}`);
        return true;
      } catch (error) {
        set((state) => {
          state.error = error as Error;
        });
        console.error(`Failed to delete flashcard set ${setId}:`, error);
        throw error;
      } finally {
        set((state) => {
          state.isMutating = false;
        });
      }
    },

    setFilters: (newFilters: Partial<FlashcardsSetFiltersViewModel>) => {
      const oldFilters = get().filters;
      const resetPage =
        (newFilters.limit !== undefined &&
          newFilters.limit !== oldFilters.limit) ||
        (newFilters.sortBy !== undefined &&
          newFilters.sortBy !== oldFilters.sortBy) ||
        (newFilters.sortOrder !== undefined &&
          newFilters.sortOrder !== oldFilters.sortOrder) ||
        (newFilters.status !== undefined &&
          newFilters.status !== oldFilters.status) ||
        (newFilters.nameSearch !== undefined &&
          newFilters.nameSearch !== oldFilters.nameSearch);

      const updatedFilters = {
        ...oldFilters,
        ...newFilters,
        page:
          resetPage && newFilters.page === undefined
            ? 1
            : (newFilters.page ?? oldFilters.page),
      };
      set((state) => {
        state.filters = updatedFilters;
      });
      get().fetchSets(updatedFilters).catch((error) => {
        console.error("Failed to fetch sets after filter change:", error);
      });
    },

    resetFilters: () => {
      set((state) => {
        state.filters = { ...state.initialFiltersState };
      });
      get().fetchSets({ ...get().initialFiltersState }).catch((error) => {
        console.error("Failed to fetch sets after filter reset:", error);
      });
    },
  }))
);

// Użycie w komponencie:
// const { setsData, isLoading, error, fetchSets, createSet, updateSet, deleteSet, filters, setFilters } = useFlashcardSetsStore();
