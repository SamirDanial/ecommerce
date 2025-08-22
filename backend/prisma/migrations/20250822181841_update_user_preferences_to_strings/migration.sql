/*
  Warnings:

  - The `language` column on the `user_preferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currency` column on the `user_preferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."user_preferences" DROP COLUMN "language",
ADD COLUMN     "language" VARCHAR(10) NOT NULL DEFAULT 'en',
DROP COLUMN "currency",
ADD COLUMN     "currency" VARCHAR(10) NOT NULL DEFAULT 'USD';
