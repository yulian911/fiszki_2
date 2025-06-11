W mojej aplikacji Next.js chciałbym rozdzielić deploymenty od releasów wprowadzając system feature flag.

Powinien być możliwy do zastosowania:

- na poziomie API routes (app/api/flashcards, app/api/sessions, app/api/tags, app/api/flashcards-sets, app/api/flashcards-suggestions)
- na poziomie stron Next.js – auth pages w app/(auth-pages)/ oraz app/auth/
- na poziomie komponentów React – komponenty nawigacji i UI w components/
- na poziomie modułów funkcjonalnych – features/auth, features/flashcard-sets, features/ai-generator, features/sessions

Na poziomie wspomnianych modułów powinienem być w stanie sprawdzić stan flagi określonej funkcjonalności, wg środowiska.

Zaprojektuj uniwersalny moduł TypeScript z którego będzie można korzystać na frontendzie (React components, hooks) i backendzie (API routes, middleware) (features/flags), który będzie przechowywał konfigurację flag dla środowisk local, integration i production.

Dodaj flagi dla:

- "auth" (logowanie, rejestracja, reset hasła)
- "flashcard-sets" (zarządzanie zestawami fiszek)
- "ai-generator" (generowanie fiszek przez AI)
- "sessions" (sesje nauki)

Środowisko dostarczę jako zmienną ENV_NAME (local, integration, prod)

Zapewnij integrację przez:

- React hook `useFeatureFlag('feature-name')`
- Utility function `isFeatureEnabled('feature-name')` dla API routes
- HOC/wrapper dla komponentów React
- Middleware Next.js dla ochrony całych route'ów

Integracją zajmiemy się w kolejnym kroku. Zanim rozpoczniemy, zadaj mi 5 pytań, które ułatwią ci całą implementację.

---

Czym są Feature Flags i dlaczego są przydatne?
Feature flags (flagi funkcjonalności) to mechanizm pozwalający włączać/wyłączać funkcjonalności aplikacji bez deploymentu kodu. Rozdzielasz deployment (wdrożenie kodu) od release (udostępnienie funkcjonalności użytkownikom).
🎯 Główne korzyści:

1. Bezpieczeństwo wdrożeń
   Możesz wdrożyć kod na produkcję z wyłączoną funkcjonalnością
   Jeśli coś nie działa - wyłączasz flagę zamiast rollback całego deployment
2. Stopniowe udostępnianie (Gradual Rollout)
   Włączasz nową funkcję dla 5% → 25% → 50% → 100% użytkowników
   Obserwujesz metryki i błędy na każdym etapie
3. A/B Testing
   Testujesz różne wersje funkcjonalności na różnych grupach użytkowników
   Podejmujesz decyzje oparte na danych
4. Szybkie reagowanie na problemy
   Bug na produkcji? Wyłączasz flagę i masz czas na fix
   Nie musisz robić emergency deployment
