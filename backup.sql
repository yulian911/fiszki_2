

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


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."flashcards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "flashcards_set_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "source" "public"."flashcard_source" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."flashcards" OWNER TO "postgres";


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
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."flashcards_set_shares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flashcards_tags" (
    "flashcard_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."flashcards_tags" OWNER TO "postgres";


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


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


ALTER TABLE ONLY "public"."flashcards"
    ADD CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcards_set"
    ADD CONSTRAINT "flashcards_set_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcards_set_shares"
    ADD CONSTRAINT "flashcards_set_shares_pkey" PRIMARY KEY ("flashcards_set_id", "user_id");



ALTER TABLE ONLY "public"."flashcards_tags"
    ADD CONSTRAINT "flashcards_tags_pkey" PRIMARY KEY ("flashcard_id", "tag_id");



ALTER TABLE ONLY "public"."session_cards"
    ADD CONSTRAINT "session_cards_pkey" PRIMARY KEY ("session_id", "flashcard_id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



CREATE INDEX "flashcards_flashcards_set_id_idx" ON "public"."flashcards" USING "btree" ("flashcards_set_id");



CREATE INDEX "flashcards_set_owner_id_idx" ON "public"."flashcards_set" USING "btree" ("owner_id");



CREATE INDEX "flashcards_set_shares_user_id_idx" ON "public"."flashcards_set_shares" USING "btree" ("user_id");



CREATE INDEX "flashcards_set_status_idx" ON "public"."flashcards_set" USING "btree" ("status");



CREATE INDEX "session_cards_flashcard_id_idx" ON "public"."session_cards" USING "btree" ("flashcard_id");



CREATE INDEX "session_cards_rating_idx" ON "public"."session_cards" USING "btree" ("rating");



CREATE INDEX "session_cards_session_id_idx" ON "public"."session_cards" USING "btree" ("session_id");



CREATE INDEX "sessions_flashcards_set_id_idx" ON "public"."sessions" USING "btree" ("flashcards_set_id");



CREATE INDEX "sessions_status_idx" ON "public"."sessions" USING "btree" ("status");



CREATE INDEX "sessions_user_id_idx" ON "public"."sessions" USING "btree" ("user_id");



CREATE INDEX "tags_name_idx" ON "public"."tags" USING "btree" ("name");



CREATE OR REPLACE TRIGGER "update_flashcards_set_shares_updated_at" BEFORE UPDATE ON "public"."flashcards_set_shares" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_flashcards_set_updated_at" BEFORE UPDATE ON "public"."flashcards_set" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_flashcards_updated_at" BEFORE UPDATE ON "public"."flashcards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



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



ALTER TABLE ONLY "public"."session_cards"
    ADD CONSTRAINT "session_cards_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_cards"
    ADD CONSTRAINT "session_cards_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_flashcards_set_id_fkey" FOREIGN KEY ("flashcards_set_id") REFERENCES "public"."flashcards_set"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



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



CREATE POLICY "Użytkownicy mogą tworzyć swoje sesje" ON "public"."sessions" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Użytkownicy mogą tworzyć tagi" ON "public"."tags" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Użytkownicy mogą usuwać fiszki ze swoich zestawów" ON "public"."flashcards" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



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



CREATE POLICY "Właściciele mogą aktualizować swoje zestawy" ON "public"."flashcards_set" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Właściciele mogą modyfikować udostępnienia" ON "public"."flashcards_set_shares" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards_set_shares"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Właściciele mogą tworzyć zestawy" ON "public"."flashcards_set" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Właściciele mogą udostępniać swoje zestawy" ON "public"."flashcards_set_shares" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards_set_shares"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



CREATE POLICY "Właściciele mogą usuwać swoje zestawy" ON "public"."flashcards_set" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Właściciele mogą usuwać udostępnienia" ON "public"."flashcards_set_shares" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."flashcards_set"
  WHERE (("flashcards_set"."id" = "flashcards_set_shares"."flashcards_set_id") AND ("flashcards_set"."owner_id" = "auth"."uid"())))));



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








































































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."flashcards" TO "anon";
GRANT ALL ON TABLE "public"."flashcards" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards" TO "service_role";



GRANT ALL ON TABLE "public"."flashcards_set" TO "anon";
GRANT ALL ON TABLE "public"."flashcards_set" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards_set" TO "service_role";



GRANT ALL ON TABLE "public"."flashcards_set_shares" TO "anon";
GRANT ALL ON TABLE "public"."flashcards_set_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards_set_shares" TO "service_role";



GRANT ALL ON TABLE "public"."flashcards_tags" TO "anon";
GRANT ALL ON TABLE "public"."flashcards_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards_tags" TO "service_role";



GRANT ALL ON TABLE "public"."session_cards" TO "anon";
GRANT ALL ON TABLE "public"."session_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."session_cards" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



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
