create or replace function get_dashboard_stats()
returns table (
    flashcards_to_review_today bigint,
    total_flashcards bigint,
    completed_sessions bigint,
    study_streak int
)
language plpgsql
security definer
as $$
declare
    current_user_id uuid := auth.uid();
begin
    return query
    select
        -- UWAGA: Logika dla fiszek do powtórzenia dzisiaj i passy nauki
        -- wymaga rozbudowy schematu bazy danych (np. o kolumnę next_review_at).
        -- Na tym etapie zwracamy wartości tymczasowe.
        0::bigint as flashcards_to_review_today,

        (select count(*)
         from public.flashcards f
         join public.flashcards_set fs on f.flashcards_set_id = fs.id
         where fs.owner_id = current_user_id) as total_flashcards,

        (select count(*)
         from public.sessions s
         where s.user_id = current_user_id and s.status = 'completed') as completed_sessions,

        0 as study_streak;
end;
$$; 