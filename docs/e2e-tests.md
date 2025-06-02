# E2E Testing Guide

This document explains how to run the end-to-end (E2E) tests for the application.

## Prerequisites

- Node.js and npm installed
- Application dependencies installed (`npm install`)
- Supabase project configured with proper environment variables

## Environment Setup

Make sure your `.env.local` file contains the following test user credentials:

```
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# E2E Test credentials
E2E_EMAIL=test@test.pl
E2E_PASSWORD=Test123!
```

**Important**:

- The test user should exist in your Supabase database
- The test user credentials are automatically loaded by Playwright from `.env.local`
- You can create/verify the test user using the provided script (see below)

## Test User Setup

Before running tests, create or verify the test user exists:

```bash
npm run setup:test-user
```

This script will:

- Create the test user if it doesn't exist
- Verify that the test user can log in successfully
- Display helpful error messages if there are issues

## Running Tests

### All Tests

To run all E2E tests:

```bash
npm run test:e2e
```

### Specific Test Groups

To run only authentication tests:

```bash
npm run test:e2e:auth
```

To run only protected area tests:

```bash
npm run test:e2e:protected
```

### Setup and Run Authentication Tests

To create test user and run authentication tests in one command:

```bash
npm run test:e2e:setup
```

### UI Mode

To run tests with Playwright UI:

```bash
npm run test:e2e:ui
```

## Test Scenarios

### Authentication (`auth.spec.ts`)

✅ **All 8 authentication tests are currently passing:**

1. **SCN_AUTH_001**: Successful registration with valid data
2. **SCN_AUTH_002**: Registration with existing email
3. **SCN_AUTH_003**: Registration with mismatched passwords
4. **SCN_AUTH_004**: Successful login with valid credentials
5. **SCN_AUTH_005**: Login with invalid credentials
6. **SCN_AUTH_006**: Successful logout
7. **SCN_AUTH_007**: Protected page access without login
8. **SCN_AUTH_008**: Protected page access after login

### Protected Area Tests (`protected.spec.ts`)

✅ **All 3 protected area tests are currently passing:**

**SCN_PROT_001**: Create new flashcard set

- Tests creation of flashcard sets with unique names
- Verifies form submission and set appearance in list
- Includes immediate edit functionality test
- ✅ **Status: PASSING**

**SCN_PROT_002**: Edit existing flashcard set

- Tests editing flashcard set details (name and description)
- Verifies changes are reflected in the UI
- Uses precise row targeting for reliable test execution
- ✅ **Status: PASSING**

**SCN_PROT_003**: Delete flashcard set

- Tests flashcard set deletion functionality
- Verifies set is removed from list after deletion
- Includes confirmation dialog interaction
- ✅ **Status: PASSING**

## Test Implementation Details

### Modal System Handling

The tests handle a complex modal system with three different modal types:

- **Create Modal**: "Utwórz nowy zestaw fiszek"
- **Edit Modal**: "Edytuj zestaw fiszek"
- **Delete Confirmation**: "Ta operacja jest nieodwracalna"

### Responsive Design Considerations

The application uses responsive design with both mobile and desktop views. Tests account for:

- Duplicate elements in mobile (cards) and desktop (table) views
- Element count expectations (e.g., `toHaveCount(2)` for items appearing in both views)

### Precise Element Targeting

Tests use advanced selector strategies:

- `button[title="${setName}"]` for exact row identification
- Modal context filtering: `page.locator('[role="dialog"]').filter({ hasText: "modal title" })`
- Label-based selectors with modal context for form fields

## Known Limitations

- **Email-dependent functionality**: Tests that require email verification (like password reset) are not included as they cannot be reliably tested in E2E environment
- **External dependencies**: Tests assume Supabase backend is available and properly configured
- **Test data cleanup**: Tests create unique data using timestamps to avoid conflicts, but don't automatically clean up test data

## Configuration

The tests are configured with the following timeouts:

- Overall test timeout: 60 seconds
- Expect timeout: 10 seconds
- Additional wait timeouts: 1-3 seconds for specific operations

These increased timeouts accommodate the authentication operations and modal interactions which may take longer in development/test environments.

## Performance

**Current test performance:**

- **Authentication tests**: ~20 seconds (8 tests)
- **Protected area tests**: ~29 seconds (3 tests)
- **Total runtime**: ~49 seconds for all tests

## Customizing Tests

To modify existing tests or add new ones, edit the following files:

- `e2e/auth.spec.ts` - Authentication tests
- `e2e/protected.spec.ts` - Protected area functionality tests

### Language Considerations

The application UI uses Polish language elements. The tests are set up using Polish selectors like:

- `Hasło` instead of `Password`
- `Zaloguj` instead of `Sign in`
- `Wyloguj` instead of `Logout`
- `Zarejestruj` instead of `Sign up`
- `Utwórz nowy zestaw` instead of `Create new set`
- `Edytuj` instead of `Edit`
- `Usuń` instead of `Delete`

If the UI language changes, the selectors in the tests will need to be updated accordingly.

## Troubleshooting

If tests are failing, check the following:

1. **Environment Variables**: Make sure your `.env.local` file contains valid Supabase credentials and E2E test user data
2. **Test User**: Run `npm run setup:test-user` to verify the test user exists and can log in
3. **Development Server**: Make sure your development server is running properly
4. **Supabase Connection**: Verify that your Supabase project is accessible and configured correctly
5. **UI Elements**: Check that the selectors in the tests match your current UI
6. **Reports**: Review the generated reports in the `playwright-report` directory for detailed error information

### Common Issues and Solutions

**Problem**: Tests timeout or fail to find elements
**Solution**: The tests now have increased timeouts (60s test, 10s expect). If still failing, check if the development server is responding slowly.

**Problem**: "Invalid email or password" errors
**Solution**: Run `npm run setup:test-user` to verify test user credentials match between `.env.local` and your Supabase database.

**Problem**: Modal or form element conflicts
**Solution**: Tests now use precise modal context filtering and label-based selectors to avoid conflicts between duplicate elements.

**Problem**: Elements not found in responsive views
**Solution**: Tests account for both mobile and desktop views, using appropriate count expectations and element targeting strategies.

## Scripts Reference

- `npm run test:e2e` - Run all e2e tests
- `npm run test:e2e:auth` - Run authentication tests only
- `npm run test:e2e:protected` - Run protected area tests only
- `npm run test:e2e:ui` - Run tests in UI mode
- `npm run setup:test-user` - Create/verify test user
- `npm run test:e2e:setup` - Setup test user and run auth tests

## Success Status

🎉 **All E2E tests are currently passing (11/11):**

- ✅ Authentication tests: 8/8 passing
- ✅ Protected area tests: 3/3 passing

The test suite provides comprehensive coverage of the application's core functionality and authentication flows.
