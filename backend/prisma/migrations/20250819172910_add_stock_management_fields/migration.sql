/*
  Warnings:

  - You are about to drop the column `canBackorder` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `isLowStock` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `isOutOfStock` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `minStockLevel` on the `product_variants` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."StockStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'BACKORDER');

-- AlterTable
ALTER TABLE "public"."product_variants" DROP COLUMN "canBackorder",
DROP COLUMN "isLowStock",
DROP COLUMN "isOutOfStock",
DROP COLUMN "minStockLevel",
ADD COLUMN     "stockStatus" "public"."StockStatus" NOT NULL DEFAULT 'IN_STOCK';
