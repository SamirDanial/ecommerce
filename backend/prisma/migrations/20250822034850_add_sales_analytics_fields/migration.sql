-- CreateEnum
CREATE TYPE "public"."ReturnStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "averageItemValue" DECIMAL(10,2),
ADD COLUMN     "costOfGoods" DECIMAL(10,2),
ADD COLUMN     "profitMargin" DECIMAL(10,2),
ADD COLUMN     "referrer" VARCHAR(200),
ADD COLUMN     "refundAmount" DECIMAL(10,2),
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "returnReason" TEXT,
ADD COLUMN     "returnStatus" "public"."ReturnStatus" DEFAULT 'NONE',
ADD COLUMN     "salesChannel" VARCHAR(50),
ADD COLUMN     "totalItems" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "utmCampaign" VARCHAR(100),
ADD COLUMN     "utmMedium" VARCHAR(100),
ADD COLUMN     "utmSource" VARCHAR(100);
