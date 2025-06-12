# Zaktualizowany plan API: Flashcards Sets (uwzględnia logikę klonowania)

**Tech stack**: Next.js, React, TypeScript, Tailwind, Shadcn/ui, Supabase SDK, Openrouter.ai

## 1. Przegląd

Punkty końcowe do zarządzania zestawami fiszek, ich klonowaniem (dla siebie), przekazywaniem kopii innym oraz udostępnianiem tylko do odczytu.

## 2. Punkty końcowe

#### 2.1 List Flashcards Sets

- **Metoda**: GET `/flashcards-sets`
- **Opis**: Pobiera listę zestawów, których użytkownik jest właścicielem lub które są mu udostępnione.
- **Parametry**: `page`, `limit`, `sortBy`, `status`, `name`
- **Odpowiedź (200 OK)**: `PaginatedResponse<FlashcardsSetViewDTO>` (z polem `flashcardCount` z materialized view).

#### 2.2 Create Flashcards Set

- **Metoda**: POST `/flashcards-sets`
- **Body**: `{ name: string }`
- **Odpowiedź (201 Created)**: `FlashcardsSetDTO`

#### 2.3 Get Flashcards Set

- **Metoda**: GET `/flashcards-sets/{setId}`
- **Opis**: Pobiera szczegóły zestawu.
- **Odpowiedź (200 OK)**: `FlashcardsSetWithCardsDTO`

#### 2.4 Update Flashcards Set

- **Metoda**: PUT `/flashcards-sets/{setId}`
- **Body**: `{ name?: string, status?: string }`
- **Odpowiedź (200 OK)**: `FlashcardsSetDTO`
- **Błędy**: 409 Conflict przy duplikacie nazwy.

#### 2.5 Delete Flashcards Set

- **Metoda**: DELETE `/flashcards-sets/{setId}`
- **Opis**: Usuwa zestaw należący do użytkownika.
- **Odpowiedź (204 No Content)**

---

### 2.a Akcje na zestawach

#### 2.6 Clone Set (dla siebie)

- **Metoda**: POST `/flashcards-sets/{setId}/clone`
- **Opis**: Tworzy kopię zestawu dla zalogowanego użytkownika.
- **Body**: Brak.
- **Odpowiedź (201 Created)**: `FlashcardsSetDTO` (dane nowego zestawu).

#### 2.7 Transfer Copy (odpowiednik "share full")

- **Metoda**: POST `/flashcards-sets/{setId}/transfer`
- **Opis**: Tworzy kopię zestawu dla innego użytkownika. Zastępuje "udostępnianie z pełnym dostępem".
- **Body**: `{ "targetUserId": string }`
- **Odpowiedź (201 Created)**: `FlashcardsSetDTO` (dane nowego zestawu utworzonego dla `targetUserId`).

---

### 2.b Udostępnianie (tylko rola `learning`)

#### 2.8 List Shares

- **Metoda**: GET `/flashcards-sets/{setId}/shares`
- **Opis**: Listuje udostępnienia `learning` dla danego zestawu.
- **Odpowiedź (200 OK)**: `PaginatedResponse<FlashcardsSetShareDTO>`

#### 2.9 Create Share (tylko `learning`)

- **Metoda**: POST `/flashcards-sets/{setId}/shares`
- **Opis**: Udostępnia zestaw innemu użytkownikowi z prawem do odczytu.
- **Body**: `{ "userId": string, "role": "learning", "expiresAt"?: string }`
- **Odpowiedź (201 Created)**: `FlashcardsSetShareDTO`

#### 2.10 Delete Share

- **Metoda**: DELETE `/flashcards-sets/{setId}/shares/{userId}`
- **Opis**: Usuwa udostępnienie `learning`.
- **Odpowiedź (204 No Content)**

## 3. Wykorzystywane typy

- `FlashcardsSetDTO`, `CreateFlashcardsSetCommand`, itp.
- `FlashcardsSetShareDTO` (zawsze z `role: 'learning'`)

## 4. Przepływ danych

- Akcja "Udostępnij z rolą `full`" w UI mapuje się na wywołanie endpointu `transfer`.
- Akcja "Klonuj" w UI mapuje się na wywołanie endpointu `clone`.
- Akcja "Udostępnij z rolą `learning`" w UI mapuje się na `shares` CRUD.
- Wszystkie operacje klonowania (`clone` i `transfer`) używają w tle funkcji `clone_flashcards_set(original_set_id, new_owner_id)`.

## 5. Zabezpieczenia i RLS

- Polityki RLS Supabase bez zmian. Właściciel może zarządzać swoimi zasobami.
- Endpoint `transfer` i `clone` wymagają, by wywołujący był właścicielem `original_set_id`.

## 6. Obsługa błędów

- **409 Conflict**: Przy próbie utworzenia zestawu o istniejącej nazwie.
- **403 Forbidden**: Przy próbie klonowania/udostępniania/usuwania nie swojego zestawu.

## 7. Kroki implementacji

1. Zaktualizować routing API, aby odzwierciedlał nowe ścieżki (`/clone`, `/transfer`, `/shares`).
2. W `FlashcardsSetService` zaimplementować:
   - `cloneForSelf(setId, userId)` -> wywołuje `POST /.../clone`
   - `transferToUser(setId, targetUserId)` -> wywołuje `POST /.../transfer`
   - `addLearningShare(setId, userId, expiresAt)` -> wywołuje `POST /.../shares`
3. Usunąć z logiki udostępniania pojęcie roli `full`.
4. Dodać testy dla nowych przepływów.
