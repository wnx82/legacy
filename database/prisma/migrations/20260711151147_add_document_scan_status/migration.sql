-- CreateEnum
CREATE TYPE "DocumentScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "scanStatus" "DocumentScanStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "scannedAt" TIMESTAMP(3);
