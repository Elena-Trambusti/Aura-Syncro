-- Coordinate meteo + tracciamento scalamento magazzino per riga ordine
ALTER TABLE "RestaurantSettings" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "RestaurantSettings" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "inventoryDeducted" BOOLEAN NOT NULL DEFAULT false;
