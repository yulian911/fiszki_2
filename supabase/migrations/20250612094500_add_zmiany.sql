-- Migracja: Dodaje funkcję klonowania, unikalność nazw, kolumny, indeksy, audyt, walidację FK, materialized view oraz polityki RLS

-- 1. Funkcja klonowania zestawu i fiszek
CREATE OR REPLACE FUNCTION public.clone_flashcards_set(original_set_id uuid, new_owner uuid)
RETURNS uuid AS $$
DECLARE
  new_set_id uuid;
BEGIN
  INSERT INTO public.flashcards_set (owner_id, name, status, description)
    SELECT new_owner, name, 'pending', description
    FROM public.flashcards_set
    WHERE id = original_set_id
    RETURNING id INTO new_set_id;

  INSERT INTO public.flashcards (flashcards_set_id, question, answer, source, created_at, updated_at)
    SELECT new_set_id, question, answer, source, now(), now()
    FROM public.flashcards
    WHERE flashcards_set_id = original_set_id;

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

-- 2. Unikalność nazw zestawów per użytkownik
ALTER TABLE public.flashcards_set
  ADD CONSTRAINT uniq_owner_name UNIQUE (owner_id, name);

-- 3. Wygasające udostępnienia
ALTER TABLE public.flashcards_set_shares
  ADD COLUMN expires_at timestamptz;

-- 4. Pełnotekstowe wyszukiwanie fiszek
ALTER TABLE public.flashcards
  ADD COLUMN search_vector tsvector;

CREATE INDEX flashcards_search_idx
  ON public.flashcards USING GIN (search_vector);

CREATE TRIGGER update_search_vector
  BEFORE INSERT OR UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'simple', question, answer);

-- 5. Audyt i versioning zmian
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

-- 6. Walidacja istniejących FK constraints
ALTER TABLE public.flashcards           VALIDATE CONSTRAINT flashcards_flashcards_set_id_fkey;
ALTER TABLE public.flashcards_set       VALIDATE CONSTRAINT flashcards_set_owner_id_fkey;
ALTER TABLE public.flashcards_set_shares VALIDATE CONSTRAINT flashcards_set_shares_flashcards_set_id_fkey;
ALTER TABLE public.flashcards_set_shares VALIDATE CONSTRAINT flashcards_set_shares_user_id_fkey;
ALTER TABLE public.flashcards_tags      VALIDATE CONSTRAINT flashcards_tags_flashcard_id_fkey;
ALTER TABLE public.flashcards_tags      VALIDATE CONSTRAINT flashcards_tags_tag_id_fkey;
ALTER TABLE public.session_cards        VALIDATE CONSTRAINT session_cards_flashcard_id_fkey;
ALTER TABLE public.session_cards        VALIDATE CONSTRAINT session_cards_session_id_fkey;
ALTER TABLE public.sessions            VALIDATE CONSTRAINT sessions_flashcards_set_id_fkey;
ALTER TABLE public.sessions            VALIDATE CONSTRAINT sessions_user_id_fkey;

-- 7. Unikalny indeks na kolejność w sesji
CREATE UNIQUE INDEX session_cards_sequence_idx
  ON public.session_cards(session_id, sequence_no);

-- 8. Check-constraint na question i answer
ALTER TABLE public.flashcards
  ADD CONSTRAINT check_non_empty_question CHECK (char_length(trim(question)) > 0),
  ADD CONSTRAINT check_non_empty_answer CHECK (char_length(trim(answer)) > 0),
  ADD CONSTRAINT check_length_question CHECK (char_length(question) <= 1000),
  ADD CONSTRAINT check_length_answer CHECK (char_length(answer) <= 5000);

-- 9. Materialized view ze statystykami
CREATE MATERIALIZED VIEW stats_flashcards_set AS
  SELECT flashcards_set_id, count(*) AS total_cards
  FROM public.flashcards
  GROUP BY flashcards_set_id;

-- 10. Polityki RLS
-- Blokuj operacje na niezaakceptowanych zestawach
CREATE POLICY "Blokuj operacje na niezaakceptowanych"
  ON public.flashcards_set
  FOR ALL
  TO authenticated
  USING (status = 'accepted'::flashcards_set_status);

-- Ograniczenie udostępniania tylko zaakceptowanych zestawów
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