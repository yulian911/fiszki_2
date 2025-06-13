-- Migracja: Zmienia tryb bezpieczeństwa funkcji is_admin() na SECURITY DEFINER.
-- To rozwiązuje problem, w którym funkcja nie mogła odczytać roli użytkownika z powodu restrykcyjnych polityk RLS.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 