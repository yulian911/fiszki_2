# API Endpoint Implementation Plan: Sessions (SRS)

**Tech stack**: Next.js, React, TypeScript, Tailwind, Shadcn/ui, Supabase SDK (zgodnie z `@techstack.md`)

## 1. Przegląd punktu końcowego

Zestaw endpointów umożliwiających rozpoczęcie, ocenę i zakończenie sesji powtórek (SRS) na podstawie zestawów fiszek. Dane sesji przechowywane w tabeli `Sessions` i `session_cards` (szczegóły w `@db-plan.md`).

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
  Dozwolone wartości dla rating: "again", "hard", "good", "easy"
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `EvaluateCardResponseDTO`
  - Gdy kolejne karty są dostępne: `SessionCardDTO`
  - Po zakończeniu sesji: `SessionSummaryDTO`

#### 2.3 End Session

- Metoda HTTP: PATCH (zmiana z DELETE)
- Ścieżka: `/sessions/{sessionId}/end`
- Parametry ścieżki:
  - `sessionId` (UUID)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `EndSessionResponseDTO`
  ```json
  {
    "sessionId": "uuid-sesji",
    "startedAt": "2024-05-19T10:15:00Z",
    "endedAt": "2024-05-19T10:22:30Z", 
    "durationSeconds": 450,
    "cardsReviewed": 15,
    "score": 85
  }
  ```

## 3. Wykorzystywane typy

- `StartSessionCommand`, `SessionCardDTO`, `StartSessionResponseDTO`, `EvaluateCardCommand`, `EvaluateCardResponseDTO`, `SessionSummaryDTO`, `EndSessionResponseDTO` (z `@types.ts`)

## 4. Szczegóły odpowiedzi

- 201 Created: wygenerowano listę kart do sesji
- 200 OK: zwrócono kolejną kartę, podsumowanie lub dane o zakończonej sesji
- Ciała odpowiedzi zgodne z interfejsami z `@types.ts`

## 5. Przepływ danych

1. Klient wysyła żądanie startu sesji.
2. Walidacja wejścia Zodem (`@backend.mdc`).
3. Wywołanie `SessionsService.start(command)`:
   - Pobranie odpowiednich fiszek z `Flashcards` z uwzględnieniem filtrów i limitu,
   - Utworzenie rekordu `Sessions` i powiązanie do wybranych fiszek w `session_cards`.
4. Klient ocenia kartę przez `SessionsService.evaluate(sessionId, cardId, rating)`:
   - Aktualizacja postępu w tabeli `session_cards` (rating, status),
   - Wyznaczenie następnej fiszki lub budowa podsumowania.
5. Klient kończy sesję: `SessionsService.end(sessionId)` aktualizuje wpis (dodaje `ended_at` i oblicza `duration_seconds`).

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
- Indeks na `session_id` i `flashcard_id` w tabeli `session_cards`.
- Pre-fetch fiszek i cache w pamięci sesji aplikacji.

## 9. Kroki implementacji

1. Utworzyć schematy Zod w `features/schemas/session.ts` i `common.ts`.
2. Zaimplementować `SessionsService` z metodami: `start`, `evaluate`, `end`.
3. Dodać API routes w `app/api/sessions/*`.
4. Skonfigurować Supabase client w warstwie service.
5. Zapewnić logikę transakcyjną dla oceny kart.
6. Rozszerzyć bazę danych o pole `ended_at` i `duration_seconds` w tabeli `sessions`.
7. Napisać testy jednostkowe i integracyjne.
8. Zaktualizować dokumentację OpenAPI.
9. Przeprowadzić code review i wdrożenie.

## 10. Uwagi

Aktualizacja migracji w bazie danych wprowadziła:
1. Tabelę `session_cards` do przechowywania relacji między sesjami i fiszkami
2. Typ wyliczeniowy `session_card_rating` z wartościami ('again', 'hard', 'good', 'easy')
3. Konieczność śledzenia czasu trwania sesji poprzez pola `ended_at` i `duration_seconds`

Dla spójności w całej aplikacji, rating karty zmieniono z ('easy', 'medium', 'hard') na ('again', 'hard', 'good', 'easy'), co lepiej odzwierciedla standardy algorytmów SRS.
