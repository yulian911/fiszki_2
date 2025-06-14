create or replace function get_daily_activity_last_7_days()
returns table (
    activity_date date,
    review_count bigint
)
language sql
security definer
as $$
    -- 1. Generate a series of the last 7 days
    with last_7_days as (
        select generate_series(
            date_trunc('day', now() at time zone 'utc') - interval '6 days',
            date_trunc('day', now() at time zone 'utc'),
            '1 day'::interval
        )::date as day
    ),
    -- 2. Get the daily review counts for the current user
    daily_reviews as (
        select
            date_trunc('day', sc.reviewed_at at time zone 'utc')::date as review_day,
            count(sc.flashcard_id) as total_reviews
        from public.session_cards sc
        join public.sessions s on sc.session_id = s.id
        where
            s.user_id = auth.uid()
            and sc.reviewed_at is not null
            and sc.reviewed_at >= date_trunc('day', now() at time zone 'utc') - interval '6 days'
        group by review_day
    )
    -- 3. Left join the days with the review counts to ensure all 7 days are present
    select
        d.day as activity_date,
        coalesce(dr.total_reviews, 0) as review_count
    from last_7_days d
    left join daily_reviews dr on d.day = dr.review_day
    order by d.day asc;
$$; 