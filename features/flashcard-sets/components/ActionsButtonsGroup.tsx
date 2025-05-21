import React from "react";
import { Button } from "@/components/ui/button";
import { useFlashcardModal } from "@/features/flashcard-sets/hooks/useFlashcardModal";

export const ActionsButtonsGroup: React.FC = () => {
  const { openCreate, openGenerateAI, openShare } = useFlashcardModal();

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={openCreate}>Dodaj fiszkę</Button>
      <Button variant="outline" onClick={openGenerateAI}>
        Generuj fiszki AI
      </Button>
      <Button variant="secondary" onClick={openShare}>
        Udostępnij
      </Button>
    </div>
  );
}; 