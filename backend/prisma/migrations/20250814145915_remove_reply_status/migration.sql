/*
  Warnings:

  - You are about to drop the column `status` on the `review_replies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."review_replies" DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."ReviewReplyStatus";
