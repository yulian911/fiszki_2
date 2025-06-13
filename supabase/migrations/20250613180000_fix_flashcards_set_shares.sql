-- Migracja: Naprawia strukturę tabeli flashcards_set_shares

-- 1. Dodaj kolumnę id jako UUID z domyślną wartością
ALTER TABLE public.flashcards_set_shares 
ADD COLUMN id uuid DEFAULT gen_random_uuid();

-- 2. Ustaw wartości id dla istniejących rekordów (jeśli są)
UPDATE public.flashcards_set_shares 
SET id = gen_random_uuid() 
WHERE id IS NULL;

-- 3. Ustaw kolumnę id jako NOT NULL
ALTER TABLE public.flashcards_set_shares 
ALTER COLUMN id SET NOT NULL;

-- 4. Usuń stary klucz główny kompozytowy
ALTER TABLE public.flashcards_set_shares 
DROP CONSTRAINT flashcards_set_shares_pkey;

-- 5. Dodaj nowy klucz główny na kolumnie id
ALTER TABLE public.flashcards_set_shares 
ADD CONSTRAINT flashcards_set_shares_pkey PRIMARY KEY (id);

-- 6. Dodaj unikalny indeks na kompozytowy klucz (flashcards_set_id, user_id)
CREATE UNIQUE INDEX flashcards_set_shares_unique_set_user 
ON public.flashcards_set_shares (flashcards_set_id, user_id);

-- 7. Dodaj indeks na id dla wydajności
CREATE INDEX flashcards_set_shares_id_idx 
ON public.flashcards_set_shares (id); 