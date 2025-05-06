# API Endpoint Implementation Plan: Tags

**Tech stack**: Next.js, React, TypeScript, Tailwind, Shadcn/ui, Supabase SDK, Openrouter.ai (zgodnie z `@techstack.md`)

## 1. Przegląd punktu końcowego

Zestaw endpointów do zarządzania tagami fiszek. Umożliwia listowanie wszystkich tagów, tworzenie nowego taga, pobranie pojedynczego taga, aktualizację i usunięcie. Dane przechowywane w tabeli `Tags` oraz powiązania z tabelą `Flashcards_Tags` (szczegóły w `@db-plan.md`).

## 2. Szczegóły żądania

#### 2.1 List Tags

- Metoda HTTP: GET
- Ścieżka: `/tags`
- Parametry zapytania:
  - `page` (int, domyślnie 1)
  - `limit` (int, domyślnie 20, max 100)
  - `sortBy` (string, np. `name`, `createdAt`)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK):
  ```json
  {
    "data": [<TagDTO>...],
    "meta": { "page":1, "limit":20, "total":NN }
  }
  ```
  Typ odpowiedzi: `PaginatedResponse<TagDTO>`

#### 2.2 Create Tag

- Metoda HTTP: POST
- Ścieżka: `/tags`
- Body (`application/json`): `CreateTagCommand`
  ```json
  { "name": "tag-name" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (201 Created): `TagDTO`

#### 2.3 Get Tag

- Metoda HTTP: GET
- Ścieżka: `/tags/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `TagDTO`

#### 2.4 Update Tag

- Metoda HTTP: PUT
- Ścieżka: `/tags/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Body (`application/json`): `UpdateTagCommand`
  ```json
  { "name": "new-name" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `TagDTO`

#### 2.5 Delete Tag

- Metoda HTTP: DELETE
- Ścieżka: `/tags/{id}`
- Parametry ścieżki:
  - `id` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (204 No Content)

## 3. Wykorzystywane typy

- `TagDTO`, `CreateTagCommand`, `UpdateTagCommand`, `MetaDTO`, `PaginatedResponse` (z `@types.ts`)

## 4. Szczegóły odpowiedzi

- 200 OK: sukcesowe odczyty listy i pojedynczego taga
- 201 Created: udane utworzenie taga
- 204 No Content: udane usunięcie
- Ciała odpowiedzi zgodne z interfejsami z `@types.ts`

## 5. Przepływ danych

1. Kontroler/Router odbiera żądanie.
2. Walidacja wejścia za pomocą Zod (`@backend.mdc`).
3. Wywołanie metody z `TagService`.
4. Komunikacja z Supabase SDK (tabela `Tags`, ewentualne cascade delete w `Flashcards_Tags`).
5. Mapowanie rekordów na DTO i zwrócenie klientowi.

## 6. Względy bezpieczeństwa

- Autoryzacja JWT Supabase i RLS (`@backend.mdc`).
- Walidacja unikalności nazwy taga (złożenie w bazie UUID i unikalność pola `name`).
- Ochrona przed usunięciem taga używanego przez fiszki — decyzja: usuwanie kaskadowe lub blokada.

## 7. Obsługa błędów

- 400 Bad Request — błędy walidacji Zod lub duplikat nazwy.
- 401 Unauthorized — brak/nieprawidłowy token.
- 403 Forbidden — brak uprawnień (jeśli w przyszłości tagi będą prywatne).
- 404 Not Found — tag nie istnieje.
- 500 Internal Server Error — nieoczekiwany błąd serwera.

## 8. Rozważania dotyczące wydajności

- Indeks unikalny na kolumnie `name`.
- Stronicowanie i limity.
- Ewentualne cachowanie listy tagów.

## 9. Kroki implementacji

1. Utworzyć schematy Zod w `features/schemas/tag.ts`.
2. Zaimplementować `TagService` z metodami: `list`, `create`, `getById`, `update`, `delete`.
3. Dodać API routes w `app/tags/*`.
4. Skonfigurować Supabase client w warstwie service.
5. Zaimplementować logikę walidacji duplikatów i decyzję dotyczącą kaskadowego usuwania.
6. Zaaplikować mapowanie na DTO i walidację.
7. Napisać testy jednostkowe i integracyjne.
8. Zaktualizować dokumentację OpenAPI.
9. Przeprowadzić code review i wdrożenie pod monitoringiem.
