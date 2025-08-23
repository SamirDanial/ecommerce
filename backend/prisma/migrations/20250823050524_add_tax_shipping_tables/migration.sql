-- CreateTable
CREATE TABLE "public"."tax_rates" (
    "id" SERIAL NOT NULL,
    "countryCode" VARCHAR(10) NOT NULL,
    "stateCode" VARCHAR(10),
    "taxRate" DECIMAL(5,2) NOT NULL,
    "taxName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shipping_rates" (
    "id" SERIAL NOT NULL,
    "countryCode" VARCHAR(10) NOT NULL,
    "stateCode" VARCHAR(10),
    "shippingCost" DECIMAL(10,2) NOT NULL,
    "deliveryDays" INTEGER NOT NULL DEFAULT 3,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_countryCode_stateCode_key" ON "public"."tax_rates"("countryCode", "stateCode");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_rates_countryCode_stateCode_key" ON "public"."shipping_rates"("countryCode", "stateCode");
