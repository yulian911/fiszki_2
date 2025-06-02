# Konfiguracja środowiska testowego

## Instalacja zależności

Poniższe pakiety zostały zainstalowane w projekcie:

```bash
# Testy jednostkowe (Jest)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest identity-obj-proxy

# Testy end-to-end (Playwright)
npm install --save-dev @playwright/test

# Konfiguracja Babel dla Jest
npm install --save-dev babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
```

## Struktura plików konfiguracyjnych

- `jest.config.js` - konfiguracja Jest dla testów jednostkowych
- `jest.setup.js` - plik inicjalizujący środowisko testowe dla Jest
- `__mocks__/fileMock.js` - mock dla plików statycznych (obrazy)
- `__mocks__/styleMock.js` - mock dla plików CSS
- `playwright.config.ts` - konfiguracja Playwright dla testów E2E
- `.babelrc` - konfiguracja Babel

## Struktura katalogów testowych

```
project/
├── __tests__/                # Testy jednostkowe
│   ├── components/           # Testy komponentów
│   ├── utils/                # Testy funkcji narzędziowych
│   ├── lib/                  # Testy bibliotek
│   ├── api/                  # Testy API
│   └── fixtures/             # Dane testowe
└── e2e/                      # Testy end-to-end
```

## Skrypty NPM

Dodane zostały następujące skrypty w pliku `package.json`:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

## Mocki i fixture'y

Utworzony został przykładowy plik z danymi testowymi w katalogu `__tests__/fixtures/mockData.ts`.

## Przykładowe testy

1. Przykładowy test komponentu:
   ```
   __tests__/components/example.test.tsx
   ```

2. Przykładowy test end-to-end:
   ```
   e2e/example.spec.ts
   ```

## Dokumentacja

Szczegółowa dokumentacja dotycząca testów znajduje się w pliku `docs/testing.md`. 