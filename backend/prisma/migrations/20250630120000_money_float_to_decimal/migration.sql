-- C-05: Convert monetary Float (double precision) columns to DECIMAL(12,2)
-- Percentages (taxRate, discountPct, lat/long, posX/Y) remain double precision.

-- FiscalClosure
ALTER TABLE "FiscalClosure" ALTER COLUMN "totalRevenue" TYPE DECIMAL(12,2) USING ROUND("totalRevenue"::numeric, 2);
ALTER TABLE "FiscalClosure" ALTER COLUMN "totalTax" TYPE DECIMAL(12,2) USING ROUND("totalTax"::numeric, 2);
ALTER TABLE "FiscalClosure" ALTER COLUMN "totalCash" TYPE DECIMAL(12,2) USING ROUND("totalCash"::numeric, 2);
ALTER TABLE "FiscalClosure" ALTER COLUMN "totalCard" TYPE DECIMAL(12,2) USING ROUND("totalCard"::numeric, 2);
ALTER TABLE "FiscalClosure" ALTER COLUMN "totalStripe" TYPE DECIMAL(12,2) USING ROUND("totalStripe"::numeric, 2);
ALTER TABLE "FiscalClosure" ALTER COLUMN "totalDigital" TYPE DECIMAL(12,2) USING ROUND("totalDigital"::numeric, 2);
ALTER TABLE "FiscalClosure" ALTER COLUMN "totalVoucher" TYPE DECIMAL(12,2) USING ROUND("totalVoucher"::numeric, 2);
ALTER TABLE "FiscalClosure" ALTER COLUMN "totalTip" TYPE DECIMAL(12,2) USING ROUND("totalTip"::numeric, 2);

-- RestaurantSettings
ALTER TABLE "RestaurantSettings" ALTER COLUMN "serviceCharge" TYPE DECIMAL(12,2) USING ROUND("serviceCharge"::numeric, 2);
ALTER TABLE "RestaurantSettings" ALTER COLUMN "depositAmount" TYPE DECIMAL(12,2) USING ROUND("depositAmount"::numeric, 2);

-- Menu
ALTER TABLE "MenuItem" ALTER COLUMN "price" TYPE DECIMAL(12,2) USING ROUND("price"::numeric, 2);
ALTER TABLE "MenuModifierOption" ALTER COLUMN "price" TYPE DECIMAL(12,2) USING ROUND("price"::numeric, 2);

-- Orders
ALTER TABLE "Order" ALTER COLUMN "subtotal" TYPE DECIMAL(12,2) USING ROUND("subtotal"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "tax" TYPE DECIMAL(12,2) USING ROUND("tax"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "serviceCharge" TYPE DECIMAL(12,2) USING ROUND("serviceCharge"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "discount" TYPE DECIMAL(12,2) USING ROUND("discount"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "total" TYPE DECIMAL(12,2) USING ROUND("total"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "revenueAmount" TYPE DECIMAL(12,2) USING ROUND("revenueAmount"::numeric, 2);
ALTER TABLE "Order" ALTER COLUMN "tipAmount" TYPE DECIMAL(12,2) USING ROUND("tipAmount"::numeric, 2);
ALTER TABLE "OrderItem" ALTER COLUMN "unitPrice" TYPE DECIMAL(12,2) USING ROUND("unitPrice"::numeric, 2);
ALTER TABLE "OrderItemModifier" ALTER COLUMN "price" TYPE DECIMAL(12,2) USING ROUND("price"::numeric, 2);

-- Reservations & CRM
ALTER TABLE "Reservation" ALTER COLUMN "depositAmountPaid" TYPE DECIMAL(12,2) USING ROUND("depositAmountPaid"::numeric, 2);
ALTER TABLE "Customer" ALTER COLUMN "totalSpent" TYPE DECIMAL(12,2) USING ROUND("totalSpent"::numeric, 2);

-- Cash drawer
ALTER TABLE "CashRegisterSession" ALTER COLUMN "openingBalance" TYPE DECIMAL(12,2) USING ROUND("openingBalance"::numeric, 2);
ALTER TABLE "CashRegisterSession" ALTER COLUMN "closingBalance" TYPE DECIMAL(12,2) USING ROUND("closingBalance"::numeric, 2);
ALTER TABLE "CashRegisterSession" ALTER COLUMN "expectedBalance" TYPE DECIMAL(12,2) USING ROUND("expectedBalance"::numeric, 2);
ALTER TABLE "CashRegisterSession" ALTER COLUMN "difference" TYPE DECIMAL(12,2) USING ROUND("difference"::numeric, 2);
ALTER TABLE "CashTransaction" ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING ROUND("amount"::numeric, 2);

-- Inventory (unit cost only)
ALTER TABLE "InventoryItem" ALTER COLUMN "cost" TYPE DECIMAL(12,2) USING ROUND("cost"::numeric, 2);

-- Invoicing
ALTER TABLE "Invoice" ALTER COLUMN "importoTotale" TYPE DECIMAL(12,2) USING ROUND("importoTotale"::numeric, 2);
ALTER TABLE "SaasElectronicInvoice" ALTER COLUMN "netAmount" TYPE DECIMAL(12,2) USING ROUND("netAmount"::numeric, 2);
ALTER TABLE "SaasElectronicInvoice" ALTER COLUMN "taxAmount" TYPE DECIMAL(12,2) USING ROUND("taxAmount"::numeric, 2);
ALTER TABLE "SaasElectronicInvoice" ALTER COLUMN "grossAmount" TYPE DECIMAL(12,2) USING ROUND("grossAmount"::numeric, 2);
