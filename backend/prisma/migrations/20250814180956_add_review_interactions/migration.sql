-- CreateEnum
CREATE TYPE "public"."InteractionType" AS ENUM ('HELPFUL', 'REPORT');

-- CreateTable
CREATE TABLE "public"."review_interactions" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "public"."InteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_interactions_reviewId_userId_type_key" ON "public"."review_interactions"("reviewId", "userId", "type");

-- AddForeignKey
ALTER TABLE "public"."review_interactions" ADD CONSTRAINT "review_interactions_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "public"."reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_interactions" ADD CONSTRAINT "review_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
