-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "serviceAreaId" TEXT;

-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "zipCodes" TEXT[],
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "radiusMiles" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaDayAssignment" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaDayAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceArea_accountId_idx" ON "ServiceArea"("accountId");

-- CreateIndex
CREATE INDEX "ServiceArea_accountId_isActive_idx" ON "ServiceArea"("accountId", "isActive");

-- CreateIndex
CREATE INDEX "AreaDayAssignment_accountId_idx" ON "AreaDayAssignment"("accountId");

-- CreateIndex
CREATE INDEX "AreaDayAssignment_groomerId_idx" ON "AreaDayAssignment"("groomerId");

-- CreateIndex
CREATE INDEX "AreaDayAssignment_areaId_idx" ON "AreaDayAssignment"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "AreaDayAssignment_groomerId_dayOfWeek_key" ON "AreaDayAssignment"("groomerId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Customer_serviceAreaId_idx" ON "Customer"("serviceAreaId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceArea" ADD CONSTRAINT "ServiceArea_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaDayAssignment" ADD CONSTRAINT "AreaDayAssignment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaDayAssignment" ADD CONSTRAINT "AreaDayAssignment_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "Groomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaDayAssignment" ADD CONSTRAINT "AreaDayAssignment_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "ServiceArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
