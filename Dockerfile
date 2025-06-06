# Etap 1: Builder - Budowanie aplikacji
# Używamy konkretnej wersji Alpine dla mniejszego i bezpieczniejszego obrazu
FROM node:22-alpine AS builder

# Ustawienie katalogu roboczego w kontenerze
WORKDIR /app

# Instalacja zależności systemowych wymaganych przez Next.js (np. dla 'sharp')
RUN apk add --no-cache libc6-compat openssl

# Kopiowanie plików manifestu zależności i instalacja
# Kopiujemy tylko te pliki, aby wykorzystać cache warstw Dockera
COPY package.json package-lock.json* ./
RUN npm ci

# Kopiowanie reszty plików aplikacji
# Pliki .dockerignore zapewniają, że niepotrzebne pliki nie są kopiowane
COPY . .

# Definiowanie argumentów, które można przekazać podczas budowania
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Ustawienie zmiennych środowiskowych na podstawie argumentów
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Budowanie aplikacji w trybie produkcyjnym
# Zmienne środowiskowe z prefiksem NEXT_PUBLIC_ zostaną wbudowane w aplikację
RUN npm run build

# Etap 2: Runner - Uruchomienie aplikacji
FROM node:22-alpine AS runner

WORKDIR /app

# Ustawienie środowiska na produkcyjne
ENV NODE_ENV=production
# Ustawienie portu, na którym będzie działać aplikacja w kontenerze
ENV PORT=40310

# Stworzenie dedykowanego użytkownika i grupy z ograniczonymi uprawnieniami
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Kopiowanie zbudowanej aplikacji z etapu 'builder'
# Kopiujemy tylko niezbędne pliki dzięki opcji output: 'standalone'
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static

# Zmiana użytkownika na tego z ograniczonymi uprawnieniami
USER appuser

# Ujawnienie portu, na którym aplikacja będzie nasłuchiwać
EXPOSE 40310

# Healthcheck - sprawdzanie, czy aplikacja działa poprawnie
# Używamy wget, ponieważ jest dostępny w obrazie alpine
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:40310/ || exit 1

# Domyślna komenda uruchamiająca serwer Next.js
CMD ["node", "server.js"] 