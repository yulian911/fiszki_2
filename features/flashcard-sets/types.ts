import type { FlashcardsSetDTO, FlashcardsSetStatus, MetaDTO } from '@/types';

// UWAGA: Zgodnie z PRD (US-202), powinna tu być liczba fiszek.
// Jeśli API GET /flashcards-sets nie zwraca tej informacji,
// należy to uzgodnić z backendem lub pominąć wyświetlanie liczby fiszek w tym widoku.

/**
 * Typ używany do wyświetlania danych w tabeli/siatce, może rozszerzać FlashcardsSetDTO
 * o dodatkowe pola UI.
 */
export interface FlashcardsSetViewItem extends FlashcardsSetDTO {
  flashcardCount?: number; // Jeśli API nie dostarcza, może być opcjonalne
  // isDeleting?: boolean; // Do obsługi stanu ładowania dla konkretnego wiersza
  // isEditing?: boolean; // Do obsługi stanu ładowania dla konkretnego wiersza
}

/**
 * Reprezentuje aktualny stan filtrów i sortowania.
 */
export interface FlashcardsSetFiltersViewModel {
  page: number;
  limit: number;
  sortBy?: keyof Omit<FlashcardsSetDTO, 'ownerId'> | string; // np. 'name', 'createdAt', usunięto ownerId jako niepotrzebne do sortowania
  sortOrder?: "asc" | "desc";
  status?: FlashcardsSetStatus | ""; // "" dla braku filtra statusu
  nameSearch?: string; // Dla wyszukiwania po nazwie
}

/**
 * Określa, który modal jest aktualnie otwarty i jakie dane przekazuje.
 */
export interface CurrentModalViewModel {
  type: "create" | "edit" | "delete" | null;
  data?: FlashcardsSetDTO; // Dane dla modala edycji lub usunięcia
} 