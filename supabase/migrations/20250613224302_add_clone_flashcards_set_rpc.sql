create or replace function public.clone_flashcards_set(
    new_owner_id uuid,
    set_id_to_clone uuid
)
returns uuid
language plpgsql
security definer
as $$
declare
    new_set_id uuid;
    original_set record;
    flashcard_record record;
begin
    -- 1. Pobierz dane oryginalnego zestawu
    select * into original_set from public.flashcards_set where id = set_id_to_clone;

    -- Sprawdź, czy oryginalny zestaw istnieje
    if original_set is null then
        raise exception 'Original flashcard set with id % not found', set_id_to_clone;
    end if;
    
    -- 2. Wstaw nowy zestaw fiszek dla nowego właściciela, kopiując dane
    insert into public.flashcards_set (owner_id, name, description, status)
    values (
        new_owner_id,
        original_set.name,
        original_set.description,
        'accepted' -- Nowa kopia jest od razu zaakceptowana i gotowa do użycia
    ) returning id into new_set_id;

    -- 3. Skopiuj wszystkie fiszki z oryginalnego zestawu do nowego
    for flashcard_record in
        select * from public.flashcards where flashcards_set_id = set_id_to_clone
    loop
        insert into public.flashcards (flashcards_set_id, question, answer, source)
        values (new_set_id, flashcard_record.question, flashcard_record.answer, flashcard_record.source);
    end loop;

    -- 4. Zwróć ID nowego zestawu
    return new_set_id;
end;
$$;
