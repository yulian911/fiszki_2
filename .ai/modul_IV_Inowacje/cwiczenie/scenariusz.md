Ćwiczenia praktyczne

Zadanie 1: CHANGELOG.md z Gemini Flash

Cel: Sprawdź możliwości Gemini Flash w kontekście tworzenia dokumentacji zmian projektowych

Instrukcje:

Utwórz nowy scenariusz CI/CD w obrębie repozytorium.

Wykorzystaj integrację z AI do analizy ostatnich commitów (np. 10) od momentu wywołania scenariusza.

Z poziomu CI/CD utwórz lub zaktualizuj plik CHANGELOG.md zawierający tekstowe podsumowanie zmian z danego okresu, który analizowało AI.

W przypadku zmian, z poziomu CI/CD utwórz nowy Pull Request ze zmianami Changeloga

Przykład dokumentu:

## 10xCMS - Changelog

### 07.04.2025 - 14.04.2025

- Wdrożono poprawki do styli na stronie głównej
- Zaktualizowano zależności w package.json
- Wykonano modernizację kodu client-side (jQuery -> Svelte)

### 01.04.2025 - 07.04.2025

- Rozbudowano endpointy do zarządzania kontem użytkownika
- Zmieniono sposób pobierania danych z CMS
