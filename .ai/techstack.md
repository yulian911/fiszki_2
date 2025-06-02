Frontend - Next.js z React dla komponentów interaktywnych:
- Next.js do wydajnych stron i aplikacji 
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Zod do walidacji schematów danych i bezpiecznego parsowania
- react-hook-form do zarządzania formularzami i integracji z walidacją Zod
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI
- React Query do pobierania, cache'owania i mutacji danych z API
- nuqs do synchronizacji parametrów URL z stanem aplikacji (filtry, modale)
- react-hot-toast do wyświetlania notyfikacji toast
- use-debounce (hook) do opóźniania zapytań przy wyszukiwaniu

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker

Testing:
- Testy jednostkowe: Wykorzystano Jest oraz React Testing Library.
- Testy end-to-end: Wykorzystano Playwright (preferowany ze względu na wsparcie dla TypeScript i automatyczne oczekiwanie) lub Cypress.