-- migracja: poprawa rekurencji rls dla flashcards_set i flashcards_set_shares
-- opis: łączy polityki select na flashcards_set w jedną i upraszcza politykę select na flashcards_set_shares
-- data: 2024-03-19

-- usunięcie istniejących polityk select na flashcards_set
alter table flashcards_set drop policy "Właściciele mogą wyświetlać swoje zestawy";
alter table flashcards_set drop policy "Użytkownicy z udostępnieniem mogą wyświetlać zestawy";

-- utworzenie pojedynczej polityki select dla flashcards_set
create policy "użytkownicy mogą wyświetlać zestawy jako właściciel lub udostępniony"
    on flashcards_set for select
    to authenticated
    using (
        auth.uid() = owner_id
        or exists (
            select 1 from flashcards_set_shares
            where flashcards_set_id = flashcards_set.id
              and user_id = auth.uid()
        )
    );

-- usunięcie polityki select na flashcards_set_shares powodującej rekurencję
alter table flashcards_set_shares drop policy "Użytkownicy mogą wyświetlać udostępnienia dla ich zestawów";

-- utworzenie uproszczonej polityki select dla flashcards_set_shares
create policy "użytkownicy mogą wyświetlać własne udostępnienia"
    on flashcards_set_shares for select
    to authenticated
    using (user_id = auth.uid()); 