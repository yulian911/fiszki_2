# API Endpoint Implementation Plan: Flashcards

**Tech stack**: Next.js, React, TypeScript, Tailwind, Shadcn/ui, Supabase SDK, Openrouter.ai (zgodnie z `@techstack.md`)

## 1. Przegląd punktu końcowego

Zestaw punktów końcowych do zarządzania pojedynczymi fiszkami użytkownika: listowanie, tworzenie, pobieranie, aktualizacja oraz usuwanie. Dane przechowywane w tabeli `Flashcards` powiązanej z `FlashcardsSet` i powiązaniami do tagów (`Tags`, `Flashcards_Tags`) (szczegóły w `@db-plan.md`).

## 2. Szczegóły żądania

#### 2.1 List Flashcards

- Metoda HTTP: GET
- Ścieżka: `/flashcards`
- Parametry zapytania:
  - `setId` (UUID, opcjonalnie filtr po zestawie)
  - `source` (`ai-full` | `ai-edit` | `manual`, opcjonalnie)
  - `tags` (string, lista tagów rozdzielona przecinkami, opcjonalnie)
  - `page` (int, domyślnie 1)
  - `limit` (int, domyślnie 20, max 100)
  - `sortBy` (string, np. `createdAt`, `question`)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK):
  ```json
  {
    "data": [<FlashcardDTO>...],
    "meta": { "page":1, "limit":20, "total":NN }
  }
  ```
  Typ odpowiedzi: `PaginatedResponse<FlashcardDTO>`

#### 2.2 Create Flashcard (Manual)

- Metoda HTTP: POST
- Ścieżka: `/flashcards`
- Body (`application/json`): `CreateFlashcardCommand`
  ```json
  {
    "flashcardsSetId": "uuid",
    "question": "Pytanie?",
    "answer": "Odpowiedź.",
    "source": "manual",
    "tags": ["tag1", "tag2"],
    "hint": "Opcjonalna wskazówka"
  }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (201 Created): `FlashcardDTO`

#### 2.3 Get Flashcard

- Metoda HTTP: GET
- Ścieżka: `/flashcards/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `FlashcardDTO`

#### 2.4 Update Flashcard

- Metoda HTTP: PUT
- Ścieżka: `/flashcards/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Body (`application/json`): `UpdateFlashcardCommand`
  ```json
  {
    "question": "Nowe pytanie?",
    "answer": "Nowa odpowiedź.",
    "tags": ["tag1"],
    "hint": "Nowa wskazówka"
  }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `FlashcardDTO`

#### 2.5 Delete Flashcard

- Metoda HTTP: DELETE
- Ścieżka: `/flashcards/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (204 No Content)

## 3. Wykorzystywane typy

- `FlashcardDTO`, `CreateFlashcardCommand`, `UpdateFlashcardCommand`, `MetaDTO`, `PaginatedResponse` (z `@types.ts`)

## 4. Szczegóły odpowiedzi

- 200 OK: sukcesowe odczyty listy i pojedynczej fiszki
- 201 Created: udane utworzenie fiszki
- 204 No Content: udane usunięcie
- Ciała odpowiedzi zgodne z interfejsami z `@types.ts`

## 5. Przepływ danych

1. Kontroler/Router odbiera żądanie.
2. Walidacja wejścia za pomocą Zod (`@backend.mdc`).
3. Wywołanie metody z `FlashcardsService`.
4. Komunikacja z Supabase SDK (tabela `Flashcards`, `Flashcards_Tags`, `Tags`).
5. W przypadku tworzenia: utworzenie tagów lub powiązań w jednej transakcji.
6. Mapowanie rekordów na DTO i zwrócenie klientowi.

## 6. Względy bezpieczeństwa

- Autoryzacja JWT Supabase i RLS (`@backend.mdc`).
- Uprawnienia: dostęp tylko do fiszek we własnych zestawach lub udostępnionych.
- Walidacja danych wejściowych (Zod).
- Ograniczenie `limit` do maksymalnie 100.

## 7. Obsługa błędów

- 400 Bad Request — błędy walidacji.
- 401 Unauthorized — brak/nieprawidłowy token.
- 403 Forbidden — dostęp do fiszki zabroniony.
- 404 Not Found — fiszka nie istnieje.
- 500 Internal Server Error — nieoczekiwany błąd serwera.

## 8. Rozważania dotyczące wydajności

- Indeksy na `flashcards_set_id`, `source`.
- Stronicowanie i limity.
- Batchowe wstawianie powiązań tagów.

## 9. Kroki implementacji

1. Utworzyć schematy Zod w `features/schemas/flashcard.ts`.
2. Zaimplementować `FlashcardsService` z metodami: `list`, `create`, `getById`, `update`, `delete`.
3. Dodać API routes w `app/flashcards/*`.
4. Skonfigurować Supabase client w warstwie service.
5. Obsłużyć logikę tworzenia i powiązania tagów.
6. Zaaplikować mapowanie na DTO i walidację.
7. Napisać testy jednostkowe i integracyjne.
8. Zaktualizować dokumentację OpenAPI.
9. Przeprowadzić code review i wdrożenie.
