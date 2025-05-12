import { useState, useEffect } from "react";
import { FlashcardsSetDTO } from "@/types";
import { notify } from "../utils/notifications";

// Interfejs dla opcji zestawu fiszek (do select)
export interface FlashcardsSetOption {
  value: string; // id zestawu
  label: string; // nazwa zestawu
}

// Funkcja API do pobierania zestawów fiszek (wyciąga pole `data` z paginowanej odpowiedzi)
const fetchFlashcardsSets = async (): Promise<FlashcardsSetDTO[]> => {
  const response = await fetch("/api/flashcards-sets", {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Nie udało się pobrać zestawów fiszek");
  }
  // odpowiedź ma kształt { data: FlashcardsSetDTO[], meta: { ... } }
  const json = await response.json();
  if (!json.data || !Array.isArray(json.data)) {
    throw new Error("Niepoprawny format odpowiedzi API");
  }
  return json.data;
};

// Funkcja API do tworzenia nowego zestawu fiszek
export const createFlashcardsSet = async (
  name: string
): Promise<FlashcardsSetDTO> => {
  const response = await fetch("/api/flashcards-sets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Nie udało się utworzyć zestawu fiszek");
  }

  return response.json();
};

// Hook useFlashcardSets
export function useFlashcardSets() {
  const [sets, setSets] = useState<FlashcardsSetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pobranie zestawów przy montowaniu komponentu
  useEffect(() => {
    const fetchSets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const fetchedSets = await fetchFlashcardsSets();
        setSets(fetchedSets);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Nieznany błąd");
        notify.apiError(error, "Nie udało się pobrać zestawów fiszek");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSets();
  }, []);

  // Konwersja zestawów do formatu opcji dla selecta
  const setOptions: FlashcardsSetOption[] = sets.map((set) => ({
    value: set.id,
    label: set.name,
  }));

  // Sortowanie opcji alfabetycznie wg nazwy
  setOptions.sort((a, b) => a.label.localeCompare(b.label));

  // Funkcja do ręcznego odświeżania listy zestawów
  const refreshSets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedSets = await fetchFlashcardsSets();
      setSets(fetchedSets);
      notify.success("Zaktualizowano listę zestawów");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Nieznany błąd");
      notify.apiError(error, "Nie udało się odświeżyć zestawów fiszek");
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja do tworzenia nowego zestawu
  const createSet = async (name: string): Promise<FlashcardsSetDTO> => {
    try {
      setIsLoading(true);
      const newSet = await createFlashcardsSet(name);

      // Dodaj nowy zestaw do stanu
      setSets((prev) => [...prev, newSet]);

      notify.success(`Utworzono nowy zestaw: ${name}`);
      return newSet;
    } catch (error) {
      notify.apiError(error, "Nie udało się utworzyć nowego zestawu");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sets,
    setOptions,
    isLoading,
    error,
    refreshSets,
    createSet,
  };
}
