# Plan implementacji: Panel Główny (Dashboard)

## 1. Przegląd

Panel Główny (`/protected/page.tsx`) jest pierwszym ekranem, który widzi zalogowany użytkownik. Jego celem jest dostarczenie scentralizowanego widoku na aktywność i postępy w nauce, a także zapewnienie szybkiego dostępu do kluczowych funkcji aplikacji, takich jak rozpoczynanie nauki, generowanie fiszek AI czy zarządzanie zestawami.

Panel został zaprojektowany w nowoczesnym, modułowym stylu, z wyraźnym podziałem na sekcje prezentujące różne typy danych.

## 2. Struktura komponentów i plików

Logika i komponenty UI dla nowej funkcji zostały umieszczone w katalogu `features/dashboard`, a dedykowane endpointy API w `app/api/dashboard`.

```
/app
├── /api
│   └── /dashboard
│       ├── /stats/route.ts
│       ├── /activity/route.ts
│       ├── /recent-sets/route.ts
│       └── /recent-sessions/route.ts
└── /protected
    └── page.tsx (Główny plik panelu)
/features
└── /dashboard
    └── /components
        ├── DashboardStats.tsx
        ├── ActivityChart.tsx
        ├── RecentSetsList.tsx
        └── RecentSessionsHistory.tsx
/supabase
└── /migrations
    ├── ..._create_dashboard_stats_function.sql
    ├── ..._create_activity_chart_function.sql
    ├── ..._create_recent_sets_function.sql
    └── ..._create_recent_sessions_function.sql
```

## 3. Widok: Panel Główny (`/protected/page.tsx`)

### 3.1. Opis

Główny widok panelu opiera się na responsywnym, dwukolumnowym układzie (na większych ekranach), który logicznie grupuje informacje:

- **Nagłówek:** Zawiera tytuł strony i krótki opis.
- **Statystyki kluczowe:** Cztery karty na górze strony prezentujące najważniejsze wskaźniki.
- **Główna treść (lewa kolumna):** Zawiera wykres aktywności oraz listę ostatnio używanych zestawów.
- **Panel boczny (prawa kolumna):** Skupia się na szybkich akcjach i historii ostatnich sesji.

### 3.2. Kluczowe komponenty

- **`DashboardStats`:** Wyświetla cztery kluczowe metryki w formie kart (`Card` z shadcn/ui):
  - Fiszki do powtórki dzisiaj (aktualnie placeholder)
  - Wszystkie fiszki
  - Ukończone sesje
  - Passa nauki (aktualnie placeholder)
- **`ActivityChart`:** Prezentuje wykres słupkowy (za pomocą biblioteki `recharts`) z aktywnością użytkownika (liczbą powtórzonych fiszek) w ciągu ostatnich 7 dni.
- **`RecentSetsList`:** Dynamiczna lista maksymalnie 5 ostatnio modyfikowanych zestawów fiszek, umożliwiająca szybkie przejście do nauki.
- **`RecentSessionsHistory`:** Tabela przedstawiająca historię 5 ostatnich ukończonych sesji nauki, zawierająca kluczowe informacje (nazwa zestawu, wynik, czas trwania).
- **Sekcja "Szybkie akcje":** Grupuje główne przyciski akcji: "Rozpocznij naukę" (modal), "Generuj fiszki AI" (modal) oraz link do zarządzania zestawami.

### 3.3. Zarządzanie stanem i danymi

- **React Query:** Wszystkie komponenty panelu wykorzystują hook `useQuery` do asynchronicznego pobierania danych z dedykowanych endpointów API. Zapewnia to cachowanie, obsługę stanów ładowania (prezentowanych jako "skeletony") oraz stanów błędu.
- **Brak złożonego stanu lokalnego:** Widok jest głównie prezentacyjny, a jego stan opiera się na danych z serwera, co minimalizuje potrzebę zarządzania stanem po stronie klienta.

## 4. Backend i Integracja API

Aby zapewnić wydajność i oddzielić logikę od prezentacji, większość obliczeń została przeniesiona do bazy danych PostgreSQL (Supabase) za pomocą funkcji RPC.

### 4.1. Funkcje w Bazie Danych

- **`get_dashboard_stats()`:** Oblicza kluczowe wskaźniki: łączną liczbę fiszek i ukończonych sesji. Zwraca placeholdery dla fiszek do powtórki i passy nauki.
- **`get_daily_activity_last_7_days()`:** Agreguje dane z tabel `sessions` i `session_cards`, aby zwrócić liczbę powtórzonych fiszek dla każdego z ostatnich 7 dni.
- **`get_recent_flashcard_sets()`:** Pobiera 5 ostatnio zmodyfikowanych, zaakceptowanych zestawów należących do użytkownika.
- **`get_recent_sessions()`:** Pobiera 5 ostatnio ukończonych sesji nauki wraz z nazwą zestawu, wynikiem i czasem trwania.

### 4.2. Endpointy API

Każda funkcja bazodanowa jest udostępniana przez dedykowany, bezpieczny endpoint API w `app/api/dashboard/`:

- `GET /api/dashboard/stats` -> wywołuje `get_dashboard_stats()`
- `GET /api/dashboard/activity` -> wywołuje `get_daily_activity_last_7_days()`
- `GET /api/dashboard/recent-sets` -> wywołuje `get_recent_flashcard_sets()`
- `GET /api/dashboard/recent-sessions` -> wywołuje `get_recent_sessions()`

## 5. Potencjalne Rozszerzenia

Dashboard jest przygotowany na przyszłą rozbudowę. Kluczowe obszary do dalszego rozwoju to:

- **Implementacja logiki SRS:** Wymaga rozbudowy schematu bazy danych o tabelę lub kolumny śledzące postęp nauki każdej fiszki (np. `next_review_at`, `interval`). Pozwoli to na faktyczne obliczanie:
  - **Fiszek do powtórki dzisiaj.**
  - **Passy nauki (study streak).**
- **Więcej wizualizacji:** Możliwość dodania bardziej zaawansowanych wykresów, np. dotyczących rozkładu znajomości fiszek.

## 6. Testowanie i Dostępność (a11y)

Zgodnie ze standardami projektu, nowo dodane komponenty i funkcje powinny być objęte testami (jednostkowymi i integracyjnymi) przy użyciu Vitest i React Testing Library. Należy również zadbać o pełną dostępność interfejsu, w tym nawigację klawiaturą, odpowiedni kontrast i semantyczny kod HTML.
