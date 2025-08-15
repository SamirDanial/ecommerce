-- CreateTable
CREATE TABLE "public"."question_replies" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reply" VARCHAR(1000) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_replies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."question_replies" ADD CONSTRAINT "question_replies_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_replies" ADD CONSTRAINT "question_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
