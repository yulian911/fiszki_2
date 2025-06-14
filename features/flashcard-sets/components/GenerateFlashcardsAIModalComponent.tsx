import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGenerateFlashcardsSuggestions } from "@/features/flashcard-sets/api/useGenerateFlashcardsSuggestions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AISuggestionDTO } from "@/types";

interface GenerateFlashcardsAIModalComponentProps {
  onCancel: () => void;
  onAccept: (suggestions: AISuggestionDTO[]) => void;
}

export const GenerateFlashcardsAIModalComponent: React.FC<
  GenerateFlashcardsAIModalComponentProps
> = ({ onCancel, onAccept }) => {
  const [text, setText] = useState("");
  const {
    mutate: generate,
    data,
    isPending,
  } = useGenerateFlashcardsSuggestions();

  const handleGenerate = () => {
    generate({ text });
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Wklej tekst lub instrukcję..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isPending}
      />
      <div className="flex gap-2">
        <Button onClick={handleGenerate} disabled={isPending || !text.trim()}>
          {isPending ? "Generowanie..." : "Generuj"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Anuluj
        </Button>
        {data && (
          <Button onClick={() => onAccept(data.suggestions)}>
            Zatwierdź i dodaj
          </Button>
        )}
      </div>
      {data && (
        <ScrollArea className="h-64 pr-4">
          <div className="grid gap-2">
            {data.suggestions.map((s) => (
              <Card key={s.id} className="p-2">
                <CardHeader className="font-medium">{s.question}</CardHeader>
                <CardContent>{s.answer}</CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
