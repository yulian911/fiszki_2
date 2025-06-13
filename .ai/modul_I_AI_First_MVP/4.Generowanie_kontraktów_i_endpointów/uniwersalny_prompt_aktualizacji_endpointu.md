Twoim zadaniem jest aktualizacja istniejącego endpointa (lub endpointów) API REST. Musisz przeanalizować dostarczony plan aktualizacji oraz istniejący kod, a następnie wprowadzić wymagane zmiany. Celem jest stworzenie solidnej i dobrze zorganizowanej implementacji, która jest zgodna z planem, zawiera odpowiednią walidację, obsługę błędów i zachowuje spójność z istniejącą architekturą.

Najpierw dokładnie przeanalizuj wszystkie dostarczone informacje:

1.  **Plan aktualizacji**: Zawiera szczegółowy opis zmian do wprowadzenia.
2.  **Istniejący kod**: Aktualny kod endpointów, które mają zostać zmodyfikowane.
3.  **Definicje typów**: Współdzielone typy i interfejsy.
4.  **Reguły implementacji**: Ogólne zasady i standardy kodowania w projekcie.

<update_plan>
{{endpoint-update-plan}} <- Wstaw referencję do planu aktualizacji (np. @flashcards-sets-api-plan.md)
</update_plan>

<existing_code>
{{source-code-files}} <- Wstaw referencje do istniejących plików z kodem do modyfikacji (np. @app/api/flashcards-sets/route.ts, @features/services/flashcardsSet.ts)
</existing_code>

<types>
{{types}} <- Wstaw referencje do definicji typów (np. @types.ts)
</types>

<implementation_rules>
{{backend-rules}} <- Wstaw referencje do reguł backendowych (np. @shared.mdc, @backend.mdc)
</implementation_rules>

<implementation_approach>
Realizuj maksymalnie 3 kroki z planu aktualizacji na raz. Po każdej iteracji podsumuj krótko, co zrobiłeś, i opisz plan na 3 kolejne działania. Zatrzymaj pracę i czekaj na feedback.
</implementation_approach>

**Kroki do wykonania:**

1.  **Analiza:**
    *   Porównaj `update_plan` z `existing_code`, aby zidentyfikować konkretne miejsca do zmiany.
    *   Zrozum, jakie nowe funkcjonalności trzeba dodać, a jakie istniejące zmodyfikować lub usunąć.
    *   Zwróć uwagę na zmiany w parametrach wejściowych, strukturach odpowiedzi, logice biznesowej oraz obsłudze błędów.

2.  **Implementacja zmian:**
    *   Zmodyfikuj istniejące funkcje endpointów zgodnie z planem.
    *   Zaktualizuj walidację danych wejściowych (np. schematy Zod), aby odzwierciedlała nowe wymagania.
    *   Dostosuj logikę biznesową w serwisach lub funkcjach pomocniczych.
    *   Zaktualizuj struktury danych odpowiedzi (DTO) zgodnie z planem.
    *   Upewnij się, że nowe implementacje są spójne z `implementation_rules`.

3.  **Walidacja i obsługa błędów:**
    *   Upewnij się, że obsługa błędów jest kompleksowa i obejmuje nowe scenariusze.
    *   Używaj odpowiednich kodów statusu HTTP (400, 401, 403, 404, 500 itp.).
    *   Dostarczaj jasne komunikaty o błędach.

4.  **Zachowanie czystości kodu:**
    *   Dodaj komentarze tylko tam, gdzie logika jest złożona.
    *   Upewnij się, że kod jest czytelny, dobrze zorganizowany i zgodny z najlepszymi praktykami.
    *   Usuń wszelki martwy kod (np. stare, nieużywane funkcje lub zmienne).

Po zakończeniu implementacji upewnij się, że kod zawiera wszystkie niezbędne importy i jest gotowy do uruchomienia. Jeśli musisz przyjąć jakieś założenia, przedstaw je przed rozpoczęciem kodowania. 