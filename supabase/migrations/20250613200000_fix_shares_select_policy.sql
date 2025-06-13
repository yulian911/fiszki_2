-- Migracja: Dodaje politykę RLS pozwalającą właścicielom na odczyt udostępnieň.

CREATE POLICY "Właściciele mogą wyświetlać udostępnienia swoich zestawów"
ON public.flashcards_set_shares
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.flashcards_set fs
    WHERE fs.id = flashcards_set_shares.flashcards_set_id AND fs.owner_id = auth.uid()
  )
); 