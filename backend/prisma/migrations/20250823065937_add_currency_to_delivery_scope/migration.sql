/*
  Warnings:

  - Added the required column `primaryCurrency` to the `delivery_scopes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."delivery_scopes" ADD COLUMN     "primaryCurrency" VARCHAR(10) NOT NULL DEFAULT 'USD';

-- Update existing records to have a default currency
UPDATE "public"."delivery_scopes" SET "primaryCurrency" = 'USD' WHERE "primaryCurrency" IS NULL;

-- Remove the default constraint after updating existing data
ALTER TABLE "public"."delivery_scopes" ALTER COLUMN "primaryCurrency" DROP DEFAULT;
