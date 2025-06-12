# Notatka z konwersacji

Poniższa notatka podsumowuje kluczowe wnioski i proponowane zmiany:

## 1. Model udostępniania
- Obecny model `share` z rolą `full` pozwala na modyfikację oryginalnego zestawu – niepożądane.
- Proponujemy mechanizm klonowania:
  - Funkcja PL/pgSQL `clone_flashcards_set(original_set_id uuid, new_owner uuid) returns uuid` kopiuje nagłówek zestawu i wszystkie fiszki.
  - Zamiast wstawiania wpisu do `flashcards_set_shares` wywołujemy tę funkcję i zwracamy nowe `flashcards_set_id`.

## 2. Brak publicznych zestawów
- Nie wprowadzamy zestawów publicznych – wystarczy udostępniać konkretnym użytkownikom.
- RLS pozostaje na poziomie właściciela i udostępnionych użytkowników.

## 3. Statusy zestawów
- Pole `status` (`pending` | `accepted` | `rejected`) służy do:
  - Etapów moderacji,
  - Filtracji po stronie aplikacji.
- Nie blokuje operacji w bazie bez dodatkowych polityk/triggerów.

## 4. Uprawnienia i RLS
- Rola `learning` – tylko odczyt (SELECT) na fiszkach w udostępnionym zestawie.
- Rola `full` – pełne uprawnienia (SELECT, INSERT, UPDATE, DELETE) na kopii zestawu.
- W przyszłości można rozważyć versioning lub audyt zmian.

## 5. Dodatkowe usprawnienia
1. Unikalność nazw zestawów per użytkownik:
   ```sql
   ALTER TABLE public.flashcards_set
     ADD CONSTRAINT uniq_owner_name UNIQUE (owner_id, name);
   ```
2. Wygasające udostępnienia:
   - Kolumna `expires_at timestamptz` w `flashcards_set_shares` + warunek w politykach RLS.
3. Pełnotekstowe wyszukiwanie fiszek:
   - Kolumna `search_vector tsvector` + GIN index i trigger aktualizujący z `question || ' ' || answer`.
4. Audyt i versioning zmian:
   - Tabela `flashcards_history` + trigger BEFORE UPDATE/DELETE wstawiający poprzednie wersje.
5. Validate FK constraints:
   - Usunięcie `NOT VALID` i `ALTER TABLE ... VALIDATE CONSTRAINT`.
6. Unikalny indeks `(session_id, sequence_no)` w `session_cards`.
7. Check-constraint na `question` i `answer`: niepuste, limity długości.
8. Konsolidacja polityk RLS: redukcja duplikacji definicji.
9. Spójna konwencja nazewnictwa triggerów, funkcji i polityk RLS.
10. Materialized views lub agregacje statystyczne (liczba fiszek, średnia ocena).
11. Ograniczenie udostępniania tylko zestawów o statusie 'accepted':
   ```sql
   CREATE POLICY "Właściciele mogą udostępniać tylko zaakceptowane zestawy"
     ON public.flashcards_set_shares
     FOR INSERT
     TO authenticated
     WITH CHECK (
       EXISTS (
         SELECT 1
           FROM public.flashcards_set fs
          WHERE fs.id = flashcards_set_shares.flashcards_set_id
            AND fs.owner_id = auth.uid()
            AND fs.status = 'accepted'::flashcards_set_status
       )
     ); 