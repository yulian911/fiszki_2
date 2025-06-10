## Dla systemów Unix/Linux

```bash
git log --since="1 year ago" --pretty=format:"" --name-only --no-merges | \
 grep -vE "${EXCLUDE_PATTERN_GREP:-^$}" | \
 grep '.' | \
 awk -F/ -v OFS=/ 'NF > 1 {$NF = ""; print $0 } NF <= 1 { print "." }' | \
 sed 's|/*$||' | \
 sed 's|^\\.$|project root|' | \
 sort | \
 uniq -c | \
 sort -nr | \
 head -n 10 | \
 awk '{count=$1; $1=""; sub(/^[ \t]+/, ""); print $0 ": " count " changes"}' | cat
```

## Dla Windows (PowerShell)

```powershell
git log --since="1 year ago" --pretty=format:"" --name-only --no-merges |
Where-Object { $_ -match '\S' } |
Where-Object { $_ -notmatch "(package\.json$|package-lock\.json$|yarn\.lock$|^node*modules/|^dist/|^build/|\.log$|\.svg$|\.png$|\.ico$|\.map$|\.d\.ts$|README\.md$|\.gitignore$|CHANGELOG\.md$|LICENSE$)" } |
ForEach-Object {
    if ($_ -match "/") {
        $parts = $_ -split "/"
        $parts[0..($parts.Length-2)] -join "/"
    } else {
        "project root"
    }
} |
Group-Object |
Sort-Object -Property Count -Descending |
Select-Object -First 10 |
ForEach-Object { "$($_.Name): $($_.Count) changes" }
```

### Wersja do kopiowania (Unix/Linux)

```bash
git log --since="1 year ago" --pretty=format:"" --name-only --no-merges | grep -vE "${EXCLUDE_PATTERN_GREP:-^$}" | grep '.' | awk -F/ -v OFS=/ 'NF > 1 {$NF = ""; print $0 } NF <= 1 { print "." }' | sed 's|/*$||' | sed 's|^\\.$|project root|' | sort | uniq -c | sort -nr | head -n 10 | awk '{count=$1; $1=""; sub(/^[ \t]+/, ""); print $0 ": " count " changes"}' | cat
```

### Wersja do kopiowania (Windows)

```powershell
git log --since="1 year ago" --pretty=format:"" --name-only --no-merges | Where-Object { $_ -match '\S' } | Where-Object { $_ -notmatch "(package\.json$|package-lock\.json$|yarn\.lock$|^node*modules/|^dist/|^build/|\.log$|\.svg$|\.png$|\.ico$|\.map$|\.d\.ts$|README\.md$|\.gitignore$|CHANGELOG\.md$|LICENSE$)" } | ForEach-Object { if ($_ -match "/") { $parts = $_ -split "/"; $parts[0..($parts.Length-2)] -join "/" } else { "project root" } } | Group-Object | Sort-Object -Property Count -Descending | Select-Object -First 10 | ForEach-Object { "$($_.Name): $($_.Count) changes" }
```
