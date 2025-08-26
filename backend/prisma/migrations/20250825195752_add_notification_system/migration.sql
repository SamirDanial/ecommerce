-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ORDER_PLACED', 'ORDER_STATUS_CHANGED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'SHIPPING_UPDATE', 'ORDER_CANCELLED', 'REFUND_REQUESTED', 'PRODUCT_REVIEW', 'PRODUCT_QUESTION', 'LOW_STOCK_ALERT', 'NEW_USER_REGISTRATION', 'CONTACT_FORM_SUBMISSION', 'SUPPORT_TICKET', 'SYSTEM_ALERT', 'SECURITY_ALERT', 'INVENTORY_UPDATE', 'PRICE_CHANGE', 'DISCOUNT_EXPIRING', 'CUSTOMER_FEEDBACK', 'EXPORT_COMPLETED', 'IMPORT_COMPLETED', 'BACKUP_COMPLETED', 'MAINTENANCE_SCHEDULED');

-- CreateEnum
CREATE TYPE "public"."NotificationCategory" AS ENUM ('ORDERS', 'PRODUCTS', 'CUSTOMERS', 'INVENTORY', 'FINANCIAL', 'SYSTEM', 'SECURITY', 'MARKETING', 'SUPPORT', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "public"."NotificationTargetType" AS ENUM ('ORDER', 'PRODUCT', 'USER', 'CATEGORY', 'INVENTORY', 'SYSTEM', 'GENERAL');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "category" "public"."NotificationCategory" NOT NULL,
    "targetType" "public"."NotificationTargetType" NOT NULL,
    "targetId" INTEGER,
    "recipientId" INTEGER,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationAction" (
    "id" SERIAL NOT NULL,
    "notificationId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionData" JSONB,
    "performedBy" INTEGER,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" "public"."NotificationCategory" NOT NULL,
    "type" "public"."NotificationType",
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "inApp" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "category" "public"."NotificationCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "variables" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_status_idx" ON "public"."Notification"("recipientId", "status");

-- CreateIndex
CREATE INDEX "Notification_type_category_idx" ON "public"."Notification"("type", "category");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_isGlobal_status_idx" ON "public"."Notification"("isGlobal", "status");

-- CreateIndex
CREATE INDEX "NotificationAction_notificationId_idx" ON "public"."NotificationAction"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationAction_performedBy_idx" ON "public"."NotificationAction"("performedBy");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "public"."NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_category_type_key" ON "public"."NotificationPreference"("userId", "category", "type");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_name_key" ON "public"."NotificationTemplate"("name");

-- CreateIndex
CREATE INDEX "NotificationTemplate_type_category_idx" ON "public"."NotificationTemplate"("type", "category");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationAction" ADD CONSTRAINT "NotificationAction_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationAction" ADD CONSTRAINT "NotificationAction_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
