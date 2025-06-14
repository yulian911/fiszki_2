# Instrukcja: Klonowanie zdalnej bazy Supabase do środowiska lokalnego

Ten przewodnik krok po kroku opisuje, jak pobrać całą bazę danych (schemat i dane) z hostowanego projektu Supabase i uruchomić ją lokalnie na komputerze deweloperskim z systemem Windows, używając Dockera. Uwzględnia on potencjalne problemy i ich rozwiązania.

---

### Krok 0: Wymagania wstępne

Przed rozpoczęciem upewnij się, że masz zainstalowane:
instalacja scoop
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

1.  **[Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)**: Narzędzie do zarządzania projektami Supabase z wiersza poleceń.
    - _Uwaga:_ W trakcie naszej pracy napotkaliśmy problemy z instalacją przez `scoop`. Jeśli komenda `supabase` nie działa, odinstaluj ją całkowicie i zainstaluj ponownie:
      ```bash
      scoop uninstall supabase; scoop cache rm supabase; scoop install supabase
      ```
2.  **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Supabase używa Dockera do uruchamiania całego lokalnego środowiska (bazy danych, serwera autoryzacji itp.).

---

### Krok 1: Uruchom Docker Desktop

**Docker musi być uruchomiony, zanim zaczniesz pracować z Supabase CLI.**
Uruchom aplikację Docker Desktop z menu Start i poczekaj, aż w pełni się załaduje (ikona wieloryba w zasobniku systemowym przestanie się animować).

---

### Krok 2: Zaloguj się i połącz projekt

Otwórz terminal (np. PowerShell) w folderze swojego projektu.

1.  **Zaloguj się na swoje konto Supabase:**

    ```bash
    supabase login
    ```

    Spowoduje to otwarcie przeglądarki w celu autoryzacji.

2.  **Znajdź ID (Ref) swojego projektu:**
    Znajdziesz je w panelu projektu na [supabase.com](https://supabase.com) w zakładce **Settings -> General**.

3.  **Połącz lokalny folder ze zdalnym projektem:**
    Użyj poniższej komendy, podmieniając `<id-projektu>` na swój identyfikator.
    ```bash
    supabase link --project-ref surfqiladpgaksipotns
    ```
    - Zostaniesz poproszony o hasło. **Ważne:** Podaj hasło do **bazy danych**, a nie do konta Supabase. Znajdziesz je (lub zresetujesz) w panelu projektu w **Settings -> Database**.

---

### Krok 3: Pobierz zrzut (dump) zdalnej bazy

Teraz, gdy CLI wie, z którym projektem się komunikować, pobierz całą bazę danych do pliku. Ta komenda stworzy plik `backup.sql` w Twoim folderze.

```bash
supabase db dump -f backup.sql
```

---

### Krok 4: Uruchom lokalne środowisko

Ta komenda uruchomi wszystkie kontenery Dockera potrzebne do działania Supabase lokalnie.

```bash
supabase start
```

---

### Krok 5: Przywróć bazę danych lokalnie (metoda z Dockerem)

Aby uniknąć instalowania dodatkowych narzędzi (`psql`), uruchomimy je bezpośrednio w kontenerze Dockera.

1.  **Znajdź nazwę kontenera z bazą danych:**

    ```bash
    docker ps
    ```

    Znajdź na liście kontener, którego nazwa zaczyna się od `supabase_db_...` (np. `supabase_db_fiszki_v2`).

2.  **Uruchom komendę importu:**
    Użyj poniższej komendy, podmieniając `NAZWA_KONTENERA` na tę znalezioną w poprzednim punkcie.
    ```bash
    cat backup.sql | docker exec -i NAZWA_KONTENERA psql -U postgres
    ```
    _Przykład:_
    ```bash
    cat backup.sql | docker exec -i supabase_db_fiszki_v2 psql -U postgres
    ```

Po wykonaniu tej komendy Twoja lokalna baza danych będzie zawierała wszystkie dane i tabele ze zdalnej bazy.

---

### Krok 6: Wygeneruj migrację początkową

Twoja lokalna baza danych jest już gotowa, ale folder `supabase/migrations` jest pusty. Musimy je zsynchronizować, generując plik migracji na podstawie stanu bazy.

```bash
supabase db diff -f initial_schema
```

Ta komenda utworzy plik w folderze `supabase/migrations`, który będzie reprezentował całą strukturę Twojej bazy danych. Od teraz możesz tworzyć nowe migracje dla kolejnych zmian.

utworzenie typów

supabase gen types typescript --local > src/db/database.types.ts

**Gratulacje! Twój projekt jest w pełni skonfigurowany do pracy lokalnej.**
