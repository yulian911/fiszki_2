# Plan implementacji widoku Generowania Fiszek AI

## 1. Przegląd

Modal do generowania fiszek z wykorzystaniem AI. Użytkownik może wkleić tekst (do 1000 znaków), który zostanie przeanalizowany przez sztuczną inteligencję. AI generuje propozycje fiszek w formacie pytanie-odpowiedź, które użytkownik może zaakceptować, edytować lub odrzucić.

## 2. Routing widoku

Widok będzie dostępny jako modal, który może być wywoływany z różnych miejsc aplikacji, w szczególności:

- Z poziomu szczegółów zestawu fiszek (`/sets/[setId]`)
- Z dashboardu (`/`)
- Z dedykowanego przycisku "Utwórz fiszkę > Generuj AI" w nawigacji

## 3. Struktura komponentów

```
AIFlashcardGeneratorDialog
├── TextGenerationForm
│   ├── Textarea (limit 1000 znaków)
│   └── Button "Generuj"
├── LoadingSpinner (gdy status="generating")
└── SuggestionsList
    └── SuggestionCard (dla każdej sugestii)
        ├── QuestionDisplay
        ├── AnswerDisplay
        └── SuggestionActions
            ├── Button "Zaakceptuj"
            ├── Button "Edytuj"
            └── Button "Odrzuć"
    └── EditSuggestionForm (pojawia się po kliknięciu "Edytuj")
    └── SelectFlashcardsSetForm (pojawia się po kliknięciu "Zaakceptuj")
```

## 4. Szczegóły komponentów

### AIFlashcardGeneratorDialog

- Opis komponentu: Główny kontener modalny, który koordynuje cały proces generowania fiszek przez AI
- Główne elementy: Dialog (Shadcn), zawierający nagłówek, TextGenerationForm, stan ładowania, listę sugestii i przycisk zamknięcia
- Obsługiwane interakcje: Otwieranie/zamykanie modalu
- Obsługiwana walidacja: Brak (delegowana do komponentów potomnych)
- Typy: `useFlashcardSuggestions` hook, `GenerationState`
- Propsy:
  - `isOpen: boolean` - czy modal jest otwarty
  - `onOpenChange: (open: boolean) => void` - handler zmiany stanu otwarcia
  - `defaultSetId?: string` - opcjonalne ID domyślnego zestawu fiszek

### TextGenerationForm

- Opis komponentu: Formularz z polem tekstowym do wprowadzenia źródłowego tekstu do analizy przez AI
- Główne elementy: Form (Shadcn), Textarea z licznikiem znaków, Button "Generuj"
- Obsługiwane interakcje: Wprowadzanie tekstu, submisja formularza
- Obsługiwana walidacja:
  - Tekst nie może być pusty
  - Tekst nie może przekraczać 1000 znaków
  - Walidacja za pomocą Zod
- Typy: `GenerateSuggestionsCommand`
- Propsy:
  - `onSubmit: (text: string) => Promise<void>` - handler submisji formularza
  - `isLoading: boolean` - czy trwa ładowanie (blokuje formularz)

### LoadingSpinner

- Opis komponentu: Wskaźnik ładowania wyświetlany podczas generowania sugestii przez AI
- Główne elementy: Spinner (animacja), tekst informacyjny
- Obsługiwane interakcje: Brak
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy:
  - `message?: string` - opcjonalny komunikat wyświetlany obok spinnera

### SuggestionsList

- Opis komponentu: Lista wygenerowanych sugestii fiszek
- Główne elementy: List, SuggestionCard dla każdej sugestii
- Obsługiwane interakcje: Brak (delegowane do komponentów potomnych)
- Obsługiwana walidacja: Brak
- Typy: `AISuggestionDTO[]`
- Propsy:
  - `suggestions: AISuggestionDTO[]` - lista sugestii do wyświetlenia
  - `onAccept: (id: string, setId: string) => Promise<void>` - handler akceptacji
  - `onReject: (id: string) => Promise<void>` - handler odrzucenia
  - `onEdit: (id: string, data: EditSuggestionCommand) => Promise<void>` - handler edycji

### SuggestionCard

- Opis komponentu: Karta wyświetlająca pojedynczą sugestię fiszki
- Główne elementy: Card (Shadcn), QuestionDisplay, AnswerDisplay, SuggestionActions
- Obsługiwane interakcje: Brak (delegowane do komponentów potomnych)
- Obsługiwana walidacja: Brak
- Typy: `AISuggestionDTO`
- Propsy:
  - `suggestion: AISuggestionDTO` - sugestia do wyświetlenia
  - `onAccept: (id: string, setId: string) => Promise<void>` - handler akceptacji
  - `onReject: (id: string) => Promise<void>` - handler odrzucenia
  - `onEdit: (id: string, data: EditSuggestionCommand) => Promise<void>` - handler edycji

### SuggestionActions

- Opis komponentu: Przyciski akcji dla pojedynczej sugestii
- Główne elementy: ButtonGroup (Shadcn) z przyciskami "Zaakceptuj", "Edytuj", "Odrzuć"
- Obsługiwane interakcje: Kliknięcie każdego z przycisków
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy:
  - `suggestionId: string` - ID sugestii, dla której są przyciski
  - `onAcceptClick: (id: string) => void` - handler kliknięcia "Zaakceptuj"
  - `onEditClick: (id: string) => void` - handler kliknięcia "Edytuj"
  - `onRejectClick: (id: string) => void` - handler kliknięcia "Odrzuć"
  - `isLoading?: boolean` - czy trwa przetwarzanie akcji

### EditSuggestionForm

- Opis komponentu: Formularz edycji istniejącej sugestii
- Główne elementy: Form, Input (pytanie), Textarea (odpowiedź), przyciski "Zapisz" i "Anuluj"
- Obsługiwane interakcje: Edycja pól, submisja formularza, anulowanie edycji
- Obsługiwana walidacja:
  - Pola pytania i odpowiedzi nie mogą być puste
  - Walidacja za pomocą Zod
- Typy: `AISuggestionDTO`, `EditSuggestionCommand`
- Propsy:
  - `suggestion: AISuggestionDTO` - sugestia do edycji
  - `onSubmit: (id: string, data: EditSuggestionCommand) => Promise<void>` - handler submisji
  - `onCancel: () => void` - handler anulowania edycji
  - `isLoading?: boolean` - czy trwa przetwarzanie

### SelectFlashcardsSetForm

- Opis komponentu: Formularz wyboru zestawu fiszek przy akceptacji sugestii
- Główne elementy: Form, Select z opcjami zestawów, przyciski "Akceptuj" i "Anuluj"
- Obsługiwane interakcje: Wybór zestawu, submisja formularza, anulowanie
- Obsługiwana walidacja:
  - Wybrany zestaw jest wymagany
  - Walidacja za pomocą Zod
- Typy: `FlashcardsSetDTO[]`, `AcceptSuggestionCommand`, `FlashcardsSetOption`
- Propsy:
  - `suggestionId: string` - ID akceptowanej sugestii
  - `sets: FlashcardsSetOption[]` - dostępne zestawy fiszek
  - `defaultSetId?: string` - opcjonalne domyślne ID zestawu
  - `onSubmit: (id: string, setId: string) => Promise<void>` - handler submisji
  - `onCancel: () => void` - handler anulowania
  - `isLoading?: boolean` - czy trwa przetwarzanie

## 5. Typy

### GenerationState

```typescript
type GenerationStatus = "idle" | "generating" | "completed" | "error";

interface GenerationState {
  status: GenerationStatus;
  text: string;
  error?: string;
  suggestions: AISuggestionDTO[];
}
```

### EditState

```typescript
interface EditState {
  isEditing: boolean;
  currentSuggestionId: string | null;
  question: string;
  answer: string;
}
```

### AcceptState

```typescript
interface AcceptState {
  isSelecting: boolean;
  currentSuggestionId: string | null;
  selectedSetId: string | null;
}
```

### FlashcardsSetOption

```typescript
interface FlashcardsSetOption {
  value: string; // id zestawu
  label: string; // nazwa zestawu
}
```

### GenerateSuggestionsFormSchema

```typescript
const generateSuggestionsFormSchema = z.object({
  text: z
    .string()
    .min(1, "Tekst jest wymagany")
    .max(1000, "Tekst nie może przekraczać 1000 znaków"),
});

type GenerateSuggestionsFormValues = z.infer<
  typeof generateSuggestionsFormSchema
>;
```

### EditSuggestionFormSchema

```typescript
const editSuggestionFormSchema = z.object({
  question: z.string().min(1, "Pytanie jest wymagane"),
  answer: z.string().min(1, "Odpowiedź jest wymagana"),
});

type EditSuggestionFormValues = z.infer<typeof editSuggestionFormSchema>;
```

### SelectSetFormSchema

```typescript
const selectSetFormSchema = z.object({
  flashcardsSetId: z.string().min(1, "Wybór zestawu jest wymagany"),
});

type SelectSetFormValues = z.infer<typeof selectSetFormSchema>;
```

## 6. Zarządzanie stanem

Główny stan będzie zarządzany przez customowy hook `useFlashcardSuggestions`:

```typescript
function useFlashcardSuggestions() {
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

  const handleSubmitText = async (text: string) => {
    // Logika generowania sugestii
  };

  const handleAcceptSuggestion = async (
    suggestionId: string,
    flashcardsSetId: string
  ) => {
    // Logika akceptacji sugestii
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    // Logika odrzucenia sugestii
  };

  const handleEditSuggestion = (suggestionId: string) => {
    // Logika rozpoczęcia edycji
  };

  const handleSaveEdit = async (
    suggestionId: string,
    data: EditSuggestionCommand
  ) => {
    // Logika zapisania edycji
  };

  // pozostałe handlery...

  return {
    generationState,
    editState,
    acceptState,
    handleSubmitText,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleEditSuggestion,
    handleSaveEdit,
    // pozostałe metody...
  };
}
```

Dodatkowo, dla pobierania zestawów fiszek użytkownika, wykorzystamy hook `useFlashcardSets`:

```typescript
function useFlashcardSets() {
  const [sets, setSets] = useState<FlashcardsSetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Logika pobierania zestawów
  }, []);

  return { sets, isLoading, error };
}
```

## 7. Integracja API

### Generowanie sugestii

```typescript
const generateSuggestions = async (
  text: string
): Promise<AISuggestionsResponseDTO> => {
  const response = await fetch("/flashcards-suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Nie udało się wygenerować sugestii");
  }

  return response.json();
};
```

### Akceptacja sugestii

```typescript
const acceptSuggestion = async (
  suggestionId: string,
  flashcardsSetId: string
): Promise<FlashcardDTO> => {
  const response = await fetch(
    `/flashcards-suggestions/${suggestionId}/accept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ flashcardsSetId }),
    }
  );

  if (!response.ok) {
    throw new Error("Nie udało się zaakceptować sugestii");
  }

  return response.json();
};
```

### Odrzucenie sugestii

```typescript
const rejectSuggestion = async (suggestionId: string): Promise<void> => {
  const response = await fetch(
    `/flashcards-suggestions/${suggestionId}/reject`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Nie udało się odrzucić sugestii");
  }
};
```

### Edycja sugestii

```typescript
const editSuggestion = async (
  suggestionId: string,
  data: EditSuggestionCommand
): Promise<AISuggestionDTO> => {
  const response = await fetch(`/flashcards-suggestions/${suggestionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Nie udało się edytować sugestii");
  }

  return response.json();
};
```

### Pobieranie zestawów fiszek

```typescript
const fetchFlashcardsSets = async (): Promise<FlashcardsSetDTO[]> => {
  const response = await fetch("/flashcards-sets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Nie udało się pobrać zestawów fiszek");
  }

  return response.json();
};
```

## 8. Interakcje użytkownika

1. **Wklejanie tekstu i generowanie sugestii**

   - Użytkownik wkleja tekst źródłowy w pole tekstowe
   - System weryfikuje, czy tekst nie przekracza 1000 znaków (licznik)
   - Po kliknięciu "Generuj", system wysyła tekst do API
   - Podczas generowania wyświetlany jest LoadingSpinner
   - Po wygenerowaniu, sugestie pojawiają się na liście

2. **Akceptacja sugestii**

   - Użytkownik klika "Zaakceptuj" przy wybranej sugestii
   - System wyświetla SelectFlashcardsSetForm
   - Użytkownik wybiera zestaw fiszek z listy
   - Po kliknięciu "Akceptuj", system wysyła żądanie do API
   - Zaakceptowana sugestia znika z listy
   - System wyświetla powiadomienie o sukcesie

3. **Edycja sugestii**

   - Użytkownik klika "Edytuj" przy wybranej sugestii
   - System wyświetla EditSuggestionForm z pytaniem i odpowiedzią
   - Użytkownik modyfikuje treść
   - Po kliknięciu "Zapisz", system waliduje dane i wysyła do API
   - Edytowana sugestia jest aktualizowana na liście

4. **Odrzucanie sugestii**
   - Użytkownik klika "Odrzuć" przy wybranej sugestii
   - System wysyła żądanie do API
   - Odrzucona sugestia znika z listy

## 9. Warunki i walidacja

### Walidacja tekstu źródłowego

- **Komponent**: TextGenerationForm
- **Warunki**:
  - Tekst nie może być pusty
  - Tekst nie może przekraczać 1000 znaków
- **Wpływ na interfejs**:
  - Pole tekstowe pokazuje licznik pozostałych znaków
  - Przycisk "Generuj" jest wyłączony, gdy tekst jest pusty
  - Komunikat błędu pojawia się, gdy tekst przekracza limit

### Walidacja edycji sugestii

- **Komponent**: EditSuggestionForm
- **Warunki**:
  - Pytanie nie może być puste
  - Odpowiedź nie może być pusta
- **Wpływ na interfejs**:
  - Komunikaty błędu pojawiają się pod odpowiednimi polami
  - Przycisk "Zapisz" jest wyłączony, gdy formularz jest niepoprawny

### Walidacja wyboru zestawu fiszek

- **Komponent**: SelectFlashcardsSetForm
- **Warunki**:
  - Zestaw fiszek musi zostać wybrany
- **Wpływ na interfejs**:
  - Komunikat błędu pojawia się pod polem wyboru
  - Przycisk "Akceptuj" jest wyłączony, gdy nie wybrano zestawu

### Walidacja stanu generowania

- **Komponent**: AIFlashcardGeneratorDialog
- **Warunki**:
  - Generowanie może być w trakcie (status="generating")
  - Brak sugestii po generowaniu (pusta lista)
- **Wpływ na interfejs**:
  - LoadingSpinner jest wyświetlany podczas generowania
  - Komunikat "Brak sugestii" jest wyświetlany, gdy lista jest pusta po generowaniu
  - Przycisk "Generuj ponownie" pojawia się, gdy generowanie zakończyło się bez sugestii

## 10. Obsługa błędów

### Błąd podczas generowania sugestii

- **Przyczyna**: Błąd API, przekroczenie limitów, problem z siecią
- **Obsługa**:
  - Toast z komunikatem błędu
  - Status generowania zmienia się na "error"
  - Wyświetlenie komunikatu błędu w interfejsie
  - Przycisk "Spróbuj ponownie" do ponownego uruchomienia generowania

### Błąd podczas akceptowania sugestii

- **Przyczyna**: Błąd API, problem z siecią, sugestia została już usunięta
- **Obsługa**:
  - Toast z komunikatem błędu
  - Ponowne ładowanie listy sugestii
  - Zamknięcie formularza wyboru zestawu

### Błąd podczas odrzucania sugestii

- **Przyczyna**: Błąd API, problem z siecią, sugestia została już usunięta
- **Obsługa**:
  - Toast z komunikatem błędu
  - Ponowne ładowanie listy sugestii

### Błąd podczas edycji sugestii

- **Przyczyna**: Błąd API, problem z siecią, sugestia została już usunięta
- **Obsługa**:
  - Toast z komunikatem błędu
  - Zachowanie formularza edycji z wprowadzonymi danymi
  - Możliwość ponownej próby wysłania edycji

### Błąd podczas pobierania zestawów fiszek

- **Przyczyna**: Błąd API, problem z siecią
- **Obsługa**:
  - Toast z komunikatem błędu
  - Przycisk "Odśwież" do ponownego pobrania zestawów
  - Domyślna opcja "Utwórz nowy zestaw" w formularzu wyboru zestawu

## 11. Kroki implementacji

1. **Przygotowanie struktury plików**

   - Utwórz foldery dla komponentów i hooks
   - Zdefiniuj typy i interfejsy

2. **Implementacja customowego hooka**

   - Zaimplementuj `useFlashcardSuggestions`
   - Zaimplementuj `useFlashcardSets`
   - Dodaj funkcje API dla operacji CRUD na sugestiach

3. **Implementacja komponentów**

   - Zaimplementuj AIFlashcardGeneratorDialog (container)
   - Zaimplementuj TextGenerationForm z walidacją Zod
   - Zaimplementuj LoadingSpinner
   - Zaimplementuj SuggestionsList
   - Zaimplementuj SuggestionCard i podkomponenty
   - Zaimplementuj EditSuggestionForm z walidacją Zod
   - Zaimplementuj SelectFlashcardsSetForm z walidacją Zod

4. **Integracja z API**

   - Dodaj funkcje łączące się z endpointami
   - Zaimplementuj obsługę asynchonicznych żądań i odpowiedzi
   - Dodaj obsługę błędów API

5. **Implementacja walidacji**

   - Dodaj schematy walidacji Zod dla wszystkich formularzy
   - Zaimplementuj wyświetlanie błędów walidacji
   - Dodaj dezaktywację przycisków dla niepoprawnych formularzy

6. **Implementacja obsługi błędów**

   - Dodaj system powiadomień (toasty)
   - Zaimplementuj obsługę błędów API
   - Dodaj mechanizmy ponowienia operacji

7. **Integracja z resztą aplikacji**

   - Dodaj wywołanie modalu z odpowiednich miejsc w aplikacji
   - Dodaj przekazywanie kontekstu (np. aktualnego zestawu fiszek)
   - Dodaj odświeżanie danych po udanej operacji

8. **Testowanie**

   - Stwórz testy jednostkowe dla komponentów
   - Stwórz testy integracyjne dla interakcji użytkownika
   - Przetestuj obsługę błędów i przypadki brzegowe

9. **Optymalizacja**

   - Dodaj memoizację komponentów dla poprawy wydajności
   - Zoptymalizuj renderowanie listy sugestii
   - Dodaj skeleton loaders dla poprawy UX

10. **Dokumentacja**
    - Uzupełnij dokumentację komponentów
    - Dodaj komentarze do kluczowych fragmentów kodu
    - Zaktualizuj dokumentację API (jeśli potrzebne)
