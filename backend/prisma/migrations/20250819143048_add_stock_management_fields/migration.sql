-- AlterTable
ALTER TABLE "public"."product_variants" ADD COLUMN     "canBackorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLowStock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOutOfStock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minStockLevel" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5;
