Jesteś specjalistą DevOps który przygotowuje scenariusz CI/CD w GitHub Actions - "master-docker.yml".

Przygotuj scenariusz  który umieści obraz @Dockerfile w GitHub Container Registry - "{owner}/{appname}" a następnie wykona Deploy na mój serwer (Add `runs-on: self-hosted` to your workflow's YAML to send jobs to this runner.). Kontener może być tagowany SHA ostatniego commita na masterze.

Job do budowania obrazu powinien korzystać ze środowiska GHA "production" i jako argument pobierać sekret NEXT_PUBLIC_SUPABASE_ANON_KEY i NEXT_PUBLIC_SUPABASE_URL jesli sa potzrebne 

<owner>yulian911</owner>
<appname>fiszki</appname>

Tworząc akcję bazuj na @main.yml (najważniejsze kroki - lint, unit-test)

Po ukończeniu draftu, upewnij się, że korzystasz z najnowszych i aktualnych wersji akcji @github-action.mdc 

Zanim rozpoczniemy, zadaj mi dodatkowe pytania które pomogą ci ukończyć to zadanie.