-- CreateTable
CREATE TABLE "public"."delivery_scopes" (
    "id" SERIAL NOT NULL,
    "businessId" VARCHAR(100) NOT NULL,
    "businessName" VARCHAR(200) NOT NULL,
    "hasInternationalDelivery" BOOLEAN NOT NULL DEFAULT false,
    "primaryCountryCode" VARCHAR(10) NOT NULL,
    "primaryCountryName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."local_shipping_rates" (
    "id" SERIAL NOT NULL,
    "businessId" VARCHAR(100) NOT NULL,
    "cityName" VARCHAR(100) NOT NULL,
    "stateCode" VARCHAR(10),
    "stateName" VARCHAR(100),
    "shippingCost" DECIMAL(10,2) NOT NULL,
    "deliveryDays" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."local_tax_rates" (
    "id" SERIAL NOT NULL,
    "businessId" VARCHAR(100) NOT NULL,
    "cityName" VARCHAR(100),
    "stateCode" VARCHAR(10),
    "stateName" VARCHAR(100),
    "taxRate" DECIMAL(5,2) NOT NULL,
    "taxName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_scopes_businessId_key" ON "public"."delivery_scopes"("businessId");
