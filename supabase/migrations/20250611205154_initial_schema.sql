create type "public"."flashcard_source" as enum ('ai-full', 'ai-edit', 'manual');

create type "public"."flashcards_set_status" as enum ('pending', 'accepted', 'rejected');

create type "public"."session_card_rating" as enum ('again', 'hard', 'good', 'easy');

create type "public"."session_status" as enum ('in_progress', 'completed', 'abandoned');

create type "public"."share_role" as enum ('full', 'learning');

create table "public"."flashcards" (
    "id" uuid not null default gen_random_uuid(),
    "flashcards_set_id" uuid not null,
    "question" text not null,
    "answer" text not null,
    "source" flashcard_source not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."flashcards" enable row level security;

create table "public"."flashcards_set" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid not null,
    "name" character varying(255),
    "status" flashcards_set_status not null default 'pending'::flashcards_set_status,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "description" character varying
);


alter table "public"."flashcards_set" enable row level security;

create table "public"."flashcards_set_shares" (
    "flashcards_set_id" uuid not null,
    "user_id" uuid not null,
    "role" share_role not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."flashcards_set_shares" enable row level security;

create table "public"."flashcards_tags" (
    "flashcard_id" uuid not null,
    "tag_id" uuid not null
);


alter table "public"."flashcards_tags" enable row level security;

create table "public"."session_cards" (
    "session_id" uuid not null,
    "flashcard_id" uuid not null,
    "sequence_no" integer not null,
    "rating" session_card_rating,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."session_cards" enable row level security;

create table "public"."sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "flashcards_set_id" uuid not null,
    "tags" text[] default '{}'::text[],
    "score" integer,
    "created_at" timestamp with time zone not null default now(),
    "ended_at" timestamp with time zone,
    "duration_seconds" integer,
    "status" session_status not null default 'in_progress'::session_status
);


alter table "public"."sessions" enable row level security;

create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(100) not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."tags" enable row level security;

CREATE INDEX flashcards_flashcards_set_id_idx ON public.flashcards USING btree (flashcards_set_id);

CREATE UNIQUE INDEX flashcards_pkey ON public.flashcards USING btree (id);

CREATE INDEX flashcards_set_owner_id_idx ON public.flashcards_set USING btree (owner_id);

CREATE UNIQUE INDEX flashcards_set_pkey ON public.flashcards_set USING btree (id);

CREATE UNIQUE INDEX flashcards_set_shares_pkey ON public.flashcards_set_shares USING btree (flashcards_set_id, user_id);

CREATE INDEX flashcards_set_shares_user_id_idx ON public.flashcards_set_shares USING btree (user_id);

CREATE INDEX flashcards_set_status_idx ON public.flashcards_set USING btree (status);

CREATE UNIQUE INDEX flashcards_tags_pkey ON public.flashcards_tags USING btree (flashcard_id, tag_id);

CREATE INDEX session_cards_flashcard_id_idx ON public.session_cards USING btree (flashcard_id);

CREATE UNIQUE INDEX session_cards_pkey ON public.session_cards USING btree (session_id, flashcard_id);

CREATE INDEX session_cards_rating_idx ON public.session_cards USING btree (rating);

CREATE INDEX session_cards_session_id_idx ON public.session_cards USING btree (session_id);

CREATE INDEX sessions_flashcards_set_id_idx ON public.sessions USING btree (flashcards_set_id);

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (id);

CREATE INDEX sessions_status_idx ON public.sessions USING btree (status);

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);

CREATE INDEX tags_name_idx ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."flashcards" add constraint "flashcards_pkey" PRIMARY KEY using index "flashcards_pkey";

alter table "public"."flashcards_set" add constraint "flashcards_set_pkey" PRIMARY KEY using index "flashcards_set_pkey";

alter table "public"."flashcards_set_shares" add constraint "flashcards_set_shares_pkey" PRIMARY KEY using index "flashcards_set_shares_pkey";

alter table "public"."flashcards_tags" add constraint "flashcards_tags_pkey" PRIMARY KEY using index "flashcards_tags_pkey";

alter table "public"."session_cards" add constraint "session_cards_pkey" PRIMARY KEY using index "session_cards_pkey";

alter table "public"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."flashcards" add constraint "flashcards_flashcards_set_id_fkey" FOREIGN KEY (flashcards_set_id) REFERENCES flashcards_set(id) ON DELETE CASCADE not valid;

alter table "public"."flashcards" validate constraint "flashcards_flashcards_set_id_fkey";

alter table "public"."flashcards_set" add constraint "flashcards_set_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."flashcards_set" validate constraint "flashcards_set_owner_id_fkey";

alter table "public"."flashcards_set_shares" add constraint "flashcards_set_shares_flashcards_set_id_fkey" FOREIGN KEY (flashcards_set_id) REFERENCES flashcards_set(id) ON DELETE CASCADE not valid;

alter table "public"."flashcards_set_shares" validate constraint "flashcards_set_shares_flashcards_set_id_fkey";

alter table "public"."flashcards_set_shares" add constraint "flashcards_set_shares_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."flashcards_set_shares" validate constraint "flashcards_set_shares_user_id_fkey";

alter table "public"."flashcards_tags" add constraint "flashcards_tags_flashcard_id_fkey" FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE not valid;

alter table "public"."flashcards_tags" validate constraint "flashcards_tags_flashcard_id_fkey";

alter table "public"."flashcards_tags" add constraint "flashcards_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."flashcards_tags" validate constraint "flashcards_tags_tag_id_fkey";

alter table "public"."session_cards" add constraint "session_cards_flashcard_id_fkey" FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE not valid;

alter table "public"."session_cards" validate constraint "session_cards_flashcard_id_fkey";

alter table "public"."session_cards" add constraint "session_cards_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE not valid;

alter table "public"."session_cards" validate constraint "session_cards_session_id_fkey";

alter table "public"."sessions" add constraint "sessions_flashcards_set_id_fkey" FOREIGN KEY (flashcards_set_id) REFERENCES flashcards_set(id) ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_flashcards_set_id_fkey";

alter table "public"."sessions" add constraint "sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_user_id_fkey";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$
;

grant delete on table "public"."flashcards" to "anon";

grant insert on table "public"."flashcards" to "anon";

grant references on table "public"."flashcards" to "anon";

grant select on table "public"."flashcards" to "anon";

grant trigger on table "public"."flashcards" to "anon";

grant truncate on table "public"."flashcards" to "anon";

grant update on table "public"."flashcards" to "anon";

grant delete on table "public"."flashcards" to "authenticated";

grant insert on table "public"."flashcards" to "authenticated";

grant references on table "public"."flashcards" to "authenticated";

grant select on table "public"."flashcards" to "authenticated";

grant trigger on table "public"."flashcards" to "authenticated";

grant truncate on table "public"."flashcards" to "authenticated";

grant update on table "public"."flashcards" to "authenticated";

grant delete on table "public"."flashcards" to "service_role";

grant insert on table "public"."flashcards" to "service_role";

grant references on table "public"."flashcards" to "service_role";

grant select on table "public"."flashcards" to "service_role";

grant trigger on table "public"."flashcards" to "service_role";

grant truncate on table "public"."flashcards" to "service_role";

grant update on table "public"."flashcards" to "service_role";

grant delete on table "public"."flashcards_set" to "anon";

grant insert on table "public"."flashcards_set" to "anon";

grant references on table "public"."flashcards_set" to "anon";

grant select on table "public"."flashcards_set" to "anon";

grant trigger on table "public"."flashcards_set" to "anon";

grant truncate on table "public"."flashcards_set" to "anon";

grant update on table "public"."flashcards_set" to "anon";

grant delete on table "public"."flashcards_set" to "authenticated";

grant insert on table "public"."flashcards_set" to "authenticated";

grant references on table "public"."flashcards_set" to "authenticated";

grant select on table "public"."flashcards_set" to "authenticated";

grant trigger on table "public"."flashcards_set" to "authenticated";

grant truncate on table "public"."flashcards_set" to "authenticated";

grant update on table "public"."flashcards_set" to "authenticated";

grant delete on table "public"."flashcards_set" to "service_role";

grant insert on table "public"."flashcards_set" to "service_role";

grant references on table "public"."flashcards_set" to "service_role";

grant select on table "public"."flashcards_set" to "service_role";

grant trigger on table "public"."flashcards_set" to "service_role";

grant truncate on table "public"."flashcards_set" to "service_role";

grant update on table "public"."flashcards_set" to "service_role";

grant delete on table "public"."flashcards_set_shares" to "anon";

grant insert on table "public"."flashcards_set_shares" to "anon";

grant references on table "public"."flashcards_set_shares" to "anon";

grant select on table "public"."flashcards_set_shares" to "anon";

grant trigger on table "public"."flashcards_set_shares" to "anon";

grant truncate on table "public"."flashcards_set_shares" to "anon";

grant update on table "public"."flashcards_set_shares" to "anon";

grant delete on table "public"."flashcards_set_shares" to "authenticated";

grant insert on table "public"."flashcards_set_shares" to "authenticated";

grant references on table "public"."flashcards_set_shares" to "authenticated";

grant select on table "public"."flashcards_set_shares" to "authenticated";

grant trigger on table "public"."flashcards_set_shares" to "authenticated";

grant truncate on table "public"."flashcards_set_shares" to "authenticated";

grant update on table "public"."flashcards_set_shares" to "authenticated";

grant delete on table "public"."flashcards_set_shares" to "service_role";

grant insert on table "public"."flashcards_set_shares" to "service_role";

grant references on table "public"."flashcards_set_shares" to "service_role";

grant select on table "public"."flashcards_set_shares" to "service_role";

grant trigger on table "public"."flashcards_set_shares" to "service_role";

grant truncate on table "public"."flashcards_set_shares" to "service_role";

grant update on table "public"."flashcards_set_shares" to "service_role";

grant delete on table "public"."flashcards_tags" to "anon";

grant insert on table "public"."flashcards_tags" to "anon";

grant references on table "public"."flashcards_tags" to "anon";

grant select on table "public"."flashcards_tags" to "anon";

grant trigger on table "public"."flashcards_tags" to "anon";

grant truncate on table "public"."flashcards_tags" to "anon";

grant update on table "public"."flashcards_tags" to "anon";

grant delete on table "public"."flashcards_tags" to "authenticated";

grant insert on table "public"."flashcards_tags" to "authenticated";

grant references on table "public"."flashcards_tags" to "authenticated";

grant select on table "public"."flashcards_tags" to "authenticated";

grant trigger on table "public"."flashcards_tags" to "authenticated";

grant truncate on table "public"."flashcards_tags" to "authenticated";

grant update on table "public"."flashcards_tags" to "authenticated";

grant delete on table "public"."flashcards_tags" to "service_role";

grant insert on table "public"."flashcards_tags" to "service_role";

grant references on table "public"."flashcards_tags" to "service_role";

grant select on table "public"."flashcards_tags" to "service_role";

grant trigger on table "public"."flashcards_tags" to "service_role";

grant truncate on table "public"."flashcards_tags" to "service_role";

grant update on table "public"."flashcards_tags" to "service_role";

grant delete on table "public"."session_cards" to "anon";

grant insert on table "public"."session_cards" to "anon";

grant references on table "public"."session_cards" to "anon";

grant select on table "public"."session_cards" to "anon";

grant trigger on table "public"."session_cards" to "anon";

grant truncate on table "public"."session_cards" to "anon";

grant update on table "public"."session_cards" to "anon";

grant delete on table "public"."session_cards" to "authenticated";

grant insert on table "public"."session_cards" to "authenticated";

grant references on table "public"."session_cards" to "authenticated";

grant select on table "public"."session_cards" to "authenticated";

grant trigger on table "public"."session_cards" to "authenticated";

grant truncate on table "public"."session_cards" to "authenticated";

grant update on table "public"."session_cards" to "authenticated";

grant delete on table "public"."session_cards" to "service_role";

grant insert on table "public"."session_cards" to "service_role";

grant references on table "public"."session_cards" to "service_role";

grant select on table "public"."session_cards" to "service_role";

grant trigger on table "public"."session_cards" to "service_role";

grant truncate on table "public"."session_cards" to "service_role";

grant update on table "public"."session_cards" to "service_role";

grant delete on table "public"."sessions" to "anon";

grant insert on table "public"."sessions" to "anon";

grant references on table "public"."sessions" to "anon";

grant select on table "public"."sessions" to "anon";

grant trigger on table "public"."sessions" to "anon";

grant truncate on table "public"."sessions" to "anon";

grant update on table "public"."sessions" to "anon";

grant delete on table "public"."sessions" to "authenticated";

grant insert on table "public"."sessions" to "authenticated";

grant references on table "public"."sessions" to "authenticated";

grant select on table "public"."sessions" to "authenticated";

grant trigger on table "public"."sessions" to "authenticated";

grant truncate on table "public"."sessions" to "authenticated";

grant update on table "public"."sessions" to "authenticated";

grant delete on table "public"."sessions" to "service_role";

grant insert on table "public"."sessions" to "service_role";

grant references on table "public"."sessions" to "service_role";

grant select on table "public"."sessions" to "service_role";

grant trigger on table "public"."sessions" to "service_role";

grant truncate on table "public"."sessions" to "service_role";

grant update on table "public"."sessions" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

create policy "Użytkownicy mogą aktualizować fiszki w swoich zestawach"
on "public"."flashcards"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM flashcards_set
  WHERE ((flashcards_set.id = flashcards.flashcards_set_id) AND (flashcards_set.owner_id = auth.uid())))));


create policy "Użytkownicy mogą dodawać fiszki do swoich zestawów"
on "public"."flashcards"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM flashcards_set
  WHERE ((flashcards_set.id = flashcards.flashcards_set_id) AND (flashcards_set.owner_id = auth.uid())))));


create policy "Użytkownicy mogą usuwać fiszki ze swoich zestawów"
on "public"."flashcards"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM flashcards_set
  WHERE ((flashcards_set.id = flashcards.flashcards_set_id) AND (flashcards_set.owner_id = auth.uid())))));


create policy "Użytkownicy mogą wyświetlać fiszki z ich zestawów"
on "public"."flashcards"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM flashcards_set
  WHERE ((flashcards_set.id = flashcards.flashcards_set_id) AND (flashcards_set.owner_id = auth.uid())))));


create policy "Użytkownicy z rolą full mogą modyfikować fiszki"
on "public"."flashcards"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM flashcards_set_shares
  WHERE ((flashcards_set_shares.flashcards_set_id = flashcards.flashcards_set_id) AND (flashcards_set_shares.user_id = auth.uid()) AND (flashcards_set_shares.role = 'full'::share_role)))));


create policy "Użytkownicy z rolą learning mogą wyświetlać fiszki"
on "public"."flashcards"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM flashcards_set_shares
  WHERE ((flashcards_set_shares.flashcards_set_id = flashcards.flashcards_set_id) AND (flashcards_set_shares.user_id = auth.uid()) AND (flashcards_set_shares.role = 'learning'::share_role)))));


create policy "Właściciele mogą aktualizować swoje zestawy"
on "public"."flashcards_set"
as permissive
for update
to authenticated
using ((auth.uid() = owner_id));


create policy "Właściciele mogą tworzyć zestawy"
on "public"."flashcards_set"
as permissive
for insert
to authenticated
with check ((auth.uid() = owner_id));


create policy "Właściciele mogą usuwać swoje zestawy"
on "public"."flashcards_set"
as permissive
for delete
to authenticated
using ((auth.uid() = owner_id));


create policy "flashcards_set_delete_policy"
on "public"."flashcards_set"
as permissive
for delete
to public
using ((auth.uid() = owner_id));


create policy "flashcards_set_insert_policy"
on "public"."flashcards_set"
as permissive
for insert
to public
with check ((auth.uid() = owner_id));


create policy "flashcards_set_select_policy"
on "public"."flashcards_set"
as permissive
for select
to public
using (((auth.uid() = owner_id) OR (EXISTS ( SELECT 1
   FROM flashcards_set_shares
  WHERE ((flashcards_set_shares.flashcards_set_id = flashcards_set.id) AND (flashcards_set_shares.user_id = auth.uid()))))));


create policy "flashcards_set_update_policy"
on "public"."flashcards_set"
as permissive
for update
to public
using ((auth.uid() = owner_id));


create policy "użytkownicy mogą wyświetlać zestawy jako właściciel lub u"
on "public"."flashcards_set"
as permissive
for select
to authenticated
using (((auth.uid() = owner_id) OR (EXISTS ( SELECT 1
   FROM flashcards_set_shares
  WHERE ((flashcards_set_shares.flashcards_set_id = flashcards_set.id) AND (flashcards_set_shares.user_id = auth.uid()))))));


create policy "Właściciele mogą modyfikować udostępnienia"
on "public"."flashcards_set_shares"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM flashcards_set
  WHERE ((flashcards_set.id = flashcards_set_shares.flashcards_set_id) AND (flashcards_set.owner_id = auth.uid())))));


create policy "Właściciele mogą udostępniać swoje zestawy"
on "public"."flashcards_set_shares"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM flashcards_set
  WHERE ((flashcards_set.id = flashcards_set_shares.flashcards_set_id) AND (flashcards_set.owner_id = auth.uid())))));


create policy "Właściciele mogą usuwać udostępnienia"
on "public"."flashcards_set_shares"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM flashcards_set
  WHERE ((flashcards_set.id = flashcards_set_shares.flashcards_set_id) AND (flashcards_set.owner_id = auth.uid())))));


create policy "użytkownicy mogą wyświetlać własne udostępnienia"
on "public"."flashcards_set_shares"
as permissive
for select
to authenticated
using ((user_id = auth.uid()));


create policy "Użytkownicy mogą dodawać tagi do swoich fiszek"
on "public"."flashcards_tags"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM (flashcards f
     JOIN flashcards_set fs ON ((f.flashcards_set_id = fs.id)))
  WHERE ((f.id = flashcards_tags.flashcard_id) AND (fs.owner_id = auth.uid())))));


create policy "Użytkownicy mogą wyświetlać powiązania tagów z fiszkami"
on "public"."flashcards_tags"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM (flashcards f
     JOIN flashcards_set fs ON ((f.flashcards_set_id = fs.id)))
  WHERE ((f.id = flashcards_tags.flashcard_id) AND (fs.owner_id = auth.uid())))));


create policy "session_cards_owner_access"
on "public"."session_cards"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM sessions
  WHERE ((sessions.id = session_cards.session_id) AND (sessions.user_id = auth.uid())))));


create policy "Użytkownicy mogą tworzyć swoje sesje"
on "public"."sessions"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "Użytkownicy mogą wyświetlać swoje sesje"
on "public"."sessions"
as permissive
for select
to authenticated
using ((user_id = auth.uid()));


create policy "sessions_owner_update"
on "public"."sessions"
as permissive
for update
to authenticated
using ((user_id = auth.uid()));


create policy "Użytkownicy mogą tworzyć tagi"
on "public"."tags"
as permissive
for insert
to authenticated
with check (true);


create policy "Wszyscy mogą wyświetlać tagi"
on "public"."tags"
as permissive
for select
to authenticated
using (true);


CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.flashcards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_set_updated_at BEFORE UPDATE ON public.flashcards_set FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_set_shares_updated_at BEFORE UPDATE ON public.flashcards_set_shares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


