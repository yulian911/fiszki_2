-- Migracja: Przebudowuje polityki SELECT dla tabeli flashcards_set_shares

-- 1. Usuń istniejące, potencjalnie konfliktowe polityki SELECT
DROP POLICY IF EXISTS "Właściciele mogą wyświetlać udostępnienia swoich zestawów" ON public.flashcards_set_shares;
DROP POLICY IF EXISTS "Użytkownicy mogą wyświetlać udostępnienia przypisane do nich" ON public.flashcards_set_shares;

-- 2. Stwórz jedną, kompletną politykę SELECT
CREATE POLICY "Właściciele i odbiorcy mogą odczytywać udostępnienia"
ON public.flashcards_set_shares
FOR SELECT
TO authenticated
USING (
  -- Warunek 1: Użytkownik jest odbiorcą tego konkretnego udostępnienia
  (user_id = auth.uid())
  -- LUB
  -- Warunek 2: Użytkownik jest właścicielem zestawu, którego dotyczy to udostępnienie
  OR (EXISTS (
    SELECT 1
    FROM public.flashcards_set fs
    WHERE fs.id = flashcards_set_shares.flashcards_set_id AND fs.owner_id = auth.uid()
  ))
); 