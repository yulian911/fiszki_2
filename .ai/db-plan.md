# Schemat bazy danych dla projektu "Inteligentne Fiszki"

## 1. Tabele i ich definicje

### a) Tabela: Users

This table is menaged by Superbase Auth

- **id**: UUID, PRIMARY KEY, domyślnie generowany (np. gen_random_uuid())
- **email**: VARCHAR(255), NOT NULL, UNIQUE
- **password**: VARCHAR(255), NOT NULL
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()

### b) Tabela: Flashcards

- **id**: UUID, PRIMARY KEY, domyślnie generowany
- **flashcards_set_id**: UUID, NOT NULL, REFERENCES FlashcardsSet(id) ON DELETE CASCADE
- **question**: TEXT, NOT NULL
- **answer**: TEXT, NOT NULL
- **source**: VARCHAR(20), NOT NULL
  - Ograniczenie: wartość musi być jedną z: 'ai-full', 'ai-edit', 'manual'
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()

### c) Tabela: FlashcardsSet

- **id**: UUID, PRIMARY KEY, domyślnie generowany
- **owner_id**: UUID, NOT NULL, REFERENCES Users(id) ON DELETE CASCADE
- **name**: VARCHAR(255)
- **status**: VARCHAR(20), NOT NULL, DEFAULT 'pending'
  - Ograniczenie: wartość musi być jedną z: 'pending', 'accepted', 'rejected'
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()

### d) Tabela: FlashcardsSet_Shares

- **flashcards_set_id**: UUID, NOT NULL, REFERENCES FlashcardsSet(id) ON DELETE CASCADE
- **user_id**: UUID, NOT NULL, REFERENCES Users(id) ON DELETE CASCADE
- **role**: VARCHAR(20), NOT NULL
  - Ograniczenie: wartość musi być jedną z: 'full', 'learning'
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()
- **Primary Key**: (flashcards_set_id, user_id)

### e) Tabela: Sessions

- **id**: UUID, PRIMARY KEY, domyślnie generowany
- **user_id**: UUID, NOT NULL, REFERENCES Users(id) ON DELETE CASCADE
- **flashcards_set_id**: UUID, NOT NULL, REFERENCES FlashcardsSet(id) ON DELETE CASCADE
- **tags**: TEXT[] DEFAULT '{}' -- tablica tagów używanych do wyszukiwania i filtrowania
- **score**: INTEGER -- opcjonalne, wynik sesji lub ocena
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()

### f) Tabela: Tags

- **id**: UUID, PRIMARY KEY, domyślnie generowany
- **name**: VARCHAR(100), NOT NULL, UNIQUE
- **created_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMPTZ, NOT NULL, DEFAULT now()

### g) Tabela: Flashcards_Tags (łącząca tabelę Flashcards i Tags)

- **flashcard_id**: UUID, NOT NULL, REFERENCES Flashcards(id) ON DELETE CASCADE
- **tag_id**: UUID, NOT NULL, REFERENCES Tags(id) ON DELETE CASCADE
- **Primary Key**: (flashcard_id, tag_id)

## 2. Relacje między tabelami

- **Users ↔ FlashcardsSet**: relacja jeden-do-wielu (jeden użytkownik może posiadać wiele zestawów fiszek).
- **FlashcardsSet ↔ Flashcards**: relacja jeden-do-wielu (jeden zestaw zawiera wiele fiszek).
- **Users ↔ FlashcardsSet_Shares**: relacja wiele-do-wielu przy użyciu tabeli pośredniczącej (FlashcardsSet_Shares), umożliwiająca udostępnianie zestawów.
- **Flashcards ↔ Tags**: relacja wiele-do-wielu przy użyciu tabeli Flashcards_Tags.
- **Users ↔ Sessions**: relacja jeden-do-wielu (użytkownik może mieć wiele sesji powtórek).
- **FlashcardsSet ↔ Sessions**: każda sesja odnosi się do jednego zestawu fiszek.

## 3. Indeksy

- **Users**: UNIKALNY indeks na kolumnie **email**.
- Indeksy dla kolumn obcych:
  - `Flashcards.flashcards_set_id`
  - `FlashcardsSet.owner_id`
  - `FlashcardsSet_Shares.flashcards_set_id` oraz `FlashcardsSet_Shares.user_id`
  - `Sessions.user_id` oraz `Sessions.flashcards_set_id`
- Opcjonalnie: indeks na kolumnie **Tags.name** dla szybkiego wyszukiwania tagów.

## 4. Zasady PostgreSQL (RLS)

Zaleca się wdrożenie zabezpieczeń na poziomie wiersza (RLS) w celu ograniczenia dostępu do danych:

- **Tabela Users**: RLS pozwalające użytkownikowi zarządzać jedynie swoimi danymi.
- **Tabela FlashcardsSet**: RLS ograniczające dostęp do zestawu fiszek tylko do właściciela oraz użytkowników, którzy otrzymali uprawnienia (poprzez tabelę FlashcardsSet_Shares).
- **Tabela Flashcards**: RLS implementowane pośrednio poprzez RLS na tabeli FlashcardsSet.
- **Tabela Sessions**: RLS zapewniające, że użytkownik ma dostęp wyłącznie do swoich sesji.

Implementacja RLS obejmuje definiowanie odpowiednich polityk (CREATE POLICY) dla operacji SELECT, INSERT, UPDATE i DELETE.

## 5. Dodatkowe uwagi

- Wszystkie tabele zawierają pola `created_at` i `updated_at` do śledzenia zmian.
- Schemat został zaprojektowany zgodnie z zasadami 3NF; denormalizacja może być rozważona w przyszłości, jeśli wymogi wydajnościowe tego będą wymagały.
- Typ UUID może być generowany przy użyciu funkcji `gen_random_uuid()` z rozszerzenia pgcrypto.
- Kolumna `status` w tabeli FlashcardsSet umożliwia mechanizm akceptacji zestawów fiszek generowanych przez AI (stany: 'pending', 'accepted', 'rejected').
- Wdrożenie RLS jest kluczowe dla zapewnienia bezpieczeństwa danych, szczególnie w środowisku wykorzystującym Supabase jako backend.
