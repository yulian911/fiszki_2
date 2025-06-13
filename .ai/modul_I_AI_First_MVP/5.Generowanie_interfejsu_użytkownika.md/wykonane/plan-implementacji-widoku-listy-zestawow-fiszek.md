# Plan implementacji widoku: Zestawy Fiszki (Zgodny z implementacją)

## 1. Przegląd

Aplikacja zawiera dwa główne widoki do zarządzania zestawami fiszek:

- **Lista Zestawów (`/protected/sets`):** Umożliwia użytkownikom przeglądanie, tworzenie, edytowanie, usuwanie, klonowanie i udostępnianie swoich zestawów fiszek.
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
│   │   └── ... (pozostałe hooki dla fiszek)
│   ├── /components (Komponenty UI)
│   │   ├── FlashcardsSetTableComponent.tsx
│   │   ├── FilterControlsComponent.tsx
│   │   ├── PaginationControlsComponent.tsx
│   │   ├── CreateSetFormComponent.tsx
│   │   ├── EditSetFormComponent.tsx
│   │   ├── ConfirmDeleteModalComponent.tsx
│   │   ├── ShareSetModalComponent.tsx
│   │   ├── SetDetailsHeader.tsx
│   │   ├── FlashcardsListView.tsx
│   │   └── ... (pozostałe komponenty)
│   ├── /hooks (Hooki do zarządzania stanem UI)
│   │   ├── useFlashcardSetFilters.ts
│   │   ├── useEditModal.tsx (zarządza modalami create/edit)
│   │   └── ... (pozostałe hooki)
│   └── /types.ts (Definicje typów TypeScript)
```

## 3. Widok: Lista Zestawów Fiszki (`/protected/sets`)

### 3.1. Opis

Główny widok do zarządzania zestawami. Użytkownik widzi tabelę ze swoimi zestawami i ma możliwość filtrowania, sortowania i paginacji.

### 3.2. Kluczowe komponenty

- **`FlashcardsSetsListViewPage` (`page.tsx`):** Główny kontener widoku.
- **`FilterControlsComponent`:** Panel z filtrami (wyszukiwanie po nazwie, status). **Panel zostanie rozszerzony o przełącznik/zakładki do filtrowania widoku: "Wszystkie", "Moje zestawy", "Udostępnione dla mnie".**
- **`FlashcardsSetTableComponent`:** Tabela wyświetlająca zestawy z akcjami. **Tabela zostanie zaktualizowana, aby:**
  - **Wyświetlać kolumnę "Właściciel"** (pokazując "Ja" lub e-mail osoby udostępniającej).
  - **Dynamicznie pokazywać akcje:**
    - Dla zestawów własnych: Edytuj, Usuń, Klonuj, Udostępnij.
    - Dla zestawów udostępnionych: **tylko akcja "Zapisz kopię u siebie" (klonowanie na własne konto) i "Ucz się" (przejście do widoku szczegółów).**
- **`PaginationControlsComponent`:** Nawigacja między stronami.
- **`EmptyStateSetsComponent`:** Wyświetlany, gdy brak zestawów (również z uwzględnieniem filtrów "Udostępnione dla mnie").
- **Modale (`Dialog` z shadcn/ui):**
  - Modal potwierdzenia usunięcia (`ConfirmDeleteModalComponent`).
  - Modal udostępniania (`ShareSetModalComponent`).
  - Modal tworzenia/edycji jest obsługiwany przez `OpenEditDeleteFlashcardSetModal` i parametry URL.

### 3.3. Zarządzanie stanem i danymi

- **Filtry w URL:** Hook `useFlashcardSetFilters` zarządza stanem filtrów (strona, limit, sortowanie, status, nazwa) w parametrach URL przy użyciu biblioteki `nuqs`. **Zostanie rozszerzony o nowy parametr `view` (`all` | `owned` | `shared`).**
- **Pobieranie danych:** Hook `useGetFlashcardsSets` (React Query) pobiera dane z API `GET /api/flashcards-sets`, przekazując aktualne filtry. **Komponenty będą wykorzystywać nowe pole `accessLevel` do renderowania warunkowego.**
- **Mutacje danych:**
  - `useMutateFlashcardSets` obsługuje tworzenie, edycję i usuwanie **własnych** zestawów.
  - `useCloneFlashcardSet` obsługuje klonowanie. **Będzie używany zarówno do klonowania własnych zestawów, jak i tworzenia kopii zestawów udostępnionych.**
- **Obsługa modali:**
  - Tworzenie/edycja: `useEditModal` (`/hooks/useEditModal.tsx`) otwiera globalny modal przez zmianę parametrów URL.
  - Usuwanie/udostępnianie: Komponent `page.tsx` zarządza lokalnym stanem (`useState`), który kontroluje widoczność modali `Dialog`.

## 4. Widok: Szczegóły Zestawu Fiszki (`/protected/sets/[setId]`)

### 4.1. Opis

Widok szczegółowy pojedynczego zestawu, koncentrujący się na zarządzaniu fiszkami.

### 4.2. Kluczowe komponenty

- **`FlashcardsSetDetailsPage` (`page.tsx`):** Główny kontener widoku.
- **`BreadcrumbNavigation`:** Ścieżka powrotu do listy zestawów.
- **`SetDetailsHeader`:** Wyświetla nazwę, status i przyciski akcji dla całego zestawu.
- **`ActionsButtonsGroup`:** Przyciski "Dodaj fiszkę", "Generuj fiszki AI", "Udostępnij".
- **`FlashcardsListFilters`:** Filtry dla listy fiszek (wyszukiwanie, sortowanie).
- **`FlashcardsListView`:** Lista fiszek z opcjami edycji/usunięcia.
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

Kluczowe typy są zdefiniowane w `features/flashcard-sets/types.ts` oraz globalnie w `types.ts`. Główne z nich to:

- `FlashcardsSetDTO`: Podstawowy obiekt transferu danych dla zestawu.
- `FlashcardsSetFiltersViewModel`: Model widoku dla filtrów listy zestawów.
- `FlashcardDTO`: Obiekt transferu danych dla pojedynczej fiszki.

### 5.2. Zarządzanie stanem globalnym (modale)

Aplikacja wykorzystuje parametry URL jako główne źródło prawdy do zarządzania stanem modali (co ma być otwarte). Dedykowane hooki (`useEditModal`, `useFlashcardModal`) upraszczają operacje na tych parametrach, a specjalne komponenty (`Open...Modal`) w layoutach lub na stronach odczytują te parametry i renderują odpowiedni modal. To podejście zapewnia:

- Możliwość linkowania do konkretnej akcji (np. edycji zestawu).
- Poprawne działanie przycisków "wstecz"/"dalej" w przeglądarce.

### 5.3. Interakcje z API

Wszystkie interakcje z backendem są zamknięte w dedykowanych hookach React Query w katalogu `features/flashcard-sets/api`. Zapewnia to:

- Centralizację logiki zapytań.
- Automatyczne cachowanie, odświeżanie i unieważnianie danych.
- Przejrzystą obsługę stanów ładowania i błędów w komponentach.
- Zgodność z `flashcards-sets-api-plan.md`.

## 6. Obsługa błędów i stanów

- **Stany ładowania:** Komponenty wyświetlają animacje ładowania lub tzw. "skeletony" podczas pobierania danych.
- **Stany puste / Brak wyników:** Dedykowane komunikaty i komponenty (`EmptyStateSetsComponent`) są wyświetlane, gdy brakuje danych lub wyników filtrowania.
- **Błędy API:** Komunikaty o błędach są wyświetlane użytkownikowi, często z opcją ponowienia operacji.
- **Walidacja:** Formularze wykorzystują Zod do walidacji danych po stronie klienta.

### `SetDetailsHeader`

- **Opis komponentu**: Wyświetla szczegółowe informacje o zestawie i przyciski zarządzania.
- **Główne elementy**: Nazwa zestawu, status, liczba fiszek, data utworzenia, przyciski akcji.
- **Obsługiwane interakcje**:
  - Kliknięcie "Edytuj zestaw" -> otwiera modal edycji zestawu (OpenEditDeleteFlashcardSetModal)
  - Kliknięcie "Usuń zestaw" -> otwiera modal usunięcia zestawu

### `ActionsButtonsGroup`

- **Opis komponentu**: Grupa przycisków do wykonywania akcji na zestawie.
- **Główne elementy**: Przyciski dodawania fiszek, generowania AI, udostępniania i wysyłania kopii.
- **Obsługiwane interakcje**:
  - Kliknięcie "Dodaj fiszkę" -> otwiera modal `AddFlashcardManuallyModal`
  - Kliknięcie "Generuj z AI" -> otwiera modal `GenerateFlashcardsAIModal`
  - Kliknięcie "Udostępnij" -> otwiera modal `ShareSetModal` (udostępnianie tylko do odczytu)
  - Kliknięcie "Wyślij kopię" -> otwiera modal `SendCopyModal` (klonowanie zestawu dla innego użytkownika)

### `FlashcardsListFilters`

- **Opis komponentu**: Zawiera kontrolki do filtrowania i sortowania listy fiszek.
- **Główne elementy**: Input do wyszukiwania, select sortowania.
- **Obsługiwane interakcje**:
  - Wyszukiwanie fiszek z debounce
  - Zmiana sortowania
- **Integracja API**: Wykorzystuje API generacji fiszek z AI.

### `FlashcardsListView`

- **Opis komponentu**: Wyświetla listę fiszek w wybranym zestawie z opcjami zarządzania.
- **Główne elementy**: Karty lub wiersze tabeli z fiszkami, przyciski akcji.
- **Obsługiwane interakcje**:
  - Wyświetlanie/ukrywanie tylnej strony fiszki
  - Kliknięcie "Edytuj fiszkę" -> otwiera modal edycji
  - Kliknięcie "Usuń fiszkę" -> otwiera modal usunięcia

### `PaginationControlsComponent`

- **Opis komponentu**: Umożliwia nawigację między stronami listy fiszek.
- **Główne elementy**: Przyciski paginacji, wybór liczby elementów na stronę.

### `EmptyFlashcardsListComponent`

- **Opis komponentu**: Wyświetlany, gdy zestaw nie zawiera żadnych fiszek.
- **Główne elementy**: Ilustracja, tekst informacyjny, przyciski do dodania fiszek.

### Modalne:

#### `AddFlashcardManuallyModal`

- **Opis komponentu**: Modal do ręcznego tworzenia nowej fiszki.
- **Główne elementy**: Formularz z polami front/back, opcjami formatowania, przyciskami zapisz/anuluj.
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

#### Nowa, oddzielna funkcjonalność: `SendCopyModal` (lub podobna nazwa)

- **Opis komponentu**: Modal do wysłania **klona (kopii)** zestawu innemu użytkownikowi. Odbiorca otrzymuje w pełni edytowalną, niezależną kopię zestawu, a oryginalny zestaw pozostaje nienaruszony u właściciela.
- **Główne elementy**:
  - Input do wyszukania użytkownika po e-mail.
  - Przycisk "Wyślij kopię".
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku "Wyślij kopię" w `ActionsButtonsGroup` (np. pod nową ikoną "Kopiuj dla kogoś").
  - Po wybraniu użytkownika i wysłaniu, odbiorca staje się właścicielem nowego, sklonowanego zestawu.
- **Integracja API**:
  - Wykorzystanie istniejącego lub stworzenie nowego endpointu, np. `POST /api/flashcards-sets/{setId}/clone` z opcjonalnym `targetUserId` w ciele, który klonuje zestaw dla wskazanego użytkownika.

#### `EditFlashcardModal`

- **Opis komponentu**: Modal do edycji istniejącej fiszki.
- **Główne elementy**: Formularz z polami front/back wypełniony danymi istniejącej fiszki.
- **Integracja API**: Wykorzystuje mutację do aktualizacji fiszki.

#### `DeleteFlashcardModal`

- **Opis komponentu**: Modal potwierdzenia usunięcia fiszki.
- **Główne elementy**: Komunikat potwierdzenia, przyciski usuń/anuluj.
- **Integracja API**: Wykorzystuje mutację do usunięcia fiszki.

## 5. Typy

Implementacja będzie wykorzystywać istniejące oraz nowe typy zgodne ze strukturą API:

```typescript
// Istniejące typy
import type { FlashcardsSetDTO } from "@/types";

// Typy dla fiszek zgodne z API
export interface FlashcardDTO {
  id: string;
  setId: string;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcardCommand {
  setId: string;
  front: string;
  back: string;
}

export interface UpdateFlashcardCommand {
  front?: string;
  back?: string;
}

// Filtrowanie fiszek
export interface FlashcardsFiltersViewModel {
  page: number;
  limit: number;
  sortBy?: "createdAt" | "front" | "back";
  sortOrder?: "asc" | "desc";
  search?: string;
}

// Udostępnianie (jeśli będzie implementowane)
export interface SetCollaboratorDTO {
  id: string;
  email: string;
  role: "viewer" | "editor";
  invitedAt: string;
  status: "pending" | "accepted" | "rejected";
}

export interface InviteCollaboratorCommand {
  setId: string;
  email: string;
  role: "viewer" | "editor";
}
```

## 6. Zarządzanie stanem

W implementacji wykorzystane zostaną:

- **React Query do zarządzania danymi z API**:

  - `useGetFlashcardSetById` - pobieranie szczegółów zestawu
  - `useGetFlashcards` - pobieranie listy fiszek z paginacją i filtrami
  - `useMutateFlashcards` - hook do operacji CRUD na fiszkach. **Sugestia:** Należy skonfigurować go do **optymistycznych aktualizacji**, aby UI reagowało natychmiast (np. usunięcie fiszki z listy od razu po kliknięciu), a ewentualny błąd API przywracał poprzedni stan i wyświetlał komunikat.
  - `useGenerateFlashcardsSuggestions` - hook do generowania sugestii fiszek

- **URL jako źródło prawdy dla filtrów fiszek**:

  - `useFlashcardFilters` - parametry filtrowania i paginacji w URL

- **Parametry URL do zarządzania modalami**:

  - `useFlashcardModal` - stan modali (dodawanie, edycja, usuwanie fiszek)
  - Reużycie istniejącego `useEditModalSet` dla edycji zestawu

- **Debouncing dla wyszukiwania fiszek**

## 7. Integracja API

Implementacja będzie korzystać z następujących endpointów zgodnych z istniejącym API:

- **Pobieranie szczegółów zestawu**:

  - `GET /api/flashcards-sets/{setId}` - pobieranie szczegółów zestawu

- **Operacje na fiszkach**:

  - `GET /api/flashcards?setId={setId}` - lista fiszek w zestawie z parametrami:
    - `page` - numer strony
    - `limit` - liczba elementów na stronę
    - `sortBy` - pole sortowania (np. 'createdAt', 'front')
    - `sortOrder` - kierunek sortowania ('asc' lub 'desc')
  - `POST /api/flashcards` - tworzenie nowej fiszki z body:
    ```json
    {
      "setId": "uuid-zestawu",
      "front": "treść przedniej strony",
      "back": "treść tylnej strony"
    }
    ```
  - `PUT /api/flashcards/{flashcardId}` - aktualizacja fiszki z body:
    ```json
    {
      "front": "nowa treść przedniej strony",
      "back": "nowa treść tylnej strony"
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
  - `POST /api/flashcards-sets/{setId}/clone` - z opcjonalnym `targetUserId` w ciele, aby wysłać komuś kopię.

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
  2. Modyfikacja treści
  3. Zapisanie zmian

- **Usuwanie fiszki**:
  1. Kliknięcie "Usuń" przy fiszce
  2. Potwierdzenie usunięcia

## 9. Obsługa błędów i stanów

Implementacja będzie zawierać kompleksową obsługę różnych stanów:

- **Stan ładowania**:

  - Skeletony podczas ładowania danych zestawu i fiszek
  - Wskaźniki ładowania dla operacji na fiszkach

- **Stan pusty**:

  - Dedykowany widok gdy zestaw nie zawiera fiszek
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
- **Optymistyczne aktualizacje UI**: Natychmiastowa aktualizacja UI przed potwierdzeniem API
- **Kontekstowe modale**: Odpowiednia zawartość modali zależna od kontekstu
- **Formatowanie tekstu fiszek**: Podstawowe opcje formatowania treści
- **Generowanie AI**: Intuicyjny interfejs do generowania fiszek z pomocą AI

## 11. Testowanie (Nowa sekcja)

- **Strategia:** Wszystkie nowo tworzone komponenty, hooki oraz kluczowe funkcje logiki biznesowej powinny być objęte testami.
- **Narzędzia:** Vitest i React Testing Library (zgodnie z przyjętymi w projekcie standardami).
- **Zakres:**
  - **Testy jednostkowe:** Dla hooków (np. `useFlashcardFilters`), funkcji pomocniczych.
  - **Testy integracyjne/komponentowe:** Dla komponentów UI (np. `AddFlashcardManuallyModal`, `FlashcardsListView`), weryfikujące renderowanie, interakcje użytkownika i komunikację z mockowanym API.

## 12. Dostępność (Accessibility - a11y) (Nowa sekcja)

- **Cel:** Zapewnienie, że interfejs będzie użyteczny dla jak najszerszej grupy użytkowników, w tym osób z niepełnosprawnościami.
- **Kluczowe aspekty do uwzględnienia:**
  - **Nawigacja klawiaturą:** Wszystkie interaktywne elementy (przyciski, linki, pola formularzy, modale) muszą być w pełni obsługiwane z poziomu klawiatury.
  - **Semantyczny HTML:** Używanie odpowiednich znaczników HTML (np. `<nav>`, `<button>`, `<main>`) w celu prawidłowej interpretacji przez technologie asystujące.
  - **Atrybuty ARIA:** Stosowanie atrybutów `aria-*` tam, gdzie jest to konieczne do poprawy dostępności dynamicznych komponentów (np. `aria-label` dla przycisków z ikonami, role dla modali).
  - **Kontrast:** Zapewnienie odpowiedniego kontrastu kolorów tekstu i tła zgodnie z wytycznymi WCAG.
  - **Alternatywne teksty:** Dodawanie opisowych tekstów alternatywnych (`alt`) dla wszystkich znaczących obrazów i ilustracji.
