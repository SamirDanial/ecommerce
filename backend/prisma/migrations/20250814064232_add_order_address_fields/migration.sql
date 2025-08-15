-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "shippingAddress1" VARCHAR(200),
ADD COLUMN     "shippingAddress2" VARCHAR(200),
ADD COLUMN     "shippingCity" VARCHAR(100),
ADD COLUMN     "shippingCompany" VARCHAR(100),
ADD COLUMN     "shippingCountry" VARCHAR(100),
ADD COLUMN     "shippingFirstName" VARCHAR(100),
ADD COLUMN     "shippingLastName" VARCHAR(100),
ADD COLUMN     "shippingPhone" VARCHAR(50),
ADD COLUMN     "shippingPostalCode" VARCHAR(20),
ADD COLUMN     "shippingState" VARCHAR(100);
