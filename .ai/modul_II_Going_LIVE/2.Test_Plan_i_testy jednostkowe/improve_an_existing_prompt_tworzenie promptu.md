Napisz mi Improve an existing prompt:   Wygeneruj test plan w moim projekcie {{Codebase}} Stack techniczny moje projektu {{TechStack}} .  What would you like improve? Ulepsz prompt aby model językowy zwracał jakosciowy test plan dopasowany do kontekstu projektu, biorac pod uwage wykorzystywane technologi, pliki oraz priorytetowe elementy całego repozytorium.Dokument powinien byc w języku polskim.


Ulepszona instrukcja generowania test planu
Prompt dla modelu językowego:
Wygeneruj kompleksowy test plan dla mojego projektu na podstawie poniższych informacji:
Kontekst projektu:

Codebase: {{Codebase}}
Stack techniczny: {{TechStack}}

Wymagania dotyczące test planu:
Przeprowadź szczegółową analizę i uwzględnij:

Analiza architektury:

Zidentyfikuj kluczowe komponenty, moduły i zależności
Określ krytyczne ścieżki biznesowe i punkty integracji
Wskaż potencjalne punkty awarii (failure points)


Strategie testowania dopasowane do stack'u technologicznego:

Testowanie jednostkowe (unit tests) - wskaż najważniejsze klasy/funkcje
Testowanie integracyjne - zdefiniuj kluczowe scenariusze
Testowanie end-to-end - priorytetowe user journey
Testowanie API/interfejsów (jeśli dotyczy)
Testowanie bezpieczeństwa specyficzne dla użytych technologii


Priorytetyzacja na podstawie analizy kodu:

Komponenty o wysokiej złożoności cyklomatycznej
Funkcje biznesowo krytyczne
Moduły z częstymi zmianami w historii commitów
Zewnętrzne integracje i zależności


Szczegółowy plan obejmujący:

Scope testów - co testujemy i dlaczego
Metody i narzędzia - konkretne frameworki testowe dla danego stack'u
Środowiska testowe - konfiguracja i wymagania
Kryteria akceptacji - definicja "done" dla każdego typu testów
Timeline - szacowany czas realizacji
Zarządzanie ryzykiem - identyfikacja i mitygacja ryzyk
Coverage goals - docelowe pokrycie kodu
Procedury CI/CD - integracja z pipeline'em


Konkretne rekomendacje:

Sugerowane narzędzia testowe kompatybilne z {{TechStack}}
Wzorce testowe (test patterns) odpowiednie dla architektury
Konfiguracja środowisk testowych
Przykłady test case'ów dla krytycznych funkcjonalności



Format odpowiedzi:
Dokument w języku polskim, strukturalny i gotowy do implementacji, zawierający praktyczne wskazówki oraz konkretne przykłady kodu testowego tam gdzie to możliwe.
Dodatkowe wytyczne:

Uwzględnij specyfikę branży/domeny projektu (jeśli da się wywnioskować z kodu)
Zaproponuj metryki do monitorowania jakości testów
Include regression testing strategy
Zaadresuj maintenance i skalowanie test suite

Cel: Stworzenie actionable test planu, który można natychmiast wdrożyć w projekcie, z uwzględnieniem jego unikalnych charakterystyk technicznych i biznesowych.
Odpowiedz zapisz w formacie markdown.