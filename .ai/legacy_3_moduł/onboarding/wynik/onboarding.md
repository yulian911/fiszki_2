# Wprowadzenie do projektu: Inteligentne Fiszki

## Witamy

Witamy w projekcie Inteligentne Fiszki! Jest to aplikacja internetowa zaprojektowana w celu uproszczenia tworzenia fiszek edukacyjnych przy użyciu sztucznej inteligencji (AI), automatyzująca proces i wspierająca efektywną naukę.

## Ogólny przegląd i struktura projektu

Podstawowa funkcjonalność aplikacji koncentruje się na generowaniu par pytanie-odpowiedź z wklejonego tekstu. Projekt jest zorganizowany jako pojedyncza aplikacja (monolit) Next.js, z następującymi kluczowymi komponentami/modułami.

## Kluczowe moduły

### `features/flashcard-sets/components`

- **Rola:** Zarządza wszystkimi aspektami zestawów fiszek, w tym tworzeniem, edycją, usuwaniem i wyświetlaniem fiszek. Obejmuje komponenty do interakcji z użytkownikiem, takie jak formularze, modale i tabele.
- **Kluczowe pliki/obszary:**
  - Formularze: `CreateSetFormComponent.tsx`, `EditSetFormComponent.tsx`, `AddFlashcardFormComponent.tsx`, `EditFlashcardFormComponent.tsx`
  - Komponenty interaktywne: `FlashcardsSetTableComponent.tsx`, `PaginationControlsComponent.tsx`, `FilterControlsComponent.tsx`
  - Modale: `ConfirmDeleteModalComponent.tsx`, `GenerateFlashcardsAIModalComponent.tsx`, `ShareSetModalComponent.tsx`
- **Najczęściej edytowane pliki:** `app/api/flashcards-sets/route.ts`, `app/api/flashcards-sets/[setId]/route.ts` (na podstawie danych `top_files`)

### `features/ai-generator/components`

- **Rola:** Obsługuje funkcjonalność generowania fiszek wspomaganą przez AI. Komponenty w tym module zarządzają interfejsem użytkownika do wprowadzania tekstu, wybierania zestawów i przeglądania wygenerowanych sugestii.
- **Kluczowe pliki/obszary:**
  - Generowanie: `AIFlashcardGeneratorDialog.tsx`, `TextGenerationForm.tsx`
  - Sugestie: `SuggestionsList.tsx`, `SuggestionCard.tsx`, `EditSuggestionForm.tsx`
- **Najczęściej edytowane pliki:** `app/api/flashcards-suggestions/[suggestionId]/accept/route.ts` (na podstawie danych `top_files`)

### `features/sessions/components`

- **Rola:** Odpowiada za sesje nauki z wykorzystaniem algorytmu powtórek interwałowych (SRS). Zawiera komponenty do wyświetlania pytań, odpowiedzi, oceniania i śledzenia postępów.
- **Kluczowe pliki/obszary:**
  - Główny widok sesji: `SessionPage.tsx`, `FlashcardView.tsx`
  - Interakcja z użytkownikiem: `RatingButtons.tsx`, `ShowAnswerButton.tsx`
  - Podsumowanie i postęp: `SessionSummary.tsx`, `SessionProgress.tsx`

### `components/ui`

- **Rola:** Zapewnia zbiór reużywalnych, podstawowych komponentów interfejsu użytkownika (zgodnie z `shadcn/ui`), które są używane w całej aplikacji w celu zachowania spójnego wyglądu i działania.
- **Kluczowe pliki/obszary:** `button.tsx`, `input.tsx`, `dialog.tsx`, `card.tsx`, `table.tsx`, `form.tsx`.

## Kluczowi kontrybutorzy

- **yulian911:** Główny kontrybutor (53 commity), z szerokim zaangażowaniem w różne części projektu, w tym w rozwój funkcji, komponentów UI i przepływów CI/CD.

## Ogólne wnioski i ostatnie zmiany

1.  **Rozwój funkcji wokół fiszek:** Znaczna część ostatnich prac koncentrowała się na tworzeniu, zarządzaniu i nauce z zestawów fiszek, co widać po dużej aktywności w `features/flashcard-sets/components`.
2.  **Integracja z AI:** Aktywność w `features/ai-generator/components` i powiązanych plikach API wskazuje na ciągły rozwój i udoskonalanie funkcji generowania fiszek przez AI.
3.  **Udoskonalanie interfejsu użytkownika:** Zmiany w `components/ui` i `app/layout.tsx` sugerują wysiłki na rzecz poprawy ogólnego doświadczenia użytkownika i spójności wizualnej.
4.  **Backend i API:** Częste aktualizacje w plikach `app/api/...` wskazują na ciągły rozwój logiki backendu do zarządzania danymi i obsługi żądań z frontendu.
5.  **Automatyzacja i CI/CD:** Zmiany w `.github/workflows/pull-request.yml` i plikach konfiguracyjnych Playwright wskazują na inwestycje w automatyzację testów i procesy ciągłej integracji.

## Potencjalna złożoność/obszary do uwagi

- **Zarządzanie stanem:** Aplikacja wykorzystuje `Zustand` i `React Query`. Zrozumienie, jak stan jest zarządzany globalnie i jak dane są pobierane/buforowane, będzie kluczowe.
- **Integracja z AI:** Logika interakcji z zewnętrznym API AI (`openrouter.ai`) w `AIFlashcardGeneratorDialog.tsx` i powiązanych hookach może być złożona, obejmując obsługę stanu ładowania, błędów i asynchronicznych aktualizacji.
- **Routing i API Next.js:** Projekt wykorzystuje routing oparty na katalogu `app` w Next.js. Zrozumienie konwencji, zwłaszcza w przypadku tras API (`route.ts`), jest niezbędne do pracy z backendem.

## Pytania do zespołu

1.  Jakie są kluczowe założenia architektoniczne dotyczące podziału na moduły w katalogu `features`? Czy istnieją wytyczne dotyczące tworzenia nowych modułów?
2.  Czy istnieją plany dotyczące rozszerzenia możliwości integracji z AI, na przykład o inne modele językowe lub typy generowanych treści?
3.  Jakie są najlepsze praktyki debugowania problemów z zarządzaniem stanem między `Zustand` a `React Query` w tym projekcie?
4.  Jak wygląda proces wdrażania na DigitalOcean i jak zarządzane są zmienne środowiskowe w środowisku produkcyjnym?
5.  Jakie są priorytety na najbliższe tygodnie/miesiące? Które z obszarów (`features`) będą najintensywniej rozwijane?
6.  Jakie są standardy dotyczące pisania testów (jednostkowych i E2E)? Czy wszystkie nowe funkcje muszą mieć pełne pokrycie testami?
7.  Czy istnieją jakieś plany dotyczące refaktoryzacji lub większych zmian w architekturze, o których powinienem wiedzieć?

## Następne kroki

1.  **Skonfiguruj środowisko programistyczne:** Postępuj zgodnie z instrukcjami w pliku `README.md`, aby sklonować repozytorium, zainstalować zależności (`npm install`) i uruchomić serwer deweloperski (`npm run dev`).
2.  **Zapoznaj się z kluczowym modułem:** Przejrzyj kod w `features/flashcard-sets/components`, aby zrozumieć, jak zaimplementowano podstawowe funkcje związane z fiszkami.
3.  **Uruchom testy:** Użyj poleceń `npm run test` i `npm run test:e2e`, aby zapoznać się z istniejącymi testami i upewnić się, że wszystko działa poprawnie w Twoim lokalnym środowisku.
4.  **Prześledź przepływ danych:** Prześledź, jak dane przepływają od interakcji użytkownika w `features/ai-generator/components` przez trasy API w `app/api` aż do bazy danych Supabase.
5.  **Przejrzyj ostatnie Pull Requesty:** Sprawdź historię commitów i zamknięte Pull Requesty związane z modułami o dużej aktywności, aby zrozumieć ostatnie zmiany i dyskusje.

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
