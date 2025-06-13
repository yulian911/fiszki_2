-- Migracja: Dodaje system ról użytkowników i pozwala adminom na zmianę statusu zestawów.

-- =================================================================
-- KROK 1: Stworzenie tabeli 'profiles' z kolumną 'role'
-- Ta tabela będzie rozszerzać domyślną tabelę 'auth.users'.
-- =================================================================

-- 1.1 Stwórz tabelę 'profiles', jeśli nie istnieje
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Ustaw RLS dla tabeli 'profiles'
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Użytkownicy mogą odczytywać własny profil" ON public.profiles;
CREATE POLICY "Użytkownicy mogą odczytywać własny profil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);


-- 1.3 Stwórz funkcję, która automatycznie tworzy profil po rejestracji nowego użytkownika
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.4 Stwórz trigger, który wywołuje tę funkcję
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =================================================================
-- KROK 2: Stworzenie funkcji pomocniczej do sprawdzania roli admina
-- =================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- =================================================================
-- KROK 3: Zaktualizowanie polityki UPDATE dla 'flashcards_set'
-- =================================================================

-- 3.1 Usuń starą politykę
DROP POLICY IF EXISTS "Właściciele mogą modyfikować swoje zestawy" ON public.flashcards_set;

-- 3.2 Stwórz nową, rozszerzoną politykę
CREATE POLICY "Właściciele lub admini mogą modyfikować zestawy"
ON public.flashcards_set FOR UPDATE TO authenticated USING (
  (owner_id = auth.uid()) OR (is_admin())
) WITH CHECK (
  (owner_id = auth.uid()) OR (is_admin())
); 