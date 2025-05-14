# Plan implementacji widoku: Lista Zestawów Fiszki

## 1. Przegląd
Widok "Lista Zestawów Fiszki" (`/sets`) umożliwia użytkownikom przeglądanie, tworzenie, edytowanie i usuwanie swoich zestawów fiszek. Prezentuje kluczowe informacje o każdym zestawie, takie jak nazwa, status i liczba fiszek (jeśli dostępna z API). Użytkownik może również inicjować filtrowanie i sortowanie listy oraz nawigować do szczegółowego widoku danego zestawu.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/sets`

## 3. Struktura komponentów
```
FlashcardsSetsListView (Komponent strony, ścieżka: /sets)
├── Przycisk "Utwórz nowy zestaw" (otwiera CreateSetModal)
├── FilterControlsComponent
│   ├── Pole tekstowe (do wyszukiwania po nazwie - filtrowanie po stronie klienta lub przyszłe API)
│   └── SelectInput (do filtrowania po statusie zestawu)
│   └── SelectInput (do sortowania listy)
├── FlashcardsSetTableComponent / FlashcardsSetGridComponent (wyświetla listę zestawów)
│   ├── Nagłówki Tabeli (umożliwiające sortowanie np. po Nazwie, Statusie, Dacie utworzenia)
│   └── FlashcardsSetRowComponent / FlashcardsSetCardComponent (dla każdego zestawu na liście)
│       ├── Nazwa Zestawu
│       ├── Status Zestawu
│       ├── Data Utworzenia
│       ├── Liczba Fiszek (jeśli FlashcardsSetDTO zostanie rozszerzone o tę informację)
│       ├── Przycisk "Edytuj" (otwiera EditSetModal)
│       ├── Przycisk "Usuń" (otwiera ConfirmDeleteModal)
│       └── Link/Przycisk "Zobacz szczegóły" (nawigacja do /sets/[setId])
├── PaginationControlsComponent (do nawigacji między stronami wyników)
├── EmptyStateSetsComponent (wyświetlany, gdy użytkownik nie ma żadnych zestawów)
│   └── Przycisk "Utwórz swój pierwszy zestaw"
├── CreateSetModalComponent (modal do tworzenia nowego zestawu)
│   └── CreateSetFormComponent
├── EditSetModalComponent (modal do edycji istniejącego zestawu)
│   └── EditSetFormComponent
└── ConfirmDeleteModalComponent (modal do potwierdzenia usunięcia zestawu)
```

## 4. Szczegóły komponentów

### `FlashcardsSetsListView` (Komponent strony)
- **Opis komponentu**: Główny kontener widoku listy zestawów. Odpowiada za pobieranie danych, zarządzanie stanem filtrów, sortowania, paginacji oraz wyświetlanie odpowiednich sub-komponentów (tabela/siatka, modale, stan pusty).
- **Główne elementy**: Kontener `div`, `<Button />` (Shadcn/ui) do tworzenia nowego zestawu, `FilterControlsComponent`, `FlashcardsSetTableComponent` (lub `FlashcardsSetGridComponent`), `PaginationControlsComponent`, `EmptyStateSetsComponent`. Wywołuje modale (`CreateSetModalComponent`, `EditSetModalComponent`, `ConfirmDeleteModalComponent`).
- **Obsługiwane interakcje**:
    - Kliknięcie "Utwórz nowy zestaw" -> otwiera `CreateSetModalComponent`.
    - Zmiana filtrów w `FilterControlsComponent` -> aktualizuje stan filtrów i ponownie pobiera dane.
    - Zmiana strony w `PaginationControlsComponent` -> aktualizuje stan paginacji i ponownie pobiera dane.
    - Odbiera zdarzenia edycji/usunięcia/zobaczenia szczegółów z `FlashcardsSetTableComponent` i otwiera odpowiednie modale lub nawiguje.
- **Obsługiwana walidacja**: Pośrednio, poprzez przekazywanie parametrów do API.
- **Typy**: `PaginatedResponse<FlashcardsSetDTO>`, `FlashcardsSetFiltersViewModel`, `CurrentModalViewModel`.
- **Propsy**: Brak (komponent strony).

### `FilterControlsComponent`
- **Opis komponentu**: Zawiera kontrolki do filtrowania i sortowania listy zestawów (np. po statusie, nazwie, kolejności).
- **Główne elementy**: Kontener `div`, `<Input />` (Shadcn/ui) do wyszukiwania tekstowego, `<Select />` (Shadcn/ui) do wyboru statusu, `<Select />` do wyboru kryterium sortowania i kierunku.
- **Obsługiwane interakcje**:
    - `onFilterChange(newFilters: FlashcardsSetFiltersViewModel)`: emitowane przy zmianie wartości któregokolwiek filtra.
    - `onSortChange(sortBy: string, sortOrder: 'asc' | 'desc')`: emitowane przy zmianie sortowania.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardsSetFiltersViewModel`, `FlashcardsSetStatus`.
- **Propsy**:
    - `initialFilters: FlashcardsSetFiltersViewModel`
    - `onFiltersChange: (filters: FlashcardsSetFiltersViewModel) => void`

### `FlashcardsSetTableComponent` (lub `FlashcardsSetGridComponent`)
- **Opis komponentu**: Wyświetla listę zestawów w formie tabeli lub siatki kart. Każdy element listy zawiera podstawowe informacje o zestawie oraz akcje do wykonania.
- **Główne elementy**: Shadcn/ui `<Table />` (z `<TableHeader />`, `<TableBody />`, `<TableRow />`, `<TableHead />`, `<TableCell />`) lub kontenery `div` dla siatki kart. W każdej komórce/karcie: tekst, `<Button />` (Shadcn/ui) dla akcji, `<Link />` (Next.js) do nawigacji.
- **Obsługiwane interakcje**:
    - `onEditSet(set: FlashcardsSetDTO)`: emitowane po kliknięciu przycisku "Edytuj".
    - `onDeleteSet(set: FlashcardsSetDTO)`: emitowane po kliknięciu przycisku "Usuń".
    - `onViewSet(setId: string)`: emitowane po kliknięciu przycisku/linku "Zobacz szczegóły".
    - Kliknięcie nagłówka kolumny (jeśli sortowanie po stronie klienta lub do zmiany parametrów API).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardsSetViewItem[]` (lub `FlashcardsSetDTO[]`).
- **Propsy**:
    - `sets: FlashcardsSetViewItem[]` (lub `FlashcardsSetDTO[]`)
    - `isLoading: boolean`
    - `onEdit: (set: FlashcardsSetDTO) => void`
    - `onDelete: (set: FlashcardsSetDTO) => void`
    - `onView: (setId: string) => void`
    - `onSort: (columnKey: string) => void` (jeśli sortowanie jest obsługiwane przez kliknięcie nagłówka)

### `PaginationControlsComponent`
- **Opis komponentu**: Umożliwia nawigację między stronami listy zestawów.
- **Główne elementy**: Kontener `div`, `<Button />` (Shadcn/ui) dla "Poprzednia" i "Następna strona", wyświetlanie informacji o bieżącej stronie i liczbie stron.
- **Obsługiwane interakcje**:
    - `onPageChange(newPage: number)`: emitowane przy zmianie strony.
- **Obsługiwana walidacja**: Sprawdzenie, czy nie wyjść poza zakres dostępnych stron.
- **Typy**: `MetaDTO`.
- **Propsy**:
    - `meta: MetaDTO`
    - `onPageChange: (page: number) => void`

### `CreateSetModalComponent`
- **Opis komponentu**: Modal do tworzenia nowego zestawu fiszek. Zawiera formularz z polem na nazwę zestawu.
- **Główne elementy**: Shadcn/ui `<Dialog />` (z `<DialogContent />`, `<DialogHeader />`, `<DialogTitle />`, `<DialogFooter />`), `CreateSetFormComponent`.
- **Obsługiwane interakcje**:
    - `onSubmit(command: CreateFlashcardsSetCommand)`: emitowane po pomyślnym zwalidowaniu i wysłaniu formularza.
    - `onClose()`: emitowane przy zamknięciu modala.
- **Obsługiwana walidacja**: Nazwa zestawu jest wymagana.
- **Typy**: `CreateFlashcardsSetCommand`.
- **Propsy**:
    - `isOpen: boolean`
    - `onClose: () => void`
    - `onSubmit: (command: CreateFlashcardsSetCommand) => Promise<void>` (lub `Promise<FlashcardsSetDTO>`)

### `CreateSetFormComponent` (wewnątrz `CreateSetModalComponent`)
- **Opis komponentu**: Formularz do wprowadzania danych dla nowego zestawu.
- **Główne elementy**: `<form>`, Shadcn/ui `<Input />` dla nazwy, `<Button />` "Zapisz" i "Anuluj".
- **Obsługiwane interakcje**: Wprowadzanie tekstu, submit formularza.
- **Obsługiwana walidacja**:
    - `name`: Wymagane. Minimalna/maksymalna długość (np. min 3, max 100 znaków).
- **Typy**: `CreateFlashcardsSetCommand`.
- **Propsy**:
    - `onSubmit: (data: CreateFlashcardsSetCommand) => void`
    - `onCancel: () => void`
    - `isLoading: boolean` (do blokowania przycisku submit)

### `EditSetModalComponent`
- **Opis komponentu**: Modal do edycji istniejącego zestawu fiszek (nazwa, status).
- **Główne elementy**: Analogiczne do `CreateSetModalComponent`, ale z `EditSetFormComponent`.
- **Obsługiwane interakcje**:
    - `onSubmit(setId: string, command: UpdateFlashcardsSetCommand)`: emitowane po wysłaniu formularza.
    - `onClose()`: emitowane przy zamknięciu modala.
- **Obsługiwana walidacja**: Nazwa zestawu jest wymagana, status musi być prawidłową wartością enum.
- **Typy**: `UpdateFlashcardsSetCommand`, `FlashcardsSetDTO` (dla danych początkowych).
- **Propsy**:
    - `isOpen: boolean`
    - `set: FlashcardsSetDTO | null` (dane edytowanego zestawu)
    - `onClose: () => void`
    - `onSubmit: (setId: string, command: UpdateFlashcardsSetCommand) => Promise<void>` (lub `Promise<FlashcardsSetDTO>`)

### `EditSetFormComponent` (wewnątrz `EditSetModalComponent`)
- **Opis komponentu**: Formularz do edycji danych zestawu.
- **Główne elementy**: `<form>`, Shadcn/ui `<Input />` dla nazwy, `<Select />` dla statusu, `<Button />` "Zapisz" i "Anuluj".
- **Obsługiwane interakcje**: Wprowadzanie tekstu, wybór statusu, submit formularza.
- **Obsługiwana walidacja**:
    - `name`: Wymagane (jeśli zmieniane). Minimalna/maksymalna długość.
    - `status`: Musi być jedną z wartości `FlashcardsSetStatus`.
- **Typy**: `UpdateFlashcardsSetCommand`, `FlashcardsSetDTO`.
- **Propsy**:
    - `initialData: FlashcardsSetDTO`
    - `onSubmit: (data: UpdateFlashcardsSetCommand) => void`
    - `onCancel: () => void`
    - `isLoading: boolean`

### `ConfirmDeleteModalComponent`
- **Opis komponentu**: Modal do potwierdzenia operacji usunięcia zestawu.
- **Główne elementy**: Shadcn/ui `<Dialog />`, tekst potwierdzenia (np. "Czy na pewno chcesz usunąć zestaw '[Nazwa zestawu]'? Tej operacji nie można cofnąć."), `<Button />` "Usuń" i "Anuluj".
- **Obsługiwane interakcje**:
    - `onConfirmDelete(setId: string)`: emitowane po kliknięciu "Usuń".
    - `onClose()`: emitowane przy zamknięciu modala.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardsSetDTO` (do wyświetlenia nazwy).
- **Propsy**:
    - `isOpen: boolean`
    - `set: FlashcardsSetDTO | null` (dane usuwanego zestawu)
    - `onClose: () => void`
    - `onConfirm: (setId: string) => Promise<void>`

### `EmptyStateSetsComponent`
- **Opis komponentu**: Wyświetlany, gdy użytkownik nie posiada żadnych zestawów fiszek. Zachęca do stworzenia pierwszego.
- **Główne elementy**: Kontener `div`, tekst informacyjny, `<Button />` (Shadcn/ui) "Utwórz swój pierwszy zestaw".
- **Obsługiwane interakcje**:
    - Kliknięcie przycisku "Utwórz swój pierwszy zestaw" -> powinno wywołać akcję otwarcia `CreateSetModalComponent`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**:
    - `onCreateNewSet: () => void`

## 5. Typy
Będziemy korzystać z istniejących typów DTO z `types.ts`:
-   `FlashcardsSetDTO`: Reprezentuje zestaw fiszek.
    ```typescript
    export interface FlashcardsSetDTO {
      id: string;
      ownerId: string;
      name: string;
      status: FlashcardsSetStatus; // "pending" | "accepted" | "rejected"
      createdAt: string;
      updatedAt: string;
      // UWAGA: Zgodnie z PRD (US-202), powinna tu być liczba fiszek. 
      // Jeśli API GET /flashcards-sets nie zwraca tej informacji, 
      // należy to uzgodnić z backendem lub pominąć wyświetlanie liczby fiszek w tym widoku.
      // flashcardCount?: number; 
    }
    ```
-   `CreateFlashcardsSetCommand`: Do tworzenia nowego zestawu.
    ```typescript
    export interface CreateFlashcardsSetCommand {
      name: FlashcardsSetDTO["name"];
    }
    ```
-   `UpdateFlashcardsSetCommand`: Do aktualizacji zestawu.
    ```typescript
    export type UpdateFlashcardsSetCommand = Partial<
      Pick<FlashcardsSetDTO, "name" | "status">
    >;
    ```
-   `PaginatedResponse<T>`: Ogólny typ dla paginowanych odpowiedzi.
-   `MetaDTO`: Metadane paginacji.
-   `FlashcardsSetStatus`: Enum dla statusu zestawu.

Nowe typy ViewModel (po stronie klienta):
-   **`FlashcardsSetViewItem`**: Typ używany do wyświetlania danych w tabeli/siatce, może rozszerzać `FlashcardsSetDTO` o dodatkowe pola UI.
    ```typescript
    interface FlashcardsSetViewItem extends FlashcardsSetDTO {
      // flashcardCount?: number; // Jeśli API nie dostarcza, może być opcjonalne
      // isDeleting?: boolean; // Do obsługi stanu ładowania dla konkretnego wiersza
      // isEditing?: boolean; // Do obsługi stanu ładowania dla konkretnego wiersza
    }
    ```
-   **`FlashcardsSetFiltersViewModel`**: Reprezentuje aktualny stan filtrów i sortowania.
    ```typescript
    interface FlashcardsSetFiltersViewModel {
      page: number;
      limit: number;
      sortBy?: keyof FlashcardsSetDTO | string; // np. 'name', 'createdAt'
      sortOrder?: "asc" | "desc";
      status?: FlashcardsSetStatus | ""; // "" dla braku filtra statusu
      nameSearch?: string; // Dla wyszukiwania po nazwie
    }
    ```
-   **`CurrentModalViewModel`**: Określa, który modal jest aktualnie otwarty i jakie dane przekazuje.
    ```typescript
    interface CurrentModalViewModel {
      type: "create" | "edit" | "delete" | null;
      data?: FlashcardsSetDTO; // Dane dla modala edycji lub usunięcia
    }
    ```

## 6. Zarządzanie stanem
Główny stan widoku będzie zarządzany w komponencie `FlashcardsSetsListView`.
-   `setsData: PaginatedResponse<FlashcardsSetDTO> | null`: Przechowuje pobrane zestawy i metadane paginacji.
-   `isLoading: boolean`: Globalny stan ładowania dla listy.
-   `error: string | null`: Przechowuje komunikaty o błędach.
-   `filters: FlashcardsSetFiltersViewModel`: Aktualne parametry filtrowania, sortowania i paginacji. Inicjalizowane wartościami domyślnymi (np. page 1, limit 20).
-   `currentModal: CurrentModalViewModel`: Stan określający, który modal jest otwarty (`{ type: null, data: undefined }` gdy żaden).

**Custom Hook (`useFlashcardSets`)**:
Rozważenie stworzenia hooka `useFlashcardSets` (lub podobnego, np. integracja z React Query/SWR) do hermetyzacji logiki pobierania danych, obsługi stanu ładowania, błędów oraz interakcji z API (CRUD).
-   **Funkcje hooka**:
    -   `fetchSets(params: FlashcardsSetFiltersViewModel)`
    -   `createSet(command: CreateFlashcardsSetCommand)`
    -   `updateSet(setId: string, command: UpdateFlashcardsSetCommand)`
    -   `deleteSet(setId: string)`
-   **Zwracane wartości**:
    -   `data: PaginatedResponse<FlashcardsSetDTO> | null`
    -   `isLoading: boolean`
    -   `error: any`
    -   Funkcje mutujące (create, update, delete)

Aktualizacja stanu `filters` (np. przez `FilterControlsComponent` lub `PaginationControlsComponent`) powinna wywoływać ponowne pobranie danych z API z nowymi parametrami.
Stan formularzy w modalach będzie zarządzany lokalnie w tych komponentach (np. przy użyciu `useState` lub biblioteki do obsługi formularzy jak `react-hook-form`).

## 7. Integracja API
Widok będzie korzystał z następujących endpointów API (zgodnie z `@flashcards-sets-api-plan.md`):

1.  **Listowanie zestawów fiszek**:
    -   Endpoint: `GET /flashcards-sets`
    -   Parametry zapytania: `page`, `limit`, `sortBy`, `status` (zgodnie z `FlashcardsSetFiltersViewModel`).
    -   Typy żądania: Brak ciała, parametry w URL.
    -   Typy odpowiedzi (Sukces 200 OK): `PaginatedResponse<FlashcardsSetDTO>`.
    -   Wywoływane: Przy pierwszym załadowaniu widoku oraz przy każdej zmianie filtrów, sortowania lub paginacji.

2.  **Tworzenie zestawu fiszek**:
    -   Endpoint: `POST /flashcards-sets`
    -   Typy żądania (Body): `CreateFlashcardsSetCommand` (`{ name: string }`).
    -   Typy odpowiedzi (Sukces 201 Created): `FlashcardsSetDTO` (nowo utworzony zestaw).
    -   Wywoływane: Po wysłaniu formularza w `CreateSetModalComponent`.

3.  **Aktualizacja zestawu fiszek**:
    -   Endpoint: `PUT /flashcards-sets/{setId}`
    -   Parametry ścieżki: `setId` (UUID).
    -   Typy żądania (Body): `UpdateFlashcardsSetCommand` (`{ name?: string, status?: FlashcardsSetStatus }`).
    -   Typy odpowiedzi (Sukces 200 OK): `FlashcardsSetDTO` (zaktualizowany zestaw).
    -   Wywoływane: Po wysłaniu formularza w `EditSetModalComponent`.

4.  **Usuwanie zestawu fiszek**:
    -   Endpoint: `DELETE /flashcards-sets/{setId}`
    -   Parametry ścieżki: `setId` (UUID).
    -   Typy żądania: Brak ciała.
    -   Typy odpowiedzi (Sukces 204 No Content): Brak ciała.
    -   Wywoływane: Po potwierdzeniu w `ConfirmDeleteModalComponent`.

Do obsługi zapytań API można użyć globalnego klienta API (np. skonfigurowanego Axios'a lub standardowego `fetch` opakowanego w custom hook `useFlashcardSets`). Należy pamiętać o dołączaniu tokenu autoryzacyjnego (`Authorization: Bearer <token>`) do nagłówków każdego żądania.

## 8. Interakcje użytkownika
-   **Przeglądanie listy**: Użytkownik widzi tabelę/siatkę zestawów. Może użyć paginacji do nawigacji.
-   **Sortowanie**: Kliknięcie na nagłówek kolumny w tabeli (jeśli zaimplementowane) lub wybór z dedykowanego selecta zmienia kolejność wyświetlanych zestawów.
-   **Filtrowanie**: Wpisanie tekstu w polu wyszukiwania (np. po nazwie) lub wybór statusu z selecta filtruje listę.
-   **Tworzenie nowego zestawu**:
    1.  Kliknięcie przycisku "Utwórz nowy zestaw".
    2.  Otwiera się `CreateSetModalComponent`.
    3.  Użytkownik wprowadza nazwę zestawu.
    4.  Kliknięcie "Zapisz" -> walidacja -> wywołanie API POST -> zamknięcie modala -> odświeżenie listy / optymistyczne dodanie.
    5.  Kliknięcie "Anuluj" lub zamknięcie modala -> modal znika bez zmian.
-   **Edycja zestawu**:
    1.  Kliknięcie przycisku "Edytuj" przy wybranym zestawie.
    2.  Otwiera się `EditSetModalComponent` z załadowanymi danymi zestawu.
    3.  Użytkownik modyfikuje nazwę i/lub status.
    4.  Kliknięcie "Zapisz" -> walidacja -> wywołanie API PUT -> zamknięcie modala -> odświeżenie listy / optymistyczna aktualizacja.
-   **Usuwanie zestawu**:
    1.  Kliknięcie przycisku "Usuń" przy wybranym zestawie.
    2.  Otwiera się `ConfirmDeleteModalComponent` z prośbą o potwierdzenie.
    3.  Kliknięcie "Usuń" -> wywołanie API DELETE -> zamknięcie modala -> odświeżenie listy / optymistyczne usunięcie.
-   **Nawigacja do szczegółów zestawu**: Kliknięcie nazwy zestawu lub przycisku "Zobacz szczegóły" przekierowuje użytkownika na stronę `/sets/[setId]`.
-   **Brak zestawów**: Jeśli lista jest pusta, wyświetlany jest `EmptyStateSetsComponent` z przyciskiem do utworzenia pierwszego zestawu.

## 9. Warunki i walidacja
-   **API `GET /flashcards-sets`**:
    -   `page`: liczba całkowita, >= 1. Weryfikowane przez `PaginationControlsComponent`.
    -   `limit`: liczba całkowita, > 0. Ustawiane w `FlashcardsSetsListView`.
    -   `sortBy`: opcjonalny string, np. `name`, `createdAt`. Weryfikowane przez `FilterControlsComponent`.
    -   `status`: opcjonalny string, musi być jednym z `FlashcardsSetStatus`. Weryfikowane przez `FilterControlsComponent`.
-   **Komponent `CreateSetFormComponent`**:
    -   `name`: Wymagane. Walidacja np. `minLength: 3`, `maxLength: 100`. Komunikat błędu wyświetlany przy polu. Przycisk "Zapisz" nieaktywny do czasu poprawnej walidacji.
-   **Komponent `EditSetFormComponent`**:
    -   `name`: Wymagane (jeśli edytowane). Walidacja jak wyżej.
    -   `status`: Wymagane. Musi być jedną z predefiniowanych wartości `FlashcardsSetStatus`.
-   Przycisk "Zapisz" w modalach powinien być nieaktywny, jeśli formularz nie jest poprawnie wypełniony lub trwa proces wysyłania danych (`isLoading`).

## 10. Obsługa błędów
-   **Błędy API (ogólne)**:
    -   W przypadku niepowodzenia żądania API (np. błąd serwera 5xx, błąd sieci), wyświetlić globalny komunikat błędu (np. używając systemu notyfikacji Shadcn/ui `toast` lub dedykowanego miejsca na stronie). Komunikat: "Wystąpił błąd podczas [ładowania/tworzenia/aktualizacji/usuwania] zestawów. Spróbuj ponownie później."
    -   Stan `error` w `FlashcardsSetsListView` przechowuje informację o błędzie.
-   **Błąd 401 Unauthorized**: Globalny handler powinien przekierować na stronę logowania.
-   **Błąd 403 Forbidden**: Wyświetlić komunikat "Nie masz uprawnień do wykonania tej akcji."
-   **Błąd 404 Not Found (np. przy próbie edycji/usunięcia nieistniejącego zasobu)**: Wyświetlić komunikat "Zestaw nie został znaleziony." i odświeżyć listę.
-   **Błędy walidacji API (400 Bad Request)**:
    -   Jeśli API zwraca szczegółowe błędy walidacji dla konkretnych pól, należy je (jeśli to możliwe) wyświetlić przy odpowiednich polach w formularzach modalnych. W przeciwnym razie, ogólny komunikat "Wprowadzone dane są nieprawidłowe."
-   **Brak zestawów (stan pusty)**: Jeśli API zwróci pustą listę (`data: []`), komponent `EmptyStateSetsComponent` powinien być wyświetlony zamiast tabeli/siatki.
-   **Stan ładowania**: Podczas wysyłania żądań API (ładowanie listy, tworzenie, edycja, usuwanie), odpowiednie elementy UI (np. przyciski w modalach, cała tabela) powinny być w stanie `isLoading` (np. wyłączone, z animacją ładowania), aby zapobiec wielokrotnym kliknięciom i poinformować użytkownika o trwającej operacji.

## 11. Kroki implementacji
1.  **Przygotowanie typów**: Zdefiniować `FlashcardsSetViewItem`, `FlashcardsSetFiltersViewModel`, `CurrentModalViewModel` w odpowiednim pliku (np. `features/flashcard-sets/types.ts`). Potwierdzić, czy `FlashcardsSetDTO` z API będzie zawierać `flashcardCount`.
2.  **Stworzenie hooka `useFlashcardSets` (opcjonalnie, ale zalecane)**:
    -   Zaimplementować logikę komunikacji z API (`GET`, `POST`, `PUT`, `DELETE /flashcards-sets`).
    -   Obsługa dołączania tokenu autoryzacyjnego.
    -   Zarządzanie stanami ładowania i błędów dla operacji API.
3.  **Implementacja komponentu `FlashcardsSetsListView`**:
    -   Inicjalizacja stanu (`setsData`, `isLoading`, `error`, `filters`, `currentModal`).
    -   Implementacja funkcji do pobierania danych przy użyciu `useFlashcardSets` lub bezpośrednio.
    -   Obsługa logiki otwierania/zamykania modali i przekazywania do nich danych.
    -   Renderowanie sub-komponentów.
4.  **Implementacja `FilterControlsComponent`**:
    -   Dodanie kontrolek (input dla nazwy, select dla statusu, select dla sortowania).
    -   Emitowanie zdarzeń `onFiltersChange` / `onSortChange`.
5.  **Implementacja `FlashcardsSetTableComponent` / `FlashcardsSetGridComponent`**:
    -   Stworzenie struktury tabeli/siatki (np. z użyciem komponentów Shadcn/ui).
    -   Renderowanie wierszy/kart na podstawie przekazanych danych (`props.sets`).
    -   Dodanie przycisków akcji ("Edytuj", "Usuń", "Zobacz szczegóły") i obsługa emitowania odpowiednich zdarzeń.
    -   Implementacja sortowania po kliknięciu nagłówków (jeśli dotyczy).
6.  **Implementacja `PaginationControlsComponent`**:
    -   Wyświetlanie informacji o stronach na podstawie `props.meta`.
    -   Obsługa kliknięć przycisków nawigacji i emitowanie `onPageChange`.
7.  **Implementacja Modali**:
    -   **`CreateSetModalComponent`** i **`CreateSetFormComponent`**:
        -   Struktura modala i formularza (Shadcn/ui).
        -   Walidacja pola `name` (np. z `react-hook-form` lub manualnie).
        -   Obsługa `onSubmit` i komunikacja z `FlashcardsSetsListView` (lub `useFlashcardSets`).
    -   **`EditSetModalComponent`** i **`EditSetFormComponent`**: Analogicznie, z polami `name` i `status`.
    -   **`ConfirmDeleteModalComponent`**: Prosty modal z potwierdzeniem.
8.  **Implementacja `EmptyStateSetsComponent`**:
    -   Wyświetlanie komunikatu i przycisku "Utwórz nowy zestaw".
9.  **Routing**: Dodanie ścieżki `/sets` w systemie routingu Next.js, wskazującej na `FlashcardsSetsListView`.
10. **Styling**: Użycie Tailwind CSS i komponentów Shadcn/ui do ostylowania widoku zgodnie z minimalistycznym designem. Zapewnienie responsywności.
11. **Obsługa błędów i stanów ładowania**: Zintegrowanie wyświetlania komunikatów o błędach i wskaźników ładowania we wszystkich relevantnych miejscach.
12. **Testowanie**:
    -   Testy jednostkowe dla logiki w hookach i komponentach (np. walidacja formularzy).
    -   Testy integracyjne dla przepływów użytkownika (tworzenie, edycja, usuwanie zestawu).
13. **Dostępność (A11y)**: Zapewnienie nawigacji klawiaturą, odpowiednich atrybutów ARIA, zarządzania focusem w modalach.
``` 