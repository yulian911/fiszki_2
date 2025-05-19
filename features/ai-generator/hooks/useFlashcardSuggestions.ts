"use client"
import { useState, useCallback, useMemo } from "react";
import {
  AISuggestionDTO,
  AISuggestionsResponseDTO,
  EditSuggestionCommand,
  FlashcardDTO,
} from "@/types";
import { notify } from "../utils/notifications";

// Typy stanu
type GenerationStatus = "idle" | "generating" | "completed" | "error";

interface GenerationState {
  status: GenerationStatus;
  text: string;
  error?: string;
  suggestions: AISuggestionDTO[];
}

interface EditState {
  isEditing: boolean;
  isProcessing: boolean;
  currentSuggestionId: string | null;
  question: string;
  answer: string;
  error?: string;
}

interface AcceptState {
  isSelecting: boolean;
  currentSuggestionId: string | null;
  selectedSetId: string | null;
  isProcessing: boolean;
  error?: string;
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
  try {
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
        if (errorBody.error) {
          // Provide specific message for common "Suggestion not found" error
          if (errorBody.error === "Suggestion not found") {
            errMsg = "Ta sugestia nie jest już dostępna. Mogła zostać już zaakceptowana lub wygasła. Spróbuj wygenerować nowe sugestie.";
          } else {
            errMsg = errorBody.error;
          }
        } else if (errorBody.details) errMsg = JSON.stringify(errorBody.details);
        else if (errorBody.message) errMsg = errorBody.message;
      } catch (jsonError) {
        // Jeśli nie możemy sparsować JSON, użyjmy statusu HTTP
        if (response.status === 500) {
          errMsg = "Błąd serwera podczas akceptowania sugestii. Spróbuj ponownie później.";
        } else if (response.status === 404) {
          errMsg = "Nie znaleziono sugestii. Może została już zaakceptowana lub odrzucona.";
        } else if (response.status === 400) {
          errMsg = "Nieprawidłowe dane. Sprawdź czy zestaw fiszek nadal istnieje.";
        }
      }
      
      console.error(`Błąd akceptacji sugestii (${response.status}):`, errMsg);
      throw new Error(errMsg);
    }
    
    return response.json();
  } catch (error) {
    console.error("Wystąpił błąd podczas akceptowania sugestii:", error);
    throw error;
  }
};

const rejectSuggestion = async (suggestionId: string): Promise<void> => {
  try {
    const response = await fetch(
      `/api/flashcards-suggestions/${suggestionId}/reject`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      let errMsg = "Nie udało się odrzucić sugestii";
      
      try {
        const errorBody = await response.json();
        if (errorBody.error) {
          // Provide better message for common "Suggestion not found" error
          if (errorBody.error === "Suggestion not found") {
            errMsg = "Ta sugestia nie jest już dostępna. Mogła zostać już odrzucona lub wygasła.";
          } else {
            errMsg = errorBody.error;
          }
        }
      } catch (jsonError) {
        // If response is not JSON or parsing fails
        if (response.status === 404 || response.status === 500) {
          // For 404/500 errors, this likely means suggestion was already removed
          errMsg = "Nie znaleziono sugestii. Mogła już zostać odrzucona lub wygasła.";
        }
      }
      
      console.error(`Błąd odrzucenia sugestii (${response.status}):`, errMsg);
      throw new Error(errMsg);
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas odrzucania sugestii:", error);
    throw error;
  }
};

const editSuggestion = async (
  suggestionId: string,
  data: EditSuggestionCommand
): Promise<AISuggestionDTO> => {
  try {
    const response = await fetch(`/api/flashcards-suggestions/${suggestionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errMsg = "Nie udało się edytować sugestii";
      
      try {
        const errorBody = await response.json();
        console.error(`Błąd edycji sugestii (${response.status}):`, errorBody);
        
        if (errorBody.error) {
          // Provide better message for common "Suggestion not found" error
          if (errorBody.error === "Suggestion not found") {
            errMsg = "Ta sugestia nie jest już dostępna. Mogła wygasnąć lub została już przetworzona.";
          } else if (typeof errorBody.error === 'object') {
            // Obsługa błędów walidacji Zod
            if (errorBody.error.question?._errors?.length > 0) {
              errMsg = `Błąd walidacji pytania: ${errorBody.error.question._errors.join(', ')}`;
            } else if (errorBody.error.answer?._errors?.length > 0) {
              errMsg = `Błąd walidacji odpowiedzi: ${errorBody.error.answer._errors.join(', ')}`;
            } else if (errorBody.error.formErrors?._errors?.length > 0) {
              errMsg = errorBody.error.formErrors._errors.join(', ');
            } else {
              errMsg = "Nieprawidłowe dane formularza. Sprawdź, czy wszystkie pola są wypełnione.";
            }
          } else if (typeof errorBody.error === 'string') {
            errMsg = errorBody.error;
          }
        }
      } catch (jsonError) {
        console.error("Błąd parsowania odpowiedzi JSON:", jsonError);
        // If response is not JSON or parsing fails
        if (response.status === 404 || response.status === 500) {
          // For 404/500 errors, this likely means suggestion was already removed
          errMsg = "Nie znaleziono sugestii. Mogła wygasnąć lub została już przetworzona.";
        } else if (response.status === 400) {
          errMsg = "Nieprawidłowe dane. Sprawdź, czy wszystkie pola są poprawnie wypełnione.";
        }
      }
      
      console.error(`Błąd edycji sugestii (${response.status}):`, errMsg);
      throw new Error(errMsg);
    }

    return response.json();
  } catch (error) {
    console.error("Wystąpił błąd podczas edycji sugestii:", error);
    throw error;
  }
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
    isProcessing: false,
    currentSuggestionId: null,
    question: "",
    answer: "",
    error: undefined,
  });

  const [acceptState, setAcceptState] = useState<AcceptState>({
    isSelecting: false,
    currentSuggestionId: null,
    selectedSetId: null,
    isProcessing: false,
    error: undefined,
  });

  // Obsługa generowania sugestii
  const handleSubmitText = useCallback(async (text: string) => {
    // Jeśli tekst jest pusty, resetujemy stan
    if (!text) {
      setGenerationState({
        status: "idle",
        text: "",
        suggestions: [],
        error: undefined,
      });
      return;
    }
    
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
        // Zacznij proces akceptowania
        setAcceptState((prev) => ({
          ...prev,
          isSelecting: false,
          currentSuggestionId: suggestionId,
          isProcessing: true,
          error: undefined,
        }));
        
        // Wywołaj API
        await acceptSuggestion(suggestionId, flashcardsSetId);

        // Aktualizacja stanu - usunięcie zaakceptowanej sugestii
        setGenerationState((prev) => ({
          ...prev,
          suggestions: prev.suggestions.filter((s) => s.id !== suggestionId),
        }));

        // Reset stanu wyboru zestawu
        setAcceptState((prev) => ({
          ...prev,
          isSelecting: false,
          currentSuggestionId: null,
          selectedSetId: null,
          isProcessing: false,
          error: undefined,
        }));

        notify.success("Fiszka została dodana do zestawu");
      } catch (error) {
        console.error("Błąd przy akceptacji sugestii:", error);
        
        // Zapisz informację o błędzie w stanie
        setAcceptState((prev) => ({
          ...prev,
          isSelecting: false,
          currentSuggestionId: null,
          selectedSetId: null,
          isProcessing: false,
          error: error instanceof Error ? error.message : "Nieznany błąd przy akceptacji sugestii",
        }));
        
        // Wyświetl powiadomienie o błędzie
        notify.error(error instanceof Error 
          ? error.message 
          : "Wystąpił błąd podczas akceptowania sugestii. Spróbuj ponownie.");
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
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      
      // Check if this is a "not found" error - if so, still update UI to remove the suggestion
      // since that was the user's intention anyway
      if (errorMessage.includes("nie jest już dostępna") || 
          errorMessage.includes("Nie znaleziono sugestii")) {
        
        // Still remove from UI even though server couldn't find it
        setGenerationState((prev) => ({
          ...prev,
          suggestions: prev.suggestions.filter((s) => s.id !== suggestionId),
        }));
        
        notify.info("Sugestia została usunięta");
      } else {
        // For other errors, show full error message
        notify.apiError(error, "Nie udało się odrzucić sugestii");
      }
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
          isProcessing: false,
          currentSuggestionId: suggestionId,
          question: suggestion.question,
          answer: suggestion.answer,
          error: undefined,
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
        // Set processing state
        setEditState(prev => ({
          ...prev,
          isProcessing: true,
          error: undefined,
        }));
        
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
          isProcessing: false,
          currentSuggestionId: null,
          question: "",
          answer: "",
          error: undefined,
        });

        notify.success("Fiszka została zaktualizowana");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
        console.error("Błąd podczas zapisywania edycji:", errorMessage);
        
        // Sprawdź czy to błąd walidacji
        const isValidationError = 
          errorMessage.includes("Błąd walidacji") || 
          errorMessage.includes("Nieprawidłowe dane formularza");
        
        // If suggestion was already gone, exit edit mode
        if (errorMessage.includes("nie jest już dostępna") || 
            errorMessage.includes("Nie znaleziono sugestii")) {
          
          // Reset edit state
          setEditState({
            isEditing: false,
            isProcessing: false,
            currentSuggestionId: null,
            question: "",
            answer: "",
            error: errorMessage,
          });
          
          // Try to remove the suggestion since it's probably gone on the server
          setGenerationState((prev) => ({
            ...prev,
            suggestions: prev.suggestions.filter((s) => s.id !== suggestionId),
          }));
          
          notify.warning("Nie można edytować tej fiszki, została już usunięta.");
        } else {
          // Keep in edit mode, but show error
          setEditState(prev => ({
            ...prev,
            isProcessing: false,
            error: errorMessage,
          }));
          
          // Dla błędów walidacji używamy notify.warning zamiast error
          if (isValidationError) {
            notify.warning(errorMessage);
          } else {
            notify.error("Nie udało się zapisać zmian: " + errorMessage);
          }
        }
      }
    },
    []
  );

  // Obsługa anulowania edycji
  const handleCancelEdit = useCallback(() => {
    setEditState({
      isEditing: false,
      isProcessing: false,
      currentSuggestionId: null,
      question: "",
      answer: "",
      error: undefined,
    });
  }, []);

  // Obsługa inicjowania wyboru zestawu (akceptacja)
  const handleInitAccept = useCallback((suggestionId: string) => {
    setAcceptState({
      isSelecting: true,
      currentSuggestionId: suggestionId,
      selectedSetId: null,
      isProcessing: false,
      error: undefined,
    });
  }, []);

  // Obsługa anulowania wyboru zestawu
  const handleCancelAccept = useCallback(() => {
    setAcceptState({
      isSelecting: false,
      currentSuggestionId: null,
      selectedSetId: null,
      isProcessing: false,
      error: undefined,
    });
  }, []);

  // Obsługa zmiany wybranego zestawu
  const handleSetSelection = useCallback((setId: string) => {
    setAcceptState((prev) => ({
      ...prev,
      selectedSetId: setId,
      error: undefined,
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
