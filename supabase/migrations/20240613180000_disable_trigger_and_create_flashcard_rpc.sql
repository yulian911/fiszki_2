-- Step 1: Disable the problematic trigger to prevent it from firing.
-- We assume the trigger is named 'update_flashcards_tsv_trigger'.
ALTER TABLE public.flashcards DISABLE TRIGGER update_flashcards_tsv_trigger;

-- Step 2: Clean up any previous RPC function attempts if they exist.
DROP FUNCTION IF EXISTS public.insert_flashcard_with_tsv(uuid, text, text, public.flashcard_source);
DROP FUNCTION IF EXISTS public.create_flashcard_and_update_tsv(uuid, text, text, public.flashcard_source);

-- Step 3: Create a new, reliable RPC function to handle the entire operation.
CREATE OR REPLACE FUNCTION public.create_flashcard_and_update_tsv(
    p_flashcards_set_id UUID,
    p_question TEXT,
    p_answer TEXT,
    p_source "public"."flashcard_source"
)
RETURNS SETOF "public"."flashcards" AS $$
DECLARE
    new_flashcard_id UUID;
BEGIN
    -- Insert the new flashcard and get its ID
    INSERT INTO "public"."flashcards" (flashcards_set_id, question, answer, source)
    VALUES (p_flashcards_set_id, p_question, p_answer, p_source)
    RETURNING id INTO new_flashcard_id;

    -- Update the new flashcard with the correct TSV
    UPDATE "public"."flashcards"
    SET tsv = to_tsvector('pg_catalog.simple', p_question || ' ' || p_answer)
    WHERE id = new_flashcard_id;
    
    -- Return the newly created and updated flashcard
    RETURN QUERY SELECT * FROM "public"."flashcards" WHERE id = new_flashcard_id;
END;
$$ LANGUAGE plpgsql; 