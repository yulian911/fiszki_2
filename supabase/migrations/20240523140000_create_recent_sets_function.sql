create or replace function get_recent_flashcard_sets()
returns table (
    id uuid,
    name text,
    description text,
    updated_at timestamptz,
    flashcard_count bigint
)
language plpgsql
security definer
as $$
begin
    return query
    select
        fs.id,
        fs.name::text,
        fs.description::text,
        fs.updated_at,
        (select count(*) from public.flashcards f where f.flashcards_set_id = fs.id) as flashcard_count
    from
        public.flashcards_set fs
    where
        fs.owner_id = auth.uid()
        and fs.status = 'accepted'
    order by
        fs.updated_at desc
    limit 5;
end;
$$; 