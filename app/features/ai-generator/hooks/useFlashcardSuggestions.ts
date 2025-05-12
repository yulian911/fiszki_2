import { useState, useCallback, useMemo } from "react";
import {
  AISuggestionDTO,
  AISuggestionsResponseDTO,
  EditSuggestionCommand,
  FlashcardDTO,
} from "@/types";
import { notify } from "../utils/notifications";

// Typy stanu
interface GenerationState {
  status: "idle" | "generating" | "completed" | "error";
  text: string;
  error?: string;
  suggestions: AISuggestionDTO[];
}

interface EditState {
  isEditing: boolean;
  currentSuggestionId: string | null;
  question: string;
  answer: string;
}

interface AcceptState {
  isSelecting: boolean;
  currentSuggestionId: string | null;
  selectedSetId: string | null;
}

// Funkcje API
const generateSuggestions = async (
  text: string
): Promise<AISuggestionsResponseDTO> => {
  const response = await fetch("/api/flashcards-suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Nie udało się wygenerować sugestii");
  }

  return response.json();
};

const acceptSuggestion = async (
  suggestionId: string,
  flashcardsSetId: string
): Promise<FlashcardDTO> => {
  const response = await fetch(
    `/api/flashcards-suggestions/${suggestionId}/accept`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcardsSetId }),
    }
  );
  if (!response.ok) {
    // parse error details from server
    let errMsg = 'Nie udało się zaakceptować sugestii';
    try {
      const errorBody = await response.json();
      if (errorBody.error) errMsg = errorBody.error;
      else if (errorBody.details) errMsg = JSON.stringify(errorBody.details);
    } catch {}
    throw new Error(errMsg);
  }
  return response.json();
};

const rejectSuggestion = async (suggestionId: string): Promise<void> => {
  const response = await fetch(
    `/api/flashcards-suggestions/${suggestionId}/reject`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Nie udało się odrzucić sugestii");
  }
};

const editSuggestion = async (
  suggestionId: string,
  data: EditSuggestionCommand
): Promise<AISuggestionDTO> => {
  const response = await fetch(`/api/flashcards-suggestions/${suggestionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Nie udało się edytować sugestii");
  }

  return response.json();
};

// Hook useFlashcardSuggestions
export function useFlashcardSuggestions() {
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: "idle",
    text: "",
    suggestions: [],
  });

  const [editState, setEditState] = useState<EditState>({
    isEditing: false,
    currentSuggestionId: null,
    question: "",
    answer: "",
  });

  const [acceptState, setAcceptState] = useState<AcceptState>({
    isSelecting: false,
    currentSuggestionId: null,
    selectedSetId: null,
  });

  // Obsługa generowania sugestii
  const handleSubmitText = useCallback(async (text: string) => {
    try {
      setGenerationState((prev) => ({
        ...prev,
        status: "generating",
        text,
        error: undefined,
      }));

      const response = await generateSuggestions(text);

      setGenerationState((prev) => ({
        ...prev,
        status: "completed",
        suggestions: response.suggestions,
      }));

      notify.success(
        `Wygenerowano ${response.suggestions.length} sugestii fiszek`
      );
    } catch (error) {
      setGenerationState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Nieznany błąd",
      }));

      notify.apiError(error, "Nie udało się wygenerować sugestii");
    }
  }, []);

  // Obsługa akceptacji sugestii
  const handleAcceptSuggestion = useCallback(
    async (suggestionId: string, flashcardsSetId: string): Promise<void> => {
      try {
        await acceptSuggestion(suggestionId, flashcardsSetId);

        // Aktualizacja stanu - usunięcie zaakceptowanej sugestii
        setGenerationState((prev) => ({
          ...prev,
          suggestions: prev.suggestions.filter((s) => s.id !== suggestionId),
        }));

        // Reset stanu wyboru zestawu
        setAcceptState({
          isSelecting: false,
          currentSuggestionId: null,
          selectedSetId: null,
        });

        notify.success("Fiszka została dodana do zestawu");
      } catch (error) {
        notify.apiError(error, "Nie udało się zaakceptować sugestii");
        throw error;
      }
    },
    []
  );

  // Obsługa odrzucenia sugestii
  const handleRejectSuggestion = useCallback(async (suggestionId: string) => {
    try {
      await rejectSuggestion(suggestionId);

      // Aktualizacja stanu - usunięcie odrzuconej sugestii
      setGenerationState((prev) => ({
        ...prev,
        suggestions: prev.suggestions.filter((s) => s.id !== suggestionId),
      }));

      notify.info("Sugestia została odrzucona");
    } catch (error) {
      notify.apiError(error, "Nie udało się odrzucić sugestii");
      throw error;
    }
  }, []);

  // Obsługa inicjowania edycji sugestii
  const handleEditSuggestion = useCallback(
    (suggestionId: string) => {
      const suggestion = generationState.suggestions.find(
        (s) => s.id === suggestionId
      );

      if (suggestion) {
        setEditState({
          isEditing: true,
          currentSuggestionId: suggestionId,
          question: suggestion.question,
          answer: suggestion.answer,
        });
      }
    },
    [generationState.suggestions]
  );

  // Obsługa zapisywania edycji sugestii
  const handleSaveEdit = useCallback(
    async (
      suggestionId: string,
      data: EditSuggestionCommand
    ): Promise<void> => {
      try {
        const updatedSuggestion = await editSuggestion(suggestionId, data);

        // Aktualizacja sugestii w stanie
        setGenerationState((prev) => ({
          ...prev,
          suggestions: prev.suggestions.map((s) =>
            s.id === suggestionId ? updatedSuggestion : s
          ),
        }));

        // Reset stanu edycji
        setEditState({
          isEditing: false,
          currentSuggestionId: null,
          question: "",
          answer: "",
        });

        notify.success("Fiszka została zaktualizowana");
      } catch (error) {
        notify.apiError(error, "Nie udało się zapisać zmian");
        throw error;
      }
    },
    []
  );

  // Obsługa anulowania edycji
  const handleCancelEdit = useCallback(() => {
    setEditState({
      isEditing: false,
      currentSuggestionId: null,
      question: "",
      answer: "",
    });
  }, []);

  // Obsługa inicjowania wyboru zestawu (akceptacja)
  const handleInitAccept = useCallback((suggestionId: string) => {
    setAcceptState({
      isSelecting: true,
      currentSuggestionId: suggestionId,
      selectedSetId: null,
    });
  }, []);

  // Obsługa anulowania wyboru zestawu
  const handleCancelAccept = useCallback(() => {
    setAcceptState({
      isSelecting: false,
      currentSuggestionId: null,
      selectedSetId: null,
    });
  }, []);

  // Obsługa zmiany wybranego zestawu
  const handleSetSelection = useCallback((setId: string) => {
    setAcceptState((prev) => ({
      ...prev,
      selectedSetId: setId,
    }));
  }, []);

  // Memoizacja wartości zwracanej
  const value = useMemo(
    () => ({
      generationState,
      editState,
      acceptState,
      handleSubmitText,
      handleAcceptSuggestion,
      handleRejectSuggestion,
      handleEditSuggestion,
      handleSaveEdit,
      handleCancelEdit,
      handleInitAccept,
      handleCancelAccept,
      handleSetSelection,
    }),
    [
      generationState,
      editState,
      acceptState,
      handleSubmitText,
      handleAcceptSuggestion,
      handleRejectSuggestion,
      handleEditSuggestion,
      handleSaveEdit,
      handleCancelEdit,
      handleInitAccept,
      handleCancelAccept,
      handleSetSelection,
    ]
  );

  return value;
}
