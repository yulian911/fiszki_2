## Dla systemów Unix/Linux

```bash
git log --since="1 year ago" --pretty=format:"" --name-only --no-merges | \
 grep -vE "${EXCLUDE_PATTERN_GREP:-^$}" | \
 grep '.' | \
 sort | \
 uniq -c | \
 sort -nr | \
 head -n 10 | \
 awk '{count=$1; $1=""; sub(/^[ \t]+/, ""); print $0 ": " count " changes"}' | cat
```

### Wersja do kopiowania (Unix/Linux)

```bash
git log --since="1 year ago" --pretty=format:"" --name-only --no-merges | grep -vE "${EXCLUDE_PATTERN_GREP:-^$}" | grep '.' | sort | uniq -c | sort -nr | head -n 10 | awk '{count=$1; $1=""; sub(/^[ \t]+/, ""); print $0 ": " count " changes"}' | cat
```

### Omówienie poleceń (Unix/Linux)

- `git log --since="1 year ago"`: pobiera historię commitów z ostatniego roku.
- `--pretty=format:""`: usuwa opis commitów, pozostawiając tylko nazwy plików.
- `--name-only`: wyświetla tylko nazwy zmienionych plików.
- `--no-merges`: wyklucza merge commity, co daje czystszy obraz zmian.
- `grep -vE "${EXCLUDE_PATTERN_GREP:-^$}"`: filtruje niechciane pliki według wzorca regex.
- `grep '.'`: usuwa puste linie.
- `sort | uniq -c`: zlicza wystąpienia każdego pliku.
- `sort -nr`: sortuje malejąco według liczby zmian.
- `head -n 10`: wybiera 10 najczęściej modyfikowanych plików.
- `awk '{...}'`: formatuje wynik do czytelnej postaci "nazwa_pliku: X changes".

## Ustawianie EXCLUDE_PATTERN_GREP

Możesz ustawić zmienną, aby wykluczyć pewne typy plików:

- **Wykluczenie plików konfiguracyjnych:**

  ```bash
  EXCLUDE_PATTERN_GREP='(\.yml$|\.yaml$|\.config\.js$)'
  ```

- **Wykluczenie testów i dokumentacji:**

  ```bash
  EXCLUDE_PATTERN_GREP='(test|spec|docs?/)'
  ```

- **Wykluczenie plików z node_modules i build:**

  ```bash
  EXCLUDE_PATTERN_GREP='(node_modules|dist|build|\.gitignore)'
  ```

- **Złożony wzorzec wykluczający wiele typów plików:**

  ```bash
  EXCLUDE_PATTERN_GREP='(\.svg$|\.png$|\.jpg$|package-lock\.json|yarn\.lock|\.md$)'
  ```

- **Przykład użycia w skrypcie:**

  ```bash
  EXCLUDE_PATTERN_GREP='(test|spec)'
  ```

> Właściwe ustawienie EXCLUDE_PATTERN_GREP najlepiej ustalić przy uruchomieniu skryptu. Jeżeli w top10 pojawią się pliki, które niewiele wnoszą do analizy hot spotów (np. package.json, pliki i18n, fonty), warto dodać je do wykluczeń.

## Dla Windows

Rekomendowanym sposobem jest wykorzystanie tego samego skryptu przez Git Bash lub Windows Subsystem for Linux (WSL).

Alternatywnie przygotowaliśmy skrypt PowerShell:

```powershell
git log --since="1 year ago" --pretty=format:"" --name-only --no-merges | \
 grep -vE "${EXCLUDE_PATTERN_GREP:-^$}" | \
 grep '.' | \
 sort | \
 uniq -c | \
 sort -nr | \
 head -n 10 | \
 awk '{count=$1; $1=""; sub(/^[ \t]+/, ""); print $0 ": " count " changes"}' | cat
```

### Wersja do kopiowania (Windows)

```powershell
git log --since="1 year ago" --pretty=format:"" --name-only --no-merges | Where-Object { $_ -match '\S' } | Where-Object { $_ -notmatch "(package\.json$|package-lock\.json$|yarn\.lock$|^node_modules/|^dist/|^build/|\.log$|\.svg$|\.png$|\.ico$|\.map$|\.d\.ts$|README\.md$|\.gitignore$|CHANGELOG\.md$|LICENSE$)" } | Group-Object | Sort-Object -Property Count -Descending | Select-Object -First 10 | ForEach-Object { "$($_.Name): $($_.Count) changes" }
```
