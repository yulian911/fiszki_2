# E2E Testing Guide

This document explains how to run the end-to-end (E2E) tests for the application.

## Prerequisites

- Node.js and npm installed
- Application dependencies installed (`npm install`)

## Environment Setup

Create a `.env.test` file in the root directory with test user credentials:

```
E2E_USERNAME=your-test-email@example.com
E2E_PASSWORD=your-test-password
```

**Important**: 
- The environment variable is named `E2E_USERNAME` but it should contain an email address, as the application uses email for authentication.
- The test user should exist in your development/test environment and should have proper permissions to perform all test operations.

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

### UI Mode

To run tests with Playwright UI:

```bash
npm run test:e2e:ui
```

## Test Scenarios

The E2E tests cover the following scenarios:

### Authentication (`auth.spec.ts`)

1. **SCN_AUTH_001**: Successful registration with valid data
2. **SCN_AUTH_002**: Registration with existing email
3. **SCN_AUTH_003**: Registration with mismatched passwords
4. **SCN_AUTH_004**: Successful login with valid credentials
5. **SCN_AUTH_005**: Login with invalid credentials
6. **SCN_AUTH_006**: Successful logout
7. **SCN_AUTH_007**: Protected page access without login
8. **SCN_AUTH_008**: Protected page access after login

### Protected Area (`protected.spec.ts`)

1. **SCN_PROT_001**: Create new flashcard set
2. **SCN_PROT_002**: Edit existing flashcard set
3. **SCN_PROT_003**: Delete flashcard set
4. **SCN_PROT_004**: Password reset flow

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

If the UI language changes, the selectors in the tests will need to be updated accordingly.

## Troubleshooting

If tests are failing, check the following:

1. Make sure your development server is running properly
2. Verify that test user credentials are correct in the environment
3. Check that the selectors in the tests match your current UI
4. Review the generated reports in the `playwright-report` directory 