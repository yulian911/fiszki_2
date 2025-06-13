-- 1. Add the tsvector column to the flashcards table
ALTER TABLE "public"."flashcards"
ADD COLUMN "tsv" tsvector;

-- 2. Update existing rows to populate the new tsvector column
UPDATE "public"."flashcards"
SET "tsv" = to_tsvector('pg_catalog.simple', question || ' ' || answer);

-- 3. Create a GIN index on the new column for faster full-text search
CREATE INDEX "flashcards_tsv_idx" ON "public"."flashcards" USING gin(tsv);
