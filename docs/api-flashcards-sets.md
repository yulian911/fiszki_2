# Dokumentacja API Zestawów Fiszek

Dokumentacja interfejsu REST API dla zestawów fiszek w aplikacji Inteligentne Fiszki.

## Uwierzytelnianie

Wszystkie punkty końcowe wymagają uwierzytelnienia za pomocą tokenu JWT Supabase. Token musi być przekazany w ciasteczku sesji lub nagłówku `Authorization`.

## Format błędów

W przypadku błędu, API zwraca obiekt JSON z informacją o błędzie:

```json
{
  "error": "Krótki opis błędu",
  "details": "Szczegółowe informacje o błędzie"
}
```

## Punkty końcowe

### Pobieranie listy zestawów fiszek

```
GET /api/flashcards-sets
```

Pobiera paginowaną listę zestawów fiszek należących do zalogowanego użytkownika.

#### Parametry zapytania

| Parametr | Typ    | Opis                                                  | Domyślnie   |
| -------- | ------ | ----------------------------------------------------- | ----------- |
| page     | number | Numer strony (od 1)                                   | 1           |
| limit    | number | Liczba elementów na stronę (max 100)                  | 20          |
| sortBy   | string | Pole do sortowania (name, createdAt, updatedAt)       | createdAt   |
| status   | string | Filtrowanie po statusie (pending, accepted, rejected) | (wszystkie) |

#### Przykładowe żądanie

```
GET /api/flashcards-sets?page=1&limit=20&sortBy=name&status=pending
```

#### Odpowiedź (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-1",
      "ownerId": "user-uuid",
      "name": "Angielski - czasowniki nieregularne",
      "status": "pending",
      "createdAt": "2023-08-15T14:30:00Z",
      "updatedAt": "2023-08-15T14:30:00Z"
    }
    // ...więcej zestawów
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

### Tworzenie nowego zestawu fiszek

```
POST /api/flashcards-sets
```

Tworzy nowy, pusty zestaw fiszek.

#### Dane żądania (application/json)

```json
{
  "name": "Nazwa zestawu fiszek"
}
```

#### Przykładowe żądanie

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name": "Hiszpański - podstawowe zwroty"}' \
  http://localhost:3000/api/flashcards-sets
```

#### Odpowiedź (201 Created)

```json
{
  "id": "nowe-uuid",
  "ownerId": "user-uuid",
  "name": "Hiszpański - podstawowe zwroty",
  "status": "pending",
  "createdAt": "2023-08-15T15:45:00Z",
  "updatedAt": "2023-08-15T15:45:00Z"
}
```

### Pobieranie pojedynczego zestawu fiszek

```
GET /api/flashcards-sets/{setId}
```

Pobiera szczegóły pojedynczego zestawu fiszek wraz z listą fiszek.

#### Parametry ścieżki

| Parametr | Typ    | Opis                |
| -------- | ------ | ------------------- |
| setId    | string | UUID zestawu fiszek |

#### Przykładowe żądanie

```
GET /api/flashcards-sets/uuid-1
```

#### Odpowiedź (200 OK)

```json
{
  "id": "uuid-1",
  "ownerId": "user-uuid",
  "name": "Angielski - czasowniki nieregularne",
  "status": "pending",
  "createdAt": "2023-08-15T14:30:00Z",
  "updatedAt": "2023-08-15T14:30:00Z",
  "flashcards": [
    {
      "id": "card-uuid-1",
      "flashcardsSetId": "uuid-1",
      "question": "go - went -",
      "answer": "gone",
      "source": "manual",
      "createdAt": "2023-08-15T14:35:00Z",
      "updatedAt": "2023-08-15T14:35:00Z",
      "tags": [
        {
          "id": "tag-uuid-1",
          "name": "czasownik",
          "createdAt": "2023-08-15T14:30:00Z",
          "updatedAt": "2023-08-15T14:30:00Z"
        }
      ]
    }
    // ...więcej fiszek
  ]
}
```

### Aktualizacja zestawu fiszek

```
PUT /api/flashcards-sets/{setId}
```

Aktualizuje istniejący zestaw fiszek.

#### Parametry ścieżki

| Parametr | Typ    | Opis                |
| -------- | ------ | ------------------- |
| setId    | string | UUID zestawu fiszek |

#### Dane żądania (application/json)

```json
{
  "name": "Nowa nazwa zestawu",
  "status": "accepted"
}
```

Oba pola są opcjonalne, ale co najmniej jedno pole musi być podane.

#### Przykładowe żądanie

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name": "Angielski - czasowniki nieregularne (podstawowe)"}' \
  http://localhost:3000/api/flashcards-sets/uuid-1
```

#### Odpowiedź (200 OK)

```json
{
  "id": "uuid-1",
  "ownerId": "user-uuid",
  "name": "Angielski - czasowniki nieregularne (podstawowe)",
  "status": "pending",
  "createdAt": "2023-08-15T14:30:00Z",
  "updatedAt": "2023-08-15T16:20:00Z"
}
```

### Usuwanie zestawu fiszek

```
DELETE /api/flashcards-sets/{setId}
```

Usuwa zestaw fiszek i wszystkie powiązane fiszki.

#### Parametry ścieżki

| Parametr | Typ    | Opis                |
| -------- | ------ | ------------------- |
| setId    | string | UUID zestawu fiszek |

#### Przykładowe żądanie

```bash
curl -X DELETE http://localhost:3000/api/flashcards-sets/uuid-1
```

#### Odpowiedź (204 No Content)

Pusta odpowiedź (brak treści).

## Kody błędów

| Kod | Opis                  | Możliwe przyczyny                                  |
| --- | --------------------- | -------------------------------------------------- |
| 400 | Bad Request           | Nieprawidłowe parametry żądania lub dane wejściowe |
| 401 | Unauthorized          | Brak uwierzytelnienia lub nieprawidłowy token      |
| 403 | Forbidden             | Brak dostępu do zasobu                             |
| 404 | Not Found             | Zasób nie istnieje                                 |
| 500 | Internal Server Error | Nieoczekiwany błąd serwera                         |

## Rozwiązywanie problemów

### Błąd 400 (Bad Request)

Ten błąd pojawia się, gdy parametry żądania są nieprawidłowe. Sprawdź, czy:

- Parametry zapytania mają poprawne wartości (np. page i limit są liczbami)
- Dane wejściowe JSON są poprawnie sformatowane
- Wszystkie wymagane pola są podane

### Błąd 401 (Unauthorized)

Ten błąd pojawia się, gdy użytkownik nie jest zalogowany. Upewnij się, że:

- Sesja użytkownika jest aktywna
- Token JWT jest przekazywany w każdym żądaniu
- Użytkownik ma konto w systemie
