# Kompleksowy Test Plan dla Projektu "Fiszki_2"

Poniższy dokument przedstawia kompleksowy plan testowania, który został opracowany na podstawie analizy architektury projektu, wykorzystywanego stacku technologicznego oraz dotychczasowej zawartości kodu (m.in. wyszukiwania testów jednostkowych). Dokument ten ma na celu dostarczenie gotowych do implementacji wytycznych oraz przykładowych fragmentów kodu, aby zapewnić wysoką jakość i spójność systemu.

---

## 1. Wprowadzenie

**Cel test planu:**  
- Zapewnienie, że wszystkie kluczowe funkcjonalności systemu są poprawnie zaimplementowane i działają zgodnie z wymaganiami biznesowymi.
- Identyfikacja potencjalnych punktów awarii i integracji między modułami.
- Ustanowienie spójnego i skalowalnego podejścia do testowania, które można łatwo integrować z CI/CD.

**Zakres:**  
Test plan obejmuje testy jednostkowe, integracyjne, end-to-end, API/interfejsów oraz testy bezpieczeństwa, zgodnie z wykorzystanym stackiem:
- **Frontend:** Next.js, React, TypeScript, Tailwind, Shadcn/ui, react-hook-form, react-query, nuqs, react-hot-toast, use-debounce
- **Backend:** Supabase (PostgreSQL, backend-as-a-service)
- **AI/Integracje:** Pośrednictwo przez Openrouter.ai
- **CI/CD & Hosting:** Github Actions, DigitalOcean

---

## 2. Analiza Architektury
### Kluczowe komponenty i moduły:
- **Frontend:** 
  - Komponenty React (np. logika interaktywna, formularze, widoki)
  - Logika zarządzania stanem i zapytań (react-query)
  - System routingu (Next.js)
- **Backend/Supabase:**  
  - Warstwa bazy danych PostgreSQL
  - Autentykacja i autoryzacja użytkowników
  - Integracje API
- **Integracje z AI:**  
  - Warstwa komunikacji z modelami poprzez Openrouter.ai

### Krytyczne ścieżki biznesowe i punkty integracji:
- Autentykacja użytkowników i zarządzanie sesjami
- Przesyłanie i walidacja danych przez formularze (react-hook-form + Zod)
- Pobrań i aktualizacji danych (react-query, API Supabase)
- Interakcje UI (przyciski, modale, notyfikacje toast)
- Integracja z usługami zewnętrznymi (np. AI, Supabase)

### Potencjalne punkty awarii:
- Błędy walidacji danych (np. niepoprawne schematy walidacji przez Zod).
- Problemy z synchronizacją stanu URL (nuqs).
- Błędy komunikacji z API (problem np. z autentykacją lub niedostępnością serwisów zewnętrznych).
- Konflikty stylów lub błędy renderowania UI z powodu Tailwind lub shadcn/ui.

---

## 3. Strategie Testowania wg Stack'u Technologicznego

### A. Testowanie jednostkowe (Unit Tests)
- **Cel:** Testowanie pojedynczych funkcji, metod oraz małych komponentów w izolacji.
- **Zakres:**  
  - Kluczowe funkcje biznesowe (np. logika walidacji, obliczenia, przetwarzanie danych).
  - Komponenty React (małe komponenty, helpery).
- **Narzędzia:**  
  - Jest jako główny framework testowy.
  - React Testing Library do testowania komponentów.
- **Przykład test case:**
  ```typescript
  // Przykład testu jednostkowego komponentu React
  import { render, screen } from '@testing-library/react';
  import HomePage from '../pages/index';

  test('strona główna renderuje się bez błędów', () => {
    render(<HomePage />);
    const headingElement = screen.getByRole('heading', { name: /witaj w aplikacji/i });
    expect(headingElement).toBeInTheDocument();
  });
  ```

### B. Testowanie integracyjne
- **Cel:** Sprawdzenie współdziałania pomiędzy modułami, integracji między frontendem i backendem, oraz przepływu danych.
- **Zakres:**  
  - Interakcje między komponentami a logiką biznesową.
  - Integracja z API Supabase.
  - Walidacja formularzy i obsługa błędów.
- **Narzędzia:**  
  - Jest wraz z odpowiednimi mockami dla Supabase.
  - Testowanie integracyjne endpointów z użyciem narzędzi typu supertest (dla Node.js).
- **Przykład test case:**
  ```typescript
  // Przykład testu integracyjnego formularza z walidacją
  import { render, screen, fireEvent } from '@testing-library/react';
  import LoginForm from '../components/LoginForm';

  test('formularz logowania poprawnie obsługuje błędne dane', () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/hasło/i), { target: { value: '' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByText(/niepoprawny email/i)).toBeInTheDocument();
  });
  ```

### C. Testowanie end-to-end (E2E)
- **Cel:** Symulacja rzeczywistej podróży użytkownika (user journey) poprzez interfejs aplikacji.
- **Zakres:**  
  - Scenariusze logowania, rejestracji i korzystania z aplikacji.
  - Testowanie przepływu danych między frontendem a backendem.
- **Narzędzia:**  
  - Cypress – dla symulacji pełnych scenariuszy użytkownika.
- **Przykład test case:**
  ```javascript
  // Przykład testu E2E z użyciem Cypress
  describe('User Journey', () => {
    it('Poprawne logowanie i nawigacja', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('user@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  });
  ```

### D. Testowanie API / Interfejsów
- **Cel:** Weryfikacja poprawności odpowiedzi API i interfejsów komunikacyjnych.
- **Zakres:**  
  - Endpointy Supabase.
  - Endpoints integrujące się z zewnętrznymi usługami (np. Openrouter.ai).
- **Narzędzia:**  
  - Supertest (dla backendu w Node.js).
  - Postman do ręcznego testowania interfejsów.
- **Przykłady:**
  - Weryfikacja kodu statusu HTTP i struktury danych w odpowiedzi.

### E. Testowanie bezpieczeństwa
- **Cel:** Identyfikacja luk bezpieczeństwa związanych z autoryzacją, walidacją danych oraz podatnościami wynikającymi z integracji.
- **Zakres:**  
  - Testy penetracyjne dla kluczowych punktów wejścia.
  - Weryfikacja kontroli dostępu i mechanizmów autoryzacji.
- **Narzędzia:**  
  - Snyk lub OWASP ZAP do automatyzacji i raportowania podatności.
  - Dedykowane skrypty bezpieczeństwa.

---

## 4. Priorytetyzacja na podstawie analizy kodu

W oparciu o analizę zawartości kodu, szczególny nacisk należy położyć na:
- Komponenty oraz funkcje o wysokiej złożoności cyklomatycznej (np. złożona logika walidacji lub zarządzania stanem).
- Kluczowe funkcjonalności biznesowe (logowanie, rejestracja, przetwarzanie danych użytkownika).
- Moduły z częstymi zmianami w historii commitów – które wymagają ciągłej regresji.
- Zewnętrzne integracje, w tym komunikacja z Supabase, Openrouter.ai oraz API zewnętrznych dostawców.

---

## 5. Szczegółowy Plan Testów

### Scope testów
- Testowanie wszystkich krytycznych funkcjonalności (autentykacja, formularze, komunikacja API).
- Testy UI odpowiadające na interakcje użytkownika.
- Testy backendu sprawdzające integralność komunikacji z bazą danych i zewnętrznymi usługami.

### Metody i narzędzia
- **Jednostkowe:** Jest, React Testing Library, mocks (np. msw dla API).
- **Integracyjne:** Supertest, Jest.
- **E2E:** Cypress.
- **Bezpieczeństwa:** Snyk, OWASP ZAP.

### Środowiska testowe
- **Lokalne:** Emulacja środowiska deweloperskiego z danymi testowymi.
- **CI/CD:** Pipeline na Github Actions z automatycznym uruchamianiem testów przy każdym commicie.
- **Testowe:** Osobna instancja Supabase i symulowanych usług zewnętrznych na potrzeby integracyjnych testów.

### Kryteria akceptacji ("done")
- Każdy test jednostkowy musi mieć status "zielony" (pass).
- Pokrycie kodu testami nie mniejsze niż 80% (z możliwością stopniowego podnoszenia).
- Każdy krytyczny scenariusz e2e musi przechodzić bez błędów.
- Brak krytycznych podatności zidentyfikowanych w testach bezpieczeństwa.

### Timeline
- **Tydzień 1-2:** Ustanowienie podstawowych testów jednostkowych i integracyjnych.
- **Tydzień 3-4:** Implementacja testów e2e oraz wstępnych testów bezpieczeństwa.
- **Tydzień 5+:** Rozbudowa test suite, refaktoryzacja i integracja w pipeline CI/CD.

### Zarządzanie ryzykiem i mitygacja
- Regularne przeglądy testów i aktualizacje w oparciu o zmiany w kodzie.
- Wykorzystanie testów regresyjnych przy każdym release.
- Monitorowanie zmian w zależnościach zewnętrznych (np. aktualizacje Supabase, zależności npm).

### Coverage Goals
- Minimum 80% pokrycia dla testów jednostkowych.
- Pokrycie krytycznych scenariuszy integracyjnych i e2e na poziomie 100%.

### Procedury CI/CD
- Wdrożenie test suite w Github Actions – uruchamianie testów przy każdym pull request i commicie.
- Automatyczne raportowanie wyników testów oraz alerty w przypadku spadku pokrycia lub wykrycia krytycznych błędów.
- Integracja z narzędziami do monitorowania jakości kodu (np. Codecov).

---

## 6. Konkretne Rekomendacje

### A. Sugerowane narzędzia testowe
- **Frontend:**
  - **Jest** i **React Testing Library** – dla testów jednostkowych komponentów.
  - **Cypress** – dla scenariuszy end-to-end.
- **Backend/Integracje:**
  - **Supertest** oraz **Jest** – dla testów integracyjnych i API.
- **Bezpieczeństwo:**
  - **Snyk** lub **OWASP ZAP** – do automatycznego skanowania podatności.
- **Monitorowanie:**  
  - **Codecov** – do śledzenia pokrycia testów.
  - **Jest** reporterów – do analizy wyników testów.

### B. Wzorce testowe (Test Patterns)
- **Arrange, Act, Assert:** Standardowy wzorzec dla testów jednostkowych.
- **Mocking/Stubbing:** Stosowanie mocks dla zewnętrznych usług (np. przy Supabase lub API AI).
- **Page Object Pattern:** Dla testów E2E, aby utrzymać czytelność testów w Cypress.

### C. Konfiguracja środowisk testowych
- Oddzielne bazy danych i instancje dla środowisk testowych.
- Użycie zmiennych środowiskowych do konfigurowania endpointów w pipeline CI/CD.
- Docker lub dedykowane kontenery w DigitalOcean, aby replikować środowisko produkcyjne.

### D. Przykłady test case'ów dla krytycznych funkcjonalności
- **Test logowania:** Sprawdzenie poprawności komunikacji z API Supabase i wyświetlania błedów.
- **Test walidacji formularzy:** Użycie Zod i react-hook-form, aby potwierdzić, że błędne dane są odpowiednio obsługiwane.
- **Test interfejsu użytkownika:** Symulacja pełnej ścieżki użytkownika w aplikacji (np. rejestracja, logowanie, interakcja z dashboardem).

---

## 7. Metryki i Monitorowanie Jakości Testów

- **Code Coverage:** Utrzymywanie minimum 80% pokrycia, monitorowane przez Codecov.
- **Czas wykonania testów:** Regularne raportowanie i optymalizacja czasu testów.
- **Stabilność testów:** Monitorowanie flakiness testów oraz częstotliwości nieudanych testów.
- **Raporty CI:** Automatyczne generowanie raportów po każdej sesji testowej.

---

## 8. Strategia Testów Regresyjnych

- Każda zmiana w głównych komponentach powinna być poparta zestawem testów regresyjnych.
- Uruchamianie pełnego zestawu testów przy każdej integracji kodu (w CI/CD).
- Archiwizacja wyników testów w celu porównania i monitorowania trendów.

---

## 9. Maintenance i Skalowanie Test Suite

- Regularna rewizja i refaktoryzacja testów w celu usunięcia zbędnych lub przestarzałych przypadków.
- Dodanie parametrów konfiguracyjnych umożliwiających uruchomienie testów równolegle.
- Wsparcie dla modularnych zestawów testowych, co umożliwi dodanie nowych testów bez naruszania istniejącej struktury.
- Integracja z narzędziami do ciągłego monitorowania i analizy wyników (dashboardy, alerty).

---

## Podsumowanie

Test plan ma na celu wypracowanie kompleksowego, skalowalnego oraz automatyzowanego procesu testowania, który zabezpieczy kluczowe ścieżki biznesowe aplikacji. Plan uwzględnia specyfikę użytego stacku technologicznego, priorytetyzację funkcji krytycznych oraz integrację testów w ramach CI/CD. Dodatkowo, planowany jest system monitorowania jakości testów oraz strategia testów regresyjnych, co zapewni długoterminową stabilność i możliwość rozwijania projektu.

Dokument ten stanowi roadmapę do wdrożenia test planu w projekcie "Fiszki_2" i może zostać bezpośrednio implementowany oraz rozszerzany w miarę rozwoju kodu i pojawienia się nowych wymagań. 