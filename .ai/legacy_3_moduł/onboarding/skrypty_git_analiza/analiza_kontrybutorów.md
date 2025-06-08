# Analiza kontrybutorów

Ten skrypt identyfikuje najaktywniejszych kontrybutorów projektu, dostarczając informacji o tym, kto najlepiej zna repozytorium i poszczególne jego obszary.

## Dla systemów Unix/Linux

### Polecenie

```bash
git log --since="1 year ago" --pretty=format:"%an <%ae>" --no-merges | \
 sort | \
 uniq -c | \
 sort -nr | \
 head -n 5 | \
 awk '{count=$1; $1=""; sub(/^[ \t]+/, ""); print $0 ": " count " commits"}'
```

### Wersja do kopiowania (Unix/Linux)

```bash
git log --since="1 year ago" --pretty=format:"%an <%ae>" --no-merges | sort | uniq -c | sort -nr | head -n 5 | awk '{count=$1; $1=""; sub(/^[ \t]+/, ""); print $0 ": " count " commits"}'
```

## Dla Windows (PowerShell)

### Polecenie

```powershell
git log --since="1 year ago" --pretty=format:"%an <%ae>" --no-merges |
Group-Object |
Sort-Object -Property Count -Descending |
Select-Object -First 5 |
ForEach-Object { "$($_.Name): $($_.Count) commits" }
```

### Wersja do kopiowania (Windows)

```powershell
git log --since="1 year ago" --pretty=format:"%an <%ae>" --no-merges | Group-Object | Sort-Object -Property Count -Descending | Select-Object -First 5 | ForEach-Object { "$($_.Name): $($_.Count) commits" }
```
