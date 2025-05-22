# Plan implementacji widoku Sesja Nauki (zmodyfikowany)

## 1. Przegląd
Widok Sesji Nauki umożliwia użytkownikowi interakcję z systemem powtórek interwałowych (SRS). Główne zmiany w stosunku do wcześniejszej wersji to:
- Przed rozpoczęciem sesji użytkownik dynamicznie wybiera parametry sesji (zestaw fiszek, tagi, limit) za pomocą interaktywnego modalu.
- Opcjonalnie, fiszki mogą być losowo tasowane (shuffle), co sprzyja lepszemu utrwaleniu materiału.

## 2. Routing widoku
Ścieżka: `/sessions/[sessionId]`

## 3. Struktura komponentów
Podstawowa struktura widoku sesji pozostaje bez zmian, z dodatkiem nowego komponentu do inicjowania sesji:

```
SessionPage
├── SessionProgress
├── SessionTimer
├── FlashcardView
│   ├── QuestionDisplay
│   ├── ShowAnswerButton
│   └── AnswerDisplay (warunkowy)
├── RatingButtons (warunkowe)
├── SessionSummary (warunkowy)
└── SessionStarterModal  <-- nowy komponent: modal do wyboru parametrów sesji
```

## 3.1. Struktura plików
Komponenty będą posegregowane zgodnie z podejściem feature-based:

```
features/
└── sessions/
    ├── components/
    │   ├── SessionPage.tsx
    │   ├── SessionProgress.tsx
    │   ├── SessionTimer.tsx
    │   ├── FlashcardView.tsx
    │   ├── QuestionDisplay.tsx
    │   ├── ShowAnswerButton.tsx
    │   ├── AnswerDisplay.tsx
    │   ├── RatingButtons.tsx
    │   ├── SessionSummary.tsx
    │   └── SessionStarterModal.tsx
    ├── hooks/
    │   ├── useSession.ts
    │   ├── useSessionTimer.ts
    │   └── useKeyboardShortcuts.ts
    ├── services/
    │   └── SessionService.ts
    ├── api/
    │   ├── useGetSession.tsx
    │   ├── useEvaluateCard.tsx
    │   └── useEndSession.tsx
    └── types.ts
```

Dodatkowo, komponent strony w Next.js znajduje się w:

```
app/
└── protected/
    └── sessions/
        └── [sessionId]/
            └── page.tsx
```

## 4. Szczegóły komponentów

### SessionStarterModal (nowy)
- **Opis**: Modal umożliwiający użytkownikowi dynamiczny wybór parametrów sesji przed jej rozpoczęciem.
- **Główne elementy**:
  - Pole wyboru zestawu fiszek (select lub lista dostępnych zestawów).
  - Pole wyboru tagów (opcjonalnie, np. wielokrotny wybór).
  - Input liczbowy do określenia limitu fiszek (np. 10, 20, itd.).
  - Przycisk "Rozpocznij sesję", który po zatwierdzeniu wysyła dane do API.
- **Interakcje**: Po zatwierdzeniu modal przekazuje wartości do funkcji inicjującej sesję (wywołanie POST do `/api/sessions` z obiektem: `{ flashcardsSetId, tags, limit }`).

### SessionPage
- **Opis**: Główny komponent sterujący procesem sesji. Pobiera dane sesji, zarządza stanem oraz renderuje komponenty potomne.
- **Zmiany**: Dodanie mechanizmu inicjowania sesji na podstawie danych z modalu oraz opcjonalne losowe tasowanie fiszek (shuffle) przed rozpoczęciem prezentacji.

### Pozostałe komponenty
Komponenty:
- SessionProgress, SessionTimer, FlashcardView, QuestionDisplay, ShowAnswerButton, AnswerDisplay, RatingButtons, SessionSummary
pozostają zasadniczo bez zmian, z możliwością wyświetlania dodatkowych informacji (np. wybrany limit, tagi) w podsumowaniu sesji.

## 5. Typy i schematy walidacji
- Aktualizacja typu `StartSessionInput`:
  ```typescript
  interface StartSessionInput {
    flashcardsSetId: string;
    tags: string[];
    limit: number;
  }
  ```
- Dodanie walidacji w formularzu modalu, aby upewnić się, że wszystkie wymagane pola są wypełnione.

## 6. Integracja z API
- **Endpoint tworzenia sesji**:
  - Żądanie POST do `/api/sessions` przyjmuje obiekt `{ flashcardsSetId, tags, limit }`.
- **Logika wyboru fiszek**:
  - Backend dobiera fiszki na podstawie przesłanych parametrów.
  - Opcjonalnie, przed wysłaniem odpowiedzi, fiszki mogą być mieszane (shuffle) – decyzja ta może być podejmowana po stronie backendu lub na frontendzie po otrzymaniu listy fiszek.

## 7. Implementacja logiki komponentów
- **SessionStarterModal**:
  - Implementacja interfejsu umożliwiającego dynamiczny wybór parametrów sesji.
  - Integracja z funkcją rozpoczynania sesji – po zatwierdzeniu modal wysyła dane do API.
- **Losowe tasowanie fiszek**:
  - Implementacja mechanizmu (np. algorytm Fishera-Yates) w hooku `useSession` lub bezpośrednio w komponencie `SessionPage` w celu opcjonalnego przetasowania tablicy fiszek.
- Pozostałe funkcjonalności (pokazywanie/ukrywanie odpowiedzi, ocena fiszek, obsługa timera) pozostają zgodnie z poprzednim planem.

## 8. Integracja z React Query
- Używanie `useQuery` do pobierania danych sesji oraz `useMutation` do oceny fiszek i zakończenia sesji.
- Wywołanie POST do `/api/sessions` musi wysyłać dane uzyskane dynamicznie z modalu.

## 9. Interakcje użytkownika
1. **Rozpoczęcie sesji**:
   - Użytkownik klika przycisk „Start Session”, otwierając `SessionStarterModal`.
   - Użytkownik wybiera zestaw fiszek, tagi oraz limit (oraz opcjonalnie opcję losowego tasowania).
   - Po zatwierdzeniu modal inicjuje żądanie do API w celu utworzenia sesji.
2. **Przebieg sesji**:
   - Po otrzymaniu danych (lista fiszek) – fiszki mogą być opcjonalnie przetasowane.
   - Sesja przebiega standardowo poprzez wyświetlanie fiszek, opcję pokazania odpowiedzi oraz oceniania.
3. **Zakończenie sesji**:
   - Po ostatniej fiszce sesja jest zakończona, a użytkownik widzi podsumowanie zawierające m.in. wybrany limit, tagi, czas trwania oraz inne statystyki.

## 10. Obsługa błędów
- **Walidacja danych**: Formularz w modalu wymusza wprowadzenie wszystkich wymaganych pól (`flashcardsSetId`, `tags`, `limit`).
- **Błędy API**: W przypadku błędów (np. niewłaściwe dane, utrata połączenia) system wyświetla odpowiednie komunikaty (np. toast) i umożliwia ponowną próbę.

## 11. Kroki implementacji
1. **Konfiguracja struktury plików**
   - Utworzenie katalogu `features/sessions` oraz dodanie nowego komponentu `SessionStarterModal.tsx`.
   - Uaktualnienie struktury plików zgodnie z nowym podziałem.
2. **Konfiguracja typów i schematów walidacji**
   - Aktualizacja typu `StartSessionInput` oraz dodanie klientowej walidacji formularza w modalu.
3. **Implementacja komponentów**
   - Implementacja szkieletu komponentów: `SessionPage`, `SessionProgress`, `SessionTimer`, `FlashcardView`, `QuestionDisplay`, `ShowAnswerButton`, `AnswerDisplay`, `RatingButtons`, `SessionSummary` oraz nowego `SessionStarterModal`.
4. **Implementacja hooków zarządzania stanem**
   - Rozszerzenie hooka `useSession` o obsługę losowego tasowania fiszek oraz inicjację sesji na podstawie danych z modalu.
5. **Integracja z API**
   - Weryfikacja endpointów (`fetchSession`, `evaluateCard`, `endSession`) aby przyjmowały aktualny obiekt danych sesji.
   - Implementacja mechanizmu przetwarzania danych sesji (opcjonalne shuffle fiszek).
6. **Implementacja logiki interakcji**
   - Logika pokazywania/ukrywania odpowiedzi, oceny fiszek, przejść między fiszkami, obsługa timera oraz komunikacja z API.
7. **Obsługa błędów**
   - Walidacja danych w formularzu modalu, obsługa błędów API oraz przypadków brzegowych.
8. **Implementacja podsumowania sesji**
   - Implementacja `SessionSummary` z prezentacją statystyk sesji i wybranych parametrów (limit, tagi, czas trwania).
9. **Testowanie i optymalizacja**
   - Testowanie funkcjonalności dynamicznego wyboru parametrów sesji i losowego tasowania fiszek.
   - Optymalizacja wydajności oraz weryfikacja responsywności i dostępności.
10. **Refaktoryzacja i dokumentacja**
    - Ostateczna refaktoryzacja kodu, aktualizacja dokumentacji (README, komentarze) oraz weryfikacja kompletności wdrożenia.

Taki zaktualizowany plan implementacji uwzględnia dynamiczny wybór parametrów sesji oraz opcjonalne losowe tasowanie fiszek, co pozwala lepiej dostosować proces nauki do potrzeb użytkownika. 