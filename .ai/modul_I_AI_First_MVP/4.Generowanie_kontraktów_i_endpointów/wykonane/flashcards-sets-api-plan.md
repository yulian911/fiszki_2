# API Endpoint Implementation Plan: Flashcards Sets

**Tech stack**: Next.js, React, TypeScript, Tailwind, Shadcn/ui, Supabase SDK, Openrouter.ai (zgodnie z `@techstack.md`)

## 1. Przegląd punktu końcowego

Zestaw punktów końcowych służących do zarządzania zestawami fiszek użytkownika: listowanie, tworzenie, pobieranie pojedynczego zestawu, aktualizacja oraz usuwanie. Dane przechowywane w tabeli `FlashcardsSet` oraz powiązane fiszki w tabeli `Flashcards` (szczegóły w `@db-plan.md`).

## 2. Szczegóły żądania

#### 2.1 List Flashcards Sets

- Metoda HTTP: GET
- Ścieżka: `/api/flashcards-sets`
- Opis: Pobiera stronicowaną listę zestawów użytkownika, **włączając w to zestawy własne oraz te, które zostały mu udostępnione przez innych użytkowników.**
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
    "data": [
      {
        "id": "uuid-set-1",
        "name": "Mój własny zestaw",
        "flashcardCount": 10,
        "accessLevel": "owner",
        "ownerEmail": null,
        "createdAt": "iso-date"
      },
      {
        "id": "uuid-set-2",
        "name": "Zestaw od kolegi",
        "flashcardCount": 25,
        "accessLevel": "viewer",
        "ownerEmail": "kolega@example.com",
        "createdAt": "iso-date"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 2 }
  }
  ```
  Typ odpowiedzi: `PaginatedResponse<FlashcardsSetDTO>`

#### 2.2 Create Flashcards Set

- Metoda HTTP: POST
- Ścieżka: `/api/flashcards-sets`
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
- Ścieżka: `/api/flashcards-sets/{setId}`
- Opis: Pobiera szczegóły zestawu wraz z listą fiszek
- Parametry ścieżki:
  - `setId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `FlashcardsSetWithCardsDTO`

#### 2.4 Update Flashcards Set

- Metoda HTTP: PUT
- Ścieżka: `/api/flashcards-sets/{setId}`
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
- Ścieżka: `/api/flashcards-sets/{setId}`
- Opis: Usuwa zestaw i wszystkie powiązane fiszki
- Parametry ścieżki:
  - `setId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (204 No Content)

#### 2.6 Clone Flashcards Set

- Metoda HTTP: POST
- Ścieżka: `/api/flashcards-sets/{setId}/clone`
- Opis: Tworzy klon (kopię) istniejącego zestawu. Domyślnie dla zalogowanego użytkownika, opcjonalnie dla innego użytkownika.
- Parametry ścieżki:
  - `setId` (UUID)
- Body (`application/json`): `CloneFlashcardsSetCommand`
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
- Ścieżka: `/api/flashcards-sets/{setId}/shares`
- Opis: Udostępnia zestaw fiszek innemu użytkownikowi w trybie tylko do odczytu.
- Parametry ścieżki:
  - `setId` (UUID)
- Body (`application/json`): `CreateShareCommand`
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
- Ścieżka: `/api/flashcards-sets/{setId}/shares`
- Opis: Pobiera listę udostępnień dla danego zestawu.
- Parametry ścieżki:
  - `setId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `[<ShareDTO>...]`

#### 3.3 Revoke Set Share

- Metoda HTTP: DELETE
- Ścieżka: `/api/flashcards-sets/{setId}/shares/{shareId}`
- Opis: Anuluje udostępnienie zestawu.
- Parametry ścieżki:
  - `setId` (UUID)
  - `shareId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (204 No Content)

## 4. Wykorzystywane typy

- `FlashcardsSetDTO`, `FlashcardsSetWithCardsDTO`, `CreateFlashcardsSetCommand`, `UpdateFlashcardsSetCommand`, `CloneFlashcardsSetCommand`, `CreateShareCommand`, `MetaDTO`, `PaginatedResponse`, `ShareDTO` (z `features/schemas/flashcardsSetSchemas.ts`)
- `FlashcardsSetDTO` powinno zostać rozszerzone o pola:
  - `flashcardCount: number`
  - `accessLevel: 'owner' | 'viewer'`
  - `ownerEmail: string | null`

## 5. Szczegóły odpowiedzi

- 200 OK: sukcesowe odczyty listy i pojedynczego zasobu
- 201 Created: udane utworzenie zasobu
- 204 No Content: udane usunięcie
- Ciała odpowiedzi zgodne z interfejsami z `@types.ts`

## 6. Przepływ danych

1. Kontroler/Router odbiera żądanie.
2. Walidacja wejścia za pomocą Zod (`features/schemas/flashcardsSetSchemas.ts`).
3. Wywołanie metody z `FlashcardsSetService` (`features/flashcard-sets/services/FlashcardsSetService.ts`). **Metoda `list` musi zostać zaktualizowana, aby pobierać zarówno zestawy własne, jak i udostępnione.**
4. Komunikacja z Supabase SDK (tabela `FlashcardsSet` oraz powiązania do `Flashcards` i `shares`).
5. Mapowanie rekordów na DTO i zwrócenie klientowi.

## 7. Względy bezpieczeństwa

- Autoryzacja JWT Supabase i RLS w bazie.
- Walidacja danych wejściowych (Zod).
- Uprawnienia: tylko właściciel lub udostępniony użytkownik.
- **Ograniczenia operacji**:
  - Akcje `Update`, `Delete`, `Clone`, `Share` powinny być dozwolone tylko dla właściciela zestawu lub administratora.
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
- Wykorzystanie RLS do pobierania liczby fiszek (`flashcard_count`).
- Opcjonalne cachowanie odczytów.

## 10. Kroki implementacji

1. Utworzyć/zaktualizować schematy Zod w `features/schemas/flashcardsSetSchemas.ts`.
2. Zaimplementować/zaktualizować `FlashcardsSetService` z metodami: `list`, `create`, `getById`, `update`, `delete`, `clone`, `share`, `listShares`, `revokeShare` w `features/flashcard-sets/services/FlashcardsSetService.ts`.
3. Dodać/zaktualizować API routes w `app/api/flashcards-sets/**` (Next.js App Router).
4. Skonfigurować Supabase client w `utils/supabase/server.ts`.
5. Zaaplikować walidację i mapowanie na DTO w warstwie routingu.
6. Napisać testy jednostkowe i integracyjne.
7. Zaktualizować specyfikację OpenAPI i dokumentację.
8. Przeprowadzić code review i wdrożenie pod monitoringiem.
