# Zaktualizowany plan implementacji widoku: Lista i szczegóły zestawów (zgodny z logiką klonowania)

## 1. Przegląd

Plan obejmuje widoki listy zestawów (`/protected/sets`) i szczegółów zestawu (`/protected/sets/[setId]`), uwzględniając nową logikę klonowania, przekazywania kopii i udostępniania.

## 2. Zmiany w logice i UI

Kluczowe zmiany w interfejsie użytkownika w stosunku do pierwotnego planu:

- **Rozdzielenie "Udostępniania"**:
  - **Przekaż kopię (dawne "share full")**: Użytkownik wybiera innego użytkownika, a system tworzy dla niego w pełni edytowalną, niezależną kopię zestawu. W UI będzie to jasno komunikowane.
  - **Udostępnij do wglądu (rola `learning`)**: Standardowe udostępnienie z prawem do odczytu, z opcjonalną datą wygaśnięcia.
- **Klonowanie dla siebie**: Osobna akcja "Klonuj" dostępna przy każdym zestawie właściciela, tworząca kopię dla niego samego.
- **Dostosowanie UI do RLS**: Przyciski akcji (Edycja, Usuń, Udostępnij, Klonuj) będą nieaktywne/ukryte dla zestawów niezaakceptowanych (`status != 'accepted'`) oraz dla użytkowników z rolą `learning`.

---

## 3. Widok: Lista Zestawów Fiszki (`/protected/sets`)

### 3.1 Struktura komponentów

```
FlashcardsSetsListViewPage
├── ... (Filtry, Paginacja, etc.)
├── FlashcardsSetTableComponent
│   └── Dla każdego zestawu:
│       ├── ... (Nazwa, Status, Liczba fiszek)
│       └── Przyciski akcji (DropDownMenu):
│           ├── Edytuj
│           ├── Udostępnij (otwiera ShareSetModal)
│           ├── Klonuj (tylko dla właściciela)
│           └── Usuń
└── Modale:
    ├── CreateSetFormComponent (z walidacją unikalności nazwy)
    ├── EditSetFormComponent (z walidacją unikalności nazwy)
    ├── ShareSetModal (z nową logiką)
    └── ConfirmDeleteModalComponent
```

### 3.2 Szczegóły komponentów

#### `FlashcardsSetTableComponent`

- **Akcje**: Zamiast pojedynczych przycisków, użyj `DropDownMenu` dla każdego wiersza.
- **Przycisk "Klonuj"**:
  - Widoczny i aktywny tylko dla zestawów, których zalogowany użytkownik jest właścicielem.
  - Wywołuje hook `useCloneSet`, który wysyła żądanie `POST /api/flashcards-sets/{setId}/clone`.
  - Po sukcesie, odświeża listę i opcjonalnie pokazuje notyfikację.

#### `ShareSetModal` (nowa logika)

- **Opis**: Modal do zarządzania dostępem – przekazywania kopii lub udostępniania do wglądu.
- **Elementy UI**:
  - Pole do wyszukania/wpisania użytkownika (`userId` lub email).
  - Przełącznik (`RadioGroup`) do wyboru trybu:
    1.  **"Przekaż pełną kopię"** (domyślnie)
        - Opis wyjaśniający: "Wybrany użytkownik otrzyma własną, edytowalną kopię tego zestawu. Zmiany nie wpłyną na Twój oryginał."
        - Po wybraniu tej opcji, przycisk "Zatwierdź" wysyła żądanie `POST /api/flashcards-sets/{setId}/transfer` z `targetUserId`.
    2.  **"Udostępnij tylko do wglądu"**
        - Opis wyjaśniający: "Użytkownik będzie mógł tylko przeglądać ten zestaw. Możesz ustawić datę wygaśnięcia dostępu."
        - Po wybraniu tej opcji pojawia się opcjonalne pole `DatePicker` na `expiresAt`.
        - Przycisk "Zatwierdź" wysyła `POST /api/flashcards-sets/{setId}/shares` z `userId`, `role: 'learning'` i opcjonalnym `expiresAt`.
- **Zarządzanie stanem**: Hook `useShareSet` obsługujący logikę wyboru trybu i wysyłania żądania do odpowiedniego endpointu.

#### `CreateSetFormComponent` / `EditSetFormComponent`

- **Walidacja**: Muszą obsługiwać błąd `409 Conflict` z API w przypadku próby zapisu zduplikowanej nazwy i wyświetlać stosowny komunikat.

---

## 4. Widok: Szczegóły Zestawu Fiszek (`/protected/sets/[setId]`)

### 4.1 Struktura i zmiany

- **Nagłówek (`SetDetailsHeader`)**: Przyciski "Udostępnij" i "Klonuj" działają tak samo jak w widoku listy.
- **Filtrowanie fiszek (`FlashcardsListFilters`)**:
  - Dodaj pole wyszukiwania, które będzie realizować **pełnotekstowe wyszukiwanie** po `question` i `answer`, wykorzystując `search_vector` z bazy danych. API musi wspierać ten nowy parametr.
- **Widok historii zmian fiszki**:
  - Przy każdej fiszce w `FlashcardsListView` dodaj ikonę/przycisk "Pokaż historię".
  - Kliknięcie otwiera modal/drawer (`FlashcardHistoryModal`), który pobiera i wyświetla dane z tabeli `flashcards_history` dla danej fiszki.
- **Walidacja w modalach fiszek**:
  - Formularze `AddFlashcardManuallyModal` i `EditFlashcardModal` muszą respektować `CHECK constraints` z bazy (długość `question` <= 1000, `answer` <= 5000, niepuste).

## 5. Integracja API

- **`useGetFlashcardSets`**: Musi pobierać dane `flashcardCount` z API (pochodzące z materialized view).
- **Nowe hooki**:
  - `useCloneSet`: `POST /api/flashcards-sets/{setId}/clone`
  - `useTransferSet`: `POST /api/flashcards-sets/{setId}/transfer`
  - `useShareSet`: `POST /api/flashcards-sets/{setId}/shares`
  - `useGetFlashcardHistory`: `GET /api/flashcards/{flashcardId}/history` (nowy endpoint do zdefiniowania)
- **Wyszukiwanie pełnotekstowe**: Endpoint `GET /api/flashcards` (dla listy fiszek w zestawie) musi przyjmować nowy parametr `searchQuery`, który będzie używany w zapytaniu `WHERE to_tsvector(...) @@ to_tsquery(...)`.

## 6. Podsumowanie kroków implementacji UI

1. Zmodyfikować `FlashcardsSetTableComponent`, dodając `DropDownMenu` z akcjami "Edytuj", "Udostępnij", "Klonuj", "Usuń" i logiką ich widoczności.
2. Zaimplementować hook `useCloneSet` i podpiąć pod przycisk "Klonuj".
3. Przeprojektować `ShareSetModal` zgodnie z nową logiką (wybór trybu, warunkowe wyświetlanie `expiresAt`).
4. Zaimplementować hooki `useTransferSet` i `useShareSet` i podpiąć je do `ShareSetModal`.
5. Dodać obsługę błędu `409 Conflict` w formularzach tworzenia/edycji zestawu.
6. W widoku szczegółów zestawu rozbudować filtrowanie fiszek o wyszukiwanie pełnotekstowe.
7. Dodać przycisk historii przy fiszce i zaimplementować `FlashcardHistoryModal` wraz z hookiem `useGetFlashcardHistory`.
8. Dodać walidację długości pól w formularzach dodawania/edycji fiszek.
9. Upewnić się, że całe UI respektuje uprawnienia wynikające ze statusu zestawu i roli użytkownika.
