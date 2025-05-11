-- Włączenie RLS dla tabeli flashcards_set
ALTER TABLE flashcards_set ENABLE ROW LEVEL SECURITY;

-- Usunięcie wszystkich istniejących polityk (jeśli istnieją)
DROP POLICY IF EXISTS "flashcards_set_select_policy" ON flashcards_set;
DROP POLICY IF EXISTS "flashcards_set_insert_policy" ON flashcards_set;
DROP POLICY IF EXISTS "flashcards_set_update_policy" ON flashcards_set;
DROP POLICY IF EXISTS "flashcards_set_delete_policy" ON flashcards_set;

-- Polityka dla odczytu zestawów przez właściciela lub użytkownika, któremu zestaw udostępniono
CREATE POLICY "flashcards_set_select_policy" ON flashcards_set
  FOR SELECT
  USING (
    auth.uid() = owner_id 
    OR EXISTS (
      SELECT 1 FROM flashcards_set_shares
      WHERE flashcards_set_id = flashcards_set.id
      AND user_id = auth.uid()
    )
  );

-- Polityka dla dodawania nowych zestawów (tylko przez zalogowanego użytkownika)
CREATE POLICY "flashcards_set_insert_policy" ON flashcards_set
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
  );

-- Polityka dla aktualizacji zestawów (tylko przez właściciela)
CREATE POLICY "flashcards_set_update_policy" ON flashcards_set
  FOR UPDATE
  USING (
    auth.uid() = owner_id
  );

-- Polityka dla usuwania zestawów (tylko przez właściciela)
CREATE POLICY "flashcards_set_delete_policy" ON flashcards_set
  FOR DELETE
  USING (
    auth.uid() = owner_id
  );

-- Indeksy dla poprawy wydajności zapytań
CREATE INDEX IF NOT EXISTS flashcards_set_owner_id_idx ON flashcards_set(owner_id);
CREATE INDEX IF NOT EXISTS flashcards_set_status_idx ON flashcards_set(status); 