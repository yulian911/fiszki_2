## US-003: Kolekcje reguł

- Tytuł: Kolekcje reguł
- Opis: Jako użytkownik chcę móc zapisywać i edytować zestawy reguł, aby szybko wykorzystywać sprawdzone rozwiązania w różnych projektach.
- Kryteria akceptacji:
  - Użytkownik może zapisać aktualny zestaw reguł (US-001) jako kolekcję (nazwa, opis, reguły).
  - Użytkownik może aktualizować kolekcję.
  - Użytkownik może usunąć kolekcję.
  - Użytkownik może przywrócić kolekcję do poprzedniej wersji (pending changes).
  - Funkcjonalność kolekcji nie jest dostępna bez logowania się do systemu (US-004).

## US-004: Bezpieczny dostęp i uwierzytelnianie

- Tytuł: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik MOŻE korzystać z tworzenia reguł "ad-hoc" bez logowania się do systemu (US-001).
  - Użytkownik NIE MOŻE korzystać z funkcji Kolekcji bez logowania się do systemu (US-003).
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.