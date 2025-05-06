-- Migracja: Dodanie brakujących polityk RLS dla udostępnionych zestawów
-- Opis: Dodaje polityki RLS dla użytkowników z rolami 'full' i 'learning'
-- Data: 2024-03-19

-- Polityki RLS dla FlashcardsSet - dostęp dla użytkowników z udostępnieniem
create policy "Użytkownicy z udostępnieniem mogą wyświetlać zestawy"
    on flashcards_set for select
    to authenticated
    using (exists (
        select 1 from flashcards_set_shares
        where flashcards_set_id = flashcards_set.id
        and user_id = auth.uid()
    ));

-- Polityki RLS dla Flashcards - dostęp dla użytkowników z rolą 'full'
create policy "Użytkownicy z rolą full mogą modyfikować fiszki"
    on flashcards for all
    to authenticated
    using (exists (
        select 1 from flashcards_set_shares
        where flashcards_set_id = flashcards.flashcards_set_id
        and user_id = auth.uid()
        and role = 'full'
    ));

-- Polityki RLS dla Flashcards - dostęp tylko do odczytu dla użytkowników z rolą 'learning'
create policy "Użytkownicy z rolą learning mogą wyświetlać fiszki"
    on flashcards for select
    to authenticated
    using (exists (
        select 1 from flashcards_set_shares
        where flashcards_set_id = flashcards.flashcards_set_id
        and user_id = auth.uid()
        and role = 'learning'
    ));

-- Polityki RLS dla FlashcardsSet_Shares - modyfikacja i usuwanie
create policy "Właściciele mogą modyfikować udostępnienia"
    on flashcards_set_shares for update
    to authenticated
    using (exists (
        select 1 from flashcards_set
        where id = flashcards_set_shares.flashcards_set_id
        and owner_id = auth.uid()
    ));

create policy "Właściciele mogą usuwać udostępnienia"
    on flashcards_set_shares for delete
    to authenticated
    using (exists (
        select 1 from flashcards_set
        where id = flashcards_set_shares.flashcards_set_id
        and owner_id = auth.uid()
    )); 