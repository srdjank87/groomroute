-- CreateEnum
CREATE TYPE "BreakType" AS ENUM ('LUNCH', 'SHORT_BREAK', 'HYDRATION');

-- AlterTable
ALTER TABLE "Groomer" ADD COLUMN     "defaultHasAssistant" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "hasAssistant" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Break" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "breakDate" DATE NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "breakType" "BreakType" NOT NULL DEFAULT 'LUNCH',
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "takenAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Break_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Break_accountId_idx" ON "Break"("accountId");

-- CreateIndex
CREATE INDEX "Break_groomerId_idx" ON "Break"("groomerId");

-- CreateIndex
CREATE INDEX "Break_groomerId_breakDate_idx" ON "Break"("groomerId", "breakDate");

-- AddForeignKey
ALTER TABLE "Break" ADD CONSTRAINT "Break_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "Groomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
