-- CreateTable
CREATE TABLE "public"."business_configs" (
    "id" SERIAL NOT NULL,
    "businessId" VARCHAR(100) NOT NULL,
    "baseCurrency" VARCHAR(10) NOT NULL,
    "businessName" VARCHAR(200) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exchange_rates" (
    "id" SERIAL NOT NULL,
    "fromCurrency" VARCHAR(10) NOT NULL,
    "toCurrency" VARCHAR(10) NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(50),

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_configs_businessId_key" ON "public"."business_configs"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_fromCurrency_toCurrency_key" ON "public"."exchange_rates"("fromCurrency", "toCurrency");
