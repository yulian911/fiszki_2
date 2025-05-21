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