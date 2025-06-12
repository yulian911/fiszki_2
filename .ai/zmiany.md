# Notatka z konwersacji

Poniższa notatka podsumowuje kluczowe wnioski i dopracowane propozycje zmian:

## 1. Model udostępniania przez klonowanie

- Zamiast modyfikować oryginalny zestaw, tworzymy jego kopię dla nowego właściciela.
- Funkcja PL/pgSQL `clone_flashcards_set(original_set_id uuid, new_owner uuid) RETURNS uuid`:

  ```sql
  CREATE OR REPLACE FUNCTION public.clone_flashcards_set(original_set_id uuid, new_owner uuid)
  RETURNS uuid AS $$
  DECLARE
    new_set_id uuid;
  BEGIN
    -- sklonuj nagłówek zestawu
    INSERT INTO public.flashcards_set (owner_id, name, status, description)
      SELECT new_owner, name, 'pending', description
      FROM public.flashcards_set
      WHERE id = original_set_id
      RETURNING id INTO new_set_id;

    -- sklonuj fiszki
    INSERT INTO public.flashcards (flashcards_set_id, question, answer, source, created_at, updated_at)
      SELECT new_set_id, question, answer, source, now(), now()
      FROM public.flashcards
      WHERE flashcards_set_id = original_set_id;

    -- sklonuj powiązania tagów
    INSERT INTO public.flashcards_tags (flashcard_id, tag_id)
      SELECT f_new.id, ft.tag_id
      FROM public.flashcards f_old
      JOIN public.flashcards_tags ft ON ft.flashcard_id = f_old.id
      JOIN public.flashcards f_new ON f_new.flashcards_set_id = new_set_id
        AND f_new.question = f_old.question
        AND f_new.answer = f_old.answer;

    RETURN new_set_id;
  END;
  $$ LANGUAGE plpgsql;
  ```

- Opcjonalnie: rozbudować o audit-trail w tabeli `flashcards_history` (pkt 5).

## 2. Brak zestawów publicznych

- Wyświetlanie i edycja możliwe tylko dla właściciela lub użytkowników z udostępnieniem.
- Ewentualny publiczny podgląd można w przyszłości dodać z osobną polityką RLS.

## 3. Statusy zestawów

- Pole `status` (`pending` | `accepted` | `rejected`) służy do:
  - Moderacji przed udostępnieniem,
  - Filtrowania po stronie frontend.
- Aby twardo blokować operacje na niezaakceptowanych zestawach, można dodać politykę RLS:
  ```sql
  CREATE POLICY "Blokuj operacje na niezaakceptowanych"
    ON public.flashcards_set
    FOR ALL
    TO authenticated
    USING (status = 'accepted'::flashcards_set_status);
  ```

## 4. Uprawnienia i RLS

- Rola `learning` – tylko SELECT na fiszkach w udostępnionym zestawie.
- Rola `full` – pełen zestaw uprawnień na klonie (inne `flashcards_set_id`).
- Upewnić się, że klonowana kopia otrzymuje nowe ID i niezależny zestaw.
- W przyszłości rozważyć wersjonowanie i audyt zmian (pkt 5.4).

## 5. Dodatkowe usprawnienia

1. Unikalność nazw zestawów per użytkownik:
   ```sql
   ALTER TABLE public.flashcards_set
     ADD CONSTRAINT uniq_owner_name UNIQUE (owner_id, name);
   ```
2. Wygasające udostępnienia:
   ```sql
   ALTER TABLE public.flashcards_set_shares
     ADD COLUMN expires_at timestamptz;
   ```
   I warunek w politykach RLS:
   ```sql
   ... AND (expires_at IS NULL OR expires_at > now())
   ```
3. Pełnotekstowe wyszukiwanie fiszek:

   ```sql
   ALTER TABLE public.flashcards
     ADD COLUMN search_vector tsvector;

   CREATE INDEX flashcards_search_idx
     ON public.flashcards USING GIN (search_vector);

   CREATE TRIGGER update_search_vector
     BEFORE INSERT OR UPDATE ON public.flashcards
     FOR EACH ROW EXECUTE FUNCTION
     to_tsvector('simple', coalesce(question,'') || ' ' || coalesce(answer,''));
   ```

4. Audyt i versioning zmian:

   ```sql
   CREATE TABLE public.flashcards_history (
     history_id serial PRIMARY KEY,
     flashcard_id uuid NOT NULL,
     question text,
     answer text,
     source flashcard_source,
     changed_at timestamptz NOT NULL DEFAULT now(),
     change_type text NOT NULL
   );

   CREATE OR REPLACE FUNCTION public.log_flashcards_history()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.flashcards_history(flashcard_id, question, answer, source, changed_at, change_type)
     VALUES (OLD.id, OLD.question, OLD.answer, OLD.source, now(), TG_OP);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trg_flashcards_history
     BEFORE UPDATE OR DELETE ON public.flashcards
     FOR EACH ROW EXECUTE FUNCTION public.log_flashcards_history();
   ```

5. Validate FK constraints:
   - Usunięcie `NOT VALID` i wykonanie `ALTER TABLE ... VALIDATE CONSTRAINT`.
6. Unikalny indeks `(session_id, sequence_no)`:
   ```sql
   CREATE UNIQUE INDEX session_cards_sequence_idx
     ON public.session_cards(session_id, sequence_no);
   ```
7. Check-constraint na `question` i `answer`:
   ```sql
   ALTER TABLE public.flashcards
     ADD CONSTRAINT check_non_empty_question CHECK (char_length(trim(question)) > 0),
     ADD CONSTRAINT check_non_empty_answer CHECK (char_length(trim(answer)) > 0),
     ADD CONSTRAINT check_length_question CHECK (char_length(question) <= 1000),
     ADD CONSTRAINT check_length_answer CHECK (char_length(answer) <= 5000);
   ```
8. Konsolidacja polityk RLS – wydzielić wspólne fragmenty (np. joiny) do widoków lub helperów.
9. Spójna konwencja nazewnictwa triggerów, funkcji i polityk RLS (prefixy `trg_`, `fn_`, `policy_`).
10. Materialized views / agregacje statystyczne (liczba fiszek, średnia ocena):
    ```sql
    CREATE MATERIALIZED VIEW stats_flashcards_set AS
      SELECT flashcards_set_id, count(*) AS total_cards
      FROM public.flashcards
      GROUP BY flashcards_set_id;
    ```
11. Ograniczenie udostępniania tylko zaakceptowanych zestawów:
    ```sql
    CREATE POLICY "Właściciele mogą udostępniać tylko zaakceptowane zestawy"
      ON public.flashcards_set_shares
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.flashcards_set fs
          WHERE fs.id = public.flashcards_set_shares.flashcards_set_id
            AND fs.owner_id = auth.uid()
            AND fs.status = 'accepted'::flashcards_set_status
        )
      );
    ```
