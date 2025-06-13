-- Migracja: W pełni idempotentna naprawa wszystkich krytycznych polityk RLS

-- =================================================================
-- KROK 1: Naprawa polityk dla tabeli 'flashcards_set'
-- =================================================================

-- 1.1 Usuń wszystkie stare polityki, aby uniknąć konfliktów
DROP POLICY IF EXISTS "Blokuj operacje na niezaakceptowanych" ON public.flashcards_set;
DROP POLICY IF EXISTS "Użytkownicy mogą odczytywać własne i udostępnione im zestawy" ON public.flashcards_set;
DROP POLICY IF EXISTS "Użytkownicy mogą tworzyć nowe zestawy" ON public.flashcards_set;
DROP POLICY IF EXISTS "Właściciele mogą modyfikować swoje zestawy" ON public.flashcards_set;
DROP POLICY IF EXISTS "Właściciele mogą usuwać swoje zestawy" ON public.flashcards_set;


-- 1.2 Stwórz poprawne polityki od nowa
CREATE POLICY "Użytkownicy mogą odczytywać własne i udostępnione im zestawy"
ON public.flashcards_set FOR SELECT TO authenticated USING (
  (owner_id = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM flashcards_set_shares
    WHERE flashcards_set_shares.flashcards_set_id = flashcards_set.id AND flashcards_set_shares.user_id = auth.uid()
  ))
);

CREATE POLICY "Użytkownicy mogą tworzyć nowe zestawy"
ON public.flashcards_set FOR INSERT TO authenticated WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY "Właściciele mogą modyfikować swoje zestawy"
ON public.flashcards_set FOR UPDATE TO authenticated USING (
  owner_id = auth.uid()
) WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY "Właściciele mogą usuwać swoje zestawy"
ON public.flashcards_set FOR DELETE TO authenticated USING (
  owner_id = auth.uid()
);


-- =================================================================
-- KROK 2: Naprawa polityk dla 'flashcards_set_shares'
-- =================================================================

-- 2.1 Usuń wszystkie stare polityki, aby uniknąć konfliktów
DROP POLICY IF EXISTS "Właściciele mogą wyświetlać udostępnienia swoich zestawów" ON public.flashcards_set_shares;
DROP POLICY IF EXISTS "Użytkownicy mogą wyświetlać udostępnienia przypisane do nich" ON public.flashcards_set_shares;
DROP POLICY IF EXISTS "Właściciele i odbiorcy mogą odczytywać udostępnienia" ON public.flashcards_set_shares;
DROP POLICY IF EXISTS "Właściciele mogą udostępniać swoje zestawy" ON public.flashcards_set_shares;
DROP POLICY IF EXISTS "Właściciele mogą usuwać udostępnienia swoich zestawów" ON public.flashcards_set_shares;


-- 2.2 Stwórz poprawne polityki od nowa
CREATE POLICY "Właściciele i odbiorcy mogą odczytywać udostępnienia"
ON public.flashcards_set_shares FOR SELECT TO authenticated USING (
  (user_id = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM flashcards_set fs WHERE fs.id = flashcards_set_shares.flashcards_set_id AND fs.owner_id = auth.uid()
  ))
);

CREATE POLICY "Właściciele mogą udostępniać swoje zestawy"
ON public.flashcards_set_shares FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM flashcards_set fs WHERE fs.id = flashcards_set_shares.flashcards_set_id AND fs.owner_id = auth.uid()
  )
);

CREATE POLICY "Właściciele mogą usuwać udostępnienia swoich zestawów"
ON public.flashcards_set_shares FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM flashcards_set fs WHERE fs.id = flashcards_set_shares.flashcards_set_id AND fs.owner_id = auth.uid()
  )
);