/*
  Warnings:

  - You are about to drop the column `centerLat` on the `ServiceArea` table. All the data in the column will be lost.
  - You are about to drop the column `centerLng` on the `ServiceArea` table. All the data in the column will be lost.
  - You are about to drop the column `radiusMiles` on the `ServiceArea` table. All the data in the column will be lost.
  - You are about to drop the column `zipCodes` on the `ServiceArea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceArea" DROP COLUMN "centerLat",
DROP COLUMN "centerLng",
DROP COLUMN "radiusMiles",
DROP COLUMN "zipCodes";
