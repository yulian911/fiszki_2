"use client";

import { ResponsiveModal } from "@/components/response-modal";
import { useFlashcardModal } from "@/features/flashcard-sets/hooks/useFlashcardModal";
import { AddFlashcardFormComponent } from "@/features/flashcard-sets/components/AddFlashcardFormComponent";
import { ConfirmDeleteFlashcardComponent } from "@/features/flashcard-sets/components/ConfirmDeleteFlashcardComponent";
import { EditFlashcardFormComponent } from "@/features/flashcard-sets/components/EditFlashcardFormComponent";
import { GenerateFlashcardsAIModalComponent } from "@/features/flashcard-sets/components/GenerateFlashcardsAIModalComponent";
import { ShareSetModalComponent } from "@/features/flashcard-sets/components/ShareSetModalComponent";
import React from "react";
import { useParams } from "next/navigation";

export default function OpenFlashcardModals() {
  const params = useParams<{ setId: string }>();
  const setId = params?.setId ?? "";

  const {
    isCreateOpen,
    closeCreate,
    editFlashcardId,
    closeEdit,
    deleteFlashcardId,
    closeDelete,
    isGenerateAIOpen,
    closeGenerateAI,
    isShareOpen,
    closeShare,
  } = useFlashcardModal();

  // Determine which modal is active
  const isModalOpen =
    !!isCreateOpen || !!editFlashcardId || !!deleteFlashcardId || !!isGenerateAIOpen || !!isShareOpen;

  let title = "";
  let description = "";
  let content: React.ReactNode = null;
  let onClose = () => {};

  if (isCreateOpen) {
    title = "Dodaj nową fiszkę";
    description = "Uzupełnij pytanie i odpowiedź";
    content = <AddFlashcardFormComponent setId={setId} onCancel={closeCreate} />;
    onClose = closeCreate;
  } else if (editFlashcardId) {
    title = "Edytuj fiszkę";
    description = "Zmień treść fiszki";
    content = <EditFlashcardFormComponent flashcardId={editFlashcardId} onCancel={closeEdit} />;
    onClose = closeEdit;
  } else if (deleteFlashcardId) {
    title = "Usuń fiszkę";
    description = "Potwierdź usunięcie";
    content = (
      <ConfirmDeleteFlashcardComponent flashcardId={deleteFlashcardId} onCancel={closeDelete} />
    );
    onClose = closeDelete;
  } else if (isGenerateAIOpen) {
    title = "Generuj fiszki z AI";
    description = "Podaj tekst do analizy";
    content = <GenerateFlashcardsAIModalComponent onCancel={closeGenerateAI} onAccept={closeGenerateAI} />;
    onClose = closeGenerateAI;
  } else if (isShareOpen) {
    title = "Udostępnij zestaw";
    description = "Zaproś współpracowników";
    content = <ShareSetModalComponent onCancel={closeShare} />;
    onClose = closeShare;
  }

  if (!isModalOpen || !content) return null;

  return (
    <ResponsiveModal open={isModalOpen} onOpenChange={onClose} title={title} description={description}>
      {content}
    </ResponsiveModal>
  );
} 