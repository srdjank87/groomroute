-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'GROOMER', 'VIEWER');

-- CreateEnum
CREATE TYPE "GeocodeStatus" AS ENUM ('PENDING', 'OK', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "BehaviorFlag" AS ENUM ('FRIENDLY', 'ANXIOUS', 'AGGRESSIVE', 'BITE_RISK', 'MUZZLE_REQUIRED', 'TWO_PERSON_REQUIRED');

-- CreateEnum
CREATE TYPE "EquipmentRequired" AS ENUM ('MUZZLE', 'TABLE_EXTENDER', 'HEAVY_DUTY_DRYER', 'EXTRA_TOWELS', 'SENSITIVE_SKIN_PRODUCTS');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('BOOKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('FULL_GROOM', 'BATH_ONLY', 'NAIL_TRIM', 'FACE_FEET_FANNY', 'SQUEEZE_IN', 'ADDON');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('START_BASE', 'APPOINTMENT', 'BREAK', 'END_BASE');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('REMINDER_24HR', 'REMINDER_2HR', 'ON_MY_WAY', 'RUNNING_LATE', 'CONFIRMATION_REQUEST', 'GAP_FILL_OFFER', 'CUSTOM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "accountId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groomer" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "baseAddress" TEXT NOT NULL,
    "baseLat" DOUBLE PRECISION,
    "baseLng" DOUBLE PRECISION,
    "geocodeStatus" "GeocodeStatus" NOT NULL DEFAULT 'PENDING',
    "workingHoursStart" TEXT,
    "workingHoursEnd" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "geocodeStatus" "GeocodeStatus" NOT NULL DEFAULT 'PENDING',
    "addressNotes" TEXT,
    "accessInstructions" TEXT,
    "locationVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT,
    "species" TEXT,
    "weight" DOUBLE PRECISION,
    "ageYears" INTEGER,
    "notes" TEXT,
    "groomingNotes" TEXT,
    "behaviorNotes" TEXT,
    "behaviorFlags" "BehaviorFlag"[],
    "equipmentRequired" "EquipmentRequired"[],
    "specialHandling" TEXT,
    "canBookSolo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "petId" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "serviceMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "appointmentType" "AppointmentType" NOT NULL DEFAULT 'FULL_GROOM',
    "earliestStart" TIMESTAMP(3),
    "latestEnd" TIMESTAMP(3),
    "notes" TEXT,
    "internalNotes" TEXT,
    "price" DOUBLE PRECISION,
    "reminderSent24hr" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent2hr" BOOLEAN NOT NULL DEFAULT false,
    "customerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "groomerId" TEXT NOT NULL,
    "routeDate" DATE NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "totalDriveMinutes" INTEGER,
    "totalDistanceMeters" INTEGER,
    "totalServiceMinutes" INTEGER,
    "efficiencyScore" DOUBLE PRECISION,
    "estimatedGasCost" DOUBLE PRECISION,
    "status" "RouteStatus" NOT NULL DEFAULT 'DRAFT',
    "provider" TEXT,
    "polyline" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "sequence" INTEGER NOT NULL,
    "arrivalTime" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),
    "driveMinutesFromPrev" INTEGER,
    "distanceMetersFromPrev" INTEGER,
    "stopType" "StopType" NOT NULL DEFAULT 'APPOINTMENT',
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "messageType" "MessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryStatus" TEXT,
    "errorMessage" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerWaitlist" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "preferredDays" TEXT[],
    "preferredTimes" TEXT[],
    "flexibleTiming" BOOLEAN NOT NULL DEFAULT true,
    "maxDistance" INTEGER,
    "notifyViaSMS" BOOLEAN NOT NULL DEFAULT true,
    "notifyViaEmail" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerWaitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GapFillNotification" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "gapStartTime" TIMESTAMP(3) NOT NULL,
    "gapEndTime" TIMESTAMP(3) NOT NULL,
    "customersSent" INTEGER NOT NULL DEFAULT 0,
    "bookingsGained" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GapFillNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_accountId_idx" ON "User"("accountId");

-- CreateIndex
CREATE INDEX "Account_createdAt_idx" ON "Account"("createdAt");

-- CreateIndex
CREATE INDEX "Groomer_accountId_idx" ON "Groomer"("accountId");

-- CreateIndex
CREATE INDEX "Groomer_accountId_isActive_idx" ON "Groomer"("accountId", "isActive");

-- CreateIndex
CREATE INDEX "Customer_accountId_idx" ON "Customer"("accountId");

-- CreateIndex
CREATE INDEX "Customer_accountId_createdAt_idx" ON "Customer"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "Pet_customerId_idx" ON "Pet"("customerId");

-- CreateIndex
CREATE INDEX "Appointment_accountId_idx" ON "Appointment"("accountId");

-- CreateIndex
CREATE INDEX "Appointment_groomerId_idx" ON "Appointment"("groomerId");

-- CreateIndex
CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");

-- CreateIndex
CREATE INDEX "Appointment_accountId_groomerId_startAt_idx" ON "Appointment"("accountId", "groomerId", "startAt");

-- CreateIndex
CREATE INDEX "Appointment_startAt_idx" ON "Appointment"("startAt");

-- CreateIndex
CREATE INDEX "Route_accountId_idx" ON "Route"("accountId");

-- CreateIndex
CREATE INDEX "Route_groomerId_idx" ON "Route"("groomerId");

-- CreateIndex
CREATE INDEX "Route_groomerId_routeDate_idx" ON "Route"("groomerId", "routeDate");

-- CreateIndex
CREATE UNIQUE INDEX "Route_groomerId_routeDate_key" ON "Route"("groomerId", "routeDate");

-- CreateIndex
CREATE INDEX "RouteStop_routeId_idx" ON "RouteStop"("routeId");

-- CreateIndex
CREATE INDEX "RouteStop_appointmentId_idx" ON "RouteStop"("appointmentId");

-- CreateIndex
CREATE INDEX "RouteStop_routeId_sequence_idx" ON "RouteStop"("routeId", "sequence");

-- CreateIndex
CREATE INDEX "Message_accountId_idx" ON "Message"("accountId");

-- CreateIndex
CREATE INDEX "Message_customerId_idx" ON "Message"("customerId");

-- CreateIndex
CREATE INDEX "Message_appointmentId_idx" ON "Message"("appointmentId");

-- CreateIndex
CREATE INDEX "Message_sentAt_idx" ON "Message"("sentAt");

-- CreateIndex
CREATE INDEX "MessageTemplate_accountId_idx" ON "MessageTemplate"("accountId");

-- CreateIndex
CREATE INDEX "MessageTemplate_accountId_type_idx" ON "MessageTemplate"("accountId", "type");

-- CreateIndex
CREATE INDEX "CustomerWaitlist_accountId_idx" ON "CustomerWaitlist"("accountId");

-- CreateIndex
CREATE INDEX "CustomerWaitlist_customerId_idx" ON "CustomerWaitlist"("customerId");

-- CreateIndex
CREATE INDEX "CustomerWaitlist_accountId_isActive_idx" ON "CustomerWaitlist"("accountId", "isActive");

-- CreateIndex
CREATE INDEX "GapFillNotification_accountId_idx" ON "GapFillNotification"("accountId");

-- CreateIndex
CREATE INDEX "GapFillNotification_routeId_idx" ON "GapFillNotification"("routeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groomer" ADD CONSTRAINT "Groomer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "Groomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_groomerId_fkey" FOREIGN KEY ("groomerId") REFERENCES "Groomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerWaitlist" ADD CONSTRAINT "CustomerWaitlist_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GapFillNotification" ADD CONSTRAINT "GapFillNotification_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
