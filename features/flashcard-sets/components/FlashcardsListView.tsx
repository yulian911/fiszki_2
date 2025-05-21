import React, { useState } from "react";
import type { FlashcardDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface FlashcardsListViewProps {
  flashcards: FlashcardDTO[];
  isLoading?: boolean;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcard: FlashcardDTO) => void;
}

export const FlashcardsListView: React.FC<FlashcardsListViewProps> = ({
  flashcards,
  isLoading = false,
  onEdit,
  onDelete,
}) => {
  const [revealedId, setRevealedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Brak fiszek w tym zestawie.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((card) => {
        const isRevealed = revealedId === card.id;
        return (
          <Card key={card.id} className="flex flex-col justify-between">
            <CardHeader className="font-medium break-words">{card.question}</CardHeader>
            {isRevealed && <CardContent className="border-t pt-2 break-words">{card.answer}</CardContent>}
            <CardFooter className="mt-auto flex items-center justify-between gap-2">
              <Button variant="link" size="sm" onClick={() => setRevealedId(isRevealed ? null : card.id)}>
                {isRevealed ? "Ukryj" : "Pokaż"}
              </Button>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => onEdit(card)}>
                  Edytuj
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(card)}>
                  Usuń
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}; 