-- ────────────────────────────────────────────────────────────────────
--  Intelligent Flashcards – SRS
--  Struktura kart w sesji + RLS
-- ────────────────────────────────────────────────────────────────────

----------------------------------------------------------------------
-- 1. ENUM z ocenami karty (utworzy tylko, gdy nie istnieje)
----------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'session_card_rating'
  ) THEN
    CREATE TYPE session_card_rating AS ENUM
      ('again', 'hard', 'good', 'easy');
  END IF;
END$$;

----------------------------------------------------------------------
-- 2. ENUM dla statusu sesji
----------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'session_status'
  ) THEN
    CREATE TYPE session_status AS ENUM
      ('in_progress', 'completed', 'abandoned');
  END IF;
END$$;

----------------------------------------------------------------------
-- 3. Tabela session_cards
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_cards (
  session_id   uuid NOT NULL
                REFERENCES sessions(id) ON DELETE CASCADE,
  flashcard_id uuid NOT NULL
                REFERENCES flashcards(id) ON DELETE CASCADE,
  sequence_no  integer NOT NULL,          -- kolejność wylosowania
  rating       session_card_rating,       -- ostatnia ocena
  reviewed_at  timestamptz,               -- kiedy oceniono
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, flashcard_id)
);

----------------------------------------------------------------------
-- 4. Dodanie brakujących kolumn do tabeli sessions
----------------------------------------------------------------------
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS status session_status NOT NULL DEFAULT 'in_progress',
ADD COLUMN IF NOT EXISTS ended_at timestamptz,
ADD COLUMN IF NOT EXISTS duration_seconds integer;

----------------------------------------------------------------------
-- 5. RLS: włącz + polityka dostępu
----------------------------------------------------------------------
ALTER TABLE session_cards ENABLE ROW LEVEL SECURITY;

-- utworzy politykę tylko, gdy brak – niepotrzebne IF NOT EXISTS w Postgresie
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1
      FROM   pg_policies
      WHERE  schemaname = current_schema()
        AND  tablename  = 'session_cards'
        AND  policyname = 'session_cards_owner_access'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY session_cards_owner_access
        ON session_cards
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM sessions
            WHERE id = session_cards.session_id
              AND user_id = auth.uid()
          )
        );
    $policy$;
  END IF;
END$$;

----------------------------------------------------------------------
-- 6. Dodanie polityki dla aktualizacji sesji (jeśli nie istnieje)
----------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1
      FROM   pg_policies
      WHERE  schemaname = current_schema()
        AND  tablename  = 'sessions'
        AND  policyname = 'sessions_owner_update'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY sessions_owner_update
        ON sessions
        FOR UPDATE
        TO authenticated
        USING (user_id = auth.uid());
    $policy$;
  END IF;
END$$;

----------------------------------------------------------------------
-- 7. Indeksy pomocnicze
----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS session_cards_session_id_idx
  ON session_cards(session_id);

CREATE INDEX IF NOT EXISTS session_cards_flashcard_id_idx
  ON session_cards(flashcard_id);

CREATE INDEX IF NOT EXISTS session_cards_rating_idx
  ON session_cards(rating);

CREATE INDEX IF NOT EXISTS sessions_status_idx
  ON sessions(status); 