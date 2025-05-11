"use client";

import { AISuggestionDTO, EditSuggestionCommand, FlashcardDTO } from "@/types";

import { EditSuggestionForm } from "./EditSuggestionForm";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectFlashcardsSetForm } from "./SelectFlashcardsSetForm";
import { SuggestionCard } from "./SuggestionCard";

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
  };
  acceptState: {
    isSelecting: boolean;
    currentSuggestionId: string | null;
    selectedSetId: string | null;
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
        onAcceptClick={() => onAcceptInit(suggestion.id)}
        onEditClick={() => onEditInit(suggestion.id)}
        onRejectClick={() => onReject(suggestion.id)}
        isMobile={isMobile}
      />
    );
  };

  return (
    <div className="space-y-4 my-4">
      <h3 className="text-center font-medium">
        Wygenerowano {suggestions.length} propozycji fiszek
      </h3>

      {isMobile ? (
        <ScrollArea className="h-[calc(100dvh-18rem)]">
          <div className="space-y-4 pr-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id}>
                {renderSuggestionContent(suggestion)}
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id}>{renderSuggestionContent(suggestion)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
