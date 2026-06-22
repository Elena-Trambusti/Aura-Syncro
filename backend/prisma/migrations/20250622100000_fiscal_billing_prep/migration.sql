-- Fiscal billing preparation: invoice numbering, customer/restaurant fiscal fields

-- RestaurantSettings: legal billing data
ALTER TABLE "RestaurantSettings" ADD COLUMN IF NOT EXISTS "legalName" TEXT;
ALTER TABLE "RestaurantSettings" ADD COLUMN IF NOT EXISTS "legalAddress" TEXT;
ALTER TABLE "RestaurantSettings" ADD COLUMN IF NOT EXISTS "fiscalCode" TEXT;
ALTER TABLE "RestaurantSettings" ADD COLUMN IF NOT EXISTS "pec" TEXT;
ALTER TABLE "RestaurantSettings" ADD COLUMN IF NOT EXISTS "sdiRecipientCode" TEXT;
ALTER TABLE "RestaurantSettings" ADD COLUMN IF NOT EXISTS "invoicePrefix" TEXT NOT NULL DEFAULT 'FATT';

-- Customer: B2B fiscal fields
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "taxId" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "fiscalCode" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "sdiRecipientCode" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "pec" TEXT;

-- Order: billing snapshot at payment
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingLegalName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingTaxId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingFiscalCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingSdiCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingPec" TEXT;

-- Fiscal sequence counter (per restaurant, per year)
CREATE TABLE IF NOT EXISTS "FiscalSequence" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "lastSequence" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalSequence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FiscalSequence_restaurantId_fiscalYear_key"
    ON "FiscalSequence"("restaurantId", "fiscalYear");

ALTER TABLE "FiscalSequence" DROP CONSTRAINT IF EXISTS "FiscalSequence_restaurantId_fkey";
ALTER TABLE "FiscalSequence" ADD CONSTRAINT "FiscalSequence_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Invoice documents
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'FATT',
    "fiscalYear" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_orderId_key" ON "Invoice"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_restaurantId_fiscalYear_sequence_key"
    ON "Invoice"("restaurantId", "fiscalYear", "sequence");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_restaurantId_documentNumber_key"
    ON "Invoice"("restaurantId", "documentNumber");
CREATE INDEX IF NOT EXISTS "Invoice_restaurantId_issuedAt_idx"
    ON "Invoice"("restaurantId", "issuedAt");

ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_restaurantId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_orderId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
