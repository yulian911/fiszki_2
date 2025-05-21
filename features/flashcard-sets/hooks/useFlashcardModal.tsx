"use client";

import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { useQueryClient } from "@tanstack/react-query";
import { FLASHCARDS_QUERY_KEY } from "@/features/flashcard-sets/api/useGetFlashcards";

/**
 * Hook managing modal states for flashcards (create, edit, delete, AI, share)
 * Uses URL query params to persist state.
 */
export const useFlashcardModal = () => {
  const queryClient = useQueryClient();

  // Add/create modal
  const [isCreateOpen, setIsCreateOpen] = useQueryState(
    "create-flashcard",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  // Edit modal (flashcard id)
  const [editFlashcardId, setEditFlashcardId] = useQueryState(
    "edit-flashcard",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  // Delete modal (flashcard id)
  const [deleteFlashcardId, setDeleteFlashcardId] = useQueryState(
    "delete-flashcard",
    parseAsString.withDefault("").withOptions({ clearOnDefault: true })
  );

  // Generate AI modal state (boolean)
  const [isGenerateAIOpen, setIsGenerateAIOpen] = useQueryState(
    "generate-flashcards-ai",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  // Share set modal state (boolean) – independent but grouped here
  const [isShareOpen, setIsShareOpen] = useQueryState(
    "share-set",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  // Helper functions
  const closeAndRefetch = async () => {
    await queryClient.invalidateQueries({ queryKey: [FLASHCARDS_QUERY_KEY] });
  };

  // Create controls
  const openCreate = () => setIsCreateOpen(true);
  const closeCreate = () => {
    setIsCreateOpen(null);
    closeAndRefetch();
  };

  // Edit controls
  const openEdit = (id: string) => setEditFlashcardId(id);
  const closeEdit = () => {
    setEditFlashcardId(null);
    closeAndRefetch();
  };

  // Delete controls
  const openDelete = (id: string) => setDeleteFlashcardId(id);
  const closeDelete = () => {
    setDeleteFlashcardId(null);
    closeAndRefetch();
  };

  // AI controls
  const openGenerateAI = () => setIsGenerateAIOpen(true);
  const closeGenerateAI = () => setIsGenerateAIOpen(null);

  // Share controls
  const openShare = () => setIsShareOpen(true);
  const closeShare = () => setIsShareOpen(null);

  return {
    isCreateOpen,
    openCreate,
    closeCreate,
    editFlashcardId,
    openEdit,
    closeEdit,
    deleteFlashcardId,
    openDelete,
    closeDelete,
    isGenerateAIOpen,
    openGenerateAI,
    closeGenerateAI,
    isShareOpen,
    openShare,
    closeShare,
  };
}; 