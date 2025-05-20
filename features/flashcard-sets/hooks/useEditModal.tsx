"use client";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { useGetFlashcardSets } from "../api/useGetFlashcardSets";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for managing modal states in flashcard sets
 * Provides functions to open/close create, edit and delete modals
 */
export default function useEditModalSet() {
  const queryClient = useQueryClient();
  
  // Create modal state
  const [isOpen, setIsOpen] = useQueryState(
    "create-flashcard-set",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  
  // Edit modal state
  const [flashcardSetEditId, setFlashcardSetEditId] = useQueryState(
    "edit-flashcard-set", 
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );
  
  // Delete modal state
  const [deleteFlashcardSetId, setDeleteFlashcardSetId] = useQueryState(
    "delete-flashcard-set",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  // Create modal controls
  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(null); // Use null to clear the parameter completely
    // Odśwież zapytania po zamknięciu modala tworzenia
    queryClient.refetchQueries({ 
      queryKey: ["flashcard-sets"],
      type: 'active'
    });
  };
  
  // Edit modal controls
  const openEdit = (id: string) => setFlashcardSetEditId(id);
  const closeEdit = () => {
    setFlashcardSetEditId(null); // Use null to clear the parameter completely
    // Odśwież zapytania po zamknięciu modala edycji
    queryClient.refetchQueries({ 
      queryKey: ["flashcard-sets"],
      type: 'active'
    });
  };
  
  // Delete modal controls
  const deleteOpen = (id: string) => setDeleteFlashcardSetId(id);
  const deleteClose = () => {
    setDeleteFlashcardSetId(null); // Use null to clear the parameter completely
    // Odśwież zapytania po zamknięciu modala usuwania
    queryClient.refetchQueries({ 
      queryKey: ["flashcard-sets"],
      type: 'active'
    });
  };
  
  return {
    isOpen,
    open,
    close,
    flashcardSetEditId,
    openEdit,     
    closeEdit,
    deleteFlashcardSetId,
    deleteOpen,
    deleteClose,
  };
}
