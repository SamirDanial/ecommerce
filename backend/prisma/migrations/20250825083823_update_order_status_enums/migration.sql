/*
  Warnings:

  - The values [REFUNDED] on the enum `DeliveryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,CONFIRMED,PROCESSING,SHIPPED,DELIVERED,REFUNDED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DeliveryStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNED');
ALTER TABLE "public"."orders" ALTER COLUMN "deliveryStatus" DROP DEFAULT;
ALTER TABLE "public"."orders" ALTER COLUMN "deliveryStatus" TYPE "public"."DeliveryStatus_new" USING ("deliveryStatus"::text::"public"."DeliveryStatus_new");
ALTER TYPE "public"."DeliveryStatus" RENAME TO "DeliveryStatus_old";
ALTER TYPE "public"."DeliveryStatus_new" RENAME TO "DeliveryStatus";
DROP TYPE "public"."DeliveryStatus_old";
ALTER TABLE "public"."orders" ALTER COLUMN "deliveryStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderStatus_new" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'ON_HOLD', 'READY_TO_PROCESS', 'COMPLETED', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED');
ALTER TABLE "public"."orders" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "public"."orders" ALTER COLUMN "orderStatus" TYPE "public"."OrderStatus_new" USING ("orderStatus"::text::"public"."OrderStatus_new");
ALTER TYPE "public"."OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "public"."OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "public"."orders" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING_APPROVAL';
COMMIT;

-- AlterTable
ALTER TABLE "public"."orders" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING_APPROVAL';
