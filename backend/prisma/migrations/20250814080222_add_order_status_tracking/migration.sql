-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "currentStatus" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "estimatedDelivery" TIMESTAMP(3),
ADD COLUMN     "lastStatusUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "statusHistory" JSONB;
