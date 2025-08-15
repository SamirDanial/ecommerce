/*
  Warnings:

  - You are about to drop the column `shippingAddressId` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_shippingAddressId_fkey";

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "shippingAddressId";
