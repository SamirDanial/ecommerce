/*
  Warnings:

  - A unique constraint covering the columns `[targetType,targetId,type]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Notification_targetType_targetId_type_key" ON "public"."Notification"("targetType", "targetId", "type");
