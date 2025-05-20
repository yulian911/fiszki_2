import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FlashcardsSetFiltersViewModel } from "../types";
import type { PaginatedResponse, FlashcardsSetDTO } from "@/types";

export const FLASHCARD_SETS_QUERY_KEY = "flashcard-sets";

export interface UseGetFlashcardSetsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  nameSearch?: string;
  enabled?: boolean;
}

export const getFlashcardSetsQueryKey = (params: UseGetFlashcardSetsParams = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    status = "",
    nameSearch = "",
  } = params;

  return [FLASHCARD_SETS_QUERY_KEY, { page, limit, sortBy, sortOrder, status, nameSearch }];
};

export const useGetFlashcardSets = (params: UseGetFlashcardSetsParams = {}) => {
  const queryClient = useQueryClient();
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    status = "",
    nameSearch = "",
    enabled = true,
  } = params;

  return useQuery({
    queryKey: getFlashcardSetsQueryKey({ page, limit, sortBy, sortOrder, status, nameSearch }),
    queryFn: async (): Promise<PaginatedResponse<FlashcardsSetDTO>> => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));
        queryParams.append("sortBy", sortBy);
        queryParams.append("sortOrder", sortOrder);
        
        if (status) queryParams.append("status", status);
        if (nameSearch) queryParams.append("name", nameSearch);
        
        const response = await fetch(`/api/flashcards-sets?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.message || `Failed to fetch flashcard sets (${response.status})`);
          (error as any).status = response.status;
          throw error;
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching flashcard sets:", error);
        throw error instanceof Error ? error : new Error("Failed to fetch flashcard sets");
      }
    },
    enabled,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetFlashcardSetById = (setId?: string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: [FLASHCARD_SETS_QUERY_KEY, setId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/flashcards-sets/${setId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.message || `Failed to fetch flashcard set (${response.status})`);
          (error as any).status = response.status;
          throw error;
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching flashcard set:", error);
        throw error instanceof Error ? error : new Error("Failed to fetch flashcard set");
      }
    },
    enabled: !!setId,
    staleTime: 60 * 1000, // 1 minute for individual sets
  });
};
