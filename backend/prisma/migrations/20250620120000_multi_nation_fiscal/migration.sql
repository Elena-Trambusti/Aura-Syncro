-- Multi-nation fiscal architecture
CREATE TYPE "CountryCode" AS ENUM ('IT', 'ES');
CREATE TYPE "TaxRegion" AS ENUM ('IT_MAIN', 'ES_CANARIAS', 'ES_PENINSULA');

ALTER TABLE "RestaurantSettings"
  ADD COLUMN IF NOT EXISTS "countryCode" "CountryCode" NOT NULL DEFAULT 'IT',
  ADD COLUMN IF NOT EXISTS "taxRegion" "TaxRegion" NOT NULL DEFAULT 'IT_MAIN',
  ADD COLUMN IF NOT EXISTS "defaultLocale" TEXT NOT NULL DEFAULT 'it';

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "taxRateApplied" DOUBLE PRECISION;

-- Backfill existing tenants (safe defaults for legacy rows)
UPDATE "RestaurantSettings"
SET
  "countryCode" = COALESCE("countryCode", 'IT'),
  "taxRegion" = COALESCE("taxRegion", 'IT_MAIN'),
  "defaultLocale" = COALESCE("defaultLocale", 'it')
WHERE "countryCode" IS NULL OR "taxRegion" IS NULL OR "defaultLocale" IS NULL;
