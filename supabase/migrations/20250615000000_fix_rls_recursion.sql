-- Migracja: Ostateczna naprawa RLS z użyciem funkcji SECURITY DEFINER, aby zapobiec nieskończonej rekurencji.

-- =================================================================
-- KROK 1: Całkowite wyczyszczenie starych polityk, aby uniknąć konfliktów
-- =================================================================

-- Policies for flashcards_set
DROP POLICY IF EXISTS "Użytkownicy mogą odczytywać własne i udostępnione im zestawy" ON public.flashcards_set;
DROP POLICY IF EXISTS "Użytkownicy mogą tworzyć nowe zestawy" ON public.flashcards_set;
DROP POLICY IF EXISTS "Właściciele mogą modyfikować swoje zestawy" ON public.flashcards_set;
DROP POLICY IF EXISTS "Właściciele mogą usuwać swoje zestawy" ON public.flashcards_set;

-- Policies for flashcards_set_shares
DROP POLICY IF EXISTS "Właściciele i odbiorcy mogą odczytywać udostępnienia" ON public.flashcards_set_shares;
DROP POLICY IF EXISTS "Właściciele mogą udostępniać swoje zestawy" ON public.flashcards_set_shares;
DROP POLICY IF EXISTS "Właściciele mogą usuwać udostępnienia swoich zestawów" ON public.flashcards_set_shares;


-- =================================================================
-- KROK 2: Stworzenie funkcji pomocniczej, która przerwie pętlę rekurencji
-- Ta funkcja działa z uprawnieniami definera (administratora), więc omija polityki RLS użytkownika.
-- =================================================================

CREATE OR REPLACE FUNCTION is_flashcards_set_owner(set_id_to_check uuid)
RETURNS boolean AS $$
BEGIN
  -- Ta kwerenda omija polityki RLS, ponieważ funkcja ma atrybut SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1
    FROM public.flashcards_set fs
    WHERE fs.id = set_id_to_check AND fs.owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =================================================================
-- KROK 3: Stworzenie od nowa poprawnych polityk dla tabeli 'flashcards_set'
-- =================================================================

CREATE POLICY "Użytkownicy mogą odczytywać własne i udostępnione im zestawy"
ON public.flashcards_set FOR SELECT TO authenticated USING (
  (owner_id = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM public.flashcards_set_shares
    WHERE flashcards_set_shares.flashcards_set_id = flashcards_set.id AND flashcards_set_shares.user_id = auth.uid()
  ))
);

CREATE POLICY "Użytkownicy mogą tworzyć nowe zestawy"
ON public.flashcards_set FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Właściciele mogą modyfikować swoje zestawy"
ON public.flashcards_set FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Właściciele mogą usuwać swoje zestawy"
ON public.flashcards_set FOR DELETE TO authenticated USING (owner_id = auth.uid());


-- =================================================================
-- KROK 4: Stworzenie od nowa poprawnych polityk dla tabeli 'flashcards_set_shares'
-- Te polityki używają funkcji pomocniczej, aby uniknąć rekurencji.
-- =================================================================

CREATE POLICY "Właściciele i odbiorcy mogą odczytywać udostępnienia"
ON public.flashcards_set_shares FOR SELECT TO authenticated USING (
  (user_id = auth.uid()) OR (is_flashcards_set_owner(flashcards_set_id))
);

CREATE POLICY "Właściciele mogą udostępniać swoje zestawy"
ON public.flashcards_set_shares FOR INSERT TO authenticated WITH CHECK (
  is_flashcards_set_owner(flashcards_set_id)
);

CREATE POLICY "Właściciele mogą usuwać udostępnienia swoich zestawów"
ON public.flashcards_set_shares FOR DELETE TO authenticated USING (
  is_flashcards_set_owner(flashcards_set_id)
); 