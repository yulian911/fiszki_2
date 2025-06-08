# Wprowadzenie do projektu: Inteligentne Fiszki

## Witamy

Witamy w projekcie Inteligentne Fiszki! Jest to aplikacja internetowa zaprojektowana w celu uproszczenia tworzenia fiszek edukacyjnych przy użyciu sztucznej inteligencji (AI), automatyzująca proces i wspierająca efektywną naukę.

## Ogólny przegląd i struktura projektu

Podstawowa funkcjonalność aplikacji koncentruje się na generowaniu par pytanie-odpowiedź z wklejonego tekstu. Projekt jest zorganizowany jako pojedyncza aplikacja (monolit) Next.js, z następującymi kluczowymi komponentami/modułami.

## Kluczowe moduły

> Ta sekcja została zaktualizowana o szczegółowe informacje z analizy kodu i powiązania między modułami.

### `features/**/components` (Frontend)

- **Rola:** Katalog `features` zawiera komponenty React, które składają się na interfejs użytkownika dla poszczególnych domen biznesowych.
- **Kluczowe pod-moduły:**
  - **`features/flashcard-sets/components`**: Zarządza wszystkimi aspektami zestawów fiszek od strony UI, w tym tworzeniem, edycją i wyświetlaniem. Jest to główny interfejs do interakcji użytkownika z fiszkami.
  - **`features/ai-generator/components`**: Obsługuje interfejs do generowania fiszek z pomocą AI, w tym formularz do wprowadzania tekstu i widok sugestii.
  - **`features/sessions/components`**: Odpowiada za interfejs sesji nauki, gdzie użytkownik odpowiada na pytania i ocenia swoją wiedzę w systemie powtórek interwałowych (SRS).
- **Powiązania:** Komponenty w tym katalogu komunikują się z backendem poprzez wywołania do endpointów API zdefiniowanych w `app/api`.

### `app/api/**` (Backend)

- **Rola:** Ten katalog zawiera logikę backendową aplikacji, zaimplementowaną jako serverless functions w Next.js. Obsługuje operacje na danych, uwierzytelnianie i integrację z usługami zewnętrznymi (np. Supabase).
- **Kluczowe pliki/obszary:**
  - **`app/api/flashcards-sets/route.ts`**: Centralny endpoint do tworzenia (POST) i listowania (GET) zestawów fiszek. Zawiera zaawansowaną logikę, w tym walidację Zod, rate limiting i uwierzytelnianie.
  - **`app/api/flashcards-suggestions/[suggestionId]/accept/route.ts`**: Kluczowy endpoint, który finalizuje proces AI, konwertując sugestię na fiszkę.
- **Architektura:** Logika biznesowa jest w dużej mierze wydzielona do dedykowanych serwisów (np. `FlashcardsSetService`), co jest dobrą praktyką architektoniczną.

### `components/ui`

- **Rola:** Zapewnia zbiór reużywalnych, podstawowych komponentów interfejsu użytkownika (zgodnie z `shadcn/ui`), które są używane w całej aplikacji w celu zachowania spójnego wyglądu i działania.
- **Kluczowe pliki/obszary:** `button.tsx`, `input.tsx`, `dialog.tsx`, `card.tsx`, `table.tsx`, `form.tsx`.

## Kluczowi kontrybutorzy

> Sekcja zaktualizowana na podstawie analizy historii Git.

- **yulian911:** Jest jedynym i głównym kontrybutorem projektu. Jego commity obejmują wszystkie aspekty aplikacji – od logiki backendowej w API, przez komponenty frontentowe w React, aż po konfigurację CI/CD i procesów wdrożeniowych.

## Ogólne wnioski i ostatnie zmiany

> Ta sekcja została zsyntetyzowana na nowo, aby odzwierciedlić aktualne priorytety deweloperskie.

1.  **Fokus na stabilizację i wdrożenie:** Analiza historii Git, zwłaszcza duża liczba commitów z ogólnymi komunikatami "update" i "deploy", wskazuje, że ostatnie prace koncentrowały się na stabilizacji istniejących funkcji i przygotowaniu aplikacji do pierwszego wdrożenia produkcyjnego.
2.  **Dojrzałość procesów CI/CD:** Znacząca aktywność w pliku `.github/workflows/pull-request.yml` świadczy o dużym nacisku na jakość i automatyzację. Proces obejmuje linting, testy jednostkowe z pokryciem kodu oraz testy E2E z użyciem Playwright, co jest oznaką dojrzałości projektu.
3.  **Solidna architektura backendu:** Endpointy API w `app/api` są dobrze zorganizowane. Stosowanie warstwy serwisowej, walidacji danych wejściowych za pomocą Zod oraz mechanizmów takich jak rate limiting i centralne uwierzytelnianie, tworzy solidne i bezpieczne fundamenty.
4.  **Brak zdefiniowanych zmiennych środowiskowych:** W repozytorium brakuje pliku `.env.example`, co stanowi utrudnienie dla nowych deweloperów.

## Potencjalna złożoność/obszary do uwagi

> Sekcja zaktualizowana o konkretne pliki i ryzyka zidentyfikowane podczas analizy.

- **Ryzyko "Bus Factor":** Projekt jest w całości rozwijany przez jednego dewelopera (`yulian911`). Brak dywersyfikacji wiedzy stanowi znaczące ryzyko dla ciągłości i utrzymania projektu.
- **Krytyczna logika akceptacji sugestii AI:** Plik `app/api/flashcards-suggestions/[suggestionId]/accept/route.ts` miał najwyższą częstotliwość zmian. Może to wskazywać na złożoność logiki lub na to, że jej dopracowanie wymagało wielu iteracji. Nowe zmiany w tym obszarze powinny być wprowadzane z dużą ostrożnością.
- **Złożoność pipeline'u CI/CD:** Workflow w `.github/workflows/pull-request.yml` jest wieloetapowy i ma zależności (np. od sekretów GitHub dla testów E2E). Zrozumienie jego działania jest kluczowe przed wprowadzeniem jakichkolwiek zmian w procesie budowania lub testowania.

## Pytania do zespołu

> Ta sekcja została zastąpiona nowymi pytaniami, które wyniknęły z analizy.

1.  Jaki był konkretny cel serii commitów "update" i "deploy" w ostatnim czasie, zwłaszcza w kontekście endpointu do akceptacji sugestii AI? Czy dotyczyły one poprawek błędów, czy refaktoryzacji?
2.  Jaka jest pełna lista zmiennych środowiskowych potrzebnych do uruchomienia projektu lokalnie? Czy można prosić o utworzenie pliku `.env.example`?
3.  Jakie są kluczowe założenia dotyczące działania testów E2E? W jaki sposób zarządzany jest stan testowego użytkownika i jego danych w bazie Supabase?
4.  Czy istnieją plany dotyczące onboardingu kolejnych deweloperów lub wprowadzenia mechanizmów code review, aby zmniejszyć ryzyko związane z "bus factor"?
5.  Dlaczego wiadomości w commitach są tak ogólne? Czy można wprowadzić konwencję (np. Conventional Commits), aby w przyszłości łatwiej było śledzić historię zmian?

## Następne kroki

> Sekcja została zaktualizowana o konkretne, praktyczne rekomendacje dla nowego dewelopera.

1.  **Zrozumienie procesu jakości:** Rozpocznij od analizy pliku `.github/workflows/pull-request.yml`, aby zrozumieć, jakie są wymagania dotyczące jakości kodu (linting, testy). Spróbuj uruchomić wszystkie skrypty (`npm run lint`, `npm run test:coverage`, `npm run test:e2e`) lokalnie.
2.  **Analiza kluczowych endpointów API:** Przejrzyj kod w `app/api/flashcards-sets/route.ts` oraz `app/api/flashcards-suggestions/[suggestionId]/accept/route.ts`. Zrozumienie logiki backendowej jest kluczowe, ponieważ to ona napędza całą aplikację.
3.  **Prześledź przepływ danych od UI do API:** Wybierz jedną kluczową funkcję, np. tworzenie zestawu fiszek. Prześledź, jak dane przepływają z komponentu React (np. w `features/flashcard-sets/components`) aż do odpowiedniego endpointu API i serwisu, który przetwarza żądanie.
4.  **Poproś o dodanie `.env.example`:** Jest to kluczowy krok do sprawnego skonfigurowania środowiska deweloperskiego.

## Konfiguracja środowiska programistycznego

1.  **Wymagania wstępne:** Node.js (zalecana wersja LTS), menedżer pakietów `npm` lub `yarn`.
2.  **Instalacja zależności:** `npm install`
3.  **Budowanie projektu:** `npm run build`
4.  **Uruchamianie aplikacji/usługi:** `npm run dev`
5.  **Uruchamianie testów:** `npm run test` (dla testów jednostkowych), `npm run test:e2e` (dla testów end-to-end).
6.  **Częste problemy:** Sekcja dotycząca częstych problemów nie została znaleziona w sprawdzonych plikach.

## Pomocne zasoby

- **Dokumentacja:** Link do głównej dokumentacji nie został znaleziony; `README.md` służy jako podstawowe źródło informacji.
- **Śledzenie zgłoszeń:** Prawdopodobnie GitHub Issues repozytorium (link nie został jawnie podany w `README.md`).
- **Przewodnik po współtworzeniu:** Plik `CONTRIBUTING.md` nie został znaleziony.
- **Kanały komunikacji:** Linki do kanałów komunikacji nie zostały znalezione w sprawdzonych plikach.
- **Zasoby do nauki:** Sekcja z konkretnymi zasobami do nauki nie została znaleziona.
