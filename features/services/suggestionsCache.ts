import type { AISuggestionDTO } from "@/types";

// In-memory cache for AI suggestions with TTL
// const cache = new Map<string, AISuggestionDTO>();
// const timeouts = new Map<string, NodeJS.Timeout>();

// HACK: Attach to globalThis for HMR persistence in development
declare global {
  // eslint-disable-next-line no-var
  var suggestionCache: Map<string, AISuggestionDTO> | undefined;
  // eslint-disable-next-line no-var
  var suggestionTimeouts: Map<string, NodeJS.Timeout> | undefined;
}

const cache = globalThis.suggestionCache || (globalThis.suggestionCache = new Map<string, AISuggestionDTO>());
const timeouts = globalThis.suggestionTimeouts || (globalThis.suggestionTimeouts = new Map<string, NodeJS.Timeout>());

const TTL_MS = 1000 * 60 * 60; // 1 hour TTL

/**
 * Stores a suggestion in cache and schedules its expiration
 */
export const setSuggestion = (suggestion: AISuggestionDTO): void => {
  // Clear any existing timeout for this suggestion ID before setting a new one
  if (timeouts.has(suggestion.id)) {
    clearTimeout(timeouts.get(suggestion.id)!);
    timeouts.delete(suggestion.id); // Also remove from the timeouts map
  }

  cache.set(suggestion.id, suggestion);
  const newTimeout = setTimeout(() => {
    cache.delete(suggestion.id);
    timeouts.delete(suggestion.id);
    console.log(`Suggestion ${suggestion.id} expired and removed from cache.`);
  }, TTL_MS);
  timeouts.set(suggestion.id, newTimeout);
  console.log(`Suggestion ${suggestion.id} set/updated in cache. New TTL started.`);
};

/**
 * Retrieves a suggestion from cache by id
 */
export const getSuggestion = (id: string): AISuggestionDTO | undefined => {
  const suggestion = cache.get(id);
  if (suggestion) {
    console.log(`Suggestion ${id} retrieved from cache.`);
  } else {
    console.log(`Suggestion ${id} not found in cache.`);
  }
  return suggestion;
};

/**
 * Deletes a suggestion from cache and clears its timeout
 */
export const deleteSuggestion = (id: string): void => {
  if (timeouts.has(id)) {
    clearTimeout(timeouts.get(id)!);
    console.log(`Timeout cleared for suggestion ${id}.`);
  }
  cache.delete(id);
  timeouts.delete(id);
  console.log(`Suggestion ${id} deleted from cache.`);
}; 