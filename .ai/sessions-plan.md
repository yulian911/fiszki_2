# API Endpoint Implementation Plan: Sessions (SRS)

**Tech stack**: Next.js, React, TypeScript, Tailwind, Shadcn/ui, Supabase SDK (zgodnie z `@techstack.md`)

## 1. Przegląd punktu końcowego

Zestaw endpointów umożliwiających rozpoczęcie, ocenę i zakończenie sesji powtórek (SRS) na podstawie zestawów fiszek. Dane sesji przechowywane w tabeli `Sessions` (szczegóły w `@db-plan.md`).

## 2. Szczegóły żądania

#### 2.1 Start Session

- Metoda HTTP: POST
- Ścieżka: `/sessions`
- Body (`application/json`): `StartSessionCommand`
  ```json
  { "flashcardsSetId": "uuid-zestawu", "tags": ["tag1", "tag2"], "limit": 20 }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (201 Created): `StartSessionResponseDTO`
  ```json
  { "sessionId": "uuid-sesji", "cards": [{ "id":"uuid-karty","question":"..." }, ...] }
  ```

#### 2.2 Evaluate Card

- Metoda HTTP: PATCH
- Ścieżka: `/sessions/{sessionId}/cards/{cardId}/evaluate`
- Parametry ścieżki:
  - `sessionId` (UUID)
  - `cardId` (UUID)
- Body (`application/json`): `EvaluateCardCommand`
  ```json
  { "rating": "easy" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `EvaluateCardResponseDTO`
  - Gdy kolejne karty są dostępne: `SessionCardDTO`
  - Po zakończeniu sesji: `SessionSummaryDTO`

#### 2.3 End Session

- Metoda HTTP: DELETE
- Ścieżka: `/sessions/{sessionId}`
- Parametry ścieżki:
  - `sessionId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (204 No Content)

## 3. Wykorzystywane typy

- `StartSessionCommand`, `SessionCardDTO`, `StartSessionResponseDTO`, `EvaluateCardCommand`, `EvaluateCardResponseDTO`, `SessionSummaryDTO` (z `@types.ts`)

## 4. Szczegóły odpowiedzi

- 201 Created: wygenerowano listę kart do sesji
- 200 OK: zwrócono kolejną kartę lub podsumowanie
- 204 No Content: zakończono sesję
- Ciała odpowiedzi zgodne z interfejsami z `@types.ts`

## 5. Przepływ danych

1. Klient wysyła żądanie startu sesji.
2. Walidacja wejścia Zodem (`@backend.mdc`).
3. Wywołanie `SessionsService.start(command)`:
   - Pobranie odpowiednich fiszek z `Flashcards` z uwzględnieniem filtrów i limitu,
   - Utworzenie rekordu `Sessions` i powiązanie do wybranych fiszek.
4. Klient ocenia kartę przez `SessionsService.evaluate(sessionId, cardId, rating)`:
   - Aktualizacja postępu w tabeli `Sessions`,
   - Wyznaczenie następnej fiszki lub budowa podsumowania.
5. Klient kończy sesję: `SessionsService.end(sessionId)` usuwa wpis lub oznacza zakończenie.

## 6. Względy bezpieczeństwa

- Autoryzacja JWT Supabase i RLS (`@backend.mdc`) – użytkownik tylko do własnych sesji.
- Walidacja danych wejściowych (Zod).
- Zapobiegać ocenie tej samej karty wielokrotnie.

## 7. Obsługa błędów

- 400 Bad Request — błędy walidacji.
- 401 Unauthorized — brak/nieprawidłowy token.
- 403 Forbidden — dostęp do cudzej sesji.
- 404 Not Found — nieistniejąca sesja lub karta.
- 500 Internal Server Error — nieoczekiwany błąd serwera.

## 8. Rozważania dotyczące wydajności

- Indeks na `user_id`, `flashcards_set_id` w tabeli `Sessions`.
- Pre-fetch fiszek i cache w pamięci sesji aplikacji.

## 9. Kroki implementacji

1. Utworzyć schematy Zod w `features/schemas/session.ts`.
2. Zaimplementować `SessionsService` z metodami: `start`, `evaluate`, `end`.
3. Dodać API routes w `app/sessions/*`.
4. Skonfigurować Supabase client w warstwie service.
5. Zapewnić logikę transakcyjną dla oceny kart.
6. Napisać testy jednostkowe i integracyjne.
7. Zaktualizować dokumentację OpenAPI.
8. Przeprowadzić code review i wdrożenie.
