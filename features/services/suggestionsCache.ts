import type { AISuggestionDTO } from "@/types";

// In-memory cache for AI suggestions with TTL
const cache = new Map<string, AISuggestionDTO>();
const timeouts = new Map<string, NodeJS.Timeout>();
const TTL_MS = 1000 * 60 * 60; // 1 hour TTL

/**
 * Stores a suggestion in cache and schedules its expiration
 */
export const setSuggestion = (suggestion: AISuggestionDTO): void => {
  cache.set(suggestion.id, suggestion);
  const timeout = setTimeout(() => {
    cache.delete(suggestion.id);
    timeouts.delete(suggestion.id);
  }, TTL_MS);
  timeouts.set(suggestion.id, timeout);
};

/**
 * Retrieves a suggestion from cache by id
 */
export const getSuggestion = (id: string): AISuggestionDTO | undefined => {
  return cache.get(id);
};

/**
 * Deletes a suggestion from cache and clears its timeout
 */
export const deleteSuggestion = (id: string): void => {
  if (timeouts.has(id)) {
    clearTimeout(timeouts.get(id)!);
  }
  cache.delete(id);
  timeouts.delete(id);
}; 