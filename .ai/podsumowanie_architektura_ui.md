<conversation_summary>
<decisions>
Zdecydowano o czterech głównych sekcjach UI: Panel główny, Lista zestawów, Generowanie fiszek (AI i ręczne) oraz Sesja nauki.
Nawigacja za pomocą sidebaru na desktopie i hamburger menu na mobile, wykorzystując Shadcn/ui i TailwindCSS.
Panel główny zawiera kluczowe akcje: „Rozpocznij naukę”, „Utwórz fiszkę” i „Lista fiszek”.
Generowanie fiszek przez AI i ręczne tworzenie odbywa się w modalach (Dialog).
Manualny modal tworzenia fiszki: jeśli brak zestawów, od razu pokazuje modal tworzenia nowego zestawu; w przeciwnym razie dropdown z istniejącymi zestawami.
Widok sesji nauki renderuje pojedynczą kartę z paskiem postępu („Karta X z Y”) oraz przyciskami oceny.
Paginacja i filtrowanie wykonywane po stronie serwera; pusta lista wyświetla komunikat „Brak danych”.
Responsywność zapewniona przez Tailwind breakpoints: sm (≥640px), md (≥768px), lg (≥1024px).
Dostępność: aria-label, trap focus w modalach, semantyczne znaczniki HTML.
Autoryzacja i ochrona tras przez Supabase Auth i Next.js middleware, redirect do /sign-in dla niezalogowanych.
Globalne zarządzanie danymi przez React Query provider i dedykowane hooki.
Użycie skeleton loaderów (Skeleton) i toast notifications (react-hot-toast) do obsługi stanów loadingu i błędów.
Wprowadzenie breadcrumb navigation dla głębokich ścieżek (np. Sets > [nazwa] > Edit).
Przełącznik motywów light/dark zapisany w localStorage.
Role w udostępnianiu zestawów:
full: edytowanie, usuwanie, udostępnianie
learning: dostęp do nauki i możliwość „opuszczenia” zestawu
Modal „Dodaj współpracownika” waliduje e-mail (API check), blokuje przycisk „Dodaj” i wyświetla błąd „Użytkownik nie istnieje”.
Filtrowanie tagami wspiera wielokrotny wybór i przycisk „Reset filtrów”.
</decisions>
<matched_recommendations>
Wykorzystanie komponentów Shadcn/ui (Sidebar, Dialog, Table, Card, Progress, Breadcrumb, Switch) i TailwindCSS.
Implementacja React Query provider w _app.tsx oraz custom hooków: useFetchSets, useGenerateSuggestions, useSession, useSetShares, useCheckUserByEmail.
Wdrożenie Supabase Auth w Next.js middleware dla ochrony tras i redirectu niezalogowanych.
Zastosowanie skeleton loaderów (Skeleton) i toastów (react-hot-toast) w procesach fetch/mutacji.
Projektowanie modali z trap focus i ESC-to-close dla dostępności.
Persistowanie preferencji motywu (light/dark) w localStorage i toggle w headerze.
Optymistyczne mutacje i rollback w React Query dla flow udostępniania i usuwania dostępu.
Reagowanie na empty states z komunikatem „Brak danych” i CTA do tworzenia zasobów.
Wdrożenie tag filtering MultiSelect z resetem filtrów.
</matched_recommendations>
<ui_architecture_planning_summary>
Główne wymagania architektury UI
Intuicyjna, modułowa nawigacja: sidebar/hamburger, breadcrumb.
Modale do AI/manual generation i share-collaborator.
Dashboard z szybkim dostępem do najważniejszych działań.
Sekwencyjny widok sesji nauki z progressem i oceną.
Role-based access dla współdzielenia zestawów.
Responsywność i dostępność na wszystkich urządzeniach.
Kluczowe widoki i przepływy
Dashboard → Akcje: Rozpocznij naukę / Utwórz fiszkę / Lista fiszek
Lista zestawów /sets z tabelą/kartami i paginacją
Modal AI generation i manual creation modal
Sesja nauki /sessions/[id] z jedną kartą
Modal współpracowników w /sets/[id]
Integracja z API i zarządzanie stanem
React Query do fetchowania, cache’owania i mutacji
Custom hooki dla zasobów: sets, flashcards, suggestions, sessions, shares
Server-side pagination i filtracja tagami
Optymistyczne mutacje z onError rollback i toastami
Responsywność, dostępność i bezpieczeństwo
Tailwind breakpoints (sm, md, lg) i adaptacja layoutu
aria-label, trap focus, semantyczne tagi HTML
Next.js middleware + Supabase Auth do ochrony i redirectu
JWT w httpOnly cookie zarządzany przez Supabase server client
Obszary wymagające dalszego doprecyzowania
Moment wyzwalania walidacji e-maila w modalu „Dodaj współpracownika” (onBlur vs onChange vs onSubmit)
</ui_architecture_planning_summary>
<unresolved_issues>
Dokładne wyzwalanie walidacji e-maila w modalu „Dodaj współpracownika” (onBlur vs onChange vs onSubmit).
</unresolved_issues>
</conversation_summary>