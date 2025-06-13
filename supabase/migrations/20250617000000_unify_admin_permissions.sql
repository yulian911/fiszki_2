-- Migracja: Ujednolica uprawnienia dla administratorów, dając im pełną kontrolę nad zestawami fiszek.

-- =================================================================
-- KROK 1: Usunięcie starych, niekompletnych polityk
-- Usuwamy istniejące polityki dla SELECT, UPDATE, DELETE, które nie uwzględniały roli admina.
-- =================================================================

DROP POLICY IF EXISTS "Właściciele mogą przeglądać swoje zestawy" ON public.flashcards_set;
DROP POLICY IF EXISTS "Udostępnione zestawy można przeglądać" ON public.flashcards_set; -- Ta polityka może również istnieć
DROP POLICY IF EXISTS "Właściciele lub admini mogą modyfikować zestawy" ON public.flashcards_set;
DROP POLICY IF EXISTS "Właściciele mogą usuwać swoje zestawy" ON public.flashcards_set;


-- =================================================================
-- KROK 2: Stworzenie kompleksowych polityk uwzględniających adminów
-- Tworzymy nowe polityki, które dają dostęp właścicielowi LUB adminowi.
-- Dodatkowo, zachowujemy logikę dostępu do zestawów udostępnionych.
-- =================================================================

-- Polityka SELECT: Dostęp ma właściciel, admin, lub osoba, której udostępniono zestaw.
CREATE POLICY "Pełny dostęp do odczytu dla właścicieli, adminów i współdzielonych użytkowników"
ON public.flashcards_set FOR SELECT TO authenticated USING (
  (owner_id = auth.uid()) 
  OR 
  (is_admin()) 
  OR 
  (
    id IN (
      SELECT flashcards_set_id FROM public.flashcards_set_shares WHERE user_id = auth.uid()
    )
  )
);

-- Polityka UPDATE: Dostęp ma właściciel lub admin.
CREATE POLICY "Pełny dostęp do modyfikacji dla właścicieli lub adminów"
ON public.flashcards_set FOR UPDATE TO authenticated USING (
  (owner_id = auth.uid()) OR (is_admin())
) WITH CHECK (
  (owner_id = auth.uid()) OR (is_admin())
);

-- Polityka DELETE: Dostęp ma właściciel lub admin.
CREATE POLICY "Pełny dostęp do usuwania dla właścicieli lub adminów"
ON public.flashcards_set FOR DELETE TO authenticated USING (
  (owner_id = auth.uid()) OR (is_admin())
); 