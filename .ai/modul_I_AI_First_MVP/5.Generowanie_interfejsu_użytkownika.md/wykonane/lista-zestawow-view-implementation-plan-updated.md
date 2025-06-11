# Plan implementacji widoku: Lista Zestawów Fiszki (Zrealizowany)

## 1. Przegląd
Widok "Lista Zestawów Fiszki" (`/protected/sets`) umożliwia użytkownikom przeglądanie, tworzenie, edytowanie i usuwanie swoich zestawów fiszek. Prezentuje kluczowe informacje o każdym zestawie, takie jak nazwa, status, data utworzenia i liczba fiszek. Użytkownik może filtrować, sortować listę oraz nawigować do szczegółowego widoku danego zestawu.

## 2. Routing widoku
Widok jest dostępny pod ścieżką: `/protected/sets`

## 3. Struktura komponentów (zrealizowana)
```
FlashcardsSetsListViewPage (app/protected/sets/page.tsx)
├── Przycisk "Utwórz nowy zestaw" (otwiera CreateSetFormComponent poprzez useEditModal)
├── FilterControlsComponent (features/flashcard-sets/components/FilterControlsComponent.tsx)
│   ├── Pole tekstowe (do wyszukiwania po nazwie)
│   ├── SelectInput (do filtrowania po statusie zestawu)
│   └── SelectInput (do sortowania listy)
├── FlashcardsSetTableComponent (features/flashcard-sets/components/FlashcardsSetTableComponent.tsx)
│   └── Dla każdego zestawu na liście:
│       ├── Nazwa Zestawu
│       ├── Status Zestawu
│       ├── Data Utworzenia
│       ├── Liczba Fiszek
│       ├── Przyciski akcji (edycja, usunięcie)
│       └── Możliwość kliknięcia w wiersz (nawigacja do /protected/sets/[setId])
├── PaginationControlsComponent (features/flashcard-sets/components/PaginationControlsComponent.tsx)
├── EmptyStateSetsComponent (features/flashcard-sets/components/EmptyStateSetsComponent.tsx)
└── OpenEditDeleteFlashcardSetModal (features/flashcard-sets/components/OpenEditDeleteFlashcardSetModal.tsx)
    ├── CreateSetFormComponent (features/flashcard-sets/components/CreateSetFormComponent.tsx)
    ├── EditSetFormComponent (features/flashcard-sets/components/EditSetFormComponent.tsx)
    └── ConfirmDeleteModalComponent (features/flashcard-sets/components/ConfirmDeleteModalComponent.tsx)
```

## 4. Szczegóły komponentów

### `FlashcardsSetsListViewPage` (app/protected/sets/page.tsx)
- **Opis komponentu**: Główny kontener widoku listy zestawów. Odpowiada za pobieranie danych, zarządzanie stanem filtrów, sortowania, paginacji.
- **Główne elementy**: Tytuł strony, przycisk tworzenia nowego zestawu, komponenty: `FilterControlsComponent`, `FlashcardsSetTableComponent`, `PaginationControlsComponent`, `EmptyStateSetsComponent`.
- **Obsługiwane interakcje**:
    - Kliknięcie "Utwórz nowy zestaw" -> otwiera modal za pomocą `useEditModal().open()`.
    - Zmiana filtrów w `FilterControlsComponent` -> aktualizuje parametry URL za pomocą `useFlashcardSetFilters`.
    - Zmiana strony w `PaginationControlsComponent` -> aktualizuje parametry URL.
    - Wyświetlanie dodatkowych widoków dla stanów ładowania i błędów.
- **Hooki i integracja**:
    - `useGetFlashcardSets` - pobieranie danych przez React Query
    - `useFlashcardSetFilters` - zarządzanie filtrami w URL
    - `useEditModal` - zarządzanie stanem modali

### `FilterControlsComponent`
- **Opis komponentu**: Zawiera kontrolki do filtrowania i sortowania listy zestawów.
- **Główne elementy**: Input do wyszukiwania, select statusu, select sortowania i kierunku.
- **Obsługiwane interakcje**:
    - Wyszukiwanie po nazwie z debounce dla lepszej wydajności
    - Filtrowanie po statusie 
    - Sortowanie (pole i kierunek)
    - Resetowanie filtrów
- **Zarządzanie stanem**: Wszystkie zmiany filtrów aktualizują parametry URL

### `FlashcardsSetTableComponent`
- **Opis komponentu**: Wyświetla listę zestawów w formie tabeli z możliwością kliknięcia wiersza.
- **Główne elementy**: Tabela z nagłówkami i wierszami dla każdego zestawu.
- **Obsługiwane interakcje**:
    - Kliknięcie wiersza -> przekierowanie do szczegółów zestawu
    - Kliknięcie "Edytuj" -> otwiera modal edycji
    - Kliknięcie "Usuń" -> otwiera modal usunięcia
- **Wyświetlane dane**: Nazwa, status, data utworzenia, liczba fiszek, akcje.

### `PaginationControlsComponent`
- **Opis komponentu**: Umożliwia nawigację między stronami listy zestawów i zmianę liczby elementów na stronę.
- **Główne elementy**: Przyciski paginacji, wybór liczby elementów na stronę, informacja o aktualnej stronie.
- **Obsługiwane interakcje**:
    - Zmiana aktualnej strony
    - Zmiana liczby elementów na stronę

### `OpenEditDeleteFlashcardSetModal`
- **Opis komponentu**: Dynamiczny komponent modalny który wyświetla odpowiednią zawartość w zależności od parametrów URL.
- **Główne elementy**: `ResponsiveModal` zawierający odpowiednio:
    - `CreateSetFormComponent` (gdy parametr URL `create-flashcard-set=true`)
    - `EditSetFormComponent` (gdy parametr URL `edit-flashcard-set=[id]`)
    - `ConfirmDeleteModalComponent` (gdy parametr URL `delete-flashcard-set=[id]`)
- **Zarządzanie stanem**: Wykorzystuje hook `useEditModal` który zarządza parametrami URL

### `CreateSetFormComponent`
- **Opis komponentu**: Formularz do tworzenia nowego zestawu.
- **Główne elementy**: Pole na nazwę zestawu, przyciski Zapisz/Anuluj.
- **Obsługiwana walidacja**: Walidacja pola `name` (wymagane, min/max długość).
- **Integracja API**: Wykorzystuje `useMutateFlashcardSets` do tworzenia nowego zestawu.

### `EditSetFormComponent`
- **Opis komponentu**: Formularz do edycji istniejącego zestawu.
- **Główne elementy**: Pole na nazwę zestawu, select statusu, przyciski Zapisz/Anuluj.
- **Obsługiwana walidacja**: Walidacja pól `name` i `status`.
- **Integracja API**: Wykorzystuje `useMutateFlashcardSets` do aktualizacji zestawu oraz `useGetFlashcardSetById` do pobrania danych.

### `ConfirmDeleteModalComponent`
- **Opis komponentu**: Modal potwierdzenia usunięcia zestawu.
- **Główne elementy**: Komunikat potwierdzenia, przyciski Usuń/Anuluj.
- **Integracja API**: Wykorzystuje `useMutateFlashcardSets` do usunięcia zestawu.

### `EmptyStateSetsComponent`
- **Opis komponentu**: Wyświetlany, gdy użytkownik nie posiada żadnych zestawów fiszek.
- **Główne elementy**: Ilustracja, tekst zachęcający, przycisk tworzenia pierwszego zestawu.

## 5. Typy
Zaimplementowane typy w `features/flashcard-sets/types.ts`:
-   `FlashcardsSetViewItem`: Rozszerza `FlashcardsSetDTO` o dodatkowe pola UI.
    ```typescript
    export interface FlashcardsSetViewItem extends FlashcardsSetDTO {
      /** Number of flashcards in the set. */
      flashcardCount: number;
    }
    ```
-   `FlashcardsSetFiltersViewModel`: Reprezentuje aktualny stan filtrów i sortowania.
    ```typescript
    export interface FlashcardsSetFiltersViewModel {
      /** Current page number (1-based) */
      page: number;
      /** Number of items per page */
      limit: number;
      /** Field to sort by (excluding ownerId) */
      sortBy?: keyof Omit<FlashcardsSetDTO, 'ownerId'> | string;
      /** Sort direction */
      sortOrder?: "asc" | "desc";
      /** Filter by set status. Empty string means no status filter */
      status?: FlashcardsSetStatus | "";
      /** Search term for filtering by name */
      nameSearch?: string;
    }
    ```
-   `CurrentModalViewModel`: Określa, który modal jest aktualnie otwarty i jakie dane przekazuje.
    ```typescript
    export interface CurrentModalViewModel {
      /** Type of the currently open modal */
      type: "create" | "edit" | "delete" | null;
      /** Data associated with the modal (for edit/delete operations) */
      data?: FlashcardsSetDTO;
    }
    ```

## 6. Zarządzanie stanem
W zaimplementowanym rozwiązaniu wykorzystano:

- **URL jako źródło prawdy dla filtrów**: 
  - Hook `useFlashcardSetFilters` przechowuje stan filtrowania i sortowania w parametrach URL używając biblioteki `nuqs`.
  - Umożliwia to udostępnianie wyfiltrowanych wyników przez link oraz nawigację przeglądarki.

- **React Query do zarządzania danymi z API**:
  - `useGetFlashcardSets` - hook wykorzystujący React Query do pobierania listy zestawów.
  - `useMutateFlashcardSets` - hook do operacji CRUD (tworzenie, aktualizacja, usunięcie).
  - `useGetFlashcardSetById` - hook do pobierania szczegółów pojedynczego zestawu.

- **Parametry URL do zarządzania modalami**:
  - Hook `useEditModal` przechowuje stan modali (tworzenie, edycja, usuwanie) w parametrach URL.
  - Umożliwia to udostępnianie linku do konkretnej akcji oraz nawigację przeglądarki (back/forward).

- **Debouncing dla wyszukiwania**: 
  - `useDebounce` umożliwia opóźnienie zapytań przy wyszukiwaniu tekstowym.

## 7. Integracja API
Zaimplementowane hooki do interakcji z istniejącym API:

1. **`useGetFlashcardSets`** (`features/flashcard-sets/api/useGetFlashcardSets.tsx`):
   - Pobiera paginowaną listę zestawów z uwzględnieniem filtrów.
   - Wykorzystuje endpoint `GET /api/flashcards-sets` z parametrami:
     - `page` - numer strony (domyślnie 1)
     - `limit` - liczba elementów na stronę (domyślnie 20)
     - `sortBy` - pole do sortowania (domyślnie "createdAt")
     - `sortOrder` - kierunek sortowania ("asc" lub "desc", domyślnie "desc")
     - `status` - opcjonalny filtr statusu
     - `name` - opcjonalne wyszukiwanie po nazwie

2. **`useMutateFlashcardSets`** (`features/flashcard-sets/api/useMutateFlashcardSets.tsx`):
   - Zawiera mutacje do tworzenia, aktualizacji i usuwania zestawów:
     - Tworzenie: `POST /api/flashcards-sets` z body zawierającym `name`
     - Aktualizacja: `PUT /api/flashcards-sets/{setId}` z body zawierającym `name` i/lub `status`
     - Usuwanie: `DELETE /api/flashcards-sets/{setId}`

3. **`useGetFlashcardSetById`** (`features/flashcard-sets/api/useGetFlashcardSetById.tsx`):
   - Pobiera szczegóły pojedynczego zestawu używając `GET /api/flashcards-sets/{setId}`

## 8. Interakcje użytkownika
Zaimplementowane zgodnie z założeniami:

- **Przeglądanie listy**: Widok tabeli z zestawami, paginacją i stanami pustymi.
- **Filtrowanie i sortowanie**: Kontrolki do wyszukiwania po nazwie, filtrowania po statusie i sortowania.
- **Tworzenie zestawu**: 
  1. Kliknięcie "Utwórz nowy zestaw"
  2. Wprowadzenie nazwy w modalu
  3. Zapisanie lub anulowanie
- **Edycja zestawu**:
  1. Kliknięcie "Edytuj" przy zestawie
  2. Zmiana nazwy/statusu w modalu
  3. Zapisanie lub anulowanie
- **Usuwanie zestawu**:
  1. Kliknięcie "Usuń" przy zestawie
  2. Potwierdzenie lub anulowanie w modalu
- **Przejście do szczegółów**: Kliknięcie wiersza zestawu przenosi na stronę szczegółów.

## 9. Obsługa błędów i stanów
Zaimplementowano kompleksową obsługę stanów:

- **Stan ładowania**: Animacje ładowania podczas pobierania danych.
- **Stan pusty**: Dedykowany widok gdy użytkownik nie ma żadnych zestawów.
- **Brak wyników wyszukiwania**: Widok informujący o braku wyników z możliwością resetowania filtrów.
- **Błędy API**: Wyświetlanie komunikatów o błędach z możliwością powtórzenia operacji.
- **Walidacja formularzy**: Sprawdzanie poprawności danych przed wysłaniem.

## 10. Szczególne cechy implementacji

- **Responsywność**: Widok działa poprawnie na urządzeniach mobilnych i desktopowych.
- **Zarządzanie stanem w URL**: Filtry i modalność przechowywane w parametrach URL, co umożliwia udostępnianie linków i nawigację.
- **Optymalizacja wydajności**: Debounce dla wyszukiwania, cachowanie zapytań przez React Query.
- **Dynamiczne modalne**: Jeden komponent modalny z dynamiczną zawartością zależną od kontekstu.
- **Zarządzanie modalami globalnie**: Modalne są osadzone w `layout.tsx`, co umożliwia ich użycie w całej aplikacji.

# Plan implementacji widoku: Szczegóły Zestawu Fiszek

## 1. Przegląd
Widok "Szczegóły Zestawu Fiszek" (`/protected/sets/[setId]`) umożliwia użytkownikom przeglądanie, edytowanie i zarządzanie fiszkami w wybranym zestawie. Prezentuje listę fiszek, informacje o zestawie oraz udostępnia funkcje dodawania nowych fiszek (ręcznie lub z pomocą AI), edycji i usuwania istniejących fiszek oraz zarządzania całym zestawem.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/protected/sets/[setId]`

## 3. Struktura komponentów
```
FlashcardsSetDetailsPage (app/protected/sets/[setId]/page.tsx)
├── BreadcrumbNavigation
│   └── Link do powrotu do listy zestawów
├── SetDetailsHeader
│   ├── Nazwa zestawu
│   ├── Status zestawu
│   ├── Informacje statystyczne (liczba fiszek, itp.)
│   ├── Przycisk "Edytuj zestaw" (otwiera modal edycji)
│   └── Przycisk "Usuń zestaw" (otwiera modal usunięcia)
├── ActionsButtonsGroup
│   ├── Przycisk "Dodaj fiszkę" (otwiera modal dodawania manualnego)
│   ├── Przycisk "Generuj fiszki AI" (otwiera modal generacji AI)
│   └── Przycisk "Udostępnij" (otwiera modal udostępniania)
├── FlashcardsListFilters
│   ├── Pole wyszukiwania
│   └── Select do sortowania
├── FlashcardsListView
│   └── Dla każdej fiszki:
│       ├── Front fiszki
│       ├── Back fiszki (opcjonalnie ukryty/wyświetlany na żądanie)
│       ├── Przycisk "Edytuj fiszkę"
│       └── Przycisk "Usuń fiszkę"
├── PaginationControlsComponent
├── EmptyFlashcardsListComponent (wyświetlany gdy brak fiszek)
└── Dynamiczne modale (zarządzane poprzez parametry URL):
    ├── AddFlashcardManuallyModal
    ├── GenerateFlashcardsAIModal
    ├── ShareSetModal
    ├── EditFlashcardModal
    └── DeleteFlashcardModal
```

## 4. Szczegóły komponentów

### `FlashcardsSetDetailsPage` (app/protected/sets/[setId]/page.tsx)
- **Opis komponentu**: Główny kontener widoku szczegółów zestawu. Odpowiada za pobieranie danych zestawu i fiszek, zarządzanie stanem filtrów, sortowania, paginacji.
- **Główne elementy**: Breadcrumb, nagłówek z informacjami o zestawie, przyciski akcji, lista fiszek, komponenty pomocnicze.
- **Obsługiwane interakcje**:
    - Nawigacja (powrót do listy zestawów)
    - Edycja/usunięcie zestawu
    - Dodawanie fiszek (ręcznie/AI)
    - Udostępnianie zestawu
    - Filtrowanie/sortowanie fiszek
    - Edycja/usunięcie pojedynczych fiszek
- **Hooki i integracja**:
    - `useGetFlashcardSetById` - pobieranie szczegółów zestawu
    - `useGetFlashcards` - pobieranie listy fiszek w zestawie
    - `useFlashcardFilters` - zarządzanie filtrami fiszek w URL
    - `useFlashcardModal` - zarządzanie modalami fiszek

### `BreadcrumbNavigation`
- **Opis komponentu**: Wyświetla ścieżkę nawigacji z możliwością powrotu do listy zestawów.
- **Główne elementy**: Link "Zestawy", nazwa aktualnego zestawu.

### `SetDetailsHeader`
- **Opis komponentu**: Wyświetla szczegółowe informacje o zestawie i przyciski zarządzania.
- **Główne elementy**: Nazwa zestawu, status, liczba fiszek, data utworzenia, przyciski akcji.
- **Obsługiwane interakcje**:
    - Kliknięcie "Edytuj zestaw" -> otwiera modal edycji zestawu (OpenEditDeleteFlashcardSetModal)
    - Kliknięcie "Usuń zestaw" -> otwiera modal usunięcia zestawu

### `ActionsButtonsGroup`
- **Opis komponentu**: Grupa przycisków do wykonywania akcji na zestawie.
- **Główne elementy**: Przyciski dodawania fiszek, generowania AI, udostępniania.
- **Obsługiwane interakcje**:
    - Kliknięcie "Dodaj fiszkę" -> otwiera modal dodawania fiszki
    - Kliknięcie "Generuj z AI" -> otwiera modal generowania fiszek
    - Kliknięcie "Udostępnij" -> otwiera modal udostępniania

### `FlashcardsListFilters`
- **Opis komponentu**: Zawiera kontrolki do filtrowania i sortowania listy fiszek.
- **Główne elementy**: Input do wyszukiwania, select sortowania.
- **Obsługiwane interakcje**:
    - Wyszukiwanie fiszek z debounce
    - Zmiana sortowania

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
- **Integracja API**: Wykorzystuje API generacji fiszek z AI.

#### `ShareSetModal`
- **Opis komponentu**: Modal do udostępniania zestawu innym użytkownikom.
- **Główne elementy**: Lista współpracowników, pole dodawania nowych, przyciski z poziomami dostępu.
- **Integracja API**: Zarządzanie dostępami do zestawu.

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
import type { FlashcardsSetDTO } from '@/types';

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
  sortBy?: 'createdAt' | 'front' | 'back';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Udostępnianie (jeśli będzie implementowane)
export interface SetCollaboratorDTO {
  id: string;
  email: string;
  role: 'viewer' | 'editor';
  invitedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface InviteCollaboratorCommand {
  setId: string;
  email: string;
  role: 'viewer' | 'editor';
}
```

## 6. Zarządzanie stanem
W implementacji wykorzystane zostaną:

- **React Query do zarządzania danymi z API**:
  - `useGetFlashcardSetById` - pobieranie szczegółów zestawu
  - `useGetFlashcards` - pobieranie listy fiszek z paginacją i filtrami
  - `useMutateFlashcards` - hook do operacji CRUD na fiszkach
  - `useGenerateFlashcardsSuggestions` - hook do generowania sugestii fiszek

- **URL jako źródło prawdy dla filtrów fiszek**:
  - `useFlashcardFilters` - parametry filtrowania i paginacji w URL

- **Parametry URL do zarządzania modalami**:
  - `useFlashcardModal` - stan modali (dodawanie, edycja, usuwanie fiszek)
  - Reużycie istniejącego `useEditModal` dla edycji zestawu

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