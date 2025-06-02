# Uruchamianie testów

## Testy jednostkowe (Jest)

Testy jednostkowe w projekcie używają frameworka Jest wraz z React Testing Library do testowania komponentów React.

### Uruchamianie wszystkich testów jednostkowych

```bash
npm test
```

### Uruchamianie testów w trybie watch (z automatycznym przeładowaniem)

```bash
npm run test:watch
```

### Generowanie raportu pokrycia kodu

```bash
npm run test:coverage
```

## Testy end-to-end (Playwright)

Testy end-to-end zostały podzielone na dwa rodzaje:
1. Testy standardowe - wymagające działającego serwera Next.js
2. Testy samodzielne (standalone) - nie wymagające serwera, działające na lokalnie wygenerowanym HTML

### Uruchamianie testów standardowych

**Uwaga:** Uruchomienie tych testów może nie być możliwe ze względu na konflikty między konfiguracją Babel dla Jest a kompilatorem SWC dla Next.js.

```bash
npm run test:e2e
```

### Uruchamianie testów samodzielnych (standalone)

Te testy nie wymagają uruchomienia serwera Next.js i działają niezależnie od konfiguracji projektu:

```bash
npm run test:e2e:standalone
```

### Uruchamianie testów w trybie UI

```bash
npm run test:e2e:ui
```

### Generowanie i przeglądanie raportów Playwright

Po uruchomieniu testów Playwright automatycznie generuje raporty HTML. Aby je otworzyć:

```bash
npx playwright show-report
```

## Struktura testów

### Testy jednostkowe

Testy jednostkowe znajdują się w katalogu `__tests__` i są podzielone na podkatalogi:

- `__tests__/components/` - testy komponentów React
- `__tests__/api/` - testy API
- `__tests__/fixtures/` - dane testowe i testy danych

### Testy end-to-end

Testy end-to-end znajdują się w katalogu `e2e`:

- `e2e/example.spec.ts` - przykładowe testy standardowe wymagające serwera Next.js
- `e2e/standalone.spec.ts` - testy samodzielne nie wymagające serwera Next.js
- `e2e/standalone.config.ts` - konfiguracja dla testów samodzielnych

## Rozwiązywanie problemów

### Problem z konfiguracją Babel i SWC

W projekcie występuje konflikt między konfiguracją Babel (używaną przez Jest) a kompilatorem SWC (używanym przez Next.js). Rozwiązaniem jest:

1. Konfiguracja Babel tylko dla środowiska testowego w pliku `.babelrc`:
   ```json
   {
     "env": {
       "test": {
         "presets": [
           "next/babel"
         ]
       }
     }
   }
   ```

2. Używanie oddzielnych testów samodzielnych dla Playwright, które nie wymagają uruchomienia serwera Next.js.

### Problemy z TypeScript w testach

Jeśli wystąpią błędy TypeScript w testach, upewnij się, że:

1. Używasz prawidłowych typów dla komponentów i ich właściwości
2. Właściwie symulowane są obiekty, które są mockowane w testach
3. Używasz odpowiednich typów z bibliotek testowych (np. `jest.Mock` zamiast `any`) 