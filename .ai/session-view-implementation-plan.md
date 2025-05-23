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

## 12. Zmiany i naprawy wprowadzone podczas implementacji

### 12.1. Struktura bazy danych
**Problem**: Brakujące kolumny i tabele w bazie danych.
**Rozwiązanie**: 
- Dodano migrację `20240320120000_add_session_cards_structure.sql` z:
  - Enum `session_card_rating` ('again', 'hard', 'good', 'easy')
  - Enum `session_status` ('in_progress', 'completed', 'abandoned')
  - Tabela `session_cards` z relacjami do sessions i flashcards
  - Brakujące kolumny w tabeli `sessions`: `status`, `ended_at`, `duration_seconds`
  - Polityki RLS i indeksy

### 12.2. SessionStarterModal - funkcjonalności zaawansowane
**Rozszerzenia**: 
- **Wyświetlanie liczby fiszek**: Badge z liczbą kart przy każdym zestawie
- **Walidacja pustych zestawów**: Ostrzeżenia i blokada gdy zestaw nie ma fiszek
- **Inteligentne limity**: Ostrzeżenia gdy limit > dostępne karty, automatyczne dostosowanie
- **API endpoints**: Dodano `/api/tags` dla listy tagów
- **Shuffle option**: Checkbox do losowego tasowania fiszek

### 12.3. Naprawy kompatybilności Next.js 15
**Problem**: `params` jest teraz Promise w Next.js 15.
**Rozwiązanie**:
```typescript
// PRZED (błędne)
const { sessionId } = params;

// PO (poprawne)  
const { sessionId } = use(params);
// + import { use } from 'react';
// + params: Promise<{sessionId: string}>
```

### 12.4. Problem z polami answer w kartach
**Problem**: API nie zwracało pola `answer`, powodując "Loading answer...".
**Rozwiązanie**:
- Dodano pole `answer` do globalnego `SessionCardDTO` w `types.ts`
- Zaktualizowano wszystkie API endpoints do zwracania `answer`
- Uproszczono `SessionContextCardDTO` do aliasu globalnego typu
- Naprawiono import w `SessionsService.ts`

### 12.5. Problem z timerem sesji
**Problem**: Timer resetował się do 00:00 przy każdym pobraniu danych.
**Rozwiązanie**:
```typescript
// PRZED (błędne)
startTime: new Date(), // Resetował za każdym razem

// PO (poprawne)
startTime: prev.cards.length === 0 ? new Date() : prev.startTime
```

### 12.6. Problem z routingiem i Supabase client
**Problemy**:
- Błędne użycie browser client w server context
- Brakująca zmienna `NEXT_PUBLIC_API_URL`
- Brakujący GET endpoint dla sesji

**Rozwiązania**:
- Zmiana na server client w API routes
- Użycie względnych URLi (`/api/...`) zamiast zmiennej środowiskowej
- Dodano `GET /api/sessions/[sessionId]` endpoint
- Naprawiono przekierowanie "Start New Session" na `/protected`

### 12.7. Shuffle algorithm
**Implementacja**: Algorytm Fisher-Yates w `SessionsService.start()`:
```typescript
if (shuffle) {
  for (let i = filteredCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
  }
}
```

### 12.8. Schema walidacji
**Uzupełnienia**:
- Dodano pole `shuffle: z.boolean().optional().default(false)` do `startSessionSchema`
- Zaktualizowano `StartSessionInput` type
- Obsługa shuffle w modal i backend

### 12.9. UX improvements
**Dodane funkcjonalności**:
- Visual feedback dla pustych zestawów (czerwone badge)
- Proactive warnings przed błędami
- Smart defaults i graceful handling błędów
- Clear error messaging z dokładnymi komunikatami

### 12.10. TypeScript fixes
**Naprawy typów**:
- Unifikacja `SessionCardDTO` vs `SessionContextCardDTO`
- Poprawne importy między lokalnymi i globalnymi typami
- Explicit typing dla mutation callbacks
- Proper Promise handling w API routes

### 12.11. Flip Card Animation
**Requirement**: Dodanie animacji przewracania karty przy kliknięciu "Show Answer".

**Implementacja 3D Flip Animation**:
- **FlashcardView refaktor**: Przeprojektowanie struktury na 3D flip card
- **Dual-sided layout**: Front (Question) i Back (Answer) jako absolutnie pozycjonowane karty
- **CSS transforms**: Użycie `rotateY(180deg)` dla 3D flip effect
- **State management**: `isFlipping` i `showBackSide` do kontroli animacji

**Tailwind Config Extensions** (`tailwind.config.ts`):
```typescript
plugins: [
  require("tailwindcss-animate"),
  function({ addUtilities }: any) {
    const newUtilities = {
      '.preserve-3d': { 'transform-style': 'preserve-3d' },
      '.perspective-1000': { 'perspective': '1000px' },
      '.backface-hidden': { 'backface-visibility': 'hidden' },
      '.rotate-y-180': { 'transform': 'rotateY(180deg)' },
    }
    addUtilities(newUtilities)
  }
]
```

**Custom CSS** (`app/globals.css`):
```css
.flashcard-content {
  font-size: 1.125rem !important; /* identyczne 18px */
  line-height: 1.75 !important;   /* identyczne leading-relaxed */
  text-align: center !important;
  font-weight: 400 !important;
}
```

**Problem: Różne rozmiary kart**:
- **Issue**: Question i Answer karty miały różne rozmiary w zależności od zawartości
- **Root cause**: Flexbox `flex-1` powodował dynamiczne rozmiary
- **Debug solution**: JavaScript debug script do analizy rzeczywistych rozmiarów DOM

**Debug Script** (`debug-flashcard.js`):
- Analiza rozmiarów kontenerów i sekcji
- Sprawdzanie custom CSS aplikacji
- Monitoring stanu animacji
- Porównanie wymiarów front vs back card

**Rozwiązanie - Stałe rozmiary**:
```typescript
// PRZED: Dynamiczne rozmiary z flex-1
<div className="flex-1 flex items-center justify-center">

// PO: Stałe rozmiary w pikselach  
<div className="h-48 flex items-center justify-center"> // 192px content
```

**Final Structure**:
- **Container**: `w-96 h-80` (384px × 320px) - stałe rozmiary
- **Header**: `h-12` (48px) - "Question"/"Answer" 
- **Content**: `h-48` (192px) - tekst z overflow scroll
- **Footer**: `h-16` (64px) - przycisk/placeholder

**Animation Timing**:
- **Duration**: 700ms transition
- **Easing**: `ease-in-out`
- **State sync**: useEffect synchronizuje `isAnswerVisible` z flip state

**Rezultat**:
- ✅ Smooth 3D flip animation
- ✅ Identyczne rozmiary kart (matematycznie potwierdzone)
- ✅ Responsywny design z stałymi proporcjami
- ✅ Overflow handling dla długich tekstów
- ✅ Perfect visual continuity podczas animacji

Taki zaktualizowany plan implementacji uwzględnia dynamiczny wybór parametrów sesji oraz opcjonalne losowe tasowanie fiszek, co pozwala lepiej dostosować proces nauki do potrzeb użytkownika. 