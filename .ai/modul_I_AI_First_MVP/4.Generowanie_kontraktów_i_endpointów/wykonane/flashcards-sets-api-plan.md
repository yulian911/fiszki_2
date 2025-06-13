# API Endpoint Implementation Plan: Flashcards Sets

**Tech stack**: Next.js, React, TypeScript, Tailwind, Shadcn/ui, Supabase SDK, Openrouter.ai (zgodnie z `@techstack.md`)

## 1. Przegląd punktu końcowego

Zestaw punktów końcowych służących do zarządzania zestawami fiszek użytkownika: listowanie, tworzenie, pobieranie pojedynczego zestawu, aktualizacja oraz usuwanie. Dane przechowywane w tabeli `FlashcardsSet` oraz powiązane fiszki w tabeli `Flashcards` (szczegóły w `@db-plan.md`).

## 2. Szczegóły żądania

#### 2.1 List Flashcards Sets

- Metoda HTTP: GET
- Ścieżka: `/flashcards-sets`
- Opis: Pobiera stronicowaną listę zestawów użytkownika
- Parametry zapytania:
  - `page` (int, domyślnie 1)
  - `limit` (int, domyślnie 20)
  - `sortBy` (string, np. `name`, `createdAt`)
  - `sortOrder` (string, `asc` | `desc`)
  - `status` (string, `pending` | `accepted` | `rejected`)
  - `name` (string, do wyszukiwania po nazwie)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK):
  ```json
  {
    "data": [<FlashcardsSetDTO>...],
    "meta": { "page":1, "limit":20, "total":NN }
  }
  ```
  Typ odpowiedzi: `PaginatedResponse<FlashcardsSetDTO>`

#### 2.2 Create Flashcards Set

- Metoda HTTP: POST
- Ścieżka: `/flashcards-sets`
- Opis: Tworzy nowy, pusty zestaw fiszek
- Body (`application/json`): `CreateFlashcardsSetCommand`
  ```json
  { "name": "Biology Terms" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (201 Created): `FlashcardsSetDTO`

#### 2.3 Get Flashcards Set

- Metoda HTTP: GET
- Ścieżka: `/flashcards-sets/{setId}`
- Opis: Pobiera szczegóły zestawu wraz z listą fiszek
- Parametry ścieżki:
  - `setId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `FlashcardsSetWithCardsDTO`

#### 2.4 Update Flashcards Set

- Metoda HTTP: PUT
- Ścieżka: `/flashcards-sets/{setId}`
- Opis: Aktualizuje nazwę i/lub status zestawu
- Parametry ścieżki:
  - `setId` (UUID)
- Body (`application/json`): `UpdateFlashcardsSetCommand`
  ```json
  { "name": "New Name", "status": "accepted" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `FlashcardsSetDTO`

#### 2.5 Delete Flashcards Set

- Metoda HTTP: DELETE
- Ścieżka: `/flashcards-sets/{setId}`
- Opis: Usuwa zestaw i wszystkie powiązane fiszki
- Parametry ścieżki:
  - `setId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (204 No Content)

#### 2.6 Clone Flashcards Set

- Metoda HTTP: POST
- Ścieżka: `/flashcards-sets/{setId}/clone`
- Opis: Tworzy klon (kopię) istniejącego zestawu. Domyślnie dla zalogowanego użytkownika, opcjonalnie dla innego użytkownika.
- Parametry ścieżki:
  - `setId` (UUID)
- Body (`application/json`, opcjonalne):
  ```json
  { "targetUserId": "uuid-of-target-user" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (201 Created): `FlashcardsSetDTO` (nowo utworzony zestaw)

## 3. Zarządzanie Udostępnianiem (Nowa sekcja)

Zestaw punktów końcowych do zarządzania udostępnianiem zestawów fiszek innym użytkownikom.

#### 3.1 Share Flashcards Set

- Metoda HTTP: POST
- Ścieżka: `/flashcards-sets/{setId}/shares`
- Opis: Udostępnia zestaw fiszek innemu użytkownikowi w trybie tylko do odczytu.
- Parametry ścieżki:
  - `setId` (UUID)
- Body (`application/json`):
  ```json
  {
    "userId": "uuid-of-user",
    "role": "learning",
    "expiresAt": "iso-date-string"
  }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (201 Created): `ShareDTO`

#### 3.2 List Set Shares

- Metoda HTTP: GET
- Ścieżka: `/flashcards-sets/{setId}/shares`
- Opis: Pobiera listę udostępnień dla danego zestawu.
- Parametry ścieżki:
  - `setId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `[<ShareDTO>...]`

#### 3.3 Revoke Set Share

- Metoda HTTP: DELETE
- Ścieżka: `/flashcards-sets/{setId}/shares/{shareId}`
- Opis: Anuluje udostępnienie zestawu.
- Parametry ścieżki:
  - `setId` (UUID)
  - `shareId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (204 No Content)

## 4. Wykorzystywane typy

- `FlashcardsSetDTO`, `FlashcardsSetWithCardsDTO`, `CreateFlashcardsSetCommand`, `UpdateFlashcardsSetCommand`, `MetaDTO`, `PaginatedResponse`, `ShareDTO` (z `@types.ts`)
- `FlashcardsSetDTO` powinno zostać rozszerzone o pole `flashcardCount: number`.

## 5. Szczegóły odpowiedzi

- 200 OK: sukcesowe odczyty listy i pojedynczego zasobu
- 201 Created: udane utworzenie zasobu
- 204 No Content: udane usunięcie
- Ciała odpowiedzi zgodne z interfejsami z `@types.ts`

## 6. Przepływ danych

1. Kontroler/Router odbiera żądanie.
2. Walidacja wejścia za pomocą Zod (`@backend.mdc`).
3. Wywołanie metody z `FlashcardsSetService`.
4. Komunikacja z Supabase SDK (tabela `FlashcardsSet` oraz powiązania do `Flashcards`).
5. Mapowanie rekordów na DTO i zwrócenie klientowi.

## 7. Względy bezpieczeństwa

- Autoryzacja JWT Supabase i RLS w bazie (`@backend.mdc`).
- Walidacja danych wejściowych (Zod).
- Uprawnienia: tylko właściciel lub udostępniony użytkownik.
- **Ograniczenia operacji**:
  - Akcje `Update`, `Delete`, `Clone`, `Share` powinny być dozwolone tylko dla zestawów o statusie `accepted`.
- Ograniczenie `limit` do maksymalnie 100.

## 8. Obsługa błędów

- 400 Bad Request — błędy walidacji.
- 401 Unauthorized — brak/nieprawidłowy token.
- 403 Forbidden — brak dostępu do zasobu.
- 404 Not Found — zasób nie istnieje.
- 409 Conflict — naruszenie unikalności (np. duplikat nazwy zestawu dla tego samego właściciela).
- 500 Internal Server Error — nieoczekiwany błąd serwera.

## 9. Rozważania dotyczące wydajności

- Indeksy na kolumnach `owner_id` i `status`.
- Stronicowanie i limity.
- Wykorzystanie zmaterializowanego widoku `stats_flashcards_set` do pobierania `flashcardCount`.
- Opcjonalne cachowanie odczytów.

## 10. Kroki implementacji

1. Utworzyć/zaktualizować schematy Zod w `features/schemas/flashcardsSet.ts`.
2. Zaimplementować/zaktualizować `FlashcardsSetService` z metodami: `list`, `create`, `getById`, `update`, `delete`, `clone`, `share`, `listShares`, `revokeShare`.
3. Dodać/zaktualizować API routes w `app/flashcards-sets/*` (Next.js) lub edge functions.
4. Skonfigurować Supabase client i wstrzykiwanie w warstwie service.
5. Zaaplikować walidację i mapowanie na DTO.
6. Napisać testy jednostkowe i integracyjne.
7. Zaktualizować specyfikację OpenAPI i dokumentację.
8. Przeprowadzić code review i wdrożenie pod monitoringiem.
