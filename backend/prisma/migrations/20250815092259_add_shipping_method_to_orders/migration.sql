-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "shippingMethod" VARCHAR(50),
ALTER COLUMN "total" SET DEFAULT 0;
