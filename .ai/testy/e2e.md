# Przewodnik Tworzenia Testów E2E

## Struktura Komponentów i Scenariuszy Testowych

W formacie ASCII przedstaw strukturę komponentów i zależności rozpoczynając od @component do testowania końcowo-końcowego (E2E).

## Przygotowanie Scenariuszy Testowych

### 4.1. Uwierzytelnianie (Authentication) - `auth.spec.ts`

**Status: ✅ Wszystkie 8 testów przechodzą**

- **SCN_AUTH_001**: Pomyślna rejestracja nowego użytkownika z poprawnymi danymi
- **SCN_AUTH_002**: Próba rejestracji z istniejącym adresem e-mail
- **SCN_AUTH_003**: Próba rejestracji z niepasującymi hasłami
- **SCN_AUTH_004**: Pomyślne logowanie z poprawnymi danymi uwierzytelniającymi
- **SCN_AUTH_005**: Próba logowania z niepoprawnym hasłem/e-mailem
- **SCN_AUTH_006**: Pomyślne wylogowanie użytkownika
- **SCN_AUTH_007**: Dostęp do strony chronionej bez zalogowania (oczekiwane przekierowanie na stronę logowania)
- **SCN_AUTH_008**: Dostęp do strony chronionej po zalogowaniu

### 4.2. Obszar Chroniony (Protected Area) - `protected.spec.ts`

**Status: ✅ Wszystkie 3 testy przechodzą**

- **SCN_PROT_001**: Tworzenie nowego zestawu fiszek
  - Test tworzenia zestawów z unikalnymi nazwami
  - Weryfikacja wysłania formularza i pojawienia się zestawu na liście
  - Zawiera test natychmiastowej funkcji edycji
- **SCN_PROT_002**: Edycja istniejącego zestawu fiszek
  - Test edycji szczegółów zestawu (nazwa i opis)
  - Weryfikacja odzwierciedlenia zmian w UI
  - Używa precyzyjnego targetowania wierszy
- **SCN_PROT_003**: Usuwanie zestawu fiszek
  - Test funkcjonalności usuwania zestawu
  - Weryfikacja usunięcia zestawu z listy po usunięciu
  - Zawiera interakcję z dialogiem potwierdzenia

## Konfiguracja Środowiska

### Dane logowania w `.env.local`:

```env
# Konfiguracja Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Dane testowe E2E
E2E_EMAIL=test@test.pl
E2E_PASSWORD=Test123!
```

## Atrybuty Testowe dla Komponentów

Dla kluczowych elementów dodaj atrybuty `data-testid` dopasowane do akcji:

### Uwierzytelnianie:

- `data-testid="auth-email-input"` - pole e-mail
- `data-testid="auth-password-input"` - pole hasła
- `data-testid="auth-confirm-password-input"` - potwierdzenie hasła
- `data-testid="auth-register-button"` - przycisk rejestracji
- `data-testid="auth-login-button"` - przycisk logowania
- `data-testid="auth-logout-button"` - przycisk wylogowania

### Zestawy Fiszek:

- `data-testid="flashcard-set-name-input"` - nazwa zestawu
- `data-testid="flashcard-set-description-input"` - opis zestawu
- `data-testid="create-set-button"` - tworzenie zestawu
- `data-testid="edit-set-button-${setName}"` - edycja konkretnego zestawu
- `data-testid="delete-set-button-${setName}"` - usuwanie konkretnego zestawu
- `data-testid="confirm-delete-button"` - potwierdzenie usunięcia

## Wzorzec Page Object Model (POM)

Utwórz dedykowane klasy dla kluczowych stron według wzorca `@playwright-e2e.mdc`:

### AuthPage:

```typescript
class AuthPage {
  constructor(private page: Page) {}

  async register(email: string, password: string) {}
  async login(email: string, password: string) {}
  async logout() {}
  async navigateToRegister() {}
  async navigateToLogin() {}
}
```

### FlashcardSetsPage:

```typescript
class FlashcardSetsPage {
  constructor(private page: Page) {}

  async createSet(name: string, description?: string) {}
  async editSet(setName: string, newName: string, newDescription?: string) {}
  async deleteSet(setName: string) {}
  async getSetByName(name: string) {}
}
```

## Selektory UI (Polskie)

Aplikacja używa polskich elementów UI:

- `Hasło` zamiast `Password`
- `Zaloguj` zamiast `Sign in`
- `Wyloguj` zamiast `Logout`
- `Zarejestruj` zamiast `Sign up`
- `Utwórz nowy zestaw` zamiast `Create new set`
- `Edytuj` zamiast `Edit`
- `Usuń` zamiast `Delete`

## System Modali

Obsługa złożonego systemu modali z trzema typami:

- **Modal Tworzenia**: "Utwórz nowy zestaw fiszek"
- **Modal Edycji**: "Edytuj zestaw fiszek"
- **Potwierdzenie Usunięcia**: "Ta operacja jest nieodwracalna"

## Responsywność

Uwzględnij widoki mobilne i desktopowe:

- Duplikowanie elementów w widokach mobile (karty) i desktop (tabela)
- Oczekiwanie na liczby elementów (np. `toHaveCount(2)` dla elementów w obu widokach)

## Wydajność Testów

**Obecna wydajność:**

- **Testy uwierzytelniania**: ~20 sekund (8 testów)
- **Testy obszaru chronionego**: ~29 sekund (3 testy)
- **Łączny czas**: ~49 sekund dla wszystkich testów

## Komendy NPM

```bash
npm run test:e2e              # Wszystkie testy E2E
npm run test:e2e:auth         # Tylko testy uwierzytelniania
npm run test:e2e:protected    # Tylko testy obszaru chronionego
npm run test:e2e:ui           # Testy w trybie UI
npm run setup:test-user       # Utworzenie/weryfikacja użytkownika testowego
npm run test:e2e:setup        # Setup użytkownika + testy auth
```

## Status Implementacji

🎉 **Wszystkie testy E2E przechodzą (11/11):**

- ✅ Testy uwierzytelniania: 8/8 zaliczonych
- ✅ Testy obszaru chronionego: 3/3 zaliczonych
