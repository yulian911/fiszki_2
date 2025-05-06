-- Migracja: Utworzenie podstawowej struktury bazy danych dla aplikacji Inteligentne Fiszki
-- Opis: Tworzy tabele FlashcardsSet, Flashcards, FlashcardsSet_Shares, Sessions, Tags i Flashcards_Tags
-- Data: 2024-03-19

-- Włączenie rozszerzenia pgcrypto dla generowania UUID
create extension if not exists "pgcrypto";

-- Utworzenie typu enum dla źródła fiszek
create type flashcard_source as enum ('ai-full', 'ai-edit', 'manual');

-- Utworzenie typu enum dla statusu zestawu fiszek
create type flashcards_set_status as enum ('pending', 'accepted', 'rejected');

-- Utworzenie typu enum dla roli użytkownika w udostępnionym zestawie
create type share_role as enum ('full', 'learning');

-- Tabela: FlashcardsSet
create table flashcards_set (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users(id) on delete cascade,
    name varchar(255),
    status flashcards_set_status not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla FlashcardsSet
alter table flashcards_set enable row level security;

-- Polityki RLS dla FlashcardsSet
create policy "Właściciele mogą wyświetlać swoje zestawy"
    on flashcards_set for select
    to authenticated
    using (auth.uid() = owner_id);

create policy "Właściciele mogą tworzyć zestawy"
    on flashcards_set for insert
    to authenticated
    with check (auth.uid() = owner_id);

create policy "Właściciele mogą aktualizować swoje zestawy"
    on flashcards_set for update
    to authenticated
    using (auth.uid() = owner_id);

create policy "Właściciele mogą usuwać swoje zestawy"
    on flashcards_set for delete
    to authenticated
    using (auth.uid() = owner_id);

-- Tabela: Flashcards
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    flashcards_set_id uuid not null references flashcards_set(id) on delete cascade,
    question text not null,
    answer text not null,
    source flashcard_source not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla Flashcards
alter table flashcards enable row level security;

-- Polityki RLS dla Flashcards
create policy "Użytkownicy mogą wyświetlać fiszki z ich zestawów"
    on flashcards for select
    to authenticated
    using (exists (
        select 1 from flashcards_set
        where id = flashcards.flashcards_set_id
        and owner_id = auth.uid()
    ));

create policy "Użytkownicy mogą dodawać fiszki do swoich zestawów"
    on flashcards for insert
    to authenticated
    with check (exists (
        select 1 from flashcards_set
        where id = flashcards.flashcards_set_id
        and owner_id = auth.uid()
    ));

create policy "Użytkownicy mogą aktualizować fiszki w swoich zestawach"
    on flashcards for update
    to authenticated
    using (exists (
        select 1 from flashcards_set
        where id = flashcards.flashcards_set_id
        and owner_id = auth.uid()
    ));

create policy "Użytkownicy mogą usuwać fiszki ze swoich zestawów"
    on flashcards for delete
    to authenticated
    using (exists (
        select 1 from flashcards_set
        where id = flashcards.flashcards_set_id
        and owner_id = auth.uid()
    ));

-- Tabela: FlashcardsSet_Shares
create table flashcards_set_shares (
    flashcards_set_id uuid not null references flashcards_set(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role share_role not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (flashcards_set_id, user_id)
);

-- Włączenie RLS dla FlashcardsSet_Shares
alter table flashcards_set_shares enable row level security;

-- Polityki RLS dla FlashcardsSet_Shares
create policy "Użytkownicy mogą wyświetlać udostępnienia dla ich zestawów"
    on flashcards_set_shares for select
    to authenticated
    using (exists (
        select 1 from flashcards_set
        where id = flashcards_set_shares.flashcards_set_id
        and owner_id = auth.uid()
    ) or user_id = auth.uid());

create policy "Właściciele mogą udostępniać swoje zestawy"
    on flashcards_set_shares for insert
    to authenticated
    with check (exists (
        select 1 from flashcards_set
        where id = flashcards_set_shares.flashcards_set_id
        and owner_id = auth.uid()
    ));

-- Tabela: Sessions
create table sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    flashcards_set_id uuid not null references flashcards_set(id) on delete cascade,
    tags text[] default '{}',
    score integer,
    created_at timestamptz not null default now()
);

-- Włączenie RLS dla Sessions
alter table sessions enable row level security;

-- Polityki RLS dla Sessions
create policy "Użytkownicy mogą wyświetlać swoje sesje"
    on sessions for select
    to authenticated
    using (user_id = auth.uid());

create policy "Użytkownicy mogą tworzyć swoje sesje"
    on sessions for insert
    to authenticated
    with check (user_id = auth.uid());

-- Tabela: Tags
create table tags (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla Tags
alter table tags enable row level security;

-- Polityki RLS dla Tags (publiczny dostęp do odczytu)
create policy "Wszyscy mogą wyświetlać tagi"
    on tags for select
    to authenticated
    using (true);

create policy "Użytkownicy mogą tworzyć tagi"
    on tags for insert
    to authenticated
    with check (true);

-- Tabela: Flashcards_Tags
create table flashcards_tags (
    flashcard_id uuid not null references flashcards(id) on delete cascade,
    tag_id uuid not null references tags(id) on delete cascade,
    primary key (flashcard_id, tag_id)
);

-- Włączenie RLS dla Flashcards_Tags
alter table flashcards_tags enable row level security;

-- Polityki RLS dla Flashcards_Tags
create policy "Użytkownicy mogą wyświetlać powiązania tagów z fiszkami"
    on flashcards_tags for select
    to authenticated
    using (exists (
        select 1 from flashcards f
        join flashcards_set fs on f.flashcards_set_id = fs.id
        where f.id = flashcards_tags.flashcard_id
        and fs.owner_id = auth.uid()
    ));

create policy "Użytkownicy mogą dodawać tagi do swoich fiszek"
    on flashcards_tags for insert
    to authenticated
    with check (exists (
        select 1 from flashcards f
        join flashcards_set fs on f.flashcards_set_id = fs.id
        where f.id = flashcards_tags.flashcard_id
        and fs.owner_id = auth.uid()
    ));

-- Indeksy
create index flashcards_set_owner_id_idx on flashcards_set(owner_id);
create index flashcards_flashcards_set_id_idx on flashcards(flashcards_set_id);
create index flashcards_set_shares_user_id_idx on flashcards_set_shares(user_id);
create index sessions_user_id_idx on sessions(user_id);
create index sessions_flashcards_set_id_idx on sessions(flashcards_set_id);
create index tags_name_idx on tags(name);

-- Trigger dla aktualizacji updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_flashcards_set_updated_at
    before update on flashcards_set
    for each row
    execute function update_updated_at_column();

create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

create trigger update_flashcards_set_shares_updated_at
    before update on flashcards_set_shares
    for each row
    execute function update_updated_at_column();

create trigger update_tags_updated_at
    before update on tags
    for each row
    execute function update_updated_at_column(); 