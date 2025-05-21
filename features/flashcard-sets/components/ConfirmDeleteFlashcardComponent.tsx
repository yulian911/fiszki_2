import React from "react";
import { Button } from "@/components/ui/button";
import { useDeleteFlashcard } from "@/features/flashcard-sets/api/useMutateFlashcards";
import { toast } from "sonner";

interface ConfirmDeleteFlashcardComponentProps {
  flashcardId: string;
  onCancel: () => void;
}

export const ConfirmDeleteFlashcardComponent: React.FC<ConfirmDeleteFlashcardComponentProps> = ({ flashcardId, onCancel }) => {
  const { mutate: deleteFlashcard, isPending } = useDeleteFlashcard();

  const handleDelete = () => {
    deleteFlashcard(flashcardId, {
      onSuccess: () => {
        toast.success("Fiszka usunięta");
        onCancel();
      },
      onError: (e) => {
        toast.error(`Błąd: ${e.message}`);
      },
    });
  };

  return (
    <div className="space-y-4">
      <p>Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Anuluj
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
          Usuń
        </Button>
      </div>
    </div>
  );
}; 