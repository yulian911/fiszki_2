import React from "react";
import type { FlashcardsSetDTO } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useEditModalSet from "@/features/flashcard-sets/hooks/useEditModal";

interface SetDetailsHeaderProps {
  set: FlashcardsSetDTO;
}

export const SetDetailsHeader: React.FC<SetDetailsHeaderProps> = ({ set }) => {
  const { openEdit } = useEditModalSet();

  // Placeholder for delete action (can be integrated later)
  const handleDelete = () => {
    // TODO: trigger delete modal
    console.log("Delete set (not implemented)");
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-muted/20 p-4 rounded-md">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold break-words max-w-xl">{set.name}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge>{set.status}</Badge>
          <span>Utworzono: {new Date(set.createdAt).toLocaleDateString()}</span>
          <span>|</span>
          <span>Liczba fiszek: {set.flashcardCount ?? 0}</span>
        </div>
        {set.description && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {set.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 self-start md:self-auto">
        <Button variant="outline" onClick={() => openEdit(set.id)}>
          Edytuj zestaw
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Usuń zestaw
        </Button>
      </div>
    </header>
  );
};
