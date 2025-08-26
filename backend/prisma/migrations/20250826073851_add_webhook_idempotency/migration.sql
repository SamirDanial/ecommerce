/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "public"."WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookEvent_type_processed_idx" ON "public"."WebhookEvent"("type", "processed");

-- CreateIndex
CREATE INDEX "WebhookEvent_createdAt_idx" ON "public"."WebhookEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "public"."payments"("transactionId");
