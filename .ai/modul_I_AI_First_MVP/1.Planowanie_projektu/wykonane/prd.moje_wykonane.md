# Dokument wymagań produktu (PRD) - Inteligentne Fiszki

## 1. Przegląd produktu

Inteligentne Fiszki to aplikacja internetowa zaprojektowana w celu uproszczenia procesu tworzenia fiszek edukacyjnych przy użyciu sztucznej inteligencji (AI). Celem jest rozwiązanie problemu czasochłonnego ręcznego tworzenia fiszek, co często zniechęca użytkowników do korzystania z efektywnej metody nauki opartej na powtórkach interwałowych (Spaced Repetition System - SRS). Wersja MVP (Minimum Viable Product) skupi się na podstawowej funkcjonalności generowania fiszek z wklejonego tekstu, możliwości ręcznego tworzenia i edycji fiszek, prostym systemie kont użytkowników oraz integracji z podstawowym, wewnętrznym algorytmem SRS.

## 2. Problem użytkownika

Głównym problemem, który rozwiązuje aplikacja, jest znaczny nakład czasu i wysiłku wymagany do ręcznego tworzenia wysokiej jakości fiszek. Studenci (np. medycyny, prawa, kierunków ścisłych), osoby uczące się języków obcych oraz profesjonaliści potrzebujący ciągłego przyswajania wiedzy często rezygnują z metody SRS z powodu bariery związanej z przygotowaniem materiałów. Istniejące narzędzia mogą być zbyt skomplikowane lub nie oferować efektywnego wsparcia w szybkim przekształcaniu notatek, artykułów czy definicji w fiszki.

## 3. Wymagania funkcjonalne

Wymagania dla wersji MVP:

*   `FR-001`: Generowanie fiszek przez AI:
    *   Użytkownik może wkleić tekst (do określonego limitu znaków, np. 1000) do analizy przez AI.
    *   AI generuje fiszki w formacie Pytanie/Odpowiedź na podstawie dostarczonego tekstu.
    *   Użytkownik może przeglądać sugerowane fiszki.
    *   Użytkownik może zaakceptować, edytować lub odrzucić każdą wygenerowaną fiszkę przed dodaniem jej do zestawu.
*   `FR-002`: Ręczne tworzenie fiszek:
    *   Użytkownik może ręcznie stworzyć nową fiszkę.
    *   Formularz tworzenia fiszki zawiera pola na tekst awersu (pytanie/termin) i rewersu (odpowiedź/definicja).
    *   Dostępne podstawowe opcje formatowania tekstu (np. pogrubienie, kursywa, listy).
    *   Możliwość dodania opcjonalnej podpowiedzi (hint).
    *   Możliwość przypisania tagów do fiszki w celu organizacji.
*   `FR-003`: Zarządzanie fiszkami:
    *   Użytkownik może przeglądać swoje zestawy fiszek.
    *   Użytkownik może edytować istniejące fiszki (zarówno te wygenerowane przez AI, jak i stworzone ręcznie).
    *   Użytkownik może usuwać pojedyncze fiszki lub całe zestawy.
    *   Fiszki mogą być grupowane w zestawy (np. na podstawie źródła tekstu lub tematu).
*   `FR-004`: System powtórek interwałowych (SRS):
    *   Aplikacja implementuje prosty, wewnętrzny algorytm SRS (np. inspirowany systemem Leitnera).
    *   Użytkownik może rozpocząć sesję powtórkową dla wybranych zestawów lub wszystkich zaległych fiszek.
    *   Podczas sesji system prezentuje awers fiszki; użytkownik odsłania rewers.
    *   Użytkownik ocenia swoją znajomość fiszki (np. w skali "łatwe", "średnie", "trudne" lub podobnej).
    *   System planuje kolejną powtórkę fiszki na podstawie oceny użytkownika i algorytmu SRS.
    *   Użytkownik ma dostęp do podstawowych statystyk dotyczących postępów w nauce (np. liczba fiszek do powtórzenia, historia sesji).
*   `FR-005`: Konta użytkowników:
    *   Użytkownik może zarejestrować się przy użyciu adresu e-mail i hasła.
    *   Użytkownik może zalogować się na swoje konto.
    *   System bezpiecznie przechowuje dane użytkownika (profil, fiszki, postępy w nauce).
    *   Dane użytkownika (fiszki, postępy) są synchronizowane przy logowaniu/na żądanie, umożliwiając dostęp z różnych urządzeń (przeglądarek).
*   `FR-006`: Interfejs użytkownika (UI/UX):
    *   Interfejs jest prosty, minimalistyczny i intuicyjny.
    *   Aplikacja jest responsywna (dostosowuje się do różnych rozmiarów ekranu przeglądarki).
    *   Nawigacja między trybem tworzenia fiszek a trybem nauki jest wyraźnie oddzielona.

## 4. Granice produktu

Następujące funkcje i cechy NIE wchodzą w zakres MVP:

*   Zaawansowane algorytmy SRS (np. SM-2, FSRS z Anki).
*   Import fiszek lub materiałów z plików (np. PDF, DOCX, CSV, Anki Decks). Wyłącznie wklejanie tekstu.
*   Współdzielenie zestawów fiszek między użytkownikami.
*   Integracje z zewnętrznymi platformami edukacyjnymi lub API.
*   Dedykowane aplikacje mobilne (iOS, Android). MVP jest aplikacją webową.
*   Zaawansowane formatowanie w edytorze fiszek (np. obrazy, wzory matematyczne LaTeX, audio, wideo).
*   Generowanie przez AI innych formatów fiszek niż Pytanie/Odpowiedź (np. uzupełnianie luk, testy wielokrotnego wyboru).
*   Możliwość określania przez użytkownika kontekstu/dziedziny dla AI w celu poprawy jakości generowania.
*   Zaawansowane mechanizmy obsługi niskiej jakości generowania przez AI (np. sugerowanie alternatyw, uczenie się preferencji użytkownika). W MVP wystarczy edycja/odrzucenie.
*   Logowanie za pomocą kont społecznościowych (Google, Facebook, itp.).
*   Synchronizacja danych w czasie rzeczywistym.
*   Mechanizmy backendowe do śledzenia limitów użycia AI pod kątem przyszłego modelu freemium.
*   Zaawansowane wizualizacje i metryki efektywności nauki.

## 5. Historyjki użytkowników

### Zarządzanie kontem

*   ID: `US-001`
*   Tytuł: Rejestracja użytkownika
*   Opis: Jako nowy użytkownik, chcę móc zarejestrować konto w aplikacji używając adresu e-mail i hasła, abym mógł zapisywać swoje fiszki i postępy w nauce.
*   Kryteria akceptacji:
    *   Formularz rejestracji zawiera pola na adres e-mail, hasło i potwierdzenie hasła.
    *   Walidacja sprawdza poprawność formatu adresu e-mail.
    *   Walidacja sprawdza, czy hasła w obu polach są identyczne.
    *   Walidacja sprawdza minimalną złożoność hasła (np. długość).
    *   System sprawdza, czy adres e-mail nie jest już zarejestrowany.
    *   Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do panelu głównego.
    *   W przypadku błędu (np. zajęty e-mail) wyświetlany jest czytelny komunikat.
    *   Hasło jest przechowywane w bezpieczny sposób (np. hashowane).

*   ID: `US-002`
*   Tytuł: Logowanie użytkownika
*   Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na moje konto używając adresu e-mail i hasła, abym mógł uzyskać dostęp do moich fiszek i rozpocząć naukę.
*   Kryteria akceptacji:
    *   Formularz logowania zawiera pola na adres e-mail i hasło.
    *   Po pomyślnym zalogowaniu użytkownik jest przekierowany do panelu głównego.
    *   W przypadku podania błędnych danych (e-mail lub hasło) wyświetlany jest czytelny komunikat błędu.
    *   System chroni przed atakami typu brute-force (np. ograniczając liczbę prób logowania).

*   ID: `US-003`
*   Tytuł: Wylogowanie użytkownika
*   Opis: Jako zalogowany użytkownik, chcę móc się wylogować z aplikacji, aby zakończyć sesję i zabezpieczyć moje konto.
*   Kryteria akceptacji:
    *   W interfejsie użytkownika dostępna jest opcja "Wyloguj".
    *   Po kliknięciu "Wyloguj" sesja użytkownika jest kończona.
    *   Użytkownik jest przekierowany na stronę logowania lub stronę główną dla niezalogowanych.

### Generowanie fiszek przez AI

*   ID: `US-101`
*   Tytuł: Wklejanie tekstu do analizy przez AI
*   Opis: Jako użytkownik, chcę móc wkleić fragment tekstu do dedykowanego pola w aplikacji, aby AI mogło go przeanalizować i zaproponować fiszki.
*   Kryteria akceptacji:
    *   W interfejsie dostępny jest obszar tekstowy (`textarea`) do wklejania tekstu.
    *   Istnieje przycisk "Generuj fiszki" (lub podobny), który inicjuje proces analizy.
    *   Aplikacja informuje użytkownika o trwającym procesie generowania (np. wskaźnik ładowania).
    *   System obsługuje rozsądny limit długości wklejanego tekstu i informuje użytkownika, jeśli go przekroczy.

*   ID: `US-102`
*   Tytuł: Przeglądanie i akceptacja fiszek AI
*   Opis: Jako użytkownik, po przetworzeniu tekstu przez AI, chcę móc przejrzeć wygenerowane fiszki (pytanie i odpowiedź), aby zdecydować, które z nich chcę zachować.
*   Kryteria akceptacji:
    *   Wygenerowane fiszki są prezentowane w czytelny sposób (np. lista kart z awersem i rewersem).
    *   Przy każdej sugerowanej fiszce znajdują się opcje: "Zaakceptuj", "Edytuj", "Odrzuć".
    *   Kliknięcie "Zaakceptuj" dodaje fiszkę do tymczasowego zestawu lub bezpośrednio do biblioteki użytkownika (do ustalenia).
    *   Kliknięcie "Odrzuć" usuwa sugestię z listy.
    *   Kliknięcie "Edytuj" pozwala na modyfikację treści awersu i rewersu przed akceptacją (przejście do US-103).
    *   Użytkownik może zaakceptować/odrzucić wiele fiszek w ramach jednego procesu.

*   ID: `US-103`
*   Tytuł: Edycja sugerowanej fiszki AI
*   Opis: Jako użytkownik, chcę móc edytować treść (awers, rewers) fiszki zasugerowanej przez AI przed jej zaakceptowaniem, aby dopasować ją do moich potrzeb lub poprawić ewentualne błędy.
*   Kryteria akceptacji:
    *   Po wybraniu opcji "Edytuj" dla sugerowanej fiszki, jej treść pojawia się w edytowalnych polach.
    *   Dostępne są podstawowe opcje formatowania tekstu.
    *   Po dokonaniu zmian, użytkownik może zapisać (zaakceptować) edytowaną fiszkę lub anulować edycję.
    *   Zapisana edytowana fiszka jest dodawana do zestawu/biblioteki.

### Ręczne tworzenie i zarządzanie fiszkami

*   ID: `US-201`
*   Tytuł: Tworzenie nowej fiszki ręcznie
*   Opis: Jako użytkownik, chcę móc ręcznie stworzyć nową fiszkę, wpisując jej awers, rewers, opcjonalną podpowiedź i tagi, aby dodać własne materiały do nauki.
*   Kryteria akceptacji:
    *   Dostępny jest dedykowany formularz lub sekcja do tworzenia nowej fiszki.
    *   Formularz zawiera pola tekstowe na awers i rewers (wymagane).
    *   Formularz zawiera opcjonalne pole na podpowiedź.
    *   Formularz zawiera pole do dodawania tagów (np. wpisywanie tekstu, autouzupełnianie istniejących tagów).
    *   Dostępne są podstawowe narzędzia formatowania tekstu dla awersu i rewersu.
    *   Przycisk "Zapisz" dodaje fiszkę do wybranego lub domyślnego zestawu.
    *   Przycisk "Anuluj" zamyka formularz bez zapisywania.

*   ID: `US-202`
*   Tytuł: Przeglądanie zestawów fiszek
*   Opis: Jako użytkownik, chcę móc przeglądać moje zestawy fiszek, aby zobaczyć ich zawartość i zarządzać nimi.
*   Kryteria akceptacji:
    *   W panelu użytkownika dostępna jest lista utworzonych zestawów fiszek.
    *   Lista pokazuje nazwę zestawu i liczbę fiszek w zestawie.
    *   Kliknięcie na zestaw wyświetla listę fiszek w tym zestawie (np. awersy lub obie strony).
    *   Możliwe jest filtrowanie/sortowanie zestawów (np. po nazwie, dacie utworzenia).

*   ID: `US-203`
*   Tytuł: Edycja istniejącej fiszki
*   Opis: Jako użytkownik, chcę móc edytować treść (awers, rewers, podpowiedź, tagi) istniejącej fiszki (zarówno AI, jak i ręcznej), aby poprawić błędy lub zaktualizować informacje.
*   Kryteria akceptacji:
    *   Podczas przeglądania fiszek w zestawie dostępna jest opcja "Edytuj" dla każdej fiszki.
    *   Kliknięcie "Edytuj" otwiera formularz edycji z załadowanymi danymi fiszki.
    *   Wszystkie pola (awers, rewers, podpowiedź, tagi) są edytowalne.
    *   Podstawowe opcje formatowania są dostępne.
    *   Przycisk "Zapisz" aktualizuje fiszkę w systemie.
    *   Przycisk "Anuluj" zamyka formularz bez zapisywania zmian.

*   ID: `US-204`
*   Tytuł: Usuwanie fiszki
*   Opis: Jako użytkownik, chcę móc usunąć pojedynczą fiszkę, której już nie potrzebuję, aby utrzymać porządek w moich zestawach.
*   Kryteria akceptacji:
    *   Podczas przeglądania fiszek w zestawie dostępna jest opcja "Usuń" dla każdej fiszki.
    *   System prosi o potwierdzenie przed usunięciem fiszki.
    *   Po potwierdzeniu fiszka jest trwale usuwana z systemu.

*   ID: `US-205`
*   Tytuł: Tworzenie i zarządzanie zestawami fiszek
*   Opis: Jako użytkownik, chcę móc tworzyć nowe zestawy fiszek i przypisywać do nich fiszki (podczas tworzenia/akceptacji AI lub później), aby logicznie grupować moje materiały do nauki.
*   Kryteria akceptacji:
    *   Możliwość utworzenia nowego, pustego zestawu i nadania mu nazwy.
    *   Podczas tworzenia/akceptowania fiszki (AI lub ręcznie) można wybrać istniejący zestaw lub utworzyć nowy.
    *   Możliwość zmiany nazwy istniejącego zestawu.
    *   Możliwość usunięcia całego zestawu (wraz ze wszystkimi fiszkami w nim zawartymi, po potwierdzeniu).
    *   (Opcjonalnie dla MVP) Możliwość przenoszenia fiszek między zestawami.

### System powtórek interwałowych (SRS)

*   ID: `US-301`
*   Tytuł: Rozpoczynanie sesji powtórkowej
*   Opis: Jako użytkownik, chcę móc rozpocząć sesję nauki (powtórkową), aby system zaprezentował mi fiszki, które wymagają powtórzenia zgodnie z algorytmem SRS.
*   Kryteria akceptacji:
    *   W panelu głównym widoczna jest informacja o liczbie fiszek zaplanowanych do powtórki na dany dzień.
    *   Dostępny jest przycisk "Rozpocznij naukę" (lub podobny).
    *   Użytkownik może (opcjonalnie) wybrać, z których zestawów chce się uczyć, jeśli są dostępne fiszki do powtórki z wielu zestawów.
    *   Kliknięcie przycisku rozpoczyna sesję nauki, prezentując pierwszą fiszkę do powtórki.

*   ID: `US-302`
*   Tytuł: Przeglądanie fiszki podczas sesji
*   Opis: Jako użytkownik, podczas sesji powtórkowej, chcę zobaczyć awers fiszki, a następnie móc odsłonić jej rewers, aby sprawdzić swoją wiedzę.
*   Kryteria akceptacji:
    *   System wyświetla awers fiszki.
    *   Dostępny jest przycisk "Pokaż odpowiedź" (lub podobny).
    *   Po kliknięciu przycisku odsłaniany jest rewers fiszki (oraz ewentualna podpowiedź).
    *   Po odsłonięciu rewersu pojawiają się opcje oceny.

*   ID: `US-303`
*   Tytuł: Ocenianie znajomości fiszki
*   Opis: Jako użytkownik, po zobaczeniu odpowiedzi (rewersu) fiszki, chcę móc ocenić, jak dobrze ją znałem, aby system mógł zaplanować kolejną powtórkę.
*   Kryteria akceptacji:
    *   Po odsłonięciu rewersu dostępne są przyciski oceny (np. "Źle", "Średnio", "Dobrze" lub 1-3/1-5).
    *   Kliknięcie przycisku oceny rejestruje odpowiedź użytkownika.
    *   System używa tej oceny do obliczenia następnego interwału powtórki dla tej fiszki zgodnie z zaimplementowanym algorytmem SRS.
    *   Po dokonaniu oceny system automatycznie przechodzi do następnej fiszki w sesji lub kończy sesję, jeśli nie ma więcej fiszek.

*   ID: `US-304`
*   Tytuł: Śledzenie postępów w nauce
*   Opis: Jako użytkownik, chcę mieć wgląd w podstawowe statystyki dotyczące moich postępów w nauce, takie jak liczba fiszek do powtórzenia dzisiaj/wkrótce.
*   Kryteria akceptacji:
    *   W panelu użytkownika wyświetlana jest liczba fiszek zaplanowanych do powtórki na bieżący dzień.
    *   (Opcjonalnie dla MVP) Wyświetlana jest łączna liczba fiszek w systemie.
    *   (Opcjonalnie dla MVP) Wyświetlana jest prosta historia ostatnich sesji nauki (np. data, liczba powtórzonych fiszek).

## 6. Metryki sukcesu

Kluczowe wskaźniki efektywności (KPI) dla oceny sukcesu MVP:

*   `M-01`: Wskaźnik akceptacji fiszek AI: Procent fiszek wygenerowanych przez AI, które są akceptowane (nieodrzucane i nieedytowane w znacznym stopniu) przez użytkownika. Cel: >= 75%.
*   `M-02`: Wskaźnik wykorzystania AI: Procent wszystkich utworzonych fiszek (AI + ręczne), które zostały stworzone przy użyciu funkcji generowania przez AI. Cel: >= 75%.
*   `M-03`: Aktywni użytkownicy dzienni/miesięczni (DAU/MAU): Liczba unikalnych użytkowników korzystających z aplikacji dziennie i miesięcznie.
*   `M-04`: Średni czas trwania sesji nauki: Czas spędzany przez użytkowników podczas aktywnej sesji powtórkowej SRS.
*   `M-05`: Wskaźnik retencji użytkowników: Procent użytkowników powracających do aplikacji po 1, 7 i 30 dniach od rejestracji lub pierwszej sesji.
*   `M-06`: Liczba utworzonych fiszek: Całkowita liczba fiszek stworzonych przez użytkowników, z podziałem na AI vs. ręczne.
*   `M-07`: Postęp w algorytmie SRS (proxy efektywności nauki): Śledzenie, jak fiszki użytkowników przechodzą przez kolejne etapy algorytmu SRS (np. średni interwał powtórek, procent "dojrzałych" fiszek). 