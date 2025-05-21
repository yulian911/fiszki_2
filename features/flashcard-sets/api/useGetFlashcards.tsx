import { useQuery } from "@tanstack/react-query";
import type { FlashcardDTO, PaginatedResponse } from "@/types";

export const FLASHCARDS_QUERY_KEY = "flashcards" as const;

export interface FlashcardsFilters {
  page: number;
  limit: number;
  sortBy?: "createdAt" | "question" | "answer";
  sortOrder?: "asc" | "desc";
  search?: string;
}

export const useGetFlashcards = (
  setId?: string,
  filters?: FlashcardsFilters
) => {
  return useQuery<PaginatedResponse<FlashcardDTO>>({
    queryKey: [FLASHCARDS_QUERY_KEY, setId, filters],
    enabled: !!setId,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (!setId) throw new Error("Missing setId");
      params.append("setId", setId);
      if (filters) {
        params.append("page", String(filters.page));
        params.append("limit", String(filters.limit));
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
        if (filters.search) params.append("search", filters.search);
      }

      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch flashcards (${response.status})`);
      }
      return (await response.json()) as PaginatedResponse<FlashcardDTO>;
    },
  });
}; 