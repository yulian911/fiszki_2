# Plan implementacji widoku: Zestawy Fiszki (Zgodny z implementacją)

## 1. Przegląd

Aplikacja zawiera dwa główne widoki do zarządzania zestawami fiszek:

- **Lista Zestawów (`/protected/sets`):** Umożliwia użytkownikom przeglądanie, tworzenie, edytowanie, usuwanie, klonowanie i udostępnianie swoich zestawów fiszek. Obsługuje również widok zestawów udostępnionych przez innych użytkowników.
- **Szczegóły Zestawu (`/protected/sets/[setId]`):** Pozwala na zarządzanie poszczególnymi fiszkami w ramach wybranego zestawu, w tym dodawanie (ręczne i z pomocą AI), edycję i usuwanie fiszek.

Oba widoki są ze sobą zintegrowane i korzystają ze wspólnych komponentów, hooków i usług.

## 2. Struktura komponentów i plików

Logika biznesowa i komponenty UI są zorganizowane w podejściu "feature-sliced" w katalogu `features/flashcard-sets`.

```
/app
├── /protected
│   ├── /sets
│   │   ├── page.tsx (Widok listy zestawów)
│   │   └── /[setId]
│   │       └── page.tsx (Widok szczegółów zestawu)
/features
├── /flashcard-sets
│   ├── /api (Hooki React Query do komunikacji z API)
│   │   ├── useGetFlashcardSets.tsx
│   │   ├── useMutateFlashcardSets.tsx
│   │   ├── useGetFlashcardSetById.tsx
│   │   ├── useCloneFlashcardSet.tsx
│   │   ├── useShareSet.tsx
│   │   ├── useGetFlashcards.tsx
│   │   ├── useMutateFlashcards.tsx
│   │   └── useGenerateFlashcardsSuggestions.tsx
│   ├── /components (Komponenty UI)
│   │   ├── FlashcardsSetTableComponent.tsx
│   │   ├── FilterControlsComponent.tsx
│   │   ├── PaginationControlsComponent.tsx
│   │   ├── CreateSetFormComponent.tsx
│   │   ├── EditSetFormComponent.tsx
│   │   ├── ConfirmDeleteModalComponent.tsx
│   │   ├── ShareSetModalComponent.tsx
│   │   ├── SetDetailsHeader.tsx
│   │   ├── ActionsButtonsGroup.tsx
│   │   ├── FlashcardsListView.tsx
│   │   ├── FlashcardsListFilters.tsx
│   │   ├── BreadcrumbNavigation.tsx
│   │   └── ... (pozostałe komponenty)
│   ├── /hooks (Hooki do zarządzania stanem UI)
│   │   ├── useFlashcardSetFilters.ts
│   │   ├── useEditModal.tsx (zarządza modalami create/edit przez URL)
│   │   ├── useFlashcardModal.tsx (zarządza modalami dla fiszek przez URL)
│   │   ├── useFlashcardFilters.ts
│   │   └── ... (pozostałe hooki)
│   └── /types.ts (Definicje typów TypeScript)
```

## 3. Widok: Lista Zestawów Fiszki (`/protected/sets`)

### 3.1. Opis

Główny widok do zarządzania zestawami. Użytkownik widzi tabelę ze swoimi zestawami i ma możliwość filtrowania, sortowania i paginacji, a także przeglądania zestawów udostępnionych.

### 3.2. Kluczowe komponenty

- **`FlashcardsSetsListViewPage` (`page.tsx`):** Główny kontener widoku.
- **`FilterControlsComponent`:** Panel z filtrami (wyszukiwanie po nazwie, status) oraz przyciskami do przełączania widoku: "Wszystkie", "Moje zestawy", "Udostępnione dla mnie".
- **`FlashcardsSetTableComponent`:** Tabela wyświetlająca zestawy z akcjami. Tabela:
  - **Wyświetla kolumnę "Właściciel"** (pokazując "Ja" lub e-mail osoby udostępniającej).
  - **Dynamicznie pokazuje akcje w zależności od `accessLevel`:**
    - Dla zestawów własnych (`owner`): Edytuj, Usuń, Klonuj, Udostępnij.
    - Dla zestawów udostępnionych: **tylko akcja "Ucz się" (`onLearn`).** W aktualnej implementacji brakuje akcji "Zapisz kopię u siebie".
- **`PaginationControlsComponent`:** Nawigacja między stronami.
- **`EmptyStateSetsComponent`:** Wyświetlany, gdy brak zestawów (również z uwzględnieniem filtrów "Udostępnione dla mnie").
- **Modale (`Dialog` z shadcn/ui):**
  - Modal potwierdzenia usunięcia (`ConfirmDeleteModalComponent`) jest renderowany w `page.tsx` i zarządzany lokalnym stanem.
  - Modal udostępniania (`ShareSetModalComponent`) jest renderowany w `page.tsx` i zarządzany lokalnym stanem.
  - Modal tworzenia/edycji jest obsługiwany przez `OpenEditDeleteFlashcardSetModal` i parametry URL.

### 3.3. Zarządzanie stanem i danymi

- **Filtry w URL:** Hook `useFlashcardSetFilters` zarządza stanem filtrów (strona, limit, sortowanie, status, nazwa, widok) w parametrach URL przy użyciu biblioteki `nuqs`. Posiada parametr `view` (`all` | `owned` | `shared`).
- **Pobieranie danych:** Hook `useGetFlashcardsSets` (React Query) pobiera dane z API `GET /api/flashcards-sets`, przekazując aktualne filtry. Odpowiedź z API zawiera pole `accessLevel` (`owner` | `learner`), które jest wykorzystywane do renderowania warunkowego.
- **Mutacje danych:**
  - `useMutateFlashcardSets` obsługuje tworzenie, edycję i usuwanie **własnych** zestawów.
  - `useCloneFlashcardSet` obsługuje klonowanie **własnych** zestawów.
- **Obsługa modali:**
  - Tworzenie/edycja: `useEditModal` (`/hooks/useEditModal.tsx`) otwiera globalny modal przez zmianę parametrów URL.
  - Usuwanie/udostępnianie: Komponent `page.tsx` zarządza lokalnym stanem (`useState`), który kontroluje widoczność odpowiednich modali opakowanych w komponent `Dialog`.

## 4. Widok: Szczegóły Zestawu Fiszki (`/protected/sets/[setId]`)

### 4.1. Opis

Widok szczegółowy pojedynczego zestawu, koncentrujący się na zarządzaniu fiszkami. **Uwaga: W aktualnej implementacji brakuje rozróżnienia na widok dla właściciela i osoby z dostępem do nauki. Akcje edycji i usuwania są widoczne dla wszystkich, co jest błędem.**

### 4.2. Kluczowe komponenty

- **`FlashcardsSetDetailsPage` (`page.tsx`):** Główny kontener widoku.
- **`BreadcrumbNavigation`:** Ścieżka powrotu do listy zestawów.
- **`SetDetailsHeader`:** Wyświetla nazwę, status i przyciski akcji dla całego zestawu. **Błąd: Komponent nie sprawdza `accessLevel` i zawsze wyświetla przyciski "Edytuj zestaw" i "Usuń zestaw". Funkcja usuwania jest niezaimplementowana.**
- **`ActionsButtonsGroup`:** Przyciski "Dodaj fiszkę", "Generuj fiszki AI", "Udostępnij". **Błąd: Komponent nie sprawdza `accessLevel` i nie implementuje funkcji "Wyślij kopię".**
- **`FlashcardsListFilters`:** Filtry dla listy fiszek (wyszukiwanie, sortowanie).
- **`FlashcardsListView`:** Lista fiszek z opcjami edycji/usunięcia. Obsługuje również stan pusty, gdy w zestawie nie ma fiszek.
- **`OpenFlashcardModals`:** Komponent zarządzający otwieraniem modali dla fiszek (dodawanie, edycja, usuwanie, generowanie AI) w oparciu o parametry URL.

### 4.3. Zarządzanie stanem i danymi

- **Dane zestawu:** Hook `useGetFlashcardSetById` pobiera szczegóły aktualnego zestawu.
- **Filtry fiszek w URL:** Hook `useFlashcardFilters` zarządza stanem filtrów listy fiszek w parametrach URL.
- **Pobieranie fiszek:** Hook `useGetFlashcards` pobiera listę fiszek dla danego zestawu, uwzględniając filtry.
- **Mutacje na fiszkach:** Hook `useMutateFlashcards` obsługuje operacje CRUD na fiszkach.
- **Generowanie AI:** Hook `useGenerateFlashcardsSuggestions` wywołuje API do generowania propozycji fiszek.
- **Obsługa modali:** Hook `useFlashcardModal` zarządza otwieraniem odpowiednich modali poprzez parametry URL, które są odczytywane przez komponent `OpenFlashcardModals`.

## 5. Wspólne mechanizmy i typy

### 5.1. Typy

Kluczowe typy są zdefiniowane w `features/flashcard-sets/types.ts`, `features/schemas` oraz globalnie w `types.ts`. Główne z nich to:

- `FlashcardsSetDTO`: Podstawowy obiekt transferu danych dla zestawu.
- `FlashcardsSetFiltersViewModel`: Model widoku dla filtrów listy zestawów.
- `FlashcardDTO`: Obiekt transferu danych dla pojedynczej fiszki, używa pól `question` i `answer`.

### 5.2. Zarządzanie stanem globalnym (modale)

Aplikacja wykorzystuje mieszane podejście do zarządzania stanem modali:

- **Parametry URL** są głównym źródłem prawdy dla modali związanych z tworzeniem i edycją (zarówno zestawów, jak i fiszek). Dedykowane hooki (`useEditModal`, `useFlashcardModal`) upraszczają operacje na tych parametrach.
- **Lokalny stan React (`useState`)** jest używany w `page.tsx` listy zestawów do kontrolowania widoczności modali usuwania i udostępniania.

To podejście zapewnia:

- Możliwość linkowania do konkretnej akcji (np. edycji zestawu).
- Poprawne działanie przycisków "wstecz"/"dalej" w przeglądarce dla akcji opartych na URL.

### 5.3. Interakcje z API

Wszystkie interakcje z backendem są zamknięte w dedykowanych hookach React Query w katalogu `features/flashcard-sets/api`. Zapewnia to:

- **Centralizację logiki zapytań**.
- **Automatyczne cachowanie, odświeżanie i unieważnianie danych**.
- **Przejrzystą obsługę stanów ładowania i błędów w komponentach**.
- **Zgodność z `flashcards-sets-api-plan.md`.**

## 6. Obsługa błędów i stanów

- **Stany ładowania:** Komponenty wyświetlają animacje ładowania lub tzw. "skeletony" podczas pobierania danych.
- **Stany puste / Brak wyników:** Dedykowane komunikaty i komponenty (`EmptyStateSetsComponent`) są wyświetlane, gdy brakuje danych lub wyników filtrowania.
- **Błędy API:** Komunikaty o błędach są wyświetlane użytkownikowi, często z opcją ponowienia operacji.
- **Walidacja:** Formularze wykorzystują Zod do walidacji danych po stronie klienta.

### `SetDetailsHeader`

- **Opis komponentu**: Wyświetla szczegółowe informacje o zestawie i przyciski zarządzania.
- **Główne elementy**: Nazwa zestawu, status, liczba fiszek, data utworzenia, przyciski akcji.
- **Obsługiwane interakcje**:
  - Kliknięcie "Edytuj zestaw" -> otwiera modal edycji zestawu (`useEditModal`).
  - Kliknięcie "Usuń zestaw" -> wywołuje niezaimplementowaną funkcję (`console.log`).
- **Błąd implementacyjny:** Komponent nie sprawdza uprawnień (`accessLevel`) i zawsze renderuje przyciski akcji, nawet dla zestawów udostępnionych.

### `ActionsButtonsGroup`

- **Opis komponentu**: Grupa przycisków do wykonywania akcji na fiszkach w ramach zestawu.
- **Główne elementy**: Przyciski "Dodaj fiszkę", "Generuj fiszki AI", "Udostępnij".
- **Obsługiwane interakcje**:
  - Kliknięcie "Dodaj fiszkę" -> otwiera modal `AddFlashcardManuallyModal` (przez `useFlashcardModal`).
  - Kliknięcie "Generuj z AI" -> otwiera modal `GenerateFlashcardsAIModal` (przez `useFlashcardModal`).
  - Kliknięcie "Udostępnij" -> otwiera modal `ShareSetModal` (przez `useFlashcardModal`).
- **Brakujące funkcje:** W komponencie brakuje przycisku "Wyślij kopię" oraz logiki warunkowej opartej na `accessLevel`.

### `FlashcardsListFilters`

- **Opis komponentu**: Zawiera kontrolki do filtrowania i sortowania listy fiszek.
- **Główne elementy**: Input do wyszukiwania, select sortowania.
- **Obsługiwane interakcje**:
  - Wyszukiwanie fiszek z debounce
  - Zmiana sortowania
- **Integracja API**: Wykorzystuje API generacji fiszek z AI.

### `FlashcardsListView`

- **Opis komponentu**: Wyświetla listę fiszek w wybranym zestawie z opcjami zarządzania. Wewnętrznie obsługuje stan pusty, gdy brak fiszek.
- **Główne elementy**: Karty lub wiersze tabeli z fiszkami, przyciski akcji.
- **Obsługiwane interakcje**:
  - Wyświetlanie/ukrywanie tylnej strony fiszki
  - Kliknięcie "Edytuj fiszkę" -> otwiera modal edycji
  - Kliknięcie "Usuń fiszkę" -> otwiera modal usunięcia

### `PaginationControlsComponent`

- **Opis komponentu**: Umożliwia nawigację między stronami listy fiszek.
- **Główne elementy**: Przyciski paginacji, wybór liczby elementów na stronę.

### `EmptyFlashcardsListComponent`

- **Status**: Komponent nie istnieje. Jego funkcjonalność została zintegrowana wewnątrz `FlashcardsListView`.

### Modalne:

#### `AddFlashcardManuallyModal`

- **Opis komponentu**: Modal do ręcznego tworzenia nowej fiszki.
- **Główne elementy**: Formularz z polami `question`/`answer`, opcjami formatowania, przyciskami zapisz/anuluj.
- **Integracja API**: Wykorzystuje mutację do tworzenia nowej fiszki.

#### `GenerateFlashcardsAIModal`

- **Opis komponentu**: Modal do generowania fiszek z wykorzystaniem AI.
- **Główne elementy**: Pole tekstowe z opisem/instrukcjami dla AI, opcje generacji, podgląd wygenerowanych fiszek.
- **Sugestia:** Podgląd wygenerowanych fiszek powinien być **edytowalny**, aby użytkownik mógł wprowadzić poprawki przed ostatecznym zapisaniem.
- **Integracja API**: Wykorzystuje API generacji fiszek z AI.

#### `ShareSetModal`

- **Opis komponentu**: Modal do udostępniania zestawu innym użytkownikom w trybie **tylko do odczytu**.
- **Główne elementy**:
  - Lista osób, którym udostępniono zestaw (e-mail, data wygaśnięcia)
  - Input z autouzupełnianiem (typeahead) do wyszukiwania użytkownika po e-mail, któremu chcemy nadać dostęp.
  - Date picker `expires_at` (opcjonalna data wygaśnięcia dostępu).
  - Przycisk „Udostępnij".
- **Integracja API**:
  - Wywołanie `POST /api/flashcards-sets/{setId}/shares` z ciałem `{ userId, role: 'learning', expiresAt }` w celu nadania dostępu do nauki (tylko do odczytu).
  - Wyświetlanie listy udostępnień na podstawie `GET /api/flashcards-sets/{setId}/shares`.
  - Możliwość odwołania dostępu przez `DELETE /api/flashcards-sets/{setId}/shares/{shareId}`.

> **Uwaga:** Funkcja "udostępniania" w tym modalu dotyczy wyłącznie nadawania dostępu do wglądu i nauki. Nie pozwala ona na edycję oryginalnego zestawu przez inną osobę ani nie przekazuje praw własności.

#### ~~`SendCopyModal`~~ (Niezaimplementowane)

- **Status:** Ta funkcjonalność nie została zaimplementowana. W widoku listy zestawów brakuje przycisku "Zapisz kopię u siebie" dla udostępnionych zestawów, a w widoku szczegółów brakuje opcji "Wyślij kopię". Endpoint API `POST /api/flashcards-sets/{setId}/clone` z `targetUserId` nie jest wykorzystywany.

#### `EditFlashcardModal`

- **Opis komponentu**: Modal do edycji istniejącej fiszki.
- **Główne elementy**: Formularz z polami `question`/`answer` wypełniony danymi istniejącej fiszki.
- **Integracja API**: Wykorzystuje mutację do aktualizacji fiszki.

#### `DeleteFlashcardModal`

- **Opis komponentu**: Modal potwierdzenia usunięcia fiszki.
- **Główne elementy**: Komunikat potwierdzenia, przyciski usuń/anuluj.
- **Integracja API**: Wykorzystuje mutację do usunięcia fiszki.

## 5. Typy

Implementacja będzie wykorzystywać istniejące oraz nowe typy zgodne ze strukturą API:

```typescript
// Przykładowe typy na podstawie schematów Zod i implementacji
import type { FlashcardsSetDTO } from "@/types";

// Typy dla fiszek zgodne z API (używają question/answer)
export interface FlashcardDTO {
  id: string;
  flashcardsSetId: string;
  question: string;
  answer: string;
  source: "ai-full" | "ai-edit" | "manual";
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcardCommand {
  flashcardsSetId: string;
  question: string;
  answer: string;
}

export interface UpdateFlashcardCommand {
  question?: string;
  answer?: string;
}

// Filtrowanie fiszek
export interface FlashcardsFiltersViewModel {
  page: number;
  limit: number;
  sortBy?: "createdAt" | "question";
  sortOrder?: "asc" | "desc";
  search?: string;
}
```

## 6. Zarządzanie stanem

W implementacji wykorzystane zostaną:

- **React Query do zarządzania danymi z API**:

  - `useGetFlashcardSetById` - pobieranie szczegółów zestawu
  - `useGetFlashcards` - pobieranie listy fiszek z paginacją i filtrami
  - `useMutateFlashcards` - hook do operacji CRUD na fiszkach. **Sugestia:** Należy skonfigurować go do **optymistycznych aktualizacji**, aby UI reagowało natychmiast.
  - `useGenerateFlashcardsSuggestions` - hook do generowania sugestii fiszek

- **URL jako źródło prawdy dla filtrów (nuqs)**:

  - `useFlashcardSetFilters` - filtry dla listy zestawów
  - `useFlashcardFilters` - filtry dla listy fiszek

- **Mieszane zarządzanie modalami**:

  - **Parametry URL** dla modali tworzenia i edycji (`useEditModal`, `useFlashcardModal`).
  - **Lokalny stan React** dla modali usuwania i udostępniania na liście zestawów.

- **Debouncing dla wyszukiwania**

## 7. Integracja API

Implementacja będzie korzystać z następujących endpointów zgodnych z istniejącym API:

- **Pobieranie szczegółów zestawu**:

  - `GET /api/flashcards-sets/{setId}` - pobieranie szczegółów zestawu

- **Operacje na fiszkach**:

  - `GET /api/flashcards?setId={setId}` - lista fiszek w zestawie z parametrami:
    - `page` - numer strony
    - `limit` - liczba elementów na stronę
    - `sortBy` - pole sortowania (np. 'createdAt', 'question')
    - `sortOrder` - kierunek sortowania ('asc' lub 'desc')
  - `POST /api/flashcards` - tworzenie nowej fiszki z body:
    ```json
    {
      "flashcardsSetId": "uuid-zestawu",
      "question": "treść pytania",
      "answer": "treść odpowiedzi"
    }
    ```
  - `PUT /api/flashcards/{flashcardId}` - aktualizacja fiszki z body:
    ```json
    {
      "question": "nowa treść pytania",
      "answer": "nowa treść odpowiedzi"
    }
    ```
  - `DELETE /api/flashcards/{flashcardId}` - usunięcie fiszki

- **Generowanie sugestii fiszek**:

  - `POST /api/flashcards-suggestions` - z body:
    ```json
    {
      "text": "Tekst do analizy przez AI"
    }
    ```

- **Udostępnianie i Klonowanie dla innych**:
  - `POST /api/flashcards-sets/{setId}/shares` - udostępnienie zestawu do wglądu.
  - `GET /api/flashcards-sets/{setId}/shares` - pobranie listy udostępnień.
  - `DELETE /api/flashcards-sets/{setId}/shares/{shareId}` - cofnięcie udostępnienia.
  - `POST /api/flashcards-sets/{setId}/clone` - **nieużywane w UI** w kontekście wysyłania kopii innemu użytkownikowi. Klonowanie jest dostępne tylko dla własnych zestawów z poziomu listy.

## 8. Interakcje użytkownika

Zaimplementowane zostaną następujące przepływy:

- **Przeglądanie fiszek**:

  - Wyświetlanie listy fiszek z opcją przewijania
  - Przełączanie widoczności tylnej strony fiszek

- **Filtrowanie i sortowanie fiszek**:

  - Wyszukiwanie tekstowe
  - Zmiana kolejności wyświetlania

- **Dodawanie fiszek ręcznie**:

  1. Kliknięcie "Dodaj fiszkę"
  2. Wypełnienie formularza (front/back)
  3. Zapisanie

- **Generowanie fiszek z AI**:

  1. Kliknięcie "Generuj z AI"
  2. Podanie tekstu/instrukcji
  3. Potwierdzenie wygenerowanych sugestii
  4. Zapisanie jako nowe fiszki

- **Edycja fiszki**:

  1. Kliknięcie "Edytuj" przy fiszce
  2. Modyfikacja treści (`question`/`answer`)
  3. Zapisanie zmian

- **Usuwanie fiszki**:

  1. Kliknięcie "Usuń" przy fiszce
  2. Potwierdzenie usunięcia

- **Stan pusty**:

  - Dedykowany widok gdy zestaw nie zawiera fiszek (`EmptyStateSetsComponent` na liście zestawów, komunikat w `FlashcardsListView` w szczegółach).
  - Sugestie dodania pierwszej fiszki

- **Brak wyników wyszukiwania**:

  - Informacja o braku fiszek pasujących do wyszukiwania
  - Opcja resetowania filtrów

- **Błędy API**:

  - Wyświetlanie komunikatów o błędach z możliwością ponowienia
  - Obsługa typowych błędów (404, 403, 500)

- **Walidacja formularzy**:
  - Sprawdzanie wymaganych pól
  - Ograniczenia długości tekstu

## 10. Szczególne cechy implementacji

- **Responsywność**: Dostosowanie widoku do urządzeń mobilnych i desktopowych
- **Konsystencja z listą zestawów**: Spójne wzorce UI/UX z widokiem listy
- **Optymistyczne aktualizacje UI**: Natychmiastowa aktualizacja UI przed potwierdzeniem API (do weryfikacji/implementacji)
- **Kontekstowe modale**: Odpowiednia zawartość modali zależna od kontekstu
- **Formatowanie tekstu fiszek**: Podstawowe opcje formatowania treści
- **Generowanie AI**: Intuicyjny interfejs do generowania fiszek z pomocą AI

## 11. Testowanie (Zgodnie ze standardami projektu)

- **Strategia:** Wszystkie nowo tworzone komponenty, hooki oraz kluczowe funkcje logiki biznesowej powinny być objęte testami.
- **Narzędzia:** Vitest i React Testing Library.
- **Zakres:**
  - **Testy jednostkowe:** Dla hooków (np. `useFlashcardFilters`), funkcji pomocniczych.
  - **Testy integracyjne/komponentowe:** Dla komponentów UI (np. `AddFlashcardManuallyModal`, `FlashcardsListView`), weryfikujące renderowanie, interakcje użytkownika i komunikację z mockowanym API.

## 12. Dostępność (Accessibility - a11y) (Zgodnie ze standardami projektu)

- **Cel:** Zapewnienie, że interfejs będzie użyteczny dla jak najszerszej grupy użytkowników, w tym osób z niepełnosprawnościami.
- **Kluczowe aspekty do uwzględnienia:**
  - **Nawigacja klawiaturą:** Wszystkie interaktywne elementy (przyciski, linki, pola formularzy, modale) muszą być w pełni obsługiwane z poziomu klawiatury.
  - **Semantyczny HTML:** Używanie odpowiednich znaczników HTML (np. `<nav>`, `<button>`, `<main>`) w celu prawidłowej interpretacji przez technologie asystujące.
  - **Atrybuty ARIA:** Stosowanie atrybutów `aria-*` tam, gdzie jest to konieczne do poprawy dostępności dynamicznych komponentów (np. `aria-label` dla przycisków z ikonami, role dla modali).
  - **Kontrast:** Zapewnienie odpowiedniego kontrastu kolorów tekstu i tła zgodnie z wytycznymi WCAG.
  - **Alternatywne teksty:** Dodawanie opisowych tekstów alternatywnych (`alt`) dla wszystkich znaczących obrazów i ilustracji.
