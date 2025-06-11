Plan Testów dla Projektu "Inteligentne Fiszki"

1. Wprowadzenie i Cele Testowania
   1.1. Wprowadzenie
   Niniejszy dokument określa plan testów dla aplikacji internetowej "Inteligentne Fiszki". Aplikacja ta, zbudowana w oparciu o Next.js i Supabase, ma na celu ułatwienie nauki poprzez tworzenie, zarządzanie i przeglądanie fiszek, w tym z wykorzystaniem mechanizmów AI do generowania sugestii oraz systemu powtórek SRS. Plan ten obejmuje strategię, zasoby, harmonogram oraz zakres działań testowych mających na celu zapewnienie wysokiej jakości produktu końcowego.
   1.2. Cele Testowania
   Główne cele procesu testowania to:
   Weryfikacja, czy aplikacja spełnia zdefiniowane wymagania funkcjonalne i niefunkcjonalne.
   Wykrycie i zaraportowanie defektów przed wdrożeniem produkcyjnym.
   Zapewnienie stabilności, wydajności i bezpieczeństwa aplikacji.
   Ocena użyteczności i ogólnego doświadczenia użytkownika (UX).
   Potwierdzenie poprawnej integracji pomiędzy komponentami systemu, w tym z usługami zewnętrznymi (Supabase, OpenRouter AI).
   Zapewnienie, że dokumentacja (np. API) jest zgodna z rzeczywistym działaniem systemu.
2. Zakres Testów
   2.1. Funkcjonalności objęte testami
   Testowaniem objęte zostaną następujące kluczowe moduły i funkcjonalności:
   Moduł Uwierzytelniania i Autoryzacji:
   Rejestracja nowego użytkownika (Sign-Up).
   Logowanie użytkownika (Sign-In).
   Wylogowywanie użytkownika (Sign-Out).
   Mechanizm przypominania/resetowania hasła (Forgot Password, Reset Password).
   Ochrona tras wymagających zalogowania.
   Zarządzanie sesją użytkownika (w tym z wykorzystaniem supabase-ssr i middleware).
   Moduł Zarządzania Zestawami Fiszki (Flashcards Sets):
   Tworzenie nowego zestawu fiszek.
   Wyświetlanie listy zestawów fiszek (z paginacją, sortowaniem, filtrowaniem).
   Wyświetlanie szczegółów pojedynczego zestawu fiszek.
   Aktualizacja danych zestawu fiszek (nazwa, opis, status).
   Usuwanie zestawu fiszek.
   Moduł Zarządzania Fiszami (Flashcards):
   Tworzenie nowej fiszki manualnie w ramach zestawu.
   Wyświetlanie listy fiszek w ramach zestawu (z paginacją, sortowaniem, filtrowaniem).
   Wyświetlanie szczegółów pojedynczej fiszki.
   Aktualizacja danych fiszki (pytanie, odpowiedź, tagi).
   Usuwanie fiszki.
   Zarządzanie tagami przypisanymi do fiszek.
   Moduł Generowania Fiszki przez AI (AI Flashcard Generation):
   Wprowadzanie tekstu źródłowego przez użytkownika.
   Generowanie sugestii fiszek na podstawie tekstu (integracja z OpenRouter).
   Wyświetlanie listy sugestii AI.
   Akceptacja sugestii AI i tworzenie z niej fiszki w wybranym zestawie.
   Odrzucenie sugestii AI.
   Edycja treści sugestii AI przed akceptacją.
   Obsługa cachowania sugestii.
   Moduł Sesji Nauki (SRS - Spaced Repetition System):
   Rozpoczynanie nowej sesji nauki (wybór zestawu, tagów, limitu kart).
   Wyświetlanie fiszek w trakcie sesji (pytanie, następnie odpowiedź).
   Ocenianie znajomości fiszki przez użytkownika (easy, medium, hard).
   Przechodzenie do kolejnej fiszki.
   Zakończenie sesji i wyświetlanie podsumowania.
   Moduł Statystyk (jeśli zaimplementowany, bazując na StatsDTO):
   Wyświetlanie statystyk użytkownika (np. fiszki do powtórki dzisiaj, łączna liczba fiszek, historia sesji).
   Moduł Udostępniania (Collaborators - jeśli zaimplementowany, bazując na SetCollaboratorDTO):
   Zapraszanie współpracowników do zestawu.
   Zarządzanie rolami współpracowników.
   Interfejs Użytkownika (UI) i Doświadczenie Użytkownika (UX):
   Responsywność na różnych urządzeniach i rozmiarach ekranu.
   Spójność wizualna i działanie komponentów UI (shadcn/ui).
   Nawigacja w aplikacji.
   Obsługa błędów i komunikaty dla użytkownika.
   Dostępność (a11y).
   Zmiana motywu (jasny/ciemny/systemowy).
   API Aplikacji (Next.js API Routes):
   Poprawność działania wszystkich endpointów API (/api/flashcards, /api/flashcards-sets, itp.).
   Walidacja danych wejściowych (Zod).
   Obsługa błędów i odpowiednie kody statusu HTTP.
   Uwierzytelnianie zapytań.
   Rate limiting.
   Konfiguracja i Wdrożenie:
   Poprawność działania aplikacji po skonfigurowaniu zmiennych środowiskowych.
   Proces budowania i uruchamiania aplikacji lokalnie i na Vercel.
   2.2. Funkcjonalności wyłączone z testów (jeśli dotyczy)
   Na tym etapie, jeśli istnieją funkcjonalności zdefiniowane w types.ts (np. pełne statystyki, udostępnianie), ale nie są jeszcze zaimplementowane w UI lub API, ich szczegółowe testy E2E zostaną odłożone. Testowane będą jedynie definicje DTO i endpointy API, jeśli istnieją.
   Testowanie wewnętrznych mechanizmów Supabase (np. działanie samego silnika PostgreSQL) jest poza zakresem – skupiamy się na integracji.
   Dogłębne testy samego modelu AI (OpenRouter) są poza zakresem – testujemy integrację i obsługę odpowiedzi.
3. Typy Testów do Przeprowadzenia
   Testy Jednostkowe (Unit Tests):
   Cel: Weryfikacja poprawności działania pojedynczych modułów, funkcji, komponentów React, hooków, schem Zod, usług (services).
   Narzędzia: Jest, React Testing Library (dla komponentów).
   Zakres: Logika biznesowa, funkcje pomocnicze, walidacja, logika komponentów UI (bez renderowania całego drzewa), logika hooków, usługi komunikujące się z API (z mockowanym API).
   Testy Integracyjne (Integration Tests):
   Cel: Weryfikacja poprawnej współpracy pomiędzy różnymi modułami systemu.
   Narzędzia: Jest, React Testing Library, Supertest (dla API), mockowana instancja Supabase lub dedykowana instancja testowa.
   Zakres:
   Interakcja komponentów frontendowych z hookami React Query i usługami API.
   Działanie Next.js API Routes (Route Handlers) w połączeniu z usługami i bazą danych (Supabase).
   Integracja z Supabase Auth.
   Integracja z usługą AI (mockowane odpowiedzi OpenRouter).
   Testy End-to-End (E2E Tests):
   Cel: Weryfikacja kompletnych przepływów użytkownika w aplikacji, symulując rzeczywiste scenariusze użycia.
   Narzędzia: Playwright lub Cypress.
   Zakres: Kluczowe ścieżki użytkownika, np. rejestracja -> logowanie -> tworzenie zestawu -> dodawanie fiszek (manualnie i AI) -> rozpoczęcie sesji nauki -> zakończenie sesji.
   Testy API (API Tests):
   Cel: Bezpośrednie testowanie endpointów API aplikacji (Next.js API Routes).
   Narzędzia: Postman, Newman, lub testy integracyjne z użyciem Supertest/fetch.
   Zakres: Sprawdzenie poprawności żądań i odpowiedzi, kodów statusu, obsługi błędów, walidacji, uwierzytelniania, rate limitingu dla wszystkich endpointów.
   Testy Wydajnościowe (Performance Tests):
   Cel: Ocena szybkości ładowania stron, responsywności interfejsu, czasu odpowiedzi API pod obciążeniem.
   Narzędzia: Lighthouse, WebPageTest, k6 (dla API).
   Zakres: Kluczowe strony (np. dashboard, lista zestawów), operacje generujące duże zapytania (np. listowanie, filtrowanie), działanie AI.
   Testy Bezpieczeństwa (Security Tests):
   Cel: Identyfikacja potencjalnych luk bezpieczeństwa.
   Narzędzia: OWASP ZAP (podstawowe skanowanie), manualna weryfikacja (np. RLS w Supabase).
   Zakres: Ochrona przed XSS, CSRF (Next.js ma wbudowane mechanizmy, ale warto zweryfikować), bezpieczeństwo sesji, poprawne działanie RLS, ochrona kluczy API.
   Testy Użyteczności (Usability Tests):
   Cel: Ocena łatwości obsługi aplikacji, intuicyjności interfejsu i ogólnego zadowolenia użytkownika.
   Metody: Testy korytarzowe, zbieranie opinii od użytkowników testowych.
   Zakres: Nawigacja, zrozumiałość komunikatów, przepływy tworzenia i nauki.
   Testy Akceptacyjne Użytkownika (UAT - User Acceptance Tests):
   Cel: Potwierdzenie przez klienta/interesariuszy, że aplikacja spełnia ich oczekiwania i potrzeby biznesowe.
   Metody: Demonstracje, przekazanie aplikacji do testów przez wyznaczone osoby.
   Testy Kompatybilności (Compatibility Tests):
   Cel: Sprawdzenie poprawnego działania aplikacji na różnych przeglądarkach i urządzeniach.
   Zakres: Najpopularniejsze przeglądarki (Chrome, Firefox, Safari, Edge) na desktopie i mobile. Różne rozdzielczości ekranu.
   Testy Wizualne (Visual Regression Tests):
   Cel: Wykrywanie niezamierzonych zmian wizualnych w interfejsie użytkownika.
   Narzędzia: Percy, Applitools, lub snapshot testing z Jest dla komponentów.
   Zakres: Kluczowe komponenty UI i widoki stron.
4. Scenariusze Testowe dla Kluczowych Funkcjonalności
   Poniżej przedstawiono przykładowe, wysokopoziomowe scenariusze testowe. Szczegółowe przypadki testowe zostaną opracowane na ich podstawie.
   4.1. Uwierzytelnianie
   SCN_AUTH_001: Pomyślna rejestracja nowego użytkownika z poprawnymi danymi.
   SCN_AUTH_002: Próba rejestracji z istniejącym adresem e-mail.
   SCN_AUTH_003: Próba rejestracji z niepasującymi hasłami.
   SCN_AUTH_004: Pomyślne logowanie z poprawnymi danymi uwierzytelniającymi.
   SCN_AUTH_005: Próba logowania z niepoprawnym hasłem/e-mailem.
   SCN_AUTH_006: Pomyślne wylogowanie użytkownika.
   SCN_AUTH_007: Dostęp do strony chronionej bez zalogowania (oczekiwane przekierowanie na stronę logowania).
   SCN_AUTH_008: Dostęp do strony chronionej po zalogowaniu.
   SCN_AUTH_009: Proces resetowania hasła (wysłanie linku, ustawienie nowego hasła).
   4.2. Zarządzanie Zestawami Fiszki
   SCN_SET_001: Pomyślne utworzenie nowego, pustego zestawu fiszek przez zalogowanego użytkownika.
   SCN_SET_002: Wyświetlenie listy zestawów należących do zalogowanego użytkownika.
   SCN_SET_003: Paginacja listy zestawów.
   SCN_SET_004: Sortowanie listy zestawów (np. po nazwie, dacie utworzenia).
   SCN_SET_005: Filtrowanie listy zestawów (np. po nazwie, statusie).
   SCN_SET_006: Pomyślna edycja nazwy i opisu istniejącego zestawu.
   SCN_SET_007: Pomyślne usunięcie zestawu fiszek (wraz z potwierdzeniem).
   SCN_SET_008: Próba dostępu/modyfikacji zestawu nienależącego do zalogowanego użytkownika (oczekiwany błąd autoryzacji).
   4.3. Zarządzanie Fiszami
   SCN_CARD_001: Pomyślne dodanie nowej fiszki (pytanie, odpowiedź, tagi) do istniejącego zestawu.
   SCN_CARD_002: Wyświetlenie listy fiszek w ramach wybranego zestawu.
   SCN_CARD_003: Edycja pytania, odpowiedzi i tagów istniejącej fiszki.
   SCN_CARD_004: Usunięcie fiszki z zestawu.
   4.4. Generowanie Fiszki przez AI
   SCN_AI_001: Pomyślne wygenerowanie sugestii fiszek na podstawie podanego tekstu.
   SCN_AI_002: Próba generowania sugestii dla bardzo krótkiego lub pustego tekstu.
   SCN_AI_003: Akceptacja wygenerowanej sugestii i dodanie jej jako fiszki do wybranego zestawu.
   SCN_AI_004: Odrzucenie wygenerowanej sugestii.
   SCN_AI_005: Edycja treści (pytania/odpowiedzi) wygenerowanej sugestii przed jej akceptacją.
   SCN_AI_006: Obsługa błędów komunikacji z API OpenRouter.
   SCN_AI_007: Sprawdzenie działania cachowania sugestii (ponowne wyświetlenie tych samych sugestii, TTL).
   4.5. Sesje Nauki SRS
   SCN_SRS_001: Pomyślne rozpoczęcie sesji nauki dla wybranego zestawu.
   SCN_SRS_002: Wyświetlanie kolejnych fiszek (najpierw pytanie, po akcji użytkownika odpowiedź).
   SCN_SRS_003: Ocenianie fiszek (easy, medium, hard) i przejście do następnej.
   SCN_SRS_004: Zakończenie sesji po przejrzeniu wszystkich zaplanowanych fiszek.
   SCN_SRS_005: Wyświetlenie podsumowania sesji (wynik, czas trwania).
   SCN_SRS_006: Rozpoczęcie sesji bez dostępnych fiszek do nauki (np. pusty zestaw).
5. Środowisko Testowe
   Zostaną przygotowane następujące środowiska:
   Lokalne środowisko deweloperskie:
   Do przeprowadzania testów jednostkowych i integracyjnych przez deweloperów.
   Lokalna instancja aplikacji Next.js.
   Lokalna instancja Supabase (jeśli możliwa i skonfigurowana) lub deweloperski projekt Supabase w chmurze.
   Środowisko testowe/stagingowe (Vercel):
   Do przeprowadzania testów integracyjnych, E2E, API, wydajnościowych, bezpieczeństwa, UAT.
   Dedykowany projekt Supabase (testowy) z odizolowanymi danymi.
   Konfiguracja zbliżona do produkcyjnej.
   Dostęp do narzędzi monitorujących i logów.
   Środowisko produkcyjne (Vercel):
   Ograniczone testy dymne (smoke tests) po każdym wdrożeniu.
   Monitorowanie działania aplikacji.
   Klucze API (Supabase, OpenRouter) będą zarządzane poprzez zmienne środowiskowe, osobne dla każdego środowiska.
6. Narzędzia do Testowania
   Testy jednostkowe i integracyjne (komponenty, logika): Jest, React Testing Library.
   Testy E2E: Playwright (preferowany ze względu na dobre wsparcie dla TypeScript i auto-waits) lub Cypress.
   Testy API: Postman (do eksploracji i testów manualnych), Newman (do automatyzacji testów Postman w CI/CD), Supertest (dla testów integracyjnych API w kodzie).
   Testy wydajnościowe: Google Lighthouse (wbudowane w Chrome DevTools), WebPageTest, k6.
   Testy bezpieczeństwa: OWASP ZAP (podstawowe skanowanie), manualna inspekcja kodu.
   Testy wizualne: Percy lub Applitools (jeśli budżet pozwoli), alternatywnie snapshot testing z Jest.
   Zarządzanie testami i błędami: Jira, TestRail, Xray (lub prostsze narzędzia jak GitHub Issues z etykietami).
   CI/CD: GitHub Actions (do automatycznego uruchamiania testów przy push/PR).
7. Harmonogram Testów
   Harmonogram testów będzie ściśle powiązany z harmonogramem deweloperskim i iteracjami projektu.
   Testy jednostkowe i integracyjne: Prowadzone równolegle z rozwojem funkcjonalności przez deweloperów.
   Testy API: Rozpoczynane po zaimplementowaniu każdego endpointu.
   Testy E2E: Rozwijane stopniowo, priorytetyzując kluczowe przepływy. Główne sesje testów E2E przed każdym większym wydaniem.
   Testy wydajnościowe i bezpieczeństwa: Planowane przed dużymi wydaniami oraz okresowo.
   UAT: Po zakończeniu każdej znaczącej iteracji lub przed wdrożeniem produkcyjnym.
   Zakłada się podejście iteracyjne, gdzie testowanie jest integralną częścią każdego sprintu/cyklu rozwojowego.
8. Kryteria Wejścia i Wyjścia z Testów (Akceptacji Testów)
   8.1. Kryteria Wejścia (Rozpoczęcia Testów)
   Zakończono rozwój danej funkcjonalności/modułu.
   Kod został zintegrowany i wdrożony na odpowiednie środowisko testowe.
   Dostępna jest dokumentacja funkcjonalności (jeśli dotyczy).
   Testy jednostkowe dla danej funkcjonalności przechodzą pomyślnie.
   Środowisko testowe jest stabilne i skonfigurowane.
   8.2. Kryteria Wyjścia (Zakończenia Testów / Akceptacji)
   Wszystkie zaplanowane przypadki testowe dla danej iteracji/wydania zostały wykonane.
   Określony procent przypadków testowych zakończył się sukcesem (np. 95% dla krytycznych i wysokich priorytetów, 90% dla średnich).
   Brak otwartych błędów krytycznych (blokujących) i wysokiego priorytetu.
   Wszystkie zgłoszone błędy zostały przeanalizowane, a ich status określony (naprawiony, odroczony, nie jest błędem).
   Wyniki testów zostały udokumentowane i zaakceptowane przez interesariuszy.
   Spełnione zostały kryteria wydajnościowe i bezpieczeństwa (jeśli były testowane w danej fazie).
9. Role i Odpowiedzialności w Procesie Testowania
   Inżynier QA / Tester:
   Projektowanie i tworzenie planów testów, przypadków testowych.
   Wykonywanie testów manualnych i automatycznych.
   Raportowanie i śledzenie błędów.
   Przygotowywanie raportów z testów.
   Współpraca z deweloperami w celu rozwiązywania problemów.
   Utrzymanie i rozwój skryptów testów automatycznych.
   Deweloperzy:
   Pisanie testów jednostkowych i integracyjnych dla swojego kodu.
   Naprawianie błędów zgłoszonych przez zespół QA.
   Uczestnictwo w przeglądach kodu pod kątem testowalności.
   Wsparcie w analizie przyczyn błędów.
   Product Owner / Manager Projektu:
   Definiowanie wymagań i kryteriów akceptacji.
   Priorytetyzacja funkcjonalności do testowania.
   Uczestnictwo w UAT.
   Podejmowanie decyzji dotyczących odroczonych błędów.
   DevOps (jeśli dotyczy):
   Zapewnienie i utrzymanie stabilnych środowisk testowych.
   Integracja testów automatycznych z procesem CI/CD.
10. Procedury Raportowania Błędów
    Każdy wykryty błąd powinien być zaraportowany w systemie śledzenia błędów (np. Jira, GitHub Issues) i zawierać następujące informacje:
    ID Błędu: Unikalny identyfikator.
    Tytuł: Zwięzły opis problemu.
    Opis: Szczegółowy opis błędu, w tym:
    Kroki do reprodukcji (numerowane, jasne i precyzyjne).
    Obserwowany wynik.
    Oczekiwany wynik.
    Środowisko: Wersja aplikacji, przeglądarka, system operacyjny, na którym wystąpił błąd.
    Priorytet: (np. Krytyczny, Wysoki, Średni, Niski) - określający wpływ błędu na działanie aplikacji i pilność naprawy.
    Stopień Ważności/Severity: (np. Blocker, Critical, Major, Minor, Trivial) - określający techniczny wpływ błędu na system.
    Załączniki: Zrzuty ekranu, nagrania wideo, logi – jeśli pomagają w zrozumieniu problemu.
    Osoba zgłaszająca: Kto znalazł błąd.
    Data zgłoszenia.
    Przypisany do: Deweloper odpowiedzialny za naprawę (jeśli znany).
    Status: (np. Nowy, Otwarty, W trakcie analizy, Do naprawy, Naprawiony, Do retestu, Zamknięty, Odrzucony).
    Cykl życia błędu:
    Zgłoszenie (Nowy/Otwarty): Tester zgłasza błąd.
    Analiza: Błąd jest analizowany pod kątem zasadności i możliwości reprodukcji.
    Przypisanie (Do naprawy): Błąd jest przypisywany deweloperowi.
    Naprawa: Deweloper naprawia błąd.
    Retest (Do retestu): Tester weryfikuje, czy błąd został poprawnie naprawiony.
    Zamknięcie (Zamknięty): Jeśli błąd został naprawiony.
    Ponowne otwarcie: Jeśli błąd nadal występuje.
    Odrzucenie (Odrzucony): Jeśli zgłoszenie nie jest błędem lub jest duplikatem.
