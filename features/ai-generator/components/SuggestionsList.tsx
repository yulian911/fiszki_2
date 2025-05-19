"use client";

import { AISuggestionDTO, EditSuggestionCommand, FlashcardDTO } from "@/types";

import { EditSuggestionForm } from "./EditSuggestionForm";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectFlashcardsSetForm } from "./SelectFlashcardsSetForm";
import { SuggestionCard } from "./SuggestionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionsListProps {
  suggestions: AISuggestionDTO[];
  onAccept: (
    suggestionId: string,
    flashcardsSetId: string
  ) => Promise<FlashcardDTO | void>;
  onReject: (suggestionId: string) => Promise<void>;
  onEdit: (
    suggestionId: string,
    data: EditSuggestionCommand
  ) => Promise<AISuggestionDTO | void>;
  onEditInit: (suggestionId: string) => void;
  onEditCancel: () => void;
  onAcceptInit: (suggestionId: string) => void;
  onAcceptCancel: () => void;
  editState: {
    isEditing: boolean;
    currentSuggestionId: string | null;
    question: string;
    answer: string;
    isProcessing: boolean;
    error?: string;
  };
  acceptState: {
    isSelecting: boolean;
    currentSuggestionId: string | null;
    selectedSetId: string | null;
    isProcessing: boolean;
    error?: string;
  };
  defaultSetId?: string;
  isMobile?: boolean;
}

export function SuggestionsList({
  suggestions,
  onAccept,
  onReject,
  onEdit,
  onEditInit,
  onEditCancel,
  onAcceptInit,
  onAcceptCancel,
  editState,
  acceptState,
  defaultSetId,
  isMobile = false,
}: SuggestionsListProps) {
  // Bezpośrednia akceptacja fiszki do domyślnego zestawu, jeśli jest podany
  const handleAcceptClick = (suggestionId: string) => {
    if (defaultSetId) {
      // Jeśli mamy defaultSetId, używamy go bezpośrednio
      onAccept(suggestionId, defaultSetId);
    } else {
      // W przeciwnym razie inicjalizujemy dialog wyboru zestawu
      onAcceptInit(suggestionId);
    }
  };

  // Renderowanie zawartości listy
  const renderSuggestionContent = (suggestion: AISuggestionDTO) => {
    // Jeśli ta sugestia jest w trybie edycji, renderuj formularz edycji
    if (
      editState.isEditing &&
      editState.currentSuggestionId === suggestion.id
    ) {
      return (
        <EditSuggestionForm
          key={suggestion.id}
          suggestion={suggestion}
          onSubmit={(data) => onEdit(suggestion.id, data)}
          onCancel={onEditCancel}
          defaultValues={{
            question: editState.question,
            answer: editState.answer,
          }}
          isSubmitting={editState.isProcessing}
          error={editState.error}
        />
      );
    }

    // Jeśli ta sugestia jest w trybie wyboru zestawu, renderuj formularz wyboru
    if (
      acceptState.isSelecting &&
      acceptState.currentSuggestionId === suggestion.id
    ) {
      return (
        <SelectFlashcardsSetForm
          key={suggestion.id}
          suggestionId={suggestion.id}
          onSubmit={(setId) => onAccept(suggestion.id, setId)}
          onCancel={onAcceptCancel}
          defaultSetId={defaultSetId}
        />
      );
    }

    // W przeciwnym razie renderuj normalną kartę sugestii
    return (
      <SuggestionCard
        key={suggestion.id}
        suggestion={suggestion}
        onAcceptClick={handleAcceptClick}
        onEditClick={() => onEditInit(suggestion.id)}
        onRejectClick={() => onReject(suggestion.id)}
        isMobile={isMobile}
        isProcessing={acceptState.isProcessing && acceptState.currentSuggestionId === suggestion.id}
      />
    );
  };

  return (
    <div className="space-y-4 my-4">
      <h3 className="text-center font-medium">
        Wygenerowano {suggestions.length} propozycji fiszek
      </h3>
      
      {acceptState.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{acceptState.error}</AlertDescription>
        </Alert>
      )}

      {isMobile ? (
        <ScrollArea className="h-[calc(100dvh-18rem)]">
          <div className="space-y-4 pr-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className={cn(acceptState.isProcessing && acceptState.currentSuggestionId !== suggestion.id && "opacity-60 pointer-events-none")}>
                {renderSuggestionContent(suggestion)}
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className={cn(acceptState.isProcessing && acceptState.currentSuggestionId !== suggestion.id && "opacity-60 pointer-events-none")}>
              {renderSuggestionContent(suggestion)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
