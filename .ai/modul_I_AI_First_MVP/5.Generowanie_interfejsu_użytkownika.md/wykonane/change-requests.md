# Lista Zmian: Aktualizacja Widoku Listy Zestawów Fiszki

Poniższa lista opisuje zmiany wymagane do zaktualizowania istniejącej implementacji widoku listy zestawów fiszek (`view_list_old.md`) do nowej specyfikacji (`plan-implementacji-widoku-listy-zestawow-fiszek.md`).

## 1. Klonowanie Zestawów

-   **Cel:** Umożliwienie użytkownikom tworzenia kopii istniejących zestawów.
-   **Zadania:**
    -   W komponencie `FlashcardsSetTableComponent` dodaj nowy przycisk akcji "Klonuj" (np. ikona kopii) obok przycisków "Edytuj" i "Usuń".
    -   Stwórz nowy hook `useCloneFlashcardSet` (`features/flashcard-sets/api/useCloneFlashcardSet.tsx`).
    -   Hook ten powinien wywoływać mutację na endpoint `POST /api/flashcards-sets/{setId}/clone`.
    -   Po pomyślnym sklonowaniu, lista zestawów powinna zostać automatycznie odświeżona, a użytkownik opcjonalnie przekierowany do edycji nowo utworzonej kopii.

## 2. Walidacja Unikalności Nazwy Zestawu

-   **Cel:** Zapobieganie tworzeniu przez użytkownika wielu zestawów o tej samej nazwie, co jest teraz wymuszane przez bazę danych.
-   **Zadania:**
    -   W formularzach `CreateSetFormComponent` i `EditSetFormComponent` zaimplementuj walidację pola `name` w czasie rzeczywistym.
    -   Użyj hooka `useDebounce`, aby sprawdzać unikalność nazwy po stronie serwera dopiero po chwili przerwy we wpisywaniu.
    -   Dodaj obsługę błędu `409 Conflict` z API w hooku `useMutateFlashcardSets`. W przypadku wystąpienia błędu, formularz powinien wyświetlić czytelny komunikat, np. "Zestaw o tej nazwie już istnieje."

## 3. Ograniczenia Interfejsu Użytkownika (RLS)

-   **Cel:** Dostosowanie dostępnych akcji w interfejsie do uprawnień użytkownika i statusu zestawu.
-   **Zadania:**
    -   W komponencie `FlashcardsSetTableComponent` zablokuj (ukryj lub wyszarz) przyciski "Edytuj", "Usuń" oraz "Klonuj" dla zestawów, które:
        -   Mają status inny niż `accepted`.
        -   Należą do użytkownika z rolą `learning` (jeśli taka informacja jest dostępna po stronie klienta).
    -   Dodaj komponent `Tooltip` (np. z biblioteki shadcn/ui), który po najechaniu na zablokowany przycisk wyjaśni powód blokady (np. "Nie można edytować opublikowanego zestawu").

## 4. Wyświetlanie Liczby Fiszek

-   **Cel:** Optymalizacja wyświetlania liczby fiszek.
-   **Zadania:**
    -   W komponencie `FlashcardsSetTableComponent` upewnij się, że kolumna "Liczba Fiszek" wyświetla wartość `flashcardCount` pobraną bezpośrednio z API (z widoku `FlashcardsSetViewItem`), zamiast liczyć długość tablicy fiszek po stronie klienta.

