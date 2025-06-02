W formacie ASCII przedstaw strukturę komponentów i zależności rozpoczynając od @component do testowania 


Przygotowuje sie do scenariusza:

np:
4.1. Uwierzytelnianie
   SCN_AUTH_001: Pomyślna rejestracja nowego użytkownika z poprawnymi danymi.
   SCN_AUTH_002: Próba rejestracji z istniejącym adresem e-mail.
   SCN_AUTH_003: Próba rejestracji z niepasującymi hasłami.
   SCN_AUTH_004: Pomyślne logowanie z poprawnymi danymi uwierzytelniającymi.
   SCN_AUTH_005: Próba logowania z niepoprawnym hasłem/e-mailem.
   SCN_AUTH_006: Pomyślne wylogowanie użytkownika.
   SCN_AUTH_007: Dostęp do strony chronionej bez zalogowania (oczekiwane przekierowanie na stronę logowania).
   SCN_AUTH_008: Dostęp do strony chronionej po zalogowaniu.
   SCN_AUTH_009: Proces resetowania hasła (wysłanie linku, ustawienie nowego hasła).

dane logowania .env E2E_USERNAME_ID=###
E2E_USERNAME=###
E2E_PASSWORD=###


E2E Testing Scenarios
Authentication Scenarios
SCN_AUTH_001: Successful registration with valid data
Navigate to /sign-up
Fill in valid email, matching passwords
Submit form
Verify redirect to protected area
SCN_AUTH_002: Registration with existing email
Navigate to /sign-up
Enter existing email
Submit form
Verify error message
SCN_AUTH_003: Registration with mismatched passwords
Navigate to /sign-up
Enter valid email but different passwords
Submit form
Verify error message
SCN_AUTH_004: Successful login
Navigate to /sign-in
Enter valid credentials (E2E_USERNAME, E2E_PASSWORD)
Submit form
Verify redirect to protected area
SCN_AUTH_005: Login with invalid credentials
Navigate to /sign-in
Enter invalid email/password
Submit form
Verify error message
SCN_AUTH_006: Successful logout
Login with valid credentials
Trigger logout
Verify redirect to public area
SCN_AUTH_007: Protected page access without login
Attempt to access /protected directly
Verify redirect to login page
SCN_AUTH_008: Protected page access after login
Login with valid credentials
Access /protected
Verify successful access
Protected Area Scenarios
SCN_PROT_001: Create new flashcard set
Login
Navigate to /protected/sets
Create new set
Verify set appears in the list
SCN_PROT_002: Edit existing flashcard set
Login
Navigate to existing set
Edit set details
Verify changes are saved
SCN_PROT_003: Delete flashcard set
Login
Navigate to sets
Delete a set
Verify set is removed
SCN_PROT_004: Password reset flow
Navigate to /forgot-password
Enter valid email
Submit form
Access reset link
Enter new password
Verify successful reset