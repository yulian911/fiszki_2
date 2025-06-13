-- Migracja: Dodaje drugą politykę SELECT dla tabeli flashcards_set_shares

CREATE POLICY "Użytkownicy mogą wyświetlać udostępnienia przypisane do nich"
ON public.flashcards_set_shares
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
); 