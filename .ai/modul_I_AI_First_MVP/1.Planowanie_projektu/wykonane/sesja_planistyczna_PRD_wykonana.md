Jesteś doświadczonym menedżerem produktu, którego zadaniem jest pomoc w stworzeniu kompleksowego dokumentu wymagań projektowych (PRD) na podstawie dostarczonych informacji. Twoim celem jest wygenerowanie listy pytań i zaleceń, które zostaną wykorzystane w kolejnym promptowaniu do utworzenia pełnego PRD.

Prosimy o uważne zapoznanie się z poniższymi informacjami:

<project_description>
### Główny problem
Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition.

### Najmniejszy zestaw funkcjonalności
- Generowanie fiszek przez AI na podstawie wprowadzonego tekstu (kopiuj-wklej)
- Manualne tworzenie fiszek
- Przeglądanie, edycja i usuwanie fiszek
- Prosty system kont użytkowników do przechowywania fiszek
- Integracja fiszek z gotowym algorytmem powtórek

### Co NIE wchodzi w zakres MVP
- Własny, zaawansowany algorytm powtórek (jak SuperMemo, Anki)
- Import wielu formatów (PDF, DOCX, itp.)
- Współdzielenie zestawów fiszek między użytkownikami
- Integracje z innymi platformami edukacyjnymi
- Aplikacje mobilne (na początek tylko web)

### Kryteria sukcesu
- 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkownika
- Użytkownicy tworzą 75% fiszek z wykorzystaniem AI
</project_description>

Przeanalizuj dostarczone informacje, koncentrując się na aspektach istotnych dla tworzenia PRD. Rozważ następujące kwestie:
<prd_analysis>
1. Zidentyfikuj główny problem, który produkt ma rozwiązać.
2. Określ kluczowe funkcjonalności MVP.
3. Rozważ potencjalne historie użytkownika i ścieżki korzystania z produktu.
4. Pomyśl o kryteriach sukcesu i sposobach ich mierzenia.
5. Oceń ograniczenia projektowe i ich wpływ na rozwój produktu.
</prd_analysis>

Na podstawie analizy wygeneruj listę pytań i zaleceń. Powinny one dotyczyć wszelkich niejasności, potencjalnych problemów lub obszarów, w których potrzeba więcej informacji, aby stworzyć skuteczny PRD. Rozważ pytania dotyczące:

1. Szczegółów problemu użytkownika
2. Priorytetyzacji funkcjonalności
3. Oczekiwanego doświadczenia użytkownika
4. Mierzalnych wskaźników sukcesu
5. Potencjalnych ryzyk i wyzwań
6. Harmonogramu i zasobów

<pytania>
1.  **Priorytetyzacja Funkcji AI (MVP):** Jak kluczowe jest generowanie przez AI *różnorodnych formatów* fiszek (luki, dopasowanie) w ramach MVP w porównaniu do podstawowego Q&A? Czy akceptowalne byłoby wprowadzenie bardziej zaawansowanych formatów po MVP?
2.  **Kontekst Domenowy AI:** Jak system AI ma radzić sobie ze specjalistycznym żargonem w różnych dziedzinach (np. medycyna vs. programowanie)? Czy użytkownik powinien mieć możliwość wskazania dziedziny/kontekstu przetwarzanego tekstu w MVP?
3.  **Obsługa Niskiej Jakości AI (MVP):** W jaki sposób system ma "oferować alternatywne wersje" fiszek w MVP? Czy wystarczy możliwość edycji + ponownej generacji, czy oczekiwany jest bardziej złożony mechanizm? Jak podstawowy powinien być mechanizm "uczenia się preferencji" w MVP?
4.  **Zaawansowane Tworzenie Manualne (MVP):** Czy dodawanie obrazów, wzorów matematycznych i powiązań między fiszkami jest *niezbędne* w MVP, czy może zostać dodane później? Skupienie się na tekście i tagach uprościłoby pierwszą wersję.
5.  **Algorytm Powtórek (MVP):** Czy MVP powinno integrować się z konkretnym *zewnętrznym* algorytmem (jak SM-2 przez AnkiConnect lub podobne API, jeśli istnieje), czy też MVP powinno zawierać *własną, prostą* implementację (np. system pudełek Leitnera lub prostszy)? Co dokładnie oznacza "inspirowana" implementacja w kontekście MVP?
6.  **Import Fiszke (MVP):** Potwierdzenie: Czy funkcja importu (nawet prostego formatu jak CSV) powinna zostać *włączona* do zakresu MVP jako element mitygacji ryzyka, mimo że pierwotnie była wykluczona?
7.  **Logowanie Społecznościowe (MVP):** Czy logowanie przez Google/Apple/Facebook jest wymagane w MVP, czy wystarczy standardowa rejestracja email/hasło, a logowanie społecznościowe zostanie dodane później?
8.  **Synchronizacja Między Urządzeniami (MVP):** Czy pełna synchronizacja w czasie rzeczywistym jest wymagana od początku, czy wystarczy mechanizm synchronizacji na żądanie/przy logowaniu dla MVP?
9.  **Struktura Freemium (MVP):** Czy podstawowa architektura MVP (np. system kont, baza danych) powinna od razu uwzględniać przyszły model freemium (np. śledzenie limitów użycia AI)?
10. **Wskaźnik Skuteczności Nauki (MVP):** Jak dokładnie miałby być mierzony i prezentowany "wskaźnik skuteczności nauki" w ramach MVP? Czy wystarczą podstawowe statystyki z algorytmu powtórek?
</pytania>

<rekomendacje>
1.  **MVP Scope Definition:** Potwierdź i jasno zdefiniuj *minimalny* zestaw funkcji dla AI (np. tylko Q&A) i tworzenia manualnego (np. tylko tekst + tagi), aby zapewnić szybkie wdrożenie MVP.
2.  **Wybór Technologii AI:** Rozpocznij badanie konkretnych modeli/API AI pod kątem zdolności generowania podstawowych fiszek (Q&A) w różnych językach i z podstawowym rozumieniem kontekstu. Oceń złożoność implementacji bardziej zaawansowanych formatów.
3.  **Decyzja ws. Algorytmu Powtórek:** Podejmij ostateczną decyzję: integracja z istniejącym API (jeśli dostępne i niezawodne) vs. budowa własnego prostego mechanizmu (np. Leitner) dla MVP. Unikaj zbyt skomplikowanej logiki na start.
4.  **Plan Wdrożenia Funkcji:** Stwórz mapę drogową produktu, wyraźnie oddzielając funkcje MVP od tych planowanych na później (np. zaawansowane formaty AI, import, logowanie społecznościowe, zaawansowane tworzenie manualne).
5.  **Projekt Techniczny MVP:** Opracuj projekt techniczny skupiony na kluczowych elementach MVP: prosty system kont, przechowywanie fiszek, podstawowe generowanie AI (Q&A), wybrany mechanizm powtórek i podstawowe API.
6.  **Mechanizm Feedbacku:** Potwierdź implementację prostego mechanizmu oceny/feedbacku dla fiszek AI w MVP, aby zbierać dane do ulepszeń.
7.  **Architektura pod Freemium:** Zaprojektuj bazę danych i system użytkowników w sposób umożliwiający łatwe dodanie limitów i warstw płatnych w przyszłości, bez nadmiernej komplikacji MVP.
8.  **Testowanie Użyteczności:** Zaplanuj wczesne testy użyteczności prototypów (nawet papierowych) kluczowych przepływów (generowanie AI, tworzenie manualne, sesja nauki), aby zweryfikować założenia UX.
</rekomendacje>

Kontynuuj ten proces, generując nowe pytania i rekomendacje w oparciu o odpowiedzi użytkownika, dopóki użytkownik wyraźnie nie poprosi o podsumowanie.

Generuj pytania i rekomendacje do momentu az uznasz ze wszystko jest jasne i masz wszystkie potrzebne informacje  

Pamiętaj, aby skupić się na jasności, trafności i dokładności wyników. Nie dołączaj żadnych dodatkowych komentarzy ani wyjaśnień poza określonym formatem wyjściowym.

Pracę analityczną należy przeprowadzić w bloku myślenia. Końcowe dane wyjściowe powinny składać się wyłącznie z pytań i zaleceń i nie powinny powielać ani powtarzać żadnej pracy wykonanej w sekcji prd_analysis.