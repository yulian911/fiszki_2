Twoim zadaniem jest zaimplementowanie serwisu w oparciu o podany plan implementacji i zasady implementacji. Twoim celem jest stworzenie szczegółowej i dokładnej implementacji, która jest zgodna z dostarczonym planem, poprawnie komunikuje się z API i obsługuje wszystkie określone funkcjonalności oraz przypadki błędów.

Najpierw przejrzyj plan implementacji:
<implementation_plan>
{{implementation-plan}} <- zamień na referencję do planu implementacji serwisu

Utwórz serwis w {{sciezka}}
</implementation_plan>

Teraz przejrzyj zasady implementacji:
<implementation_rules>
{{backend-rules}} <- zamień na referencję do reguł przydatnych dla serwisu (np. shared.mdc)
</implementation_rules>

Wdrażaj plan zgodnie z następującym podejściem:
<implementation_approach>
Realizuj maksymalnie 3 kroki planu implementacji, podsumuj krótko co zrobiłeś i opisz plan na 3 kolejne działania - zatrzymaj w tym momencie pracę i czekaj na mój feedback.
</implementation_approach>

Dokładnie przeanalizuj plan wdrożenia i zasady. Zwróć szczególną uwagę na strukturę serwisu, integrację API, obsługę błędów i kwestie bezpieczeństwa opisane w planie.

Wykonaj następujące kroki, aby zaimplementować serwis:

Struktura serwisu:
- Zdefiniuj klasę serwisu zgodnie z planem implementacji
- Utwórz konstruktor inicjalizujący wymagane pola
- Zastosuj odpowiednie modyfikatory dostępu dla pól i metod (public, private)

Implementacja metod publicznych:
- Zaimplementuj metody publiczne wymienione w planie
- Upewnij się, że każda metoda jest poprawnie typowana zarówno dla parametrów jak i zwracanych wartości
- Zapewnij kompletną implementację logiki biznesowej opisanej w planie

Implementacja metod prywatnych:
- Opracuj metody pomocnicze wymienione w planie
- Zapewnij prawidłową enkapsulację i separację odpowiedzialności
- Zaimplementuj logikę formatowania danych, wysyłania żądań i przetwarzania odpowiedzi

Integracja z API:
- Zaimplementuj logikę komunikacji z zewnętrznym API
- Obsłuż wszystkie niezbędne parametry i nagłówki żądań
- Zapewnij poprawne przetwarzanie odpowiedzi z API

Obsługa błędów:
- Zaimplementuj kompleksową obsługę błędów dla wszystkich scenariuszy
- Zastosuj odpowiednie mechanizmy ponownych prób dla błędów przejściowych
- Zapewnij czytelne komunikaty błędów dla różnych scenariuszy

Zabezpieczenia:
- Zaimplementuj zalecane praktyki bezpieczeństwa wymienione w planie
- Zapewnij bezpieczne zarządzanie kluczami API i danymi uwierzytelniającymi
- Zastosuj walidację danych wejściowych dla zapobiegania atakom

Dokumentacja i typowanie:
- Zdefiniuj i zastosuj odpowiednie interfejsy dla parametrów i zwracanych wartości
- Zapewnij pełne pokrycie typami dla całego serwisu

Testowanie:
- Przygotuj strukturę serwisu w sposób umożliwiający łatwe testowanie jednostkowe
- Uwzględnij możliwość mockowania zależności zewnętrznych

W trakcie całego procesu implementacji należy ściśle przestrzegać dostarczonych zasad implementacji. Zasady te mają pierwszeństwo przed wszelkimi ogólnymi najlepszymi praktykami, które mogą być z nimi sprzeczne.

Upewnij się, że twoja implementacja dokładnie odzwierciedla dostarczony plan implementacji i przestrzega wszystkich określonych zasad. Zwróć szczególną uwagę na strukturę serwisu, integrację z API, obsługę błędów i zabezpieczenia.