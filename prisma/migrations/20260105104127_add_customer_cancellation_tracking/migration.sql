-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "cancellationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCancellationAt" TIMESTAMP(3),
ADD COLUMN     "lastNoShowAt" TIMESTAMP(3),
ADD COLUMN     "noShowCount" INTEGER NOT NULL DEFAULT 0;
