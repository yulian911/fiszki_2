# Architektura UI dla Inteligentne Fiszki

## 1. Przegląd struktury UI

Inteligentne Fiszki to aplikacja webowa z responsywnym, dostępnościowym interfejsem. Główne elementy struktury:

- Globalny provider React Query i toastów do obsługi fetch/mutacji i powiadomień.
- Nawigacja:
  - Sidebar z linkami (Dashboard, Zestawy, Nauka, Utwórz fiszkę, Profil, Wyloguj) na desktopie.
  - Hamburger menu z tymi samymi pozycjami na mobile.
  - Breadcrumb dla głębszych ścieżek (np. Zestawy > [nazwa] > Edycja).
- Modale (Dialog) dla generowania fiszek AI, tworzenia ręcznego i zarządzania współpracownikami.
- Widoki główne renderowane w <main> z odpowiednimi skeleton loaderami i obsługą pustych stanów.
- ThemeToggle zapisujący preferencje w localStorage.
- Autoryzacja Next.js middleware + Supabase Auth.

## 2. Lista widoków

### 2.1 Dashboard

- Ścieżka: `/`
- Cel: szybki dostęp do kluczowych akcji i przeglądu postępów.
- Wyświetlane informacje:
  - Liczba fiszek do powtórki dzisiaj,
  - Przyciski: "Rozpocznij naukę", "Utwórz fiszkę", "Zestawy fiszek".
- Komponenty:
  - Card z metrykami (dueToday, totalCards),
  - ButtonGroup,
  - Skeleton podczas ładowania,
  - Alert dla błędów.
- UX/A11y/Security:
  - aria-labely przy przyciskach,
  - focus trap przy modalu,
  - ochrona trasy.

### 2.2 Lista zestawów

- Ścieżka: `/sets`
- Cel: przegląd i zarządzanie zestawami.
- Info:
  - Tabela/karty z nazwą zestawu, liczbą fiszek, statusem, opcjami CRUD.
  - Filtracja po tagach i statusie.
- Komponenty:
  - Table lub CardGrid,
  - MultiSelect do filtrowania tagów,
  - Pagination,
  - EmptyState z CTA "Utwórz nowy zestaw".
- UX/A11y/Security:
  - keyboard navigation w tabeli,
  - aria-sort dla kolumn,
  - potwierdzenie przy usuwaniu.

### 2.3 Detal zestawu

- Ścieżka: `/sets/[setId]`
- Cel: przegląd fiszek w zestawie, zarządzanie.
- Info:
  - Lista fiszek (awersy/obustronny podgląd),
  - Przyciski: Edytuj, Usuń, Generuj AI, Dodaj ręcznie, Udostępnij.
- Komponenty:
  - Card lub Table z akcjami,
  - Breadcrumb,
  - Modal generowania AI,
  - Modal tworzenia ręcznego,
  - Modal współpracownika,
  - Skeleton przy fetch.
- UX/A11y/Security:
  - trap focus w modalu,
  - walidacja e-mail onBlur,
  - RLS w backend.

### 2.4 Generowanie fiszek AI (modal)

- Cel: składanie tekstu do API i przegląd sugestii.
- Info:
  - Textarea z limitem (1000 znaków), przycisk "Generuj".
  - Lista sugestii z Question/Answer.
  - Akcje: Zaakceptuj, Edytuj, Odrzuć.
- Komponenty:
  - Dialog z Textarea,
  - List z Cardami sugestii,
  - ButtonGroup,
  - Toast do błędów,
  - Spinner podczas oczekiwania.
- UX/A11y/Security:
  - aria-live region dla statusu generowania,
  - limit znaków + informacja.

### 2.5 Tworzenie fiszki ręcznie (modal)

- Cel: szybkie dodanie fiszki do wybranego zestawu.
- Info:
  - Pola: Awers, Rewers (wymagane), Hint, Tagi,
  - Dropdown wyboru zestawu lub tworzenie nowego.
- Komponenty:
  - Form,
  - TextInput, Textarea,
  - TagInput z autouzupełnianiem,
  - Select/CreatableSelect,
  - Buttons.
- UX/A11y/Security:
  - form validation,
  - rollback mutacji przy błędzie.

### 2.6 Sesja nauki

- Ścieżka: `/sessions/[sessionId]`
- Cel: interakcja SRS z oceną fiszek.
- Info:
  - Karta X z Y,
  - Pytanie (awers), przycisk "Pokaż odpowiedź",
  - Rewers + oceny ("Źle", "Średnio", "Dobrze").
- Komponenty:
  - ProgressBar,
  - Card,
  - ButtonGroup,
  - Toast sukcesu/błędu,
  - Skeleton.
- UX/A11y/Security:
  - keyboard shortcuts (np. 1/2/3),
  - chronione endpointy.

### 2.7 Logowanie/Rejestracja

- Ścieżki: `/sign-in`, `/sign-up`
- Cel: uwierzytelnienie użytkownika.
- Info:
  - Formularze z email, hasło (+ potwierdzenie), walidacja.
- Komponenty:
  - Form,
  - TextInput,
  - PasswordInput,
  - Buttons,
  - Alerty.
- UX/A11y/Security:
  - rate limit feedback,
  - httpOnly cookie dla JWT.

### 2.8 Profil/Ustawienia

- Ścieżka: `/profile`
- Cel: zarządzanie kontem, wylogowanie.
- Info:
  - Email, opcja zmiany hasła, przycisk "Wyloguj".
- Komponenty:
  - Card,
  - Form,
  - Buttons.
- UX/A11y/Security:
  - potwierdzenie wylogowania,
  - RLS.

## 3. Mapa podróży użytkownika

1. Użytkownik niezalogowany → `/sign-in` / `/sign-up` → zalogowany.
2. Dashboard (`/`) → podgląd metryk,
3. Przejście do Zestawów (`/sets`),
4. Tworzenie nowego zestawu → formularz → redirect do detal,
5. W detal zestawu → modal AI lub manual → dodawanie fiszek,
6. Po dodaniu powrót do detalu, odświeżenie listy,
7. Rozpoczęcie sesji nauki (`/sessions/[id]`), ocena fiszek → zakończenie,
8. Powrót do dashboardu lub zestawów.

## 4. Układ i struktura nawigacji

- Sidebar/ Hamburger z linkami:
  - Dashboard,
  - Zestawy,
  - Nauka,
  - Utwórz fiszkę (submenu: AI, Manual),
  - Profil,
  - Wyloguj,
  - ThemeToggle.
- Breadcrumb na stronach `/sets/[id]` i `/sessions/[id]`.
- Sticky Header z Breadcrumb i ThemeToggle.

## 5. Kluczowe komponenty

- Sidebar & HamburgerMenu,
- Header & Breadcrumb,
- Dialog (Shadcn/ui),
- Card & Table,
- ProgressBar,
- Form (TextInput, Textarea, Select, TagInput),
- MultiSelect,
- SkeletonLoader,
- Toast Notifications,
- AuthGuard / ProtectedRoute,
- SessionCard + RatingButtons.

**Uwzględnione**: responsywność (Tailwind breakpoints), dostępność (aria, focus trap), bezpieczeństwo (RLS, httpOnly cookies, rate limiting feedback).
