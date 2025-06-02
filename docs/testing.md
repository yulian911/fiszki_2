# Testy w projekcie Fiszki

## Testy jednostkowe (Unit Tests)

Testy jednostkowe używają Jest i React Testing Library. Testy te sprawdzają pojedyncze komponenty i funkcje w izolacji.

### Uruchamianie testów jednostkowych

```bash
# Uruchom wszystkie testy jednostkowe
npm test

# Uruchom testy w trybie watch (przydatne podczas developmentu)
npm run test:watch

# Uruchom testy z pomiarem pokrycia kodu
npm run test:coverage
```

### Lokalizacja testów jednostkowych

Testy jednostkowe znajdują się w katalogu `__tests__`. Struktura tego katalogu odzwierciedla strukturę głównego projektu:

- `__tests__/components/` - testy dla komponentów React
- `__tests__/utils/` - testy dla funkcji narzędziowych
- `__tests__/lib/` - testy dla bibliotek
- `__tests__/api/` - testy dla funkcji API

### Pisanie testów jednostkowych

Przykład testu jednostkowego:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '@/components/Component';

describe('Component', () => {
  it('renderuje się poprawnie', () => {
    render(<Component />);
    expect(screen.getByText('Oczekiwany tekst')).toBeInTheDocument();
  });

  it('reaguje na interakcje użytkownika', async () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Testy end-to-end (E2E)

Testy E2E używają Playwright. Testy te symulują interakcję użytkownika z aplikacją i sprawdzają, czy aplikacja działa poprawnie od początku do końca.

### Uruchamianie testów E2E

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# Uruchom testy E2E z interfejsem użytkownika
npm run test:e2e:ui
```

### Lokalizacja testów E2E

Testy E2E znajdują się w katalogu `e2e`.

### Pisanie testów E2E

Przykład testu E2E:

```ts
import { test, expect } from '@playwright/test';

test('użytkownik może się zalogować', async ({ page }) => {
  await page.goto('/');
  
  // Kliknij przycisk logowania
  await page.getByRole('button', { name: /zaloguj/i }).click();
  
  // Wypełnij formularz logowania
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Hasło').fill('password123');
  
  // Kliknij przycisk zaloguj
  await page.getByRole('button', { name: /zaloguj/i }).click();
  
  // Sprawdź, czy użytkownik jest zalogowany
  await expect(page.getByText(/witaj/i)).toBeVisible();
});
```

## Mocks i Fixtures

### Mockowanie API i usług

Przykład mockowania zewnętrznego API:

```tsx
// Mockowanie modułu Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseClient: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { /* mockowe dane */ },
      error: null
    })
  }
}));
```

### Testowe dane (fixtures)

Dane testowe można umieścić w katalogu `__tests__/fixtures/` i importować je w testach.

## CI/CD

Testy są uruchamiane automatycznie w pipeline CI/CD przy każdym pull requeście i pushu do głównej gałęzi.

## Dobre praktyki

1. Każdy nowy komponent powinien mieć test jednostkowy
2. Każda nowa funkcjonalność powinna mieć test E2E
3. Testy powinny być niezależne od siebie
4. Używaj mocków dla zewnętrznych zależności
5. Utrzymuj pokrycie kodu testami na poziomie co najmniej 80% 