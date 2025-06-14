create or replace function get_recent_sessions()
returns table (
    id uuid,
    ended_at timestamptz,
    score int,
    duration_seconds int,
    set_name text
)
language plpgsql
security definer
as $$
begin
    return query
    select
        s.id,
        s.ended_at,
        s.score,
        s.duration_seconds,
        fs.name::text as set_name
    from
        public.sessions s
    join
        public.flashcards_set fs on s.flashcards_set_id = fs.id
    where
        s.user_id = auth.uid()
        and s.status = 'completed'
    order by
        s.ended_at desc
    limit 5;
end;
$$; 