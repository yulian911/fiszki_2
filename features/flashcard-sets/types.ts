import type { FlashcardsSetDTO, FlashcardsSetStatus, MetaDTO } from '@/types';

// UWAGA: Zgodnie z PRD (US-202), powinna tu być liczba fiszek.
// Jeśli API GET /flashcards-sets nie zwraca tej informacji,
// należy to uzgodnić z backendem lub pominąć wyświetlanie liczby fiszek w tym widoku.

/**
 * Represents a flashcard set item as displayed in the UI table/grid.
 * Extends the base DTO with UI-specific properties.
 */
export interface FlashcardsSetViewItem extends FlashcardsSetDTO {
  /** Number of flashcards in the set. Optional if not provided by the API. */
  flashcardCount?: number;
  // isDeleting?: boolean; // Do obsługi stanu ładowania dla konkretnego wiersza
  // isEditing?: boolean; // Do obsługi stanu ładowania dla konkretnego wiersza
}

/**
 * Represents the current state of filters and sorting for flashcard sets.
 */
export interface FlashcardsSetFiltersViewModel {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Field to sort by (excluding ownerId) */
  sortBy?: keyof Omit<FlashcardsSetDTO, 'ownerId'> | string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Filter by set status. Empty string means no status filter */
  status?: FlashcardsSetStatus | "";
  /** Search term for filtering by name */
  nameSearch?: string;
}

/**
 * Defines the current modal state and its associated data.
 */
export interface CurrentModalViewModel {
  /** Type of the currently open modal */
  type: "create" | "edit" | "delete" | null;
  /** Data associated with the modal (for edit/delete operations) */
  data?: FlashcardsSetDTO;
} 