

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."flashcard_source" AS ENUM (
    'ai-full',
    'ai-edit',
    'manual'
);


ALTER TYPE "public"."flashcard_source" OWNER TO "postgres";


CREATE TYPE "public"."flashcards_set_status" AS ENUM (
    'pending',
    'accepted',
    'rejected'
);


ALTER TYPE "public"."flashcards_set_status" OWNER TO "postgres";


CREATE TYPE "public"."session_card_rating" AS ENUM (
    'again',
    'hard',
    'good',
    'easy'
);


ALTER TYPE "public"."session_card_rating" OWNER TO "postgres";


CREATE TYPE "public"."session_status" AS ENUM (
    'in_progress',
    'completed',
    'abandoned'
);


ALTER TYPE "public"."session_status" OWNER TO "postgres";


CREATE TYPE "public"."share_role" AS ENUM (
    'full',
    'learning'
);


ALTER TYPE "public"."share_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clone_flashcards_set"("new_owner_id" "uuid", "set_id_to_clone" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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


ALTER FUNCTION "public"."clone_flashcards_set"("new_owner_id" "uuid", "set_id_to_clone" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."flashcards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "flashcards_set_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "source" "public"."flashcard_source" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "search_vector" "tsvector",
    "tsv" "tsvector",
    CONSTRAINT "check_length_answer" CHECK (("char_length"("answer") <= 5000)),
    CONSTRAINT "check_length_question" CHECK (("char_length"("question") <= 1000)),
    CONSTRAINT "check_non_empty_answer" CHECK (("char_length"(TRIM(BOTH FROM "answer")) > 0)),
    CONSTRAINT "check_non_empty_question" CHECK (("char_length"(TRIM(BOTH FROM "question")) > 0))
);


ALTER TABLE "public"."flashcards" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_flashcard_and_update_tsv"("p_flashcards_set_id" "uuid", "p_question" "text", "p_answer" "text", "p_source" "public"."flashcard_source") RETURNS SETOF "public"."flashcards"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."create_flashcard_and_update_tsv"("p_flashcards_set_id" "uuid", "p_question" "text", "p_answer" "text", "p_source" "public"."flashcard_source") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_user_by_email"("email_query" "text") RETURNS TABLE("id" "uuid", "email" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email::text -- <--- POPRAWKA: Rzutowanie na typ TEXT
  FROM auth.users u
  WHERE u.email = email_query;
END;
$$;


ALTER FUNCTION "public"."find_user_by_email"("email_query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_daily_activity_last_7_days"() RETURNS TABLE("activity_date" "date", "review_count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
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


ALTER FUNCTION "public"."get_daily_activity_last_7_days"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_stats"() RETURNS TABLE("flashcards_to_review_today" bigint, "total_flashcards" bigint, "completed_sessions" bigint, "study_streak" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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


ALTER FUNCTION "public"."get_dashboard_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_flashcard_sets_for_user"("p_user_id" "uuid", "p_page" integer, "p_limit" integer, "p_sort_by" "text", "p_sort_order" "text", "p_status" "text", "p_name_search" "text", "p_view" "text") RETURNS TABLE("id" "uuid", "owner_id" "uuid", "name" "text", "status" "text", "description" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "flashcard_count" integer, "access_level" "text", "owner_email" "text", "total_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_offset INT;
    v_sort_column TEXT;
BEGIN
    v_offset := (p_page - 1) * p_limit;
    v_sort_column := CASE p_sort_by
        WHEN 'name' THEN 'name'
        WHEN 'createdAt' THEN 'created_at'
        WHEN 'updatedAt' THEN 'updated_at'
        ELSE 'created_at'
    END;
    RETURN QUERY
    WITH all_sets AS (
        -- Zestawy własne użytkownika
        SELECT
            fs.id, fs.owner_id, fs.name, fs.status, fs.description, fs.created_at, fs.updated_at,
            (SELECT count(*) FROM flashcards WHERE flashcards_set_id = fs.id)::INT AS flashcard_count,
            'owner' AS access_level,
            NULL::TEXT AS owner_email
        FROM flashcards_set fs
        WHERE fs.owner_id = p_user_id AND (p_view = 'all' OR p_view = 'owned')
        UNION ALL
        -- Zestawy udostępnione użytkownikowi
        SELECT
            fs.id, fs.owner_id, fs.name, fs.status, fs.description, fs.created_at, fs.updated_at,
            (SELECT count(*) FROM flashcards WHERE flashcards_set_id = fs.id)::INT,
            'viewer' AS access_level,
            u.email AS owner_email
        FROM flashcards_set_shares s
        JOIN flashcards_set fs ON s.flashcards_set_id = fs.id
        JOIN auth.users u ON fs.owner_id = u.id
        WHERE s.user_id = p_user_id AND (s.expires_at IS NULL OR s.expires_at > now())
          AND (p_view = 'all' OR p_view = 'shared')
    ),
    filtered_sets AS (
        SELECT * FROM all_sets
        WHERE
            (p_status IS NULL OR all_sets.status::TEXT = p_status) AND
            (p_name_search IS NULL OR all_sets.name ILIKE '%' || p_name_search || '%')
    ),
    counted_sets AS (
        SELECT *, COUNT(*) OVER() as total_count FROM filtered_sets
    )
    SELECT cs.id, cs.owner_id, cs.name::text, cs.status::TEXT, cs.description::text, cs.created_at, cs.updated_at,
           cs.flashcard_count, cs.access_level, cs.owner_email, cs.total_count
    FROM counted_sets cs
    ORDER BY
        CASE WHEN v_sort_column = 'name' AND p_sort_order = 'asc' THEN cs.name END ASC,
        CASE WHEN v_sort_column = 'name' AND p_sort_order = 'desc' THEN cs.name END DESC,
        CASE WHEN v_sort_column = 'createdAt' AND p_sort_order = 'asc' THEN cs.created_at END ASC,
        CASE WHEN v_sort_column = 'createdAt' AND p_sort_order = 'desc' THEN cs.created_at END DESC,
        CASE WHEN v_sort_column = 'updatedAt' AND p_sort_order = 'asc' THEN cs.updated_at END ASC,
        CASE WHEN v_sort_column = 'updatedAt' AND p_sort_order = 'desc' THEN cs.updated_at END DESC
    LIMIT p_limit
    OFFSET v_offset;
END;
$$;


ALTER FUNCTION "public"."get_flashcard_sets_for_user"("p_user_id" "uuid", "p_page" integer, "p_limit" integer, "p_sort_by" "text", "p_sort_order" "text", "p_status" "text", "p_name_search" "text", "p_view" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_recent_flashcard_sets"() RETURNS TABLE("id" "uuid", "name" "text", "description" "text", "updated_at" timestamp with time zone, "flashcard_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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


ALTER FUNCTION "public"."get_recent_flashcard_sets"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_recent_sessions"() RETURNS TABLE("id" "uuid", "ended_at" timestamp with time zone, "score" integer, "duration_seconds" integer, "set_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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


ALTER FUNCTION "public"."get_recent_sessions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_flashcards_set_owner"("set_id_to_check" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Ta kwerenda omija polityki RLS, ponieważ funkcja ma atrybut SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1
    FROM public.flashcards_set fs
    WHERE fs.id = set_id_to_check AND fs.owner_id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."is_flashcards_set_owner"("set_id_to_check" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_flashcards_history"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO public.flashcards_history(flashcard_id, question, answer, source, changed_at, change_type)
  VALUES (OLD.id, OLD.question, OLD.answer, OLD.source, now(), TG_OP);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_flashcards_history"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_flashcards_tsv"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Use pg_catalog.simple to avoid search_path issues.
    NEW.tsv := to_tsvector('pg_catalog.simple', NEW.question || ' ' || NEW.answer);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_flashcards_tsv"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flashcards_history" (
    "history_id" integer NOT NULL,
    "flashcard_id" "uuid" NOT NULL,
    "question" "text",
    "answer" "text",
    "source" "public"."flashcard_source",
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "change_type" "text" NOT NULL
);


ALTER TABLE "public"."flashcards_history" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."flashcards_history_history_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."flashcards_history_history_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."flashcards_history_history_id_seq" OWNED BY "public"."flashcards_history"."history_id";



CREATE TABLE IF NOT EXISTS "public"."flashcards_set" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "name" character varying(255),
    "status" "public"."flashcards_set_status" DEFAULT 'pending'::"public"."flashcards_set_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" character varying
);


ALTER TABLE "public"."flashcards_set" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flashcards_set_shares" (
    "flashcards_set_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."share_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."flashcards_set_shares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flashcards_tags" (
    "flashcard_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."flashcards_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_cards" (
    "session_id" "uuid" NOT NULL,
    "flashcard_id" "uuid" NOT NULL,
    "sequence_no" integer NOT NULL,
    "rating" "public"."session_card_rating",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."session_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "flashcards_set_id" "uuid" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "score" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ended_at" timestamp with time zone,
    "duration_seconds" integer,
    "status" "public"."session_status" DEFAULT 'in_progress'::"public"."session_status" NOT NULL
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."stats_flashcards_set" AS
 SELECT "flashcards"."flashcards_set_id",
    "count"(*) AS "total_cards"
   FROM "public"."flashcards"
  GROUP BY "flashcards"."flashcards_set_id"
  WITH NO DATA;


ALTER TABLE "public"."stats_flashcards_set" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


ALTER TABLE ONLY "public"."flashcards_history" ALTER COLUMN "history_id" SET DEFAULT "nextval"('"public"."flashcards_history_history_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."flashcards_history"
    ADD CONSTRAINT "flashcards_history_pkey" PRIMARY KEY ("history_id");



ALTER TABLE ONLY "public"."flashcards"
    ADD CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcards_set"
    ADD CONSTRAINT "flashcards_set_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcards_set_shares"
    ADD CONSTRAINT "flashcards_set_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcards_tags"
    ADD CONSTRAINT "flashcards_tags_pkey" PRIMARY KEY ("flashcard_id", "tag_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_cards"
    ADD CONSTRAINT "session_cards_pkey" PRIMARY KEY ("session_id", "flashcard_id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcards_set"
    ADD CONSTRAINT "uniq_owner_name" UNIQUE ("owner_id", "name");



CREATE INDEX "flashcards_flashcards_set_id_idx" ON "public"."flashcards" USING "btree" ("flashcards_set_id");



CREATE INDEX "flashcards_search_idx" ON "public"."flashcards" USING "gin" ("search_vector");



CREATE INDEX "flashcards_set_owner_id_idx" ON "public"."flashcards_set" USING "btree" ("owner_id");



CREATE INDEX "flashcards_set_shares_id_idx" ON "public"."flashcards_set_shares" USING "btree" ("id");



CREATE UNIQUE INDEX "flashcards_set_shares_unique_set_user" ON "public"."flashcards_set_shares" USING "btree" ("flashcards_set_id", "user_id");



CREATE INDEX "flashcards_set_shares_user_id_idx" ON "public"."flashcards_set_shares" USING "btree" ("user_id");



CREATE INDEX "flashcards_set_status_idx" ON "public"."flashcards_set" USING "btree" ("status");



CREATE INDEX "flashcards_tsv_idx" ON "public"."flashcards" USING "gin" ("tsv");



CREATE INDEX "session_cards_flashcard_id_idx" ON "public"."session_cards" USING "btree" ("flashcard_id");



CREATE INDEX "session_cards_rating_idx" ON "public"."session_cards" USING "btree" ("rating");



CREATE UNIQUE INDEX "session_cards_sequence_idx" ON "public"."session_cards" USING "btree" ("session_id", "sequence_no");



CREATE INDEX "session_cards_session_id_idx" ON "public"."session_cards" USING "btree" ("session_id");



CREATE INDEX "sessions_flashcards_set_id_idx" ON "public"."sessions" USING "btree" ("flashcards_set_id");



CREATE INDEX "sessions_status_idx" ON "public"."sessions" USING "btree" ("status");



CREATE INDEX "sessions_user_id_idx" ON "public"."sessions" USING "btree" ("user_id");



CREATE INDEX "tags_name_idx" ON "public"."tags" USING "btree" ("name");



CREATE OR REPLACE TRIGGER "trg_flashcards_history" BEFORE DELETE OR UPDATE ON "public"."flashcards" FOR EACH ROW EXECUTE FUNCTION "public"."log_flashcards_history"();



CREATE OR REPLACE TRIGGER "update_flashcards_set_shares_updated_at" BEFORE UPDATE ON "public"."flashcards_set_shares" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_flashcards_set_updated_at" BEFORE UPDATE ON "public"."flashcards_set" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_flashcards_tsv_trigger" BEFORE INSERT OR UPDATE ON "public"."flashcards" FOR EACH ROW EXECUTE FUNCTION "public"."update_flashcards_tsv"();

ALTER TABLE "public"."flashcards" DISABLE TRIGGER "update_flashcards_tsv_trigger";



CREATE OR REPLACE TRIGGER "update_flashcards_updated_at" BEFORE UPDATE ON "public"."flashcards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_search_vector" BEFORE INSERT OR UPDATE ON "public"."flashcards" FOR EACH ROW EXECUTE FUNCTION "tsvector_update_trigger"('search_vector', 'simple', 'question', 'answer');

ALTER TABLE "public"."flashcards" DISABLE TRIGGER "update_search_vector";



CREATE OR REPLACE TRIGGER "update_tags_updated_at" BEFORE UPDATE ON "public"."tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."flashcards"
    ADD CONSTRAINT "flashcards_flashcards_set_id_fkey" FOREIGN KEY ("flashcards_set_id") REFERENCES "public"."flashcards_set"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcards_set"
    ADD CONSTRAINT "flashcards_set_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcards_set_shares"
    ADD CONSTRAINT "flashcards_set_shares_flashcards_set_id_fkey" FOREIGN KEY ("flashcards_set_id") REFERENCES "public"."flashcards_set"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcards_set_shares"
    ADD CONSTRAINT "flashcards_set_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcards_tags"
    ADD CONSTRAINT "flashcards_tags_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcards_tags"
    ADD CONSTRAINT "flashcards_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_cards"
    ADD CONSTRAINT "session_cards_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_cards"
    ADD CONSTRAINT "session_cards_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_flashcards_set_id_fkey" FOREIGN KEY ("flashcards_set_id") REFERENCES "public"."flashcards_set"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Pełny dostęp do modyfikacji dla właścicieli lub adminów" ON "public"."flashcards_set" FOR UPDATE TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("owner_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Pełny dostęp do odczytu dla właścicieli, adminów i współ" ON "public"."flashcards_set" FOR SELECT TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR "public"."is_admin"() OR ("id" IN ( SELECT "flashcards_set_shares"."flashcards_set_id"
   FROM "public"."flashcards_set_shares"
  WHERE ("flashcards_set_shares"."user_id" = "auth"."uid"())))));



CREATE POLICY "Pełny dostęp do usuwania dla właścicieli lub adminów" ON "public"."flashcards_set" FOR DELETE TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "Użytkownicy mogą aktualizować fiszki w swoich zestawach" ON "public"."flashcards" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Użytkownicy mogą dodawać fiszki do swoich zestawów" ON "public"."flashcards" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Użytkownicy mogą dodawać tagi do swoich fiszek" ON "public"."flashcards_tags" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."flashcards" "f"
     JOIN "public"."flashcards_set" "fs" ON (("f"."flashcards_set_id" = "fs"."id")))
  WHERE (("f"."id" = "flashcards_tags"."flashcard_id") AND ("fs"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Użytkownicy mogą odczytywać własne i udostępnione im zesta" ON "public"."flashcards_set" FOR SELECT TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."flashcards_set_shares"
  WHERE (("flashcards_set_shares"."flashcards_set_id" = "flashcards_set"."id") AND ("flashcards_set_shares"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Użytkownicy mogą odczytywać własny profil" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Użytkownicy mogą tworzyć nowe zestawy" ON "public"."flashcards_set" FOR INSERT TO "authenticated" WITH CHECK (("owner_id" = "auth"."uid"()));



CREATE POLICY "Użytkownicy mogą tworzyć swoje sesje" ON "public"."sessions" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Użytkownicy mogą tworzyć tagi" ON "public"."tags" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Użytkownicy mogą usuwać fiszki ze swoich zestawów" ON "public"."flashcards" FOR DELETE TO "authenticated" USING ((( SELECT "flashcards_set"."owner_id"
   FROM "public"."flashcards_set"
  WHERE ("flashcards_set"."id" = "flashcards"."flashcards_set_id")) = "auth"."uid"()));



CREATE POLICY "Użytkownicy mogą wyświetlać fiszki z ich zestawów" ON "public"."flashcards" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Użytkownicy mogą wyświetlać powiązania tagów z fiszkami" ON "public"."flashcards_tags" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."flashcards" "f"
     JOIN "public"."flashcards_set" "fs" ON (("f"."flashcards_set_id" = "fs"."id")))
  WHERE (("f"."id" = "flashcards_tags"."flashcard_id") AND ("fs"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Użytkownicy mogą wyświetlać swoje sesje" ON "public"."sessions" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Użytkownicy z rolą full mogą modyfikować fiszki" ON "public"."flashcards" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set_shares"
  WHERE (("flashcards_set_shares"."flashcards_set_id" = "flashcards"."flashcards_set_id") AND ("flashcards_set_shares"."user_id" = "auth"."uid"()) AND ("flashcards_set_shares"."role" = 'full'::"public"."share_role")))));



CREATE POLICY "Użytkownicy z rolą learning mogą wyświetlać fiszki" ON "public"."flashcards" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set_shares"
  WHERE (("flashcards_set_shares"."flashcards_set_id" = "flashcards"."flashcards_set_id") AND ("flashcards_set_shares"."user_id" = "auth"."uid"()) AND ("flashcards_set_shares"."role" = 'learning'::"public"."share_role")))));



CREATE POLICY "Wszyscy mogą wyświetlać tagi" ON "public"."tags" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Właściciele i odbiorcy mogą odczytywać udostępnienia" ON "public"."flashcards_set_shares" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_flashcards_set_owner"("flashcards_set_id")));



CREATE POLICY "Właściciele mogą aktualizować swoje zestawy" ON "public"."flashcards_set" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Właściciele mogą modyfikować udostępnienia" ON "public"."flashcards_set_shares" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards_set_shares"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Właściciele mogą tworzyć zestawy" ON "public"."flashcards_set" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Właściciele mogą udostępniać swoje zestawy" ON "public"."flashcards_set_shares" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_flashcards_set_owner"("flashcards_set_id"));



CREATE POLICY "Właściciele mogą udostępniać tylko zaakceptowane zestawy" ON "public"."flashcards_set_shares" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set" "fs"
  WHERE (("fs"."id" = "flashcards_set_shares"."flashcards_set_id") AND ("fs"."owner_id" = "auth"."uid"()) AND ("fs"."status" = 'accepted'::"public"."flashcards_set_status")))));



CREATE POLICY "Właściciele mogą usuwać udostępnienia" ON "public"."flashcards_set_shares" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards_set_shares"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Właściciele mogą usuwać udostępnienia swoich zestawów" ON "public"."flashcards_set_shares" FOR DELETE TO "authenticated" USING ("public"."is_flashcards_set_owner"("flashcards_set_id"));



ALTER TABLE "public"."flashcards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flashcards_set" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "flashcards_set_delete_policy" ON "public"."flashcards_set" FOR DELETE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "flashcards_set_insert_policy" ON "public"."flashcards_set" FOR INSERT WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "flashcards_set_select_policy" ON "public"."flashcards_set" FOR SELECT USING ((("auth"."uid"() = "owner_id") OR (EXISTS ( SELECT 1
   FROM "public"."flashcards_set_shares"
  WHERE (("flashcards_set_shares"."flashcards_set_id" = "flashcards_set"."id") AND ("flashcards_set_shares"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."flashcards_set_shares" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "flashcards_set_update_policy" ON "public"."flashcards_set" FOR UPDATE USING (("auth"."uid"() = "owner_id"));



ALTER TABLE "public"."flashcards_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session_cards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "session_cards_owner_access" ON "public"."session_cards" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."sessions"
  WHERE (("sessions"."id" = "session_cards"."session_id") AND ("sessions"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sessions_owner_update" ON "public"."sessions" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "użytkownicy mogą wyświetlać własne udostępnienia" ON "public"."flashcards_set_shares" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "użytkownicy mogą wyświetlać zestawy jako właściciel lub u" ON "public"."flashcards_set" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "owner_id") OR (EXISTS ( SELECT 1
   FROM "public"."flashcards_set_shares"
  WHERE (("flashcards_set_shares"."flashcards_set_id" = "flashcards_set"."id") AND ("flashcards_set_shares"."user_id" = "auth"."uid"()))))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON FUNCTION "public"."clone_flashcards_set"("new_owner_id" "uuid", "set_id_to_clone" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."clone_flashcards_set"("new_owner_id" "uuid", "set_id_to_clone" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clone_flashcards_set"("new_owner_id" "uuid", "set_id_to_clone" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."flashcards" TO "anon";
GRANT ALL ON TABLE "public"."flashcards" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_flashcard_and_update_tsv"("p_flashcards_set_id" "uuid", "p_question" "text", "p_answer" "text", "p_source" "public"."flashcard_source") TO "anon";
GRANT ALL ON FUNCTION "public"."create_flashcard_and_update_tsv"("p_flashcards_set_id" "uuid", "p_question" "text", "p_answer" "text", "p_source" "public"."flashcard_source") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_flashcard_and_update_tsv"("p_flashcards_set_id" "uuid", "p_question" "text", "p_answer" "text", "p_source" "public"."flashcard_source") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_user_by_email"("email_query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."find_user_by_email"("email_query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_user_by_email"("email_query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_daily_activity_last_7_days"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_daily_activity_last_7_days"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_daily_activity_last_7_days"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_flashcard_sets_for_user"("p_user_id" "uuid", "p_page" integer, "p_limit" integer, "p_sort_by" "text", "p_sort_order" "text", "p_status" "text", "p_name_search" "text", "p_view" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_flashcard_sets_for_user"("p_user_id" "uuid", "p_page" integer, "p_limit" integer, "p_sort_by" "text", "p_sort_order" "text", "p_status" "text", "p_name_search" "text", "p_view" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_flashcard_sets_for_user"("p_user_id" "uuid", "p_page" integer, "p_limit" integer, "p_sort_by" "text", "p_sort_order" "text", "p_status" "text", "p_name_search" "text", "p_view" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recent_flashcard_sets"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_recent_flashcard_sets"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recent_flashcard_sets"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recent_sessions"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_recent_sessions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recent_sessions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_flashcards_set_owner"("set_id_to_check" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_flashcards_set_owner"("set_id_to_check" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_flashcards_set_owner"("set_id_to_check" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_flashcards_history"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_flashcards_history"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_flashcards_history"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_flashcards_tsv"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_flashcards_tsv"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_flashcards_tsv"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."flashcards_history" TO "anon";
GRANT ALL ON TABLE "public"."flashcards_history" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."flashcards_history_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."flashcards_history_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."flashcards_history_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."flashcards_set" TO "anon";
GRANT ALL ON TABLE "public"."flashcards_set" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards_set" TO "service_role";



GRANT ALL ON TABLE "public"."flashcards_set_shares" TO "anon";
GRANT ALL ON TABLE "public"."flashcards_set_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards_set_shares" TO "service_role";



GRANT ALL ON TABLE "public"."flashcards_tags" TO "anon";
GRANT ALL ON TABLE "public"."flashcards_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards_tags" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."session_cards" TO "anon";
GRANT ALL ON TABLE "public"."session_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."session_cards" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."stats_flashcards_set" TO "anon";
GRANT ALL ON TABLE "public"."stats_flashcards_set" TO "authenticated";
GRANT ALL ON TABLE "public"."stats_flashcards_set" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
