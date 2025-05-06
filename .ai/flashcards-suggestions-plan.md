# API Endpoint Implementation Plan: Flashcards Suggestions

**Tech stack**: Next.js, React, TypeScript, Tailwind, Shadcn/ui, Supabase SDK, Openrouter.ai (zgodnie z `@techstack.md`)

## 1. Przegląd punktu końcowego

Zestaw endpointów do generowania i zarządzania sugestiami fiszek tworzonymi przez AI. Sugestie są tymczasowe, a ich zaakceptowanie powoduje trwałe utworzenie fiszki w bazie (`Flashcards`).

## 2. Szczegóły żądania

#### 2.1 Generate Suggestions

- Metoda HTTP: POST
- Ścieżka: `/flashcards-suggestions`
- Body (`application/json`): `GenerateSuggestionsCommand`
  ```json
  { "text": "Długi tekst do analizy i wygenerowania pytań i odpowiedzi" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (202 Accepted): `AISuggestionsResponseDTO`
  ```json
  {
    "suggestions": [
      { "id": "temp-id-1", "question": "...", "answer": "..." },
      { "id": "temp-id-2", "question": "...", "answer": "..." }
    ]
  }
  ```

#### 2.2 Accept Suggestion

- Metoda HTTP: POST
- Ścieżka: `/flashcards-suggestions/{suggestionId}/accept`
- Parametry ścieżki:
  - `suggestionId` (string)
- Body (`application/json`): `AcceptSuggestionCommand`
  ```json
  { "flashcardsSetId": "uuid-zestawu" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (201 Created): `FlashcardDTO`  
  Tworzona fiszka z `source` ustawionym na `ai-full` lub `ai-edit` (zależnie od logiki).

#### 2.3 Reject Suggestion

- Metoda HTTP: POST
- Ścieżka: `/flashcards-suggestions/{suggestionId}/reject`
- Parametry ścieżki:
  - `suggestionId` (string)
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (204 No Content)

#### 2.4 Edit Suggestion

- Metoda HTTP: PUT
- Ścieżka: `/flashcards-suggestions/{suggestionId}`
- Parametry ścieżki:
  - `suggestionId` (string)
- Body (`application/json`): `EditSuggestionCommand`
  ```json
  { "question": "Poprawione pytanie?", "answer": "Poprawiona odpowiedź?" }
  ```
- Nagłówki:
  - `Authorization: Bearer <token>`
- Odpowiedź (200 OK): `AISuggestionDTO`

## 3. Wykorzystywane typy

- `GenerateSuggestionsCommand`, `AISuggestionsResponseDTO`, `AISuggestionDTO`, `AcceptSuggestionCommand`, `EditSuggestionCommand`, `RejectSuggestionCommand`, `FlashcardDTO` (z `@types.ts`)

## 4. Szczegóły odpowiedzi

- 202 Accepted: wygenerowano sugestie (asynchroniczne przetwarzanie AI)
- 201 Created: utworzono fiszkę po zaakceptowaniu
- 200 OK: zwrócono zaktualizowaną sugestię
- 204 No Content: odrzucono sugestię lub usunięto
- Ciała odpowiedzi zgodne z interfejsami z `@types.ts`

## 5. Przepływ danych

1. Klient wysyła tekst do `/flashcards-suggestions`.
2. Serwer waliduje `text` Zodem (`@backend.mdc`).
3. Wywołanie `FlashcardsSuggestionService.generate(text)`:
   - Wysłanie żądania do Openrouter.ai,
   - Parsowanie wyników do `AISuggestionDTO`, generowanie unikalnych `suggestionId`, przechowywanie w pamięci (TTL).
4. Klient wybiera sugestię i wywołuje `/accept` lub `/reject` lub `/PUT`:
   - `accept`: serwis odczytuje dane z pamięci, tworzy `Flashcard` przez Supabase SDK, usuwa sugestię z cache.
   - `reject`: usuwa sugestię z cache.
   - `edit`: aktualizuje wpis w cache.
5. Serwer mapuje wynik na DTO i zwraca klientowi.

## 6. Względy bezpieczeństwa

- Autoryzacja JWT Supabase i RLS dla tworzenia fiszek (`@backend.mdc`).
- Walidacja wejścia: maks. długość `text`, niepustość pola.
- Ograniczenie liczby żądań do AI (rate limiting).
- Ochrona przed wielokrotnym zaakceptowaniem tej samej sugestii.

## 7. Obsługa błędów

- 400 Bad Request — błędy walidacji Zod.
- 401 Unauthorized — brak/nieprawidłowy token.
- 404 Not Found — nieznane `suggestionId`.
- 429 Too Many Requests — przekroczono limity AI lub własne.
- 500 Internal Server Error — błąd komunikacji z Openrouter lub Supabase.

## 8. Rozważania dotyczące wydajności

- Cache in-memory z TTL dla sugestii (Redis lub Node-cache).
- Paginate body AI, limitować liczbę sugestii na żądanie.
- Wykorzystywać asynchroniczne kolejkowanie do AI (opcjonalnie).

## 9. Kroki implementacji

1. Utworzyć schematy Zod w `features/schemas/flashcardsSuggestion.ts`.
2. Zaimplementować `FlashcardsSuggestionService` z funkcjami: `generate`, `accept`, `reject`, `edit`.
3. Konfiguracja klienta Openrouter.ai w warstwie service.
4. Implementacja cache (in-memory lub Redis) do przechowywania sugestii.
5. Dodanie API routes w `app/flashcards-suggestions/*`.
6. Integracja z Supabase SDK przy zatwierdzaniu sugestii.
7. Testy jednostkowe i integracyjne, w tym mock AI i cache.
8. Uzupełnić dokumentację OpenAPI i README.
9. Code review i deployment pod monitoringiem.
