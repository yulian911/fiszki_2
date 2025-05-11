import {
  AISuggestionDTO,
  AISuggestionsResponseDTO,
  FlashcardDTO,
  FlashcardsSetDTO,
} from "@/types";

// Pomocnik do generowania losowych ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Przykładowe dane do testów - zestawy fiszek
const mockSets: FlashcardsSetDTO[] = [
  {
    id: "set-1",
    ownerId: "user-1",
    name: "Angielski - słówka",
    status: "accepted",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "set-2",
    ownerId: "user-1",
    name: "Programowanie - JavaScript",
    status: "accepted",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "set-3",
    ownerId: "user-1",
    name: "Historia Polski",
    status: "accepted",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Przykładowe dane do testów - sugestie fiszek
let mockSuggestions: AISuggestionDTO[] = [];

// Symulacja opóźnienia sieciowego
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Symulacja generowania sugestii fiszek na podstawie tekstu
 */
export const mockGenerateSuggestions = async (
  text: string
): Promise<AISuggestionsResponseDTO> => {
  // Symulacja czasu przetwarzania
  await delay(2000);

  // Jeśli tekst jest zbyt krótki, symuluj błąd
  if (text.length < 10) {
    throw new Error(
      "Tekst jest zbyt krótki. Podaj dłuższy fragment do analizy."
    );
  }

  // Generowanie losowej liczby sugestii (2-5)
  const numSuggestions = Math.floor(Math.random() * 4) + 2;

  // Wygeneruj sugestie na podstawie tekstu
  mockSuggestions = Array.from({ length: numSuggestions }, (_, i) => ({
    id: generateId(),
    question: `Przykładowe pytanie ${i + 1} wygenerowane z tekstu: "${text.substring(0, 30)}..."`,
    answer: `Przykładowa odpowiedź ${i + 1} zawierająca istotną informację z podanego tekstu.`,
  }));

  return {
    suggestions: mockSuggestions,
  };
};

/**
 * Symulacja akceptacji sugestii
 */
export const mockAcceptSuggestion = async (
  suggestionId: string,
  flashcardsSetId: string
): Promise<FlashcardDTO> => {
  await delay(1000);

  const suggestion = mockSuggestions.find((s) => s.id === suggestionId);

  if (!suggestion) {
    throw new Error("Nie znaleziono sugestii o podanym ID");
  }

  // Tworzenie fiszki na podstawie sugestii
  const newFlashcard: FlashcardDTO = {
    id: generateId(),
    flashcardsSetId,
    question: suggestion.question,
    answer: suggestion.answer,
    source: "ai-full",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
  };

  // Usunięcie sugestii z listy (symulacja akceptacji)
  mockSuggestions = mockSuggestions.filter((s) => s.id !== suggestionId);

  return newFlashcard;
};

/**
 * Symulacja odrzucenia sugestii
 */
export const mockRejectSuggestion = async (
  suggestionId: string
): Promise<void> => {
  await delay(500);

  if (!mockSuggestions.some((s) => s.id === suggestionId)) {
    throw new Error("Nie znaleziono sugestii o podanym ID");
  }

  // Usunięcie sugestii z listy
  mockSuggestions = mockSuggestions.filter((s) => s.id !== suggestionId);
};

/**
 * Symulacja edycji sugestii
 */
export const mockEditSuggestion = async (
  suggestionId: string,
  data: { question: string; answer: string }
): Promise<AISuggestionDTO> => {
  await delay(800);

  const suggestionIndex = mockSuggestions.findIndex(
    (s) => s.id === suggestionId
  );

  if (suggestionIndex === -1) {
    throw new Error("Nie znaleziono sugestii o podanym ID");
  }

  // Aktualizacja sugestii
  const updatedSuggestion: AISuggestionDTO = {
    ...mockSuggestions[suggestionIndex],
    question: data.question,
    answer: data.answer,
  };

  mockSuggestions[suggestionIndex] = updatedSuggestion;

  return updatedSuggestion;
};

/**
 * Symulacja pobierania zestawów fiszek
 */
export const mockFetchSets = async (): Promise<FlashcardsSetDTO[]> => {
  await delay(800);

  return [...mockSets];
};

/**
 * Symulacja tworzenia nowego zestawu fiszek
 */
export const mockCreateSet = async (
  name: string
): Promise<FlashcardsSetDTO> => {
  await delay(1000);

  if (!name || name.trim().length === 0) {
    throw new Error("Nazwa zestawu nie może być pusta");
  }

  const newSet: FlashcardsSetDTO = {
    id: generateId(),
    ownerId: "user-1",
    name: name.trim(),
    status: "accepted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Dodaj nowy zestaw do listy
  mockSets.push(newSet);

  return newSet;
};
