# Dokumentacja 10xRules.ai

10xRules.ai (web page) to aplikacja webowa, która pomaga w generowaniu reguł dla AI na podstawie informacji o projekcie. Narzędzie przyspiesza proces definiowania reguł dla dowolnego stacku technologicznego – nie musimy robić tego samodzielnie od zera.

## Jak korzystać z 10xRules.ai?

### 1. Wybór sposobu dostarczenia informacji o projekcie:
- Ręczne wybranie technologii z dostępnej listy.
- Przesłanie pliku `package.json` (dla projektów Node.js).
- Przesłanie pliku `requirements.txt` (dla projektów Python).

### 2. Generowanie reguł:
Narzędzie automatycznie dostosowuje reguły do formatu wybranego edytora (np. Cursor, Copilot). Następnie wykonaj następujące kroki:
- Upewnij się, że wszystkie potrzebne reguły zostały dodane.
- Pobierz pliki z regułami lub skopiuj je bezpośrednio do edytora.
- Zapisz reguły w formacie zgodnym z Twoim edytorem.

### 3. Doprecyzowanie szczegółów reguł:
- Wersje technologii.
- Konwencje nazewnictwa.
- Struktura katalogów.
- Preferowane wzorce i konwencje.

## Podsumowanie

W tej lekcji poznaliśmy kluczowe aspekty personalizacji AI dla programisty:

- **Samodzielny bootstrap:** Zamiast "kopać się z AI", lepiej oprzeć się na oficjalnych szablonach i podwinąć rękawy. Świadomość ograniczeń modeli jest kluczem do satysfakcjonującej pracy z ich wykorzystaniem.
- **Integracja z linterami:** Jeżeli pracujesz z Cursorem lub Windsurfem w ekosystemach JS/TS lub Python, narzędzia statycznej analizy kodu dostarczą cenne wskazówki dla AI. Pracujesz w innym setupie? Tak czy inaczej warto inwestować w konfigurację statycznej analizy kodu na poziomie edytora, ponieważ przekazywanie feedbacku z linterów do modeli może wymagać więcej pracy manualnej (przynajmniej na razie 😉).
- **Personalizacja z AI:** Reguły dla AI redukują halucynacje i podnoszą jakość kodu bez konieczności ciągłego powtarzania naszych preferencji i oczekiwań. Pamiętaj jednak, że modele traktują te reguły jako przydatne sugestie, a nie przykazania.

Pamiętaj, że nawet najlepiej skonfigurowane AI jest nadal tylko narzędziem, które wymaga pilnego nadzoru. Konfiguracja linterów oraz reguły dla AI pomagają modelom generować lepszy kod, ale to 10xDev jest odpowiedzialny za końcową ocenę jakości kodu i wprowadzanie niezbędnych poprawek.